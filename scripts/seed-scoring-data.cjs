const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const serviceAccount = require("./serviceAccountKey.json");

const app = initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore(app);

// --- Adjust these PHC IDs to match your actual PHCs collection ---
const RAMPUR_PHC_ID = "rampur";
const SITAPUR_PHC_ID = "sitapur";
const DEVGAON_PHC_ID = "devgaon";

function dateString(daysAgo) {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split("T")[0]; // "YYYY-MM-DD"
}

async function seedDiseaseCases() {
    const batch = db.batch();

    // Sitapur: fever cases rising over the last 6 days (14 -> 28)
    const feverCounts = [14, 17, 19, 22, 25, 28];
    feverCounts.forEach((count, i) => {
        const daysAgo = feverCounts.length - 1 - i;
        const ref = db.collection("DiseaseCases").doc();
        batch.set(ref, {
            phc_id: SITAPUR_PHC_ID,
            disease_name: "Fever",
            date: dateString(daysAgo),
            case_count: count,
        });
    });

    // A few flat/normal entries for other PHCs so they don't score as disease-flagged
    [RAMPUR_PHC_ID, DEVGAON_PHC_ID].forEach((phcId) => {
        [0, 1, 2].forEach((daysAgo) => {
            const ref = db.collection("DiseaseCases").doc();
            batch.set(ref, {
                phc_id: phcId,
                disease_name: "Fever",
                date: dateString(daysAgo),
                case_count: 5, // stable, no spike
            });
        });
    });

    await batch.commit();
    console.log("✅ DiseaseCases seeded");
}

async function seedDailyReports() {
    const batch = db.batch();

    // Devgaon: doctor absent for the last 5 consecutive days
    for (let daysAgo = 0; daysAgo < 5; daysAgo++) {
        const ref = db.collection("DailyReports").doc();
        batch.set(ref, {
            phc_id: DEVGAON_PHC_ID,
            date: dateString(daysAgo),
            doctor_present: false,
        });
    }

    // Rampur and Sitapur: doctor present as normal, so staffing doesn't
    // falsely contribute to their scores
    [RAMPUR_PHC_ID, SITAPUR_PHC_ID].forEach((phcId) => {
        [0, 1, 2].forEach((daysAgo) => {
            const ref = db.collection("DailyReports").doc();
            batch.set(ref, {
                phc_id: phcId,
                date: dateString(daysAgo),
                doctor_present: true,
            });
        });
    });

    await batch.commit();
    console.log("✅ DailyReports seeded");
}

async function main() {
    await seedDiseaseCases();
    await seedDailyReports();
    console.log("Done.");
    process.exit(0);
}

main().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
});