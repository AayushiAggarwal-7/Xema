import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useDistrictOverview } from "../../hooks/useDistrictOverview";
import { useNavigate } from "react-router-dom";

const TIER_COLORS = {
  High: { bg: "#fef2f2", border: "#fca5a5", text: "#b91c1c", dot: "#ef4444" },
  Medium: { bg: "#fffbeb", border: "#fcd34d", text: "#92400e", dot: "#f59e0b" },
  Healthy: { bg: "#f0fdf4", border: "#86efac", text: "#166534", dot: "#22c55e" },
};

export default function CommandCenter() {
  const { user, logout } = useAuth();
  const { phcs, summary, loading, error } = useDistrictOverview();
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      <style>{`
        .dashboard-container {
          font-family: var(--sans);
          min-height: 100vh;
          background: #fcfbfe;
        }
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #ffffff;
          padding: 16px 32px;
          border-bottom: 1px solid var(--border);
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }
        .header-logo-section {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .header-logo {
          height: 32px;
        }
        .header-logo-text {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-h);
        }
        .user-profile-section {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .welcome-text {
          font-size: 14.5px;
          color: var(--text);
        }
        .user-name {
          font-weight: 600;
          color: var(--text-h);
        }
        .user-role-badge {
          background: rgba(170, 59, 255, 0.1);
          color: #aa3bff;
          padding: 2px 8px;
          border-radius: 99px;
          font-size: 12px;
          font-weight: 600;
          margin-left: 8px;
          text-transform: uppercase;
        }
        .logout-btn {
          background: #ffffff;
          border: 1px solid var(--border);
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13.5px;
          font-weight: 600;
          color: #ef4444;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .logout-btn:hover {
          background: #fef2f2;
          border-color: #fca5a5;
        }
        .dashboard-content {
          padding: 40px 32px;
          text-align: left;
          max-width: 1126px;
          margin: 0 auto;
        }

        /* ---- New: summary strip ---- */
        .summary-strip {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 32px;
        }
        .summary-card {
          background: #ffffff;
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 20px;
        }
        .summary-card .count {
          font-size: 28px;
          font-weight: 700;
          color: var(--text-h);
        }
        .summary-card .label {
          font-size: 13px;
          color: var(--text);
          margin-top: 4px;
        }

        /* ---- New: section header + link to AI Priorities ---- */
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .section-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-h);
        }
        .view-priorities-link {
          font-size: 13.5px;
          font-weight: 600;
          color: #aa3bff;
          text-decoration: none;
          cursor: pointer;
        }

        /* ---- New: PHC grid ---- */
        .phc-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 16px;
        }
        .phc-card {
          border-radius: 12px;
          padding: 18px;
          border: 1px solid;
          cursor: pointer;
          transition: transform 0.15s ease;
        }
        .phc-card:hover {
          transform: translateY(-2px);
        }
        .phc-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        .phc-name {
          font-weight: 600;
          font-size: 15px;
          color: var(--text-h);
        }
        .tier-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        .phc-reason {
          font-size: 13px;
          color: var(--text);
        }

        .state-message {
          padding: 24px;
          text-align: center;
          color: var(--text);
        }
      `}</style>

      <header className="dashboard-header">
        <div className="header-logo-section">
          <img src="/logo.svg" className="header-logo" alt="Xema" />
          <span className="header-logo-text">Xema</span>
        </div>

        <div className="user-profile-section">
          <span className="welcome-text">
            Welcome, <span className="user-name">{user?.name || "DHO"}</span>
            <span className="user-role-badge">DHO</span>
          </span>
          <button className="logout-btn" onClick={logout}>
            Sign Out
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        {loading && <p className="state-message">Loading district overview…</p>}
        {error && <p className="state-message">Couldn't load data: {error}</p>}

        {!loading && !error && (
          <>
            <div className="summary-strip">
              <div className="summary-card">
                <div className="count">{summary.total}</div>
                <div className="label">Total PHCs</div>
              </div>
              <div className="summary-card">
                <div className="count" style={{ color: "#ef4444" }}>
                  {summary.high}
                </div>
                <div className="label">High priority</div>
              </div>
              <div className="summary-card">
                <div className="count" style={{ color: "#f59e0b" }}>
                  {summary.medium}
                </div>
                <div className="label">Medium priority</div>
              </div>
              <div className="summary-card">
                <div className="count" style={{ color: "#22c55e" }}>
                  {summary.healthy}
                </div>
                <div className="label">Healthy</div>
              </div>
            </div>

            <div className="section-header">
              <span className="section-title">District PHC Overview</span>
              <a
                className="view-priorities-link"
                onClick={() => navigate("/dho/ai-priorities")}
              >
                View AI Priorities →
              </a>
            </div>

            <div className="phc-grid">
              {phcs.map((phc) => {
                const colors = TIER_COLORS[phc.tier];
                return (
                  <div
                    key={phc.phcId}
                    className="phc-card"
                    style={{ background: colors.bg, borderColor: colors.border }}
                    onClick={() => navigate(`/dho/phc/${phc.phcId}`)}
                  >
                    <div className="phc-card-top">
                      <span className="phc-name">{phc.phcName}</span>
                      <span
                        className="tier-dot"
                        style={{ background: colors.dot }}
                        title={phc.tier}
                      />
                    </div>
                    <p className="phc-reason" style={{ color: colors.text }}>
                      {phc.reason}
                    </p>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}