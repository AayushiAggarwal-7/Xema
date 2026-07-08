
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase"; // adjust to your actual firebase init path
import { computeDistrictScores } from "../../lib/scoring.js";
// Helper to determine greeting based on current local time
function getGreeting() {
    const hr = new Date().getHours();
    if (hr < 12) {
        return { emoji: "🌅", text: "Good Morning!!" };
    } else if (hr < 17) {
        return { emoji: "☀️", text: "Good Afternoon!!" };
    } else {
        return { emoji: "🌇", text: "Good Evening!!" };
    }
}


// --- Colors, matching your existing design tokens ---
const NAVY = "#1b2a4a";
const CREAM = "#fdf6ee";

const styles = {
    page: { minHeight: "100vh", background: CREAM, display: "flex" },
    main: { flex: 1, padding: "32px 40px" },
    headerRow: { display: "flex", alignItems: "center", gap: 16, marginBottom: 24 },
    backBtn: { border: "none", background: "none", cursor: "pointer", fontSize: 14, color: NAVY },
    greeting: { textAlign: "center", flex: 1 },
    avatarRow: { display: "flex", alignItems: "center", gap: 16, marginBottom: 16 },
    avatar: { width: 56, height: 56, borderRadius: 8, objectFit: "cover", background: "#7ecbe0" },
    sectionLabel: { fontWeight: 700, fontSize: 15, marginBottom: 8 },
    reportCard: {
        background: "#fbe4e4",
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        fontSize: 14,
        lineHeight: 1.7,
        whiteSpace: "pre-wrap",
    },
    recBadge: {
        display: "inline-block",
        background: "#3ddc84",
        color: "#04361c",
        fontWeight: 700,
        padding: "8px 18px",
        borderRadius: 20,
        marginBottom: 12,
    },
    noteCard: {
        background: "#fbe4e4",
        borderRadius: 12,
        padding: 20,
        fontSize: 14,
        borderLeft: `4px solid #e05555`,
    },
    sidebar: { width: 220, background: "#e9edf3", padding: 24 },
    loading: { padding: 40, textAlign: "center", color: "#888" },
    empty: { padding: 40, textAlign: "center", color: "#888" },
    errorBox: { padding: 40, textAlign: "center", color: "#b91c1c" },
};

// Formats a raw report doc's `data` map into the same plain-text block
// shown in the mockups (Report type / PHC / Submitted by / fields...).
function formatReportBody(report) {
    const lines = [];
    lines.push(`Report type: ${report.report_type_label || report.report_type}`);
    lines.push(`PHC: ${report.phc_name}`);
    lines.push(`Submitted by: ${report.submitted_by}`);
    lines.push(`Date/time: ${report.timestamp_display || report.timestamp}`);
    lines.push("");
    Object.entries(report.data || {}).forEach(([key, value]) => {
        lines.push(`${key}: ${value}`);
    });
    return lines.join("\n");
}
// Fallback formatter for PHCs that don't have a curated SubmittedReports doc
// (i.e. anyone except Rampur/Sitapur). Builds the same plain-text block shape
// from real DailyReports + DiseaseCases + Inventory data instead.
function formatLiveReportBody({ phcName, latestReport, lowStock, diseaseTrend }) {
    const lines = [];
    lines.push(`Report type: Live Status Summary`);
    lines.push(`PHC: ${phcName}`);
    lines.push(`Submitted by: System (auto-compiled from daily records)`);
    lines.push(`Date/time: ${latestReport?.date || "N/A"}`);
    lines.push("");
    if (latestReport) {
        lines.push(`Doctor present: ${latestReport.doctor_present === false ? "No" : "Yes"}`);
    }
    if (lowStock && lowStock.length > 0) {
        lines.push(`Low stock items: ${lowStock.map((i) => `${i.medName} (${i.quantity}/${i.threshold})`).join(", ")}`);
    } else {
        lines.push(`Low stock items: None`);
    }
    if (diseaseTrend) {
        lines.push(`Rising disease trend: ${diseaseTrend.name} — ${diseaseTrend.values.join(" → ")}`);
    }
    return lines.join("\n");
}

