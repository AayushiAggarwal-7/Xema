const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");
const serviceAccount = require("./serviceAccountKey.json");

const app = initializeApp({
    credential: cert(serviceAccount),
});

const db = getFirestore(app);
const auth = getAuth(app);

// ---------- Helpers ----------

function isoDaysAgo(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().split("T")[0]; // "YYYY-MM-DD"
}

function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ---------- Static data ----------

const DISTRICT_ID = "kaushal";

const PHCS = [
    { id: "rampur", name: "PHC Rampur", pattern: "crisis_stock" },
    { id: "sitapur", name: "PHC Sitapur", pattern: "crisis_disease" },
    { id: "devgaon", name: "PHC Devgaon", pattern: "crisis_staffing" },
    { id: "kishanpur", name: "PHC Kishanpur", pattern: "moderate_stock" },
    { id: "amarganj", name: "PHC Amarganj", pattern: "moderate_beds" },
    { id: "lalganj", name: "PHC Lalganj", pattern: "healthy_surplus" },
    { id: "narayanpur", name: "PHC Narayanpur", pattern: "healthy_surplus" },
    { id: "chandpur", name: "PHC Chandpur", pattern: "healthy_no_xray" },
    { id: "bhagwanpur", name: "PHC Bhagwanpur", pattern: "healthy" },
    { id: "manikpur", name: "PHC Manikpur", pattern: "healthy_no_malaria" },
    { id: "fatehganj", name: "PHC Fatehganj", pattern: "healthy" },
    { id: "govindpur", name: "PHC Govindpur", pattern: "healthy" },
];

const MEDICINES = [
    { id: "med01", name: "Paracetamol 500mg", category: "Analgesic", unit: "strip", reorder_threshold: 50 },
    { id: "med02", name: "ORS Sachets", category: "Rehydration", unit: "sachet", reorder_threshold: 100 },
    { id: "med03", name: "Amoxicillin 500mg", category: "Antibiotic", unit: "strip", reorder_threshold: 40 },
    { id: "med04", name: "Ciprofloxacin 500mg", category: "Antibiotic", unit: "strip", reorder_threshold: 40 },
    { id: "med05", name: "Metronidazole 400mg", category: "Antibiotic", unit: "strip", reorder_threshold: 30 },
    { id: "med06", name: "Azithromycin 500mg", category: "Antibiotic", unit: "strip", reorder_threshold: 30 },
    { id: "med07", name: "Iron & Folic Acid Tablets", category: "Supplement", unit: "strip", reorder_threshold: 60 },
    { id: "med08", name: "Vitamin A Syrup", category: "Supplement", unit: "bottle", reorder_threshold: 20 },
    { id: "med09", name: "Albendazole 400mg", category: "Antiparasitic", unit: "tablet", reorder_threshold: 50 },
    { id: "med10", name: "Cough Syrup", category: "Respiratory", unit: "bottle", reorder_threshold: 25 },
    { id: "med11", name: "Antacid Tablets", category: "Gastro", unit: "strip", reorder_threshold: 40 },
    { id: "med12", name: "Oral Rehydration Salts (Paediatric)", category: "Rehydration", unit: "sachet", reorder_threshold: 50 },
    { id: "med13", name: "Insulin (Human, Regular)", category: "Diabetes", unit: "vial", reorder_threshold: 15 },
    { id: "med14", name: "Chloroquine", category: "Antimalarial", unit: "strip", reorder_threshold: 30 },
    { id: "med15", name: "ACT (Artemisinin Combination Therapy)", category: "Antimalarial", unit: "strip", reorder_threshold: 30 },
    { id: "med16", name: "Anti-TB Drugs (Category I Kit)", category: "TB Treatment", unit: "kit", reorder_threshold: 10 },
    { id: "med17", name: "Diazepam Injection", category: "Sedative/Emergency", unit: "vial", reorder_threshold: 10 },
    { id: "med18", name: "Adrenaline Injection", category: "Emergency", unit: "vial", reorder_threshold: 10 },
    { id: "med19", name: "Normal Saline IV", category: "IV Fluid", unit: "bottle", reorder_threshold: 40 },
    { id: "med20", name: "Oxytocin Injection", category: "Maternal Care", unit: "vial", reorder_threshold: 15 },
];

const DEMO_USERS = [
    { email: "dho@xema.demo", password: "Xema@2026", role: "dho", name: "District Health Officer", phc_id: null },
    { email: "mo.rampur@xema.demo", password: "Xema@2026", role: "medical_officer", name: "Dr. Medical Officer - Rampur", phc_id: "rampur" },
    { email: "pharmacist.rampur@xema.demo", password: "Xema@2026", role: "pharmacist", name: "Pharmacist - Rampur", phc_id: "rampur" },
    { email: "mp@xema.demo", password: "Xema@2026", role: "mp", name: "Member of Parliament", phc_id: null },
];

// ---------- Generators ----------

function genDailyReports(phcId, pattern) {
    const docs = [];
    for (let d = 14; d >= 0; d--) {
        const date = isoDaysAgo(d);
        let doctor_present = true;
        let staff_available_count = 6;
        const staff_required_count = 6;
        let beds_total = 20;
        let beds_occupied = 12;
        let patient_count = rand(35, 45);

        if (pattern === "crisis_staffing") {
            // Devgaon: doctor absent last 5 days (d=4..0), staff drops 6 -> 4
            if (d <= 4) {
                doctor_present = false;
                staff_available_count = Math.max(4, 6 - (5 - d));
            }
        }

        if (pattern === "moderate_beds") {
            // Amarganj: consistently 1 bed short of capacity
            beds_occupied = 19;
        }

        docs.push({
            id: `${phcId}_${date}`,
            phc_id: phcId,
            date,
            patient_count,
            doctor_present,
            staff_available_count,
            staff_required_count,
            beds_total,
            beds_occupied,
            submitted_by: "seed",
        });
    }
    return docs;
}

function genDiseaseCases(phcId, pattern) {
    const docs = [];
    for (let d = 14; d >= 0; d--) {
        const date = isoDaysAgo(d);
        let fever = rand(4, 6);
        let diarrhea = rand(2, 3);

        if (pattern === "crisis_disease") {
            // Sitapur: flat until d=4, then rises sharply
            if (d <= 4) {
                const risePosition = 4 - d; // 0..4
                fever = [8, 12, 18, 24, 28][risePosition];
                diarrhea = [4, 6, 9, 12, 15][risePosition];
            }
        }

        docs.push({ id: `${phcId}_${date}_fever`, phc_id: phcId, date, disease_name: "Fever", case_count: fever });
        docs.push({ id: `${phcId}_${date}_diarrhea`, phc_id: phcId, date, disease_name: "Diarrhea", case_count: diarrhea });
    }
    return docs;
}

function genInventory(phcId, pattern) {
    const docs = [];
    for (const med of MEDICINES) {
        let quantity = rand(60, 120); // healthy default

        if (pattern === "crisis_stock") {
            // Rampur: Amoxicillin + Ciprofloxacin critically low
            if (med.id === "med03") quantity = 8;
            else if (med.id === "med04") quantity = 12;
        }

        if (pattern === "moderate_stock") {
            // Kishanpur: ~35% across the board
            quantity = Math.round(med.reorder_threshold * 0.9); // hovering near/slightly above threshold, trending down
        }

        if (pattern === "healthy_surplus") {
            // Lalganj / Narayanpur: surplus antibiotics for transfer-demo
            if (med.id === "med03" || med.id === "med04") quantity = rand(120, 150);
        }

        docs.push({
            id: `${phcId}_${med.id}`,
            phc_id: phcId,
            medicine_id: med.id,
            quantity,
            batch_no: `B${rand(1000, 9999)}`,
            expiry_date: isoDaysAgo(-rand(60, 300)), // future date
            updated_at: new Date().toISOString(),
        });
    }
    return docs;
}

function genTestAvailability(phcId, pattern) {
    const tests = ["CBC", "X-ray", "Malaria Rapid Test", "Blood Sugar", "Urine Routine"];
    return tests.map((test) => {
        let available = true;
        if (pattern === "healthy_no_xray" && test === "X-ray") available = false;
        if (pattern === "healthy_no_malaria" && test === "Malaria Rapid Test") available = false;
        return {
            id: `${phcId}_${test.replace(/\s+/g, "_")}`,
            phc_id: phcId,
            date: isoDaysAgo(0),
            test_name: test,
            available,
        };
    });
}

// ---------- Batch write helper ----------

async function writeCollection(collectionName, docs) {
    const batch = db.batch();
    docs.forEach((d) => {
        const { id, ...rest } = d;
        batch.set(db.collection(collectionName).doc(id), rest);
    });
    await batch.commit();
    console.log(`  -> wrote ${docs.length} docs to ${collectionName}`);
}

// ---------- Main ----------

async function seed() {
    console.log("Seeding Xema Firestore data...\n");

    // District
    await db.collection("Districts").doc(DISTRICT_ID).set({ name: "Kaushal District" });
    console.log("District created.");

    // PHCs
    await writeCollection(
        "PHCs",
        PHCS.map((p) => ({ id: p.id, district_id: DISTRICT_ID, name: p.name, location_lat: null, location_lng: null }))
    );

    // Medicines
    await writeCollection("Medicines", MEDICINES);

    // Per-PHC data
    for (const phc of PHCS) {
        console.log(`\nSeeding data for ${phc.name} (${phc.pattern})...`);
        await writeCollection("DailyReports", genDailyReports(phc.id, phc.pattern));
        await writeCollection("DiseaseCases", genDiseaseCases(phc.id, phc.pattern));
        await writeCollection("Inventory", genInventory(phc.id, phc.pattern));
        await writeCollection("TestAvailability", genTestAvailability(phc.id, phc.pattern));
    }

    // Demo users (Auth + Users collection)
    console.log("\nCreating demo user accounts...");
    for (const u of DEMO_USERS) {
        let userRecord;
        try {
            userRecord = await auth.createUser({ email: u.email, password: u.password, displayName: u.name });
        } catch (err) {
            if (err.code === "auth/email-already-exists") {
                userRecord = await auth.getUserByEmail(u.email);
                console.log(`  ${u.email} already exists, reusing.`);
            } else {
                throw err;
            }
        }
        await db.collection("Users").doc(userRecord.uid).set({
            name: u.name,
            email: u.email,
            role: u.role,
            phc_id: u.phc_id,
        });
        console.log(`  -> ${u.email} (uid: ${userRecord.uid}, role: ${u.role})`);
    }

    console.log("\nSeeding complete.");
    process.exit(0);
}

seed().catch((err) => {
    console.error("Seed script failed:", err);
    process.exit(1);
});