import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'var(--sans)', color: 'var(--text)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ border: '4px solid var(--border)', borderTop: '4px solid var(--accent)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <p>Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const userRole = user.role?.toLowerCase();

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // If the logged-in user tries to access a role that is not theirs, redirect to their correct dashboard
    if (userRole === 'dho') {
      return <Navigate to="/dho/dashboard" replace />;
    } else if (userRole === 'medical_officer') {
      return <Navigate to="/medical-officer/dashboard" replace />;
    } else if (userRole === 'pharmacist') {
      return <Navigate to="/pharmacist/dashboard" replace />;
    } else if (userRole === 'mp') {
      return <Navigate to="/mp/overview" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
}