// Fetches live data (Inventory/Medicines/DiseaseCases/DailyReports) for a
// single PHC, used as a fallback when there's no curated SubmittedReports doc.
async function fetchLiveReportData(phcId) {
    const medsSnap = await getDocs(collection(db, "Medicines"));
    const meds = {};
    medsSnap.forEach((d) => (meds[d.id] = d.data()));

    const invSnap = await getDocs(query(collection(db, "Inventory"), where("phc_id", "==", phcId)));
    const inventory = [];
    invSnap.forEach((d) => inventory.push({ id: d.id, ...d.data() }));
    const lowStock = inventory
        .map((item) => ({ ...item, medName: meds[item.medicine_id]?.name, threshold: meds[item.medicine_id]?.reorder_threshold }))
        .filter((item) => item.threshold && item.quantity < item.threshold);

    const diseaseSnap = await getDocs(
        query(collection(db, "DiseaseCases"), where("phc_id", "==", phcId), orderBy("date", "asc"))
    );
    const byDisease = {};
    diseaseSnap.forEach((d) => {
        const row = d.data();
        if (!byDisease[row.disease_name]) byDisease[row.disease_name] = [];
        byDisease[row.disease_name].push(row);
    });
    let diseaseTrend = null;
    Object.entries(byDisease).forEach(([name, rows]) => {
        const last7 = rows.slice(-7);
        const oldest = last7[0]?.case_count ?? 0;
        const latest = last7[last7.length - 1]?.case_count ?? 0;
        if (oldest > 0 && (latest - oldest) / oldest > 0.3) {
            diseaseTrend = { name, values: last7.map((r) => r.case_count) };
        }
    });

    const reportsSnap = await getDocs(
        query(collection(db, "DailyReports"), where("phc_id", "==", phcId), orderBy("date", "desc"))
    );
    let latestReport = null;
    reportsSnap.forEach((d) => { if (!latestReport) latestReport = d.data(); });

    return { lowStock, diseaseTrend, latestReport };
}
export default function DhoReportDetail() {
    const { phcId } = useParams();
    const navigate = useNavigate();

    const [phcName, setPhcName] = useState("");
    const [report, setReport] = useState(null);
    const [recommendation, setRecommendation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            setError(null);
            try {
                // 1. PHC name
                const phcSnap = await getDoc(doc(db, "PHCs", phcId));
                const name = phcSnap.exists() ? phcSnap.data().name : phcId;

                // 2. Latest submitted report for this PHC (pharmacist OR MO — whichever is newest)
                const reportsQ = query(
                    collection(db, "SubmittedReports"),
                    where("phc_id", "==", phcId),
                    orderBy("timestamp", "desc"),
                    limit(1)
                );
                const reportsSnap = await getDocs(reportsQ);
                let latestReport = reportsSnap.empty ? null : reportsSnap.docs[0].data();

                // 3. AI recommendation for this district (filtered to this PHC)
                // Adjust "districtId" below if it's passed as a prop/route param elsewhere.
                const recSnap = await getDoc(doc(db, "recommendations", "west-division"));
                const recData = recSnap.exists() ? recSnap.data() : null;
                let phcRec = recData?.items?.find((r) => r.phc_id === phcId) || null;

                // Fallback: most PHCs don't have a curated SubmittedReports doc
                // (only Rampur/Sitapur do) — for everyone else, build the report
                // from real live data instead of showing "no report submitted".
                if (!latestReport) {
                    const live = await fetchLiveReportData(phcId);
                    latestReport = {
                        __live: true,
                        body: formatLiveReportBody({ phcName: name, ...live }),
                    };
                }

                // Fallback: compute the recommendation live (same logic AIPriorities
                // already uses) for PHCs not covered by the curated recommendations doc.
                if (!phcRec) {
                    const scores = await computeDistrictScores();
                    const liveScore = scores.find((s) => s.phcId === phcId);
                    if (liveScore && liveScore.tier !== "Healthy") {
                        phcRec = { reason: liveScore.reason, actionLabel: liveScore.actionLabel };
                    }
                }

                if (!cancelled) {
                    setPhcName(name);
                    setReport(latestReport);
                    setRecommendation(phcRec);
                }
            } catch (err) {
                console.error("Failed to load PHC report:", err);
                if (!cancelled) setError(err.message || String(err));
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => { cancelled = true; };
    }, [phcId]);

    if (loading) return <div style={styles.loading}>Loading report…</div>;
    if (error) return <div style={styles.errorBox}>Couldn't load report: {error}</div>;

    return (
        <div style={styles.page}>
            <div style={styles.main}>
                <div style={styles.headerRow}>
                    <button style={styles.backBtn} onClick={() => navigate(-1)}>← Back to Overview</button>
                </div>

                <div style={styles.greeting}>
                    <div>{getGreeting().emoji} {getGreeting().text}</div>
                    <strong>{new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</strong>
                </div>

                <div style={styles.avatarRow}>
                    <img src="/avatar-placeholder.png" alt="" style={styles.avatar} />
                    <div>
                        <div><strong>PHC:</strong> {phcName}</div>
                        <div><strong>District:</strong> West Division</div>
                    </div>
                </div>

                <div style={styles.sectionLabel}>Submitted Report</div>

                {report ? (
                    <div style={styles.reportCard}>{report.__live ? report.body : formatReportBody(report)}</div>
                ) : (
                    <div style={styles.empty}>No report submitted yet for this PHC.</div>
                )}

                {recommendation && (
                    <>
                        <span style={styles.recBadge}>Xema Recommendation</span>
                        <div style={styles.noteCard}>
                            <strong>{recommendation.reason}</strong>
                            <div style={{ marginTop: 8 }}>{recommendation.actionLabel}</div>
                        </div>
                    </>
                )}
            </div>

            <div style={styles.sidebar}>
                <div>🔔 Notifications</div>
                <div style={{ marginTop: 16, fontWeight: 700 }}>PROFILE</div>
                <div style={{ marginTop: 24 }}>Filter tabs</div>
                <button style={{ marginTop: 16 }}>Generate report</button>
            </div>
        </div>
    );
}