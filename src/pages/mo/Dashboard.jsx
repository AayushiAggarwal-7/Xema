import React from "react";
import { useAuth } from "../../context/AuthContext";

const TEAL = "#14958F";
const NAVY = "#1B2A4A";

export default function MoDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="mo-dashboard-container">
      <style>{`
        .mo-dashboard-container {
          font-family: var(--sans);
          min-height: 100vh;
          background: #fcfbfe;
        }
        .mo-dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #ffffff;
          padding: 16px 32px;
          border-bottom: 1px solid var(--border);
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }
        .mo-header-logo-section { display: flex; align-items: center; gap: 8px; }
        .mo-header-logo { height: 32px; }
        .mo-user-profile-section { display: flex; align-items: center; gap: 20px; }
        .mo-welcome-text { font-size: 14.5px; color: var(--text); }
        .mo-user-name { font-weight: 600; color: var(--text-h); }
        .mo-role-badge {
          background: rgba(20, 149, 143, 0.12);
          color: ${TEAL};
          padding: 2px 8px;
          border-radius: 99px;
          font-size: 12px;
          font-weight: 600;
          margin-left: 8px;
          text-transform: uppercase;
        }
        .mo-logout-btn {
          background: #ffffff;
          border: 1px solid var(--border);
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13.5px;
          font-weight: 600;
          color: #ef4444;
          cursor: pointer;
        }
        .mo-logout-btn:hover { background: #fef2f2; border-color: #fca5a5; }
        .mo-dashboard-content {
          padding: 40px 32px;
          text-align: left;
          max-width: 1126px;
          margin: 0 auto;
        }
        .mo-summary-strip {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 32px;
        }
        .mo-summary-card {
          background: #ffffff;
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 20px;
        }
        .mo-summary-card .count { font-size: 28px; font-weight: 700; color: var(--text-h); }
        .mo-summary-card .label { font-size: 13px; color: var(--text); margin-top: 4px; }
        .mo-section-title { font-size: 18px; font-weight: 700; color: var(--text-h); margin-bottom: 16px; }
        .mo-action-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }
        .mo-action-card {
          background: #ffffff;
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 18px;
        }
        .mo-action-card .title { font-weight: 600; font-size: 15px; color: var(--text-h); margin-bottom: 4px; }
        .mo-action-card .desc { font-size: 12.5px; color: var(--text); }
        .mo-report-preview {
          background: #f0fbfa;
          border: 1px solid #bfe8e5;
          border-radius: 12px;
          padding: 24px;
        }
        .mo-report-preview .heading { font-weight: 700; font-size: 15px; color: ${TEAL}; margin-bottom: 12px; }
        .mo-report-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #d7f0ee;
          font-size: 13.5px;
          color: ${NAVY};
        }
        .mo-report-row:last-child { border-bottom: none; }
        .mo-report-row .label { color: var(--text); }
      `}</style>

      <header className="mo-dashboard-header">
        <div className="mo-header-logo-section">
          <img src="/logo.svg" className="mo-header-logo" alt="Xema" />
        </div>
        <div className="mo-user-profile-section">
          <span className="mo-welcome-text">
            Welcome, <span className="mo-user-name">{user?.name || "Medical Officer"}</span>
            <span className="mo-role-badge">Medical Officer</span>
          </span>
          <button className="mo-logout-btn" onClick={logout}>Sign Out</button>
        </div>
      </header>

      <div className="mo-dashboard-content">
        <div className="mo-summary-strip">
          <div className="mo-summary-card">
            <div className="count">34</div>
            <div className="label">Patients seen today</div>
          </div>
          <div className="mo-summary-card">
            <div className="count" style={{ color: TEAL }}>4 / 5</div>
            <div className="label">Staff present</div>
          </div>
          <div className="mo-summary-card">
            <div className="count" style={{ color: "#22c55e" }}>12 / 20</div>
            <div className="label">Beds available</div>
          </div>
          <div className="mo-summary-card">
            <div className="count" style={{ color: "#ef4444" }}>3</div>
            <div className="label">Referrals made</div>
          </div>
        </div>

        <div className="mo-section-title">Quick Actions</div>
        <div className="mo-action-grid">
          <div className="mo-action-card">
            <div className="title">Daily Patient & Disease Log</div>
            <div className="desc">Submit today's patient load and disease case counts.</div>
          </div>
          <div className="mo-action-card">
            <div className="title">Staff Attendance</div>
            <div className="desc">Mark doctor and staff presence for today.</div>
          </div>
          <div className="mo-action-card">
            <div className="title">Bed Availability</div>
            <div className="desc">Update ward occupancy and available beds.</div>
          </div>
          <div className="mo-action-card">
            <div className="title">Test Availability</div>
            <div className="desc">Report which diagnostic tests are currently offered.</div>
          </div>
        </div>

        <div className="mo-section-title">Today's Submitted Report</div>
        <div className="mo-report-preview">
          <div className="heading">Sitapur PHC — Daily Patient & Disease Log</div>
          <div className="mo-report-row"><span className="label">Total patients seen today</span><span>34</span></div>
          <div className="mo-report-row"><span className="label">Fever cases</span><span>28</span></div>
          <div className="mo-report-row"><span className="label">Diarrhea cases</span><span>4</span></div>
          <div className="mo-report-row"><span className="label">Respiratory cases</span><span>2</span></div>
          <div className="mo-report-row"><span className="label">Doctor status</span><span>Present, full day</span></div>
        </div>
      </div>
    </div>
  );
}