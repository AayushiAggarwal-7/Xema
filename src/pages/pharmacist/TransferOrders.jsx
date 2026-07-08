import React, { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, doc, updateDoc, increment, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase.js';
import DashboardHeader from '../../components/DashboardHeader';

const MUSTARD = '#E0A72E';
const NAVY = '#1B2A4A';
const CREAM = '#FBF8F0';

export default function TransferOrders() {
  const { user } = useAuth();
  const phcId = user?.phc_id;

  const [medicinesById, setMedicinesById] = useState({});
  const [phcsById, setPhcsById] = useState({});
  const [transfers, setTransfers] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');
  const [confirmQty, setConfirmQty] = useState({}); // { [transferId]: string }

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

  // All transfers involving this PHC — either incoming (to confirm) or outgoing (to track)
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

  useEffect(() => {
    if (!phcId) return;
    const unsub = onSnapshot(collection(db, 'Inventory'), (snap) => {
      const rows = [];
      snap.forEach((d) => {
        const data = d.data();
        if (data.phc_id === phcId) rows.push({ id: d.id, ...data });
      });
      setInventory(rows);
    });
    return () => unsub();
  }, [phcId]);

  const enriched = useMemo(() => {
    return transfers
      .map((t) => ({
        ...t,
        medicineName: medicinesById[t.medicine_id]?.name || t.medicine_id,
        unit: medicinesById[t.medicine_id]?.unit || '',
        fromPhcName: phcsById[t.from_phc_id]?.name || t.from_phc_id || '—',
        toPhcName: phcsById[t.to_phc_id]?.name || t.to_phc_id || '—',
        direction: t.to_phc_id === phcId ? 'incoming' : 'outgoing',
      }))
      .sort((a, b) => (a.status === 'pending' ? -1 : 1) - (b.status === 'pending' ? -1 : 1));
  }, [transfers, medicinesById, phcsById, phcId]);

  const incomingPending = enriched.filter((t) => t.direction === 'incoming' && t.status === 'pending');
  const history = enriched.filter((t) => t.status !== 'pending' || t.direction === 'outgoing');

  async function confirmTransfer(t) {
    setError('');
    const qtyStr = confirmQty[t.id];
    const qty = Number(qtyStr);
    if (!qty || qty <= 0) {
      setError('Enter the quantity actually received before confirming.');
      return;
    }

    setBusyId(t.id);
    try {
      // Find (or note absence of) an existing Inventory row for this medicine at this PHC
      const existing = inventory.find((i) => i.medicine_id === t.medicine_id);

      if (existing) {
        await updateDoc(doc(db, 'Inventory', existing.id), { quantity: increment(qty) });
      } else {
        await addDoc(collection(db, 'Inventory'), {
          phc_id: phcId,
          medicine_id: t.medicine_id,
          quantity: qty,
        });
      }

      await updateDoc(doc(db, 'Transfers', t.id), {
        status: 'completed',
        quantity: qty,
        completed_at: serverTimestamp(),
        completed_by: user?.uid || 'pharmacist',
      });

      await addDoc(collection(db, 'Transactions'), {
        phc_id: phcId,
        medicine_id: t.medicine_id,
        type: 'receive',
        quantity: qty,
        note: `Transfer from ${t.fromPhcName}`,
        performed_by: user?.uid || 'pharmacist',
        created_at: serverTimestamp(),
      });

      setConfirmQty((prev) => ({ ...prev, [t.id]: '' }));
    } catch (err) {
      console.error('Failed to confirm transfer:', err);
      setError('Something went wrong confirming this transfer — try again.');
    } finally {
      setBusyId(null);
    }
  }

  async function rejectTransfer(t) {
    setBusyId(t.id);
    setError('');
    try {
      await updateDoc(doc(db, 'Transfers', t.id), {
        status: 'rejected',
        completed_at: serverTimestamp(),
        completed_by: user?.uid || 'pharmacist',
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
        <h1 style={styles.title}>Transfer Orders</h1>
        {error && <div style={styles.errorBanner}>{error}</div>}

        <h3 style={styles.sectionTitle}>Pending — awaiting your confirmation</h3>
        {incomingPending.length === 0 && (
          <div style={styles.emptyState}>No pending transfers right now.</div>
        )}
        {incomingPending.map((t) => (
          <div key={t.id} style={styles.pendingCard}>
            <div style={styles.pendingHeader}>
              <span style={styles.medName}>{t.medicineName}</span>
              <span style={styles.fromTag}>From {t.fromPhcName}</span>
            </div>
            <div style={styles.confirmRow}>
              <input
                type="number"
                min="1"
                placeholder="Qty received"
                style={styles.qtyInput}
                value={confirmQty[t.id] || ''}
                onChange={(e) => setConfirmQty((prev) => ({ ...prev, [t.id]: e.target.value }))}
              />
              <button
                style={styles.confirmBtn}
                disabled={busyId === t.id}
                onClick={() => confirmTransfer(t)}
              >
                {busyId === t.id ? 'Confirming…' : 'Confirm Transfer'}
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

        <h3 style={{ ...styles.sectionTitle, marginTop: '28px' }}>History</h3>
        <div style={styles.tableCard}>
          <div style={{ ...styles.tableRow, ...styles.tableHeadRow }}>
            <div style={{ ...styles.cell, flex: 2 }}>Medicine</div>
            <div style={styles.cell}>Direction</div>
            <div style={styles.cell}>Qty</div>
            <div style={styles.cell}>Status</div>
          </div>
          {history.length === 0 && (
            <div style={styles.emptyState}>No transfer history yet.</div>
          )}
          {history.map((t) => (
            <div key={t.id} style={styles.tableRow}>
              <div style={{ ...styles.cell, flex: 2, fontWeight: 700, color: NAVY }}>{t.medicineName}</div>
              <div style={styles.cell}>
                {t.direction === 'incoming' ? `From ${t.fromPhcName}` : `To ${t.toPhcName}`}
              </div>
              <div style={styles.cell}>{t.quantity ?? '—'} {t.unit}</div>
              <div style={styles.cell}>
                <span style={{
                  ...styles.statusPill,
                  background: t.status === 'completed' ? '#EAFAF0' : t.status === 'rejected' ? '#FDECEC' : '#FBF0D6',
                  color: t.status === 'completed' ? '#1E8A4C' : t.status === 'rejected' ? '#C0392B' : '#8A6D2E',
                }}>
                  {t.status}
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

  pendingCard: { background: '#FFFDF8', border: '1.5px solid #F3D08A', borderRadius: '16px', padding: '16px 20px', marginBottom: '12px' },
  pendingHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  medName: { fontSize: '15px', fontWeight: 800, color: NAVY },
  fromTag: { fontSize: '12px', fontWeight: 700, color: '#8A6D2E' },
  confirmRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  qtyInput: { flex: '1 1 120px', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #E5DFC9', fontSize: '14px' },
  confirmBtn: { background: NAVY, color: '#fff', border: 'none', borderRadius: '999px', padding: '8px 16px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' },
  rejectBtn: { background: 'transparent', border: '1.5px solid #C0392B', color: '#C0392B', borderRadius: '999px', padding: '8px 16px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' },

  tableCard: { backgroundColor: '#FFFDF8', borderRadius: '18px', border: '1.5px solid #EFE7CF', overflow: 'hidden' },
  tableRow: { display: 'flex', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid #F1EBDA', gap: '10px' },
  tableHeadRow: { background: '#FBF0D6', fontWeight: 700, color: NAVY, fontSize: '13px' },
  cell: { flex: 1, fontSize: '14px', color: NAVY },
  statusPill: { padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 700, textTransform: 'capitalize' },
};