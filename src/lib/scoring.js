import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "./firebase.js";

const WEIGHTS = { stock: 0.4, disease: 0.35, staffing: 0.25 };
export const HIGH_THRESHOLD = 0.6;
export const MEDIUM_THRESHOLD = 0.3;

// An outbreak override: if a disease's case count has risen on 5+
// consecutive reporting days, with at least a 50% total rise from
// the start of that run to the end, force High regardless of the
// composite score. This catches real outbreaks (like Sitapur's fever
// trend) that a single weighted factor can't push past the threshold
// on its own.
const OUTBREAK_MIN_STREAK = 5;
const OUTBREAK_MIN_RISE = 0.5; // 50%

function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
}

/**
 * Computes score, tier, reason, and suggested action for every PHC
 * in the district. Returns ALL PHCs — healthy ones included — sorted
 * worst-first.
 */
export async function computeDistrictScores() {
    const [phcsSnap, medsSnap, invSnap] = await Promise.all([
        getDocs(collection(db, "PHCs")),
        getDocs(collection(db, "Medicines")),
        getDocs(collection(db, "Inventory")),
    ]);

    const phcs = {};
    phcsSnap.forEach((d) => (phcs[d.id] = d.data()));
    const meds = {};
    medsSnap.forEach((d) => (meds[d.id] = d.data()));

    const inventoryByPhc = {};
    invSnap.forEach((d) => {
        const row = d.data();
        if (!inventoryByPhc[row.phc_id]) inventoryByPhc[row.phc_id] = [];
        inventoryByPhc[row.phc_id].push(row);
    });

    const results = [];

    for (const phcId of Object.keys(phcs)) {
        // ---- Stock ----
        const phcInventory = inventoryByPhc[phcId] || [];
        let worstRatio = 1;
        let worstMed = null;
        phcInventory.forEach((item) => {
            const threshold = meds[item.medicine_id]?.reorder_threshold;
            if (!threshold) return;
            const ratio = item.quantity / threshold;
            if (ratio < worstRatio) {
                worstRatio = ratio;
                worstMed = { name: meds[item.medicine_id]?.name, quantity: item.quantity, threshold };
            }
        });
        const stockScore = clamp(1 - worstRatio, 0, 1);

        // ---- Disease ----

        const diseaseQ = query(
            collection(db, "DiseaseCases"),
            where("phc_id", "==", phcId),
            orderBy("date", "asc")
        );
        const diseaseSnap = await getDocs(diseaseQ);
        const byDisease = {};
        diseaseSnap.forEach((d) => {
            const row = d.data();
            if (!byDisease[row.disease_name]) byDisease[row.disease_name] = [];
            byDisease[row.disease_name].push(row);
        });
        let diseaseScore = 0;
        let diseaseInfo = null;
        let outbreakDetected = false;
        let outbreakInfo = null;
        Object.entries(byDisease).forEach(([name, rows]) => {
            const sorted = rows.sort((a, b) => a.date.localeCompare(b.date));
            const last7 = sorted.slice(-7);
            if (last7.length < 2) return;
            const oldest = last7[0].case_count;
            const latest = last7[last7.length - 1].case_count;
            const increase = oldest > 0 ? (latest - oldest) / oldest : latest > 0 ? 1 : 0;
            const score = clamp(increase / 1.5, 0, 1);
            if (score > diseaseScore) {
                diseaseScore = score;
                diseaseInfo = { name, latest, oldest };
            }

            // Outbreak override check: is the run long enough, strictly
            // non-decreasing, and does it represent a large enough rise?
            if (last7.length >= OUTBREAK_MIN_STREAK) {
                const isNonDecreasing = last7.every(
                    (row, i) => i === 0 || row.case_count >= last7[i - 1].case_count
                );
                const totalRise = oldest > 0 ? (latest - oldest) / oldest : 0;
                if (isNonDecreasing && totalRise >= OUTBREAK_MIN_RISE) {
                    outbreakDetected = true;
                    outbreakInfo = { name, latest, oldest, days: last7.length };
                }
            }
        });

        // ---- Staffing ----
        const reportsQ = query(
            collection(db, "DailyReports"),
            where("phc_id", "==", phcId),
            orderBy("date", "desc")
        );
        const reportsSnap = await getDocs(reportsQ);
        const reports = [];
        reportsSnap.forEach((d) => reports.push(d.data()));
        let absentStreak = 0;
        for (const r of reports) {
            if (r.doctor_present === false) absentStreak++;
            else break;
        }
        const staffingScore = clamp(absentStreak / 5, 0, 1);

        // ---- Combine ----
        const score =
            stockScore * WEIGHTS.stock + diseaseScore * WEIGHTS.disease + staffingScore * WEIGHTS.staffing;

        let tier = score >= HIGH_THRESHOLD ? "High" : score >= MEDIUM_THRESHOLD ? "Medium" : "Healthy";

        // Force High on a detected outbreak, regardless of composite score.
        if (outbreakDetected) tier = "High";

        const dominant =
            outbreakDetected
                ? "disease"
                : stockScore >= diseaseScore && stockScore >= staffingScore
                    ? "stock"
                    : diseaseScore >= staffingScore
                        ? "disease"
                        : "staffing";

        let reason = "No active issues";
        let actionLabel = null;

        if (tier !== "Healthy") {
            if (dominant === "stock" && worstMed) {
                reason = `${worstMed.name} at ${worstMed.quantity} of ${worstMed.threshold} strips, below threshold.`;
                let bestSource = null;
                let bestQty = -1;
                Object.entries(inventoryByPhc).forEach(([otherPhcId, items]) => {
                    if (otherPhcId === phcId) return;
                    const match = items.find((i) => meds[i.medicine_id]?.name === worstMed.name);
                    if (match && match.quantity > bestQty) {
                        bestQty = match.quantity;
                        bestSource = phcs[otherPhcId]?.name;
                    }
                });
                actionLabel = bestSource ? `Approve transfer from ${bestSource}` : "Review stock transfer options";
            } else if (dominant === "disease" && (outbreakInfo || diseaseInfo)) {
                const info = outbreakInfo || diseaseInfo;
                reason = `${info.name} cases rising to ${info.latest} per day over the last week.`;
                actionLabel = "Dispatch rapid response team";
            } else if (dominant === "staffing") {
                reason = `Doctor absent for ${absentStreak} consecutive day${absentStreak !== 1 ? "s" : ""}.`;
                actionLabel = "Request temporary staff cover";
            }
        }

        results.push({
            phcId,
            phcName: phcs[phcId]?.name,
            score,
            tier,
            reason,
            actionLabel,
            actionType: dominant,
            worstMed,
        });
    }

    results.sort((a, b) => b.score - a.score);
    return results;
}