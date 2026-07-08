import React, { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase.js';
import DashboardHeader from '../../components/DashboardHeader';

const MUSTARD = '#E0A72E';
const NAVY = '#1B2A4A';
const CREAM = '#FBF8F0';

// Shared status -> pill styling/label, kept in sync with the pharmacist
// TransferOrders screen so a transfer looks the same everywhere.
const statusColors = {
    completed: { bg: '#EAFAF0', fg: '#1E8A4C' },
    rejected: { bg: '#FDECEC', fg: '#C0392B' },
    rejected_by_dho: { bg: '#FDECEC', fg: '#C0392B' },
    pending: { bg: '#FBF0D6', fg: '#8A6D2E' },
    pending_approval: { bg: '#EAF0FB', fg: '#2E5C8A' },
};
const statusLabels = {
    rejected_by_dho: 'Rejected by DHO',
    pending_approval: 'Awaiting DHO approval',
};

export default function TransferApprovals() {
    const { user } = useAuth();

    const [medicinesById, setMedicinesById] = useState({});
    const [phcsById, setPhcsById] = useState({});
    const [transfers, setTransfers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const unsubMeds = onSnapshot(collection(db, 'Medicines'), (snap) => {
            const map = {};
            snap.forEach((d) => (map[d.id] = d.data()));
            setMedicinesById(map);
        });
        const unsubPhcs = onSnapshot(collection(db, 'PHCs'), (snap) => {
            const map = {};
            snap.forEach((d) => (map[d.id] = d.data()));
            setPhcsById(map);
        });
        return () => { unsubMeds(); unsubPhcs(); };
    }, []);

    // DHO oversees the whole district, so unlike the pharmacist screen this
    // is NOT scoped to a single phc_id — every transfer across every PHC
    // shows up here.
    useEffect(() => {
        const unsub = onSnapshot(collection(db, 'Transfers'), (snap) => {
            const rows = [];
            snap.forEach((d) => rows.push({ id: d.id, ...d.data() }));
            setTransfers(rows);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const enriched = useMemo(() => {
        return transfers
            .map((t) => ({
                ...t,
                medicineName: medicinesById[t.medicine_id]?.name || t.medicine_id,
                unit: medicinesById[t.medicine_id]?.unit || '',
                // Fall back to the originally-requested quantity/from-PHC if the
                // top-level field hasn't been written yet (e.g. before the
                // receiving PHC confirms), so nothing shows as a bare "—".
                displayQty: t.quantity ?? t.requested_quantity ?? '—',
                fromPhcName:
                    phcsById[t.from_phc_id]?.name ||
                    phcsById[t.requested_from_phc_id]?.name ||
                    t.from_phc_id ||
                    t.requested_from_phc_id ||
                    '—',
                toPhcName: phcsById[t.to_phc_id]?.name || t.to_phc_id || '—',
            }))
            .sort((a, b) => (a.status === 'pending_approval' ? -1 : 1) - (b.status === 'pending_approval' ? -1 : 1));
    }, [transfers, medicinesById, phcsById]);

    const awaitingApproval = enriched.filter((t) => t.status === 'pending_approval');
    const history = enriched.filter((t) => t.status !== 'pending_approval');

    async function approveTransfer(t) {
        setBusyId(t.id);
        setError('');
        try {
            await updateDoc(doc(db, 'Transfers', t.id), {
                status: 'pending',
                approved_by: user?.uid || 'dho',
                approved_at: serverTimestamp(),
            });
        } catch (err) {
            console.error('Failed to approve transfer:', err);
            setError('Something went wrong approving this transfer — try again.');
        } finally {
            setBusyId(null);
        }
    }

    async function rejectTransfer(t) {
        setBusyId(t.id);
        setError('');
        try {
            // Preserve whatever from-PHC/quantity info exists so History doesn't
            // show blank fields for a DHO-rejected transfer.
            await updateDoc(doc(db, 'Transfers', t.id), {
                status: 'rejected_by_dho',
                from_phc_id: t.from_phc_id ?? t.requested_from_phc_id ?? null,
                quantity: t.quantity ?? t.requested_quantity ?? null,
                approved_by: user?.uid || 'dho',
                approved_at: serverTimestamp(),
            });
        } catch (err) {
            console.error('Failed to reject transfer:', err);
            setError('Something went wrong rejecting this transfer — try again.');
        } finally {
            setBusyId(null);
        }
    }

    if (loading) {
        return <div style={styles.loadingScreen}>Loading transfers…</div>;
    }

    return (
        <div style={{ backgroundColor: CREAM, minHeight: '100vh' }}>
            <DashboardHeader accentColor={MUSTARD} />

            <div style={styles.page}>
                <h1 style={styles.title}>Transfer Approvals</h1>
                {error && <div style={styles.errorBanner}>{error}</div>}

                <h3 style={styles.sectionTitle}>Awaiting your approval</h3>
                {awaitingApproval.length === 0 && (
                    <div style={styles.emptyState}>No transfers waiting on approval right now.</div>
                )}
                {awaitingApproval.map((t) => (
                    <div key={t.id} style={styles.pendingCard}>
                        <div style={styles.pendingHeader}>
                            <span style={styles.medName}>{t.medicineName}</span>
                            <span style={styles.qtyTag}>{t.displayQty} {t.unit}</span>
                        </div>
                        <div style={styles.routeRow}>
                            {t.fromPhcName} → {t.toPhcName}
                        </div>
                        <div style={styles.confirmRow}>
                            <button
                                style={styles.confirmBtn}
                                disabled={busyId === t.id}
                                onClick={() => approveTransfer(t)}
                            >
                                {busyId === t.id ? 'Approving…' : 'Approve'}
                            </button>
                            <button
                                style={styles.rejectBtn}
                                disabled={busyId === t.id}
                                onClick={() => rejectTransfer(t)}
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                ))}

                <h3 style={{ ...styles.sectionTitle, marginTop: '28px' }}>All transfers</h3>
                <div style={styles.tableCard}>
                    <div style={{ ...styles.tableRow, ...styles.tableHeadRow }}>
                        <div style={{ ...styles.cell, flex: 2 }}>Medicine</div>
                        <div style={{ ...styles.cell, flex: 2 }}>Route</div>
                        <div style={styles.cell}>Qty</div>
                        <div style={styles.cell}>Status</div>
                    </div>
                    {history.length === 0 && (
                        <div style={styles.emptyState}>No transfer history yet.</div>
                    )}
                    {history.map((t) => (
                        <div key={t.id} style={styles.tableRow}>
                            <div style={{ ...styles.cell, flex: 2, fontWeight: 700, color: NAVY }}>{t.medicineName}</div>
                            <div style={{ ...styles.cell, flex: 2 }}>{t.fromPhcName} → {t.toPhcName}</div>
                            <div style={styles.cell}>{t.displayQty} {t.unit}</div>
                            <div style={styles.cell}>
                                <span style={{
                                    ...styles.statusPill,
                                    background: statusColors[t.status]?.bg || '#FBF0D6',
                                    color: statusColors[t.status]?.fg || '#8A6D2E',
                                }}>
                                    {statusLabels[t.status] || t.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

const styles = {
    loadingScreen: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: CREAM, color: NAVY, fontSize: '16px' },
    page: { padding: '20px 24px 40px', maxWidth: '860px', margin: '0 auto' },
    title: { fontSize: '22px', fontWeight: 800, color: NAVY, margin: '0 0 18px' },
    sectionTitle: { fontSize: '15px', fontWeight: 800, color: NAVY, margin: '0 0 10px' },

    errorBanner: { background: '#FDECEC', color: '#C0392B', padding: '10px 16px', borderRadius: '10px', fontSize: '14px', marginBottom: '14px' },
    emptyState: { padding: '20px', textAlign: 'center', color: '#8A897F', fontSize: '14px', background: '#FFFDF8', borderRadius: '14px', border: '1.5px solid #EFE7CF' },

    pendingCard: { background: '#FFFDF8', border: '1.5px solid #F3D08A', borderRadius: '16px', padding: '16px 20px', marginBottom: '12px' },
    pendingHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' },
    medName: { fontSize: '15px', fontWeight: 800, color: NAVY },
    qtyTag: { fontSize: '12px', fontWeight: 700, color: '#8A6D2E' },
    routeRow: { fontSize: '13px', color: NAVY, opacity: 0.75, marginBottom: '10px' },
    confirmRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
    confirmBtn: { background: NAVY, color: '#fff', border: 'none', borderRadius: '999px', padding: '8px 16px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' },
    rejectBtn: { background: 'transparent', border: '1.5px solid #C0392B', color: '#C0392B', borderRadius: '999px', padding: '8px 16px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' },

    tableCard: { backgroundColor: '#FFFDF8', borderRadius: '18px', border: '1.5px solid #EFE7CF', overflow: 'hidden' },
    tableRow: { display: 'flex', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid #F1EBDA', gap: '10px' },
    tableHeadRow: { background: '#FBF0D6', fontWeight: 700, color: NAVY, fontSize: '13px' },
    cell: { flex: 1, fontSize: '14px', color: NAVY },
    statusPill: { padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 700, textTransform: 'capitalize' },
};