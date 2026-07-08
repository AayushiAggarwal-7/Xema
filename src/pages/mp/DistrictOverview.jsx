import React from "react";
import { useAuth } from "../../context/AuthContext";

const TERRACOTTA = "#C87F4A";
const NAVY = "#1B2A4A";

const CONSTITUENCY_PHCS = [
  { name: "PHC Sitapur", tier: "High", reason: "Fever cases rising to 28 per day over the last week." },
  { name: "PHC Devgaon", tier: "Medium", reason: "Doctor absent for 5 consecutive days." },
  { name: "PHC Rampur", tier: "Medium", reason: "Amoxicillin 500mg below reorder threshold." },
  { name: "PHC Govindpur", tier: "Healthy", reason: "No active issues." },
  { name: "PHC Manikpur", tier: "Healthy", reason: "No active issues." },
  { name: "PHC Amarganj", tier: "Healthy", reason: "No active issues." },
];

const TIER_COLORS = {
  High: { bg: "#fef2f2", border: "#fca5a5", text: "#b91c1c", dot: "#ef4444" },
  Medium: { bg: "#fffbeb", border: "#fcd34d", text: "#92400e", dot: "#f59e0b" },
  Healthy: { bg: "#f0fdf4", border: "#86efac", text: "#166534", dot: "#22c55e" },
};

export default function MpDistrictOverview() {
  const { user, logout } = useAuth();

  return (
    <div className="mp-dashboard-container">
      <style>{`
        .mp-dashboard-container {
          font-family: var(--sans);
          min-height: 100vh;
          background: #fcfbfe;
        }
        .mp-dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #ffffff;
          padding: 16px 32px;
          border-bottom: 1px solid var(--border);
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }
        .mp-header-logo-section { display: flex; align-items: center; gap: 8px; }
        .mp-header-logo { height: 32px; }
        .mp-user-profile-section { display: flex; align-items: center; gap: 20px; }
        .mp-welcome-text { font-size: 14.5px; color: var(--text); }
        .mp-user-name { font-weight: 600; color: var(--text-h); }
        .mp-role-badge {
          background: rgba(200, 127, 74, 0.14);
          color: ${TERRACOTTA};
          padding: 2px 8px;
          border-radius: 99px;
          font-size: 12px;
          font-weight: 600;
          margin-left: 8px;
          text-transform: uppercase;
        }
        .mp-logout-btn {
          background: #ffffff;
          border: 1px solid var(--border);
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13.5px;
          font-weight: 600;
          color: #ef4444;
          cursor: pointer;
        }
        .mp-logout-btn:hover { background: #fef2f2; border-color: #fca5a5; }
        .mp-dashboard-content {
          padding: 40px 32px;
          text-align: left;
          max-width: 1126px;
          margin: 0 auto;
        }
        .mp-summary-strip {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 32px;
        }
        .mp-summary-card {
          background: #ffffff;
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 20px;
        }
        .mp-summary-card .count { font-size: 28px; font-weight: 700; color: var(--text-h); }
        .mp-summary-card .label { font-size: 13px; color: var(--text); margin-top: 4px; }
        .mp-section-title { font-size: 18px; font-weight: 700; color: var(--text-h); margin-bottom: 16px; }
        .mp-phc-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 16px;
        }
        .mp-phc-card { border-radius: 12px; padding: 18px; border: 1px solid; }
        .mp-phc-card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .mp-phc-name { font-weight: 600; font-size: 15px; color: var(--text-h); }
        .mp-tier-dot { width: 10px; height: 10px; border-radius: 50%; }
        .mp-phc-reason { font-size: 13px; }
      `}</style>

      <header className="mp-dashboard-header">
        <div className="mp-header-logo-section">
          <img src="/logo.svg" className="mp-header-logo" alt="Xema" />
        </div>
        <div className="mp-user-profile-section">
          <span className="mp-welcome-text">
            Welcome, <span className="mp-user-name">{user?.name || "MP"}</span>
            <span className="mp-role-badge">MP</span>
          </span>
          <button className="mp-logout-btn" onClick={logout}>Sign Out</button>
        </div>
      </header>

      <div className="mp-dashboard-content">
        <div className="mp-summary-strip">
          <div className="mp-summary-card">
            <div className="count">12</div>
            <div className="label">PHCs in constituency</div>
          </div>
          <div className="mp-summary-card">
            <div className="count" style={{ color: "#ef4444" }}>1</div>
            <div className="label">High priority</div>
          </div>
          <div className="mp-summary-card">
            <div className="count" style={{ color: "#f59e0b" }}>2</div>
            <div className="label">Medium priority</div>
          </div>
          <div className="mp-summary-card">
            <div className="count" style={{ color: "#22c55e" }}>9</div>
            <div className="label">Healthy</div>
          </div>
        </div>

        <div className="mp-section-title">Constituency Health Overview</div>
        <div className="mp-phc-grid">
          {CONSTITUENCY_PHCS.map((phc) => {
            const colors = TIER_COLORS[phc.tier];
            return (
              <div
                key={phc.name}
                className="mp-phc-card"
                style={{ background: colors.bg, borderColor: colors.border }}
              >
                <div className="mp-phc-card-top">
                  <span className="mp-phc-name">{phc.name}</span>
                  <span className="mp-tier-dot" style={{ background: colors.dot }} title={phc.tier} />
                </div>
                <p className="mp-phc-reason" style={{ color: colors.text }}>{phc.reason}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}