import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, ArrowRight, Bell } from 'lucide-react';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase.js';
import { useAuth } from '../../context/AuthContext';
import { usePriorityAlerts } from '../../hooks/usePriorityAlerts';
import DashboardHeader from '../../components/DashboardHeader';

const NAVY = '#1B2A4A';
const CREAM = '#FBF8F0';

const TIER_STYLES = {
  High: { border: '#F3A6A6', glow: 'rgba(243,166,166,0.4)', badgeBg: '#E24C4C' },
  Medium: { border: '#F0C98A', glow: 'rgba(240,201,138,0.4)', badgeBg: '#E0A72E' },
};

export default function AIPriorities() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { alerts, loading, generatedAt, refresh } = usePriorityAlerts();
  const [handledIds, setHandledIds] = useState([]);
  const [actioning, setActioning] = useState(null);

  async function handleAction(alert) {
    setActioning(alert.phcId);
    try {
      const actionDoc = {
        phc_id: alert.phcId,
        phc_name: alert.phcName,
        action_type: alert.actionType,
        description: alert.actionLabel,
        reason: alert.reason,
        status: 'approved',
        approved_by: user?.uid || 'dho',
        created_at: new Date().toISOString(),
      };
      // Every DHO approval gets logged as an auditable Action record —
      // this is the "propose -> approve -> execute" pattern from the spec.
      await setDoc(doc(collection(db, 'Actions')), actionDoc);

      // Stock-type approvals also create the actual pending Transfer,
      // so the Pharmacist sees it as a real "Confirm Transfer" next.
      if (alert.actionType === 'stock' && alert.worstMed) {
        await setDoc(doc(collection(db, 'Transfers')), {
          medicine_id: alert.worstMed.name,
          to_phc_id: alert.phcId,
          status: 'pending',
          quantity: null, // Pharmacist confirms exact quantity on dispatch
          requested_by: 'dho_approval',
          approved_by: user?.uid || 'dho',
          requested_at: new Date().toISOString(),
          approved_at: new Date().toISOString(),
        });
      }

      setHandledIds((prev) => [...prev, alert.phcId]);
    } catch (err) {
      console.error('Failed to record action:', err);
      alert('Something went wrong recording this action — check the console.');
    } finally {
      setActioning(null);
    }
  }
  <div style={styles.alertTopRow} onClick={() => navigate(`/dho/report/${alert.phcId}`)} role="button"></div>
  const visibleAlerts = alerts.filter((a) => !handledIds.includes(a.phcId));
  const timeAgoText = generatedAt
    ? `Generated ${Math.max(0, Math.round((Date.now() - generatedAt.getTime()) / 60000))} min ago`
    : '';

  return (
    <div style={{ backgroundColor: CREAM, minHeight: '100vh' }}>
      <DashboardHeader accentColor={NAVY} />

      <div style={styles.page}>
        <div style={styles.profileRow}>
          <div style={styles.avatar} />
          <div>
            <p style={styles.nameLine}>Name of DHO : {user?.name || 'District Health Officer'}</p>
            <p style={styles.districtLine}>District : {user?.district || 'District'}</p>
          </div>
          <div style={styles.bellWrap}>
            <Bell size={20} color={NAVY} />
          </div>
        </div>

        <div style={styles.controlRow}>
          <span style={styles.priorityPill}>
            Priority alerts
            <br />
            <span style={styles.pillSub}>{timeAgoText}</span>
          </span>
          <span style={styles.refreshBtn} onClick={refresh}>
            <RefreshCw size={14} className={loading ? 'xema-spin' : ''} /> Refresh
          </span>
        </div>
        <style>{`@keyframes xema-spin-icon { from { transform: rotate(0); } to { transform: rotate(360deg); } } .xema-spin { animation: xema-spin-icon 1s linear infinite; }`}</style>

        {loading && <p style={styles.emptyState}>Computing priority scores from live data…</p>}
        {!loading && visibleAlerts.length === 0 && (
          <p style={styles.emptyState}>No PHCs currently need urgent attention.</p>
        )}

        {visibleAlerts.map((alert) => {
          const tierStyle = TIER_STYLES[alert.tier];
          return (
            <div
              key={alert.phcId}
              style={{ ...styles.alertCard, borderColor: tierStyle.border, boxShadow: `0 0 30px ${tierStyle.glow}` }}
            >
              <div style={styles.alertTopRow}>
                <h3 style={styles.alertTitle}>{alert.phcName}</h3>
                <span style={{ ...styles.tierBadge, backgroundColor: tierStyle.badgeBg }}>{alert.tier}</span>
              </div>
              <p style={styles.alertReason}>{alert.reason}</p>
              <button
                style={styles.actionBtn}
                onClick={() => handleAction(alert)}
                disabled={actioning === alert.phcId}
              >
                {actioning === alert.phcId ? 'Recording…' : alert.actionLabel}
                <ArrowRight size={16} />
              </button>
            </div>
          );
        })}

        <div style={styles.backLink} onClick={() => navigate('/dho/dashboard')}>
          ← Back
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth: '760px', margin: '0 auto', padding: '20px 24px 40px' },
  profileRow: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' },
  avatar: { width: '56px', height: '56px', borderRadius: '10px', backgroundColor: '#5EC5D6' },
  nameLine: { fontSize: '16px', fontWeight: 700, color: NAVY, margin: 0 },
  districtLine: { fontSize: '14px', color: '#5B5A52', margin: '2px 0 0' },
  bellWrap: { marginLeft: 'auto' },

  controlRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' },
  priorityPill: { backgroundColor: NAVY, color: '#fff', borderRadius: '14px', padding: '10px 18px', fontSize: '15px', fontWeight: 700 },
  pillSub: { fontSize: '11px', fontWeight: 400, opacity: 0.8 },
  refreshBtn: { display: 'flex', alignItems: 'center', gap: '6px', color: NAVY, fontWeight: 600, fontSize: '14px', cursor: 'pointer' },

  emptyState: { textAlign: 'center', color: '#8A897F', fontSize: '14px', padding: '20px 0' },

  alertCard: { backgroundColor: '#FFFDF8', border: '1.5px solid', borderRadius: '18px', padding: '18px 22px', marginBottom: '16px' },
  alertTopRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  alertTitle: { fontSize: '18px', fontWeight: 800, color: NAVY, margin: 0 },
  tierBadge: { color: '#fff', fontSize: '12px', fontWeight: 700, borderRadius: '999px', padding: '4px 14px' },
  alertReason: { fontSize: '14px', color: '#4A4A45', margin: '8px 0 14px' },
  actionBtn: {
    width: '100%', backgroundColor: '#FBF8F0', border: `1.5px solid ${NAVY}`, borderRadius: '999px',
    padding: '12px 20px', fontSize: '14px', fontWeight: 600, color: NAVY, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
  },

  backLink: { fontSize: '14px', color: '#6B6A63', fontWeight: 600, cursor: 'pointer', marginTop: '20px' },
};