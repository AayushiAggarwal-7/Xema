import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "./firebase.js";
 
const WEIGHTS = { stock: 0.4, disease: 0.35, staffing: 0.25 };
const HIGH_THRESHOLD = 0.6;
const MEDIUM_THRESHOLD = 0.3;
 
function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}
 
// Returns EVERY PHC (including healthy ones) with a computed tier.
// Callers that only want "needs attention" PHCs should filter tier !== 'Healthy'.
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
 
    const diseaseQ = query(collection(db, "DiseaseCases"), where("phc_id", "==", phcId), orderBy("date", "asc"));
    const diseaseSnap = await getDocs(diseaseQ);
    const byDisease = {};
    diseaseSnap.forEach((d) => {
      const row = d.data();
      if (!byDisease[row.disease_name]) byDisease[row.disease_name] = [];
      byDisease[row.disease_name].push(row);
    });
    let diseaseScore = 0;
    let diseaseInfo = null;
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
    });
 
    const reportsQ = query(collection(db, "DailyReports"), where("phc_id", "==", phcId), orderBy("date", "desc"));
    const reportsSnap = await getDocs(reportsQ);
    const reports = [];
    reportsSnap.forEach((d) => reports.push(d.data()));
    let absentStreak = 0;
    for (const r of reports) {
      if (r.doctor_present === false) absentStreak++;
      else break;
    }
    const staffingScore = clamp(absentStreak / 5, 0, 1);
 
    const score = stockScore * WEIGHTS.stock + diseaseScore * WEIGHTS.disease + staffingScore * WEIGHTS.staffing;
 
    let tier = "Healthy";
    if (score >= HIGH_THRESHOLD) tier = "High";
    else if (score >= MEDIUM_THRESHOLD) tier = "Medium";
 
    const dominant =
      stockScore >= diseaseScore && stockScore >= staffingScore ? "stock"
      : diseaseScore >= staffingScore ? "disease"
      : "staffing";
 
    let reason = "All metrics within normal range.";
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
      } else if (dominant === "disease" && diseaseInfo) {
        reason = `${diseaseInfo.name} cases rising to ${diseaseInfo.latest} per day over the last week.`;
        actionLabel = "Dispatch rapid response team";
      } else if (dominant === "staffing") {
        reason = `Doctor absent for ${absentStreak} consecutive day${absentStreak !== 1 ? "s" : ""}.`;
        actionLabel = "Request temporary staff cover";
      }
    }
 
    results.push({
      phcId, phcName: phcs[phcId]?.name, score, tier, reason, actionLabel,
      actionType: dominant, worstMed,
    });
  }
 
  results.sort((a, b) => b.score - a.score);
  return results;
}
 
