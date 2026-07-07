// src/hooks/usePHCReportDetail.js
import { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase.js";

export function usePHCReportDetail(phcId) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        if (!phcId) return;
        let cancelled = false;

        async function load() {
            setLoading(true);

            const phcDoc = await getDoc(doc(db, "PHCs", phcId));
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

            if (!cancelled) {
                setData({
                    phcName: phcDoc.data()?.name,
                    lowStock,
                    diseaseTrend,
                    latestReport,
                    reportType: lowStock.length > 0 ? "stock" : diseaseTrend ? "disease" : "general",
                });
                setLoading(false);
            }
        }

        load();
        return () => { cancelled = true; };
    }, [phcId]);

    return { data, loading };
}