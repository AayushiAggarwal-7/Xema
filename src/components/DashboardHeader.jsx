import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAVY = '#1B2A4A';

export default function DashboardHeader({ accentColor = NAVY }) {
    const { logout } = useAuth();
    const navigate = useNavigate();

    async function handleLogout() {
        await logout();
        navigate('/');
    }

    return (
        <div style={styles.header}>
            <img src="/logo.svg" alt="Xema" style={styles.logo} />
            <button onClick={handleLogout} style={{ ...styles.logoutBtn, borderColor: accentColor, color: accentColor }}>
                <LogOut size={14} /> Logout
            </button>
        </div>
    );
}

const styles = {
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 0' },
    logo: { height: '28px' },
    logoutBtn: {
        display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent',
        border: '1.5px solid', borderRadius: '999px', padding: '7px 16px',
        fontSize: '13px', fontWeight: 600, cursor: 'pointer',
    },
};