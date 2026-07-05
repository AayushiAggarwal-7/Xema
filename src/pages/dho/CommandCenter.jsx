import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function CommandCenter() {
  const { user, logout } = useAuth();

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
        .card-placeholder {
          background: #ffffff;
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 30px;
          margin-top: 24px;
        }
      `}</style>

      <header className="dashboard-header">
        <div className="header-logo-section">
          <img src="/logo.svg" className="header-logo" alt="Xema Logo" />
          <span className="header-logo-text">XEMA</span>
        </div>
        
        <div className="user-profile-section">
          {user && (
            <span className="welcome-text" id="welcome-message">
              Welcome, <span className="user-name">{user.name}</span>
              <span className="user-role-badge">{user.role}</span>
            </span>
          )}
          <button className="logout-btn" onClick={logout}>Sign Out</button>
        </div>
      </header>

      <main className="dashboard-content">
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-h)', margin: '0 0 8px 0' }}>
          District Command Center (DHO)
        </h1>
        <p style={{ color: 'var(--text)', fontSize: '15px', margin: 0 }}>
          District-wide health oversight and top priority risks.
        </p>

        <div className="card-placeholder">
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-h)', margin: '0 0 12px 0' }}>
            Operations & AI Priorities
          </h2>
          <p style={{ color: 'var(--text)', fontSize: '14px', margin: 0 }}>
            Full dashboard charts, heatmaps, resource allocation tools, and Gemini recommendations will be active here in subsequent build phases.
          </p>
        </div>
      </main>
    </div>
  );
}