const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const serviceAccount = require("./serviceAccountKey.json");

const app = initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore(app);

// --- Adjust these to match your actual PHCs collection doc IDs ---
const RAMPUR_PHC_ID = "rampur";
const SITAPUR_PHC_ID = "sitapur";

async function seedSubmittedReports() {
    const batch = db.batch();

    // Rampur: Pharmacist stock update (matches your first mockup)
    const rampurRef = db.collection("SubmittedReports").doc();
    batch.set(rampurRef, {
        phc_id: RAMPUR_PHC_ID,
        phc_name: "Rampur PHC",
        report_type: "stock_update",
        report_type_label: "Stock Update",
        submitted_by: "Pharmacist, Rampur",
        timestamp: Timestamp.fromDate(new Date("2026-07-06T09:15:00")),
        timestamp_display: "2026-07-06, 09:15 AM",
        data: {
            "Medicine": "Amoxicillin 500mg",
            "Quantity in hand": "8 strips",
            "Quantity dispensed (since last report)": "14 strips",
            "Reorder threshold": "40 strips",
            "Status": "Below threshold",
        },
    });

    // Sitapur: Medical Officer daily patient & disease log (matches your second mockup)
    const sitapurRef = db.collection("SubmittedReports").doc();
    batch.set(sitapurRef, {
        phc_id: SITAPUR_PHC_ID,
        phc_name: "Sitapur PHC",
        report_type: "daily_log",
        report_type_label: "Daily Patient & Disease Log",
        submitted_by: "Medical Officer, Sitapur",
        timestamp: Timestamp.fromDate(new Date("2026-07-06T18:30:00")),
        timestamp_display: "2026-07-06, 06:30 PM",
        data: {
            "Total patients seen today": 34,
            "Fever cases": 28,
            "Diarrhea cases": 4,
            "Respiratory cases": 2,
            "Referrals made": "3 (to District Hospital)",
            "Doctor status": "Present, full day",
        },
    });

    await batch.commit();
    console.log("✅ SubmittedReports seeded");
}

async function seedRecommendations() {
    // One doc per district, matching what DhoReportDetail.jsx reads:
    // getDoc(doc(db, "recommendations", "west-division"))
    await db.collection("recommendations").doc("west-division").set({
        items: [
            {
                phc_id: RAMPUR_PHC_ID,
                reason: "Amoxicillin 500mg at 8 of 40 strips, below threshold.",
                actionLabel: "Approve transfer from a nearby PHC",
            },
            {
                phc_id: SITAPUR_PHC_ID,
                reason: "Fever cases rising to 28 per day over the last week.",
                actionLabel: "Dispatch rapid response team",
            },
        ],
    });
    console.log("✅ recommendations seeded");
}

async function main() {
    await seedSubmittedReports();
    await seedRecommendations();
    console.log("Done.");
    process.exit(0);
}

main().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
});