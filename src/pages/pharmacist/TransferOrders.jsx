import React, { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase.js';
import DashboardHeader from '../../components/DashboardHeader';

const MUSTARD = '#E0A72E';
const NAVY = '#1B2A4A';
const CREAM = '#FBF8F0';

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
  pending: 'Approved (Awaiting Delivery)',
};

export default function TransferOrders() {
  const { user } = useAuth();
  const phcId = user?.phc_id;

  const [medicinesById, setMedicinesById] = useState({});
  const [phcsById, setPhcsById] = useState({});
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // All transfers involving this PHC
  useEffect(() => {
    if (!phcId) return;
    const unsub = onSnapshot(collection(db, 'Transfers'), (snap) => {
      const rows = [];
      snap.forEach((d) => {
        const data = d.data();
        if (data.to_phc_id === phcId || data.from_phc_id === phcId) {
          rows.push({ id: d.id, ...data });
        }
      });
      setTransfers(rows);
      setLoading(false);
    });
    return () => unsub();
  }, [phcId]);

  const enriched = useMemo(() => {
    return transfers
      .map((t) => ({
        ...t,
        medicineName: medicinesById[t.medicine_id]?.name || t.medicine_id,
        unit: medicinesById[t.medicine_id]?.unit || '',
        fromPhcName:
          phcsById[t.from_phc_id]?.name ||
          phcsById[t.requested_from_phc_id]?.name ||
          t.from_phc_id ||
          t.requested_from_phc_id ||
          '—',
        toPhcName: phcsById[t.to_phc_id]?.name || t.to_phc_id || '—',
        direction: t.to_phc_id === phcId ? 'incoming' : 'outgoing',
      }))
      .sort((a, b) => b.requested_at?.localeCompare(a.requested_at || '') || 0);
  }, [transfers, medicinesById, phcsById, phcId]);

  if (loading) {
    return <div style={styles.loadingScreen}>Loading transfers…</div>;
  }

  return (
    <div style={{ backgroundColor: CREAM, minHeight: '100vh' }}>
      <DashboardHeader accentColor={MUSTARD} />

      <div style={styles.page}>
        <h1 style={styles.title}>Transfer Orders</h1>

        <h3 style={styles.sectionTitle}>Active Transfers</h3>
        <div style={styles.tableCard}>
          <div style={{ ...styles.tableRow, ...styles.tableHeadRow }}>
            <div style={{ ...styles.cell, flex: 2 }}>Medicine</div>
            <div style={styles.cell}>Direction</div>
            <div style={styles.cell}>Qty</div>
            <div style={styles.cell}>Status</div>
          </div>
          {enriched.length === 0 && (
            <div style={styles.emptyState}>No transfers recorded.</div>
          )}
          {enriched.map((t) => (
            <div key={t.id} style={styles.tableRow}>
              <div style={{ ...styles.cell, flex: 2, fontWeight: 700, color: NAVY }}>{t.medicineName}</div>
              <div style={styles.cell}>
                {t.direction === 'incoming' ? `From ${t.fromPhcName}` : `To ${t.toPhcName}`}
              </div>
              <div style={styles.cell}>{t.quantity ?? t.requested_quantity ?? '—'} {t.unit}</div>
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
  page: { padding: '20px 24px 40px', maxWidth: '760px', margin: '0 auto' },
  title: { fontSize: '22px', fontWeight: 800, color: NAVY, margin: '0 0 18px' },
  sectionTitle: { fontSize: '15px', fontWeight: 800, color: NAVY, margin: '0 0 10px' },

  errorBanner: { background: '#FDECEC', color: '#C0392B', padding: '10px 16px', borderRadius: '10px', fontSize: '14px', marginBottom: '14px' },
  emptyState: { padding: '20px', textAlign: 'center', color: '#8A897F', fontSize: '14px', background: '#FFFDF8', borderRadius: '14px', border: '1.5px solid #EFE7CF' },

  tableCard: { backgroundColor: '#FFFDF8', borderRadius: '18px', border: '1.5px solid #EFE7CF', overflow: 'hidden' },
  tableRow: { display: 'flex', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid #F1EBDA', gap: '10px' },
  tableHeadRow: { background: '#FBF0D6', fontWeight: 700, color: NAVY, fontSize: '13px' },
  cell: { flex: 1, fontSize: '14px', color: NAVY },
  statusPill: { padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 700, textTransform: 'capitalize' },
};