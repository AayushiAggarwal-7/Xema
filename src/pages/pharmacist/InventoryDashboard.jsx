import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePharmacistDashboard } from '../../hooks/usePharmacistDashboard';

const MUSTARD = '#E0A72E';
const NAVY = '#1B2A4A';
const CREAM = '#FBF8F0';

export default function InventoryDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    loading, phcName, totalMedicines, lowStockCount, lowStockItems,
    expiringCount, pendingTransferCount, pendingTransfers,
    recentActivity, unreadNotificationCount,
  } = usePharmacistDashboard(user?.phc_id, user?.uid);

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  if (loading) {
    return <div style={styles.loadingScreen}>Loading dashboard…</div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.mainCol}>
        <div style={styles.header}>
          <p style={styles.greeting}>🌅 Good Morning!!</p>
          <p style={styles.date}>{today}</p>
          <h1 style={styles.phcName}>{phcName?.toUpperCase()}</h1>
        </div>

        <div style={styles.statStrip}>
          <StatBlock value={totalMedicines} label="Medicines Tracked" />
          <StatBlock value={lowStockCount} label="Low stock" />
          <StatBlock value={expiringCount} label="Expiring Soon" />
          <StatBlock value={pendingTransferCount} label="Pending Transfer" />
        </div>

        <div style={{ ...styles.card, borderColor: '#F3A6A6', boxShadow: '0 0 30px rgba(243,166,166,0.35)' }}>
          <h3 style={styles.cardTitle}>Today's Alerts</h3>
          {lowStockItems.length === 0 && expiringCount === 0 && (
            <p style={styles.emptyState}>No alerts today — all stock levels look healthy.</p>
          )}
          {lowStockItems.map((item) => (
            <p key={item.id} style={styles.alertLine}>
              <span style={{ color: '#E24C4C' }}>●</span> {item.name} Low ({item.quantity}/{item.threshold} {item.unit})
            </p>
          ))}
          {expiringCount > 0 && (
            <p style={styles.alertLine}>
              <span style={{ color: '#E8A23D' }}>●</span> {expiringCount} Medicine{expiringCount !== 1 ? 's' : ''} expiring &lt; 7 days
            </p>
          )}
        </div>

        <div style={{ ...styles.card, borderColor: '#8FD4C4', boxShadow: '0 0 30px rgba(143,212,196,0.35)' }}>
          <h3 style={styles.cardTitle}>Recent Activity</h3>
          {recentActivity.length === 0 && (
            <p style={styles.emptyState}>No recent transactions yet.</p>
          )}
          {recentActivity.map((tx) => (
            <p key={tx.id} style={styles.activityLine}>
              {tx.type === 'receive' ? '📥' : tx.type === 'dispense' ? '💊' : '📦'}{' '}
              {tx.label} {tx.medicineName} ({tx.timeAgo})
            </p>
          ))}
        </div>
      </div>

      <div style={styles.sidebar}>
        <div style={styles.sidebarTopRow}>
          <div style={styles.bellWrap}>
            <Bell size={20} color={NAVY} />
            {unreadNotificationCount > 0 && (
              <span style={styles.bellBadge}>{unreadNotificationCount}</span>
            )}
          </div>
          <span style={styles.profilePill}>PROFILE</span>
        </div>

        <h4 style={styles.quickActionsTitle}>Quick Actions</h4>

        {pendingTransferCount > 0 && (
          <div style={styles.transferAlert} onClick={() => navigate('/pharmacist/transfers')}>
            <p style={styles.transferAlertTitle}>
              CONFIRM TRANSFER {pendingTransferCount}
            </p>
            <p style={styles.transferAlertSub}>
              <AlertTriangle size={12} style={{ marginRight: '4px', verticalAlign: '-2px' }} />
              From {pendingTransfers[0]?.fromPhcName}
            </p>
          </div>
        )}

        <div style={styles.actionLink} onClick={() => navigate('/pharmacist/stock-update')}>&gt; Receive stock</div>
        <div style={styles.actionLink} onClick={() => navigate('/pharmacist/stock-update')}>&gt; Dispense medicine</div>
        <div style={styles.actionLink} onClick={() => navigate('/pharmacist/inventory')}>&gt; View inventory</div>
      </div>
    </div>
  );
}

function StatBlock({ value, label }) {
  return (
    <div style={styles.statBlock}>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  );
}

const styles = {
  loadingScreen: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: CREAM, color: NAVY, fontSize: '16px' },
  page: { minHeight: '100vh', backgroundColor: CREAM, display: 'grid', gridTemplateColumns: '1fr 260px', gap: '24px', padding: '24px' },
  mainCol: { display: 'flex', flexDirection: 'column', gap: '20px' },

  header: { textAlign: 'center' },
  greeting: { fontSize: '15px', color: MUSTARD, fontWeight: 600, margin: 0 },
  date: { fontSize: '18px', color: MUSTARD, fontWeight: 700, margin: '2px 0' },
  phcName: { fontSize: '22px', color: NAVY, fontWeight: 800, margin: '4px 0 0' },

  statStrip: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', backgroundColor: '#FBF0D6', borderRadius: '14px', padding: '16px 0' },
  statBlock: { textAlign: 'center' },
  statValue: { fontSize: '26px', fontWeight: 800, color: NAVY },
  statLabel: { fontSize: '12px', color: '#6B6A63', marginTop: '2px' },

  card: { backgroundColor: '#FFFDF8', borderRadius: '18px', border: '1.5px solid', padding: '20px 24px' },
  cardTitle: { textAlign: 'center', fontSize: '17px', fontWeight: 800, color: NAVY, margin: '0 0 14px' },
  alertLine: { fontSize: '15px', color: NAVY, fontWeight: 600, margin: '8px 0' },
  activityLine: { fontSize: '15px', color: NAVY, fontWeight: 500, margin: '8px 0' },
  emptyState: { fontSize: '14px', color: '#8A897F', textAlign: 'center', margin: 0 },

  sidebar: { backgroundColor: '#F3E9D2', borderRadius: '18px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' },
  sidebarTopRow: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginBottom: '8px' },
  bellWrap: { position: 'relative' },
  bellBadge: { position: 'absolute', top: '-6px', right: '-6px', backgroundColor: '#E24C4C', color: '#fff', fontSize: '10px', fontWeight: 700, borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  profilePill: { backgroundColor: '#EDE79A', borderRadius: '999px', padding: '6px 16px', fontSize: '12px', fontWeight: 700, color: NAVY, cursor: 'pointer' },
  quickActionsTitle: { fontSize: '15px', fontWeight: 800, color: NAVY, margin: '0 0 4px' },

  transferAlert: { cursor: 'pointer', padding: '4px 0' },
  transferAlertTitle: { color: '#E24C4C', fontWeight: 800, fontSize: '13px', margin: 0 },
  transferAlertSub: { color: '#8A6D2E', fontSize: '12px', margin: '2px 0 0' },

  actionLink: { fontSize: '14px', fontWeight: 600, color: NAVY, cursor: 'pointer', padding: '4px 0' },
};