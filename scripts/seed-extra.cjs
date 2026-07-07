const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const serviceAccount = require("./serviceAccountKey.json");

const app = initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore(app);

function minutesAgo(n) {
  return new Date(Date.now() - n * 60 * 1000).toISOString();
}
function hoursAgo(n) {
  return new Date(Date.now() - n * 60 * 60 * 1000).toISOString();
}

async function seedExtra() {
  console.log("Seeding extra Transactions + Transfer for demo realism...\n");

  const batch = db.batch();

  // Recent Activity — a few realistic transactions for Rampur
  const transactions = [
    { id: "rampur_tx_1", phc_id: "rampur", medicine_id: "med02", type: "receive", quantity: 100, performed_by: "seed", created_at: minutesAgo(10) },
    { id: "rampur_tx_2", phc_id: "rampur", medicine_id: "med13", type: "dispense", quantity: 2, performed_by: "seed", created_at: hoursAgo(1) },
    { id: "rampur_tx_3", phc_id: "rampur", medicine_id: "med01", type: "dispense", quantity: 15, performed_by: "seed", created_at: hoursAgo(3) },
  ];
  transactions.forEach((t) => {
    const { id, ...rest } = t;
    batch.set(db.collection("Transactions").doc(id), rest);
  });

  // One pending Transfer INTO Rampur — matches "CONFIRM TRANSFER 1 From PHC Chandpur"
  batch.set(db.collection("Transfers").doc("transfer_1"), {
    medicine_id: "med03", // Amoxicillin — matches Rampur's actual crisis
    from_phc_id: "chandpur",
    to_phc_id: "rampur",
    quantity: 40,
    status: "pending",
    requested_by: "system",
    approved_by: null,
    requested_at: hoursAgo(2),
    approved_at: null,
  });

  await batch.commit();
  console.log("Done — Recent Activity and Confirm Transfer should now show real data.");
  process.exit(0);
}

seedExtra().catch((err) => {
  console.error("seed-extra failed:", err);
  process.exit(1);
});