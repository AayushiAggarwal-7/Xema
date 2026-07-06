import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";
import { db } from "../lib/firebase.js";

function timeAgo(dateInput) {
    const then = dateInput?.toDate ? dateInput.toDate() : new Date(dateInput);
    const seconds = Math.floor((Date.now() - then.getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}hr ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

export function usePharmacistDashboard(phcId, userId) {
    const [loading, setLoading] = useState(true);
    const [medicinesById, setMedicinesById] = useState({});
    const [phcsById, setPhcsById] = useState({});
    const [inventory, setInventory] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [pendingTransfers, setPendingTransfers] = useState([]);
    const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

    useEffect(() => {
        const unsubMeds = onSnapshot(collection(db, "Medicines"), (snap) => {
            const map = {};
            snap.forEach((d) => (map[d.id] = d.data()));
            setMedicinesById(map);
        });
        const unsubPhcs = onSnapshot(collection(db, "PHCs"), (snap) => {
            const map = {};
            snap.forEach((d) => (map[d.id] = d.data()));
            setPhcsById(map);
        });
        return () => { unsubMeds(); unsubPhcs(); };
    }, []);

    useEffect(() => {
        if (!phcId) return;
        const q = query(collection(db, "Inventory"), where("phc_id", "==", phcId));
        const unsub = onSnapshot(q, (snap) => {
            const rows = [];
            snap.forEach((d) => rows.push({ id: d.id, ...d.data() }));
            setInventory(rows);
            setLoading(false);
        });
        return () => unsub();
    }, [phcId]);

    useEffect(() => {
        if (!phcId) return;
        const q = query(
            collection(db, "Transactions"),
            where("phc_id", "==", phcId),
            orderBy("created_at", "desc"),
            limit(5)
        );
        const unsub = onSnapshot(q, (snap) => {
            const rows = [];
            snap.forEach((d) => rows.push({ id: d.id, ...d.data() }));
            setRecentActivity(rows);
        });
        return () => unsub();
    }, [phcId]);

    useEffect(() => {
        if (!phcId) return;
        const q = query(
            collection(db, "Transfers"),
            where("to_phc_id", "==", phcId),
            where("status", "==", "pending")
        );
        const unsub = onSnapshot(q, (snap) => {
            const rows = [];
            snap.forEach((d) => rows.push({ id: d.id, ...d.data() }));
            setPendingTransfers(rows);
        });
        return () => unsub();
    }, [phcId]);

    useEffect(() => {
        if (!userId) return;
        const q = query(
            collection(db, "Notifications"),
            where("user_id", "==", userId),
            where("read_bool", "==", false)
        );
        const unsub = onSnapshot(q, (snap) => setUnreadNotificationCount(snap.size));
        return () => unsub();
    }, [userId]);

    const totalMedicines = inventory.length;

    const lowStockItems = inventory
        .filter((item) => {
            const med = medicinesById[item.medicine_id];
            return med && item.quantity < med.reorder_threshold;
        })
        .map((item) => ({
            ...item,
            name: medicinesById[item.medicine_id]?.name || item.medicine_id,
            threshold: medicinesById[item.medicine_id]?.reorder_threshold,
            unit: medicinesById[item.medicine_id]?.unit || "",
        }));

    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    const expiringItems = inventory
        .filter((item) => {
            if (!item.expiry_date) return false;
            const expiry = new Date(item.expiry_date).getTime();
            return expiry - Date.now() < SEVEN_DAYS_MS && expiry > Date.now();
        })
        .map((item) => ({ ...item, name: medicinesById[item.medicine_id]?.name || item.medicine_id }));

    const recentActivityFormatted = recentActivity.map((tx) => ({
        ...tx,
        medicineName: medicinesById[tx.medicine_id]?.name || tx.medicine_id,
        timeAgo: timeAgo(tx.created_at),
        label:
            tx.type === "receive" ? "Received"
                : tx.type === "dispense" ? "Dispensed"
                    : tx.type === "expired" ? "Marked expired"
                        : tx.type === "damaged" ? "Marked damaged"
                            : tx.type,
    }));

    const pendingTransfersFormatted = pendingTransfers.map((t) => ({
        ...t,
        fromPhcName: phcsById[t.from_phc_id]?.name || t.from_phc_id,
        medicineName: medicinesById[t.medicine_id]?.name || t.medicine_id,
    }));

    return {
        loading,
        phcName: phcsById[phcId]?.name || (phcId ? `PHC ${phcId.toUpperCase()}` : ""),
        totalMedicines,
        lowStockItems,
        lowStockCount: lowStockItems.length,
        expiringItems,
        expiringCount: expiringItems.length,
        pendingTransfers: pendingTransfersFormatted,
        pendingTransferCount: pendingTransfersFormatted.length,
        recentActivity: recentActivityFormatted,
        unreadNotificationCount,
    };
}