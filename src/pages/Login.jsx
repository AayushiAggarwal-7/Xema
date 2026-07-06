import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase.js';
import { useAuth } from '../context/AuthContext';

const NAVY = '#1B2A4A';
const CREAM = '#FBF8F0';

function hexToRgba(hex, alpha) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default function Login() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Theme comes from which role card was clicked (cosmetic only —
  // does NOT affect authentication or the redirect decision below).
  const themeColor = location.state?.color || NAVY;
  const roleLabel = location.state?.label || null;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);


  useEffect(() => {
    if (user) {
      const role = user.role?.toLowerCase();
      if (role === 'dho') navigate('/dho/dashboard', { replace: true });
      else if (role === 'medical_officer') navigate('/medical-officer/dashboard', { replace: true });
      else if (role === 'pharmacist') navigate('/pharmacist/dashboard', { replace: true });
      else if (role === 'mp') navigate('/mp/overview', { replace: true });
    }
  }, [user, navigate]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    setIsLoading(true);
    setErrorMsg('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // Redirect is ALWAYS decided by the real Firestore role for this
      // account — never by themeColor/roleLabel above, regardless of
      // which card the person clicked to get here.
      const userDocRef = doc(db, 'Users', uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const role = userDocSnap.data().role?.toLowerCase();
        if (role === 'dho') navigate('/dho/dashboard');
        else if (role === 'medical_officer') navigate('/medical-officer/dashboard');
        else if (role === 'pharmacist') navigate('/pharmacist/dashboard');
        else if (role === 'mp') navigate('/mp/overview');
        else setErrorMsg('Authentication successful, but no recognized role is assigned to this account.');
      } else {
        setErrorMsg('Authentication successful, but your user profile does not exist in the database.');
      }
    } catch (error) {
      console.error('Firebase Auth error during sign-in:', error);
      if (['auth/invalid-credential', 'auth/wrong-password', 'auth/user-not-found'].includes(error.code)) {
        setErrorMsg('Incorrect email or password. Please try again.');
      } else if (error.code === 'auth/invalid-email') {
        setErrorMsg('Invalid email format. Please enter a valid email address.');
      } else if (error.code === 'auth/network-request-failed') {
        setErrorMsg('Connection error. Please check your internet connectivity.');
      } else {
        setErrorMsg(`Authentication failed: ${error.message || error.code}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const cardBg = hexToRgba(themeColor, 0.14);
  const cardGlow = hexToRgba(themeColor, 0.35);

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes xema-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .xema-login-input:focus { outline: none; box-shadow: 0 0 0 3px ${hexToRgba(themeColor, 0.2)}; }
        .xema-login-btn:hover:not(:disabled) { filter: brightness(0.95); }
        .xema-login-btn:disabled { opacity: 0.6; cursor: not-allowed; }
      `}</style>

      <div style={styles.navBar}>
        <img src="/logo.svg" alt="Xema" style={styles.navLogo} onClick={() => navigate('/')} />
        <div style={styles.navTabs}>
          <span style={styles.navTabActive} onClick={() => navigate('/')}>HOME</span>
          <span style={styles.navTabInactive}>ABOUT</span>
        </div>
      </div>

      <div style={{ ...styles.card, backgroundColor: cardBg, borderColor: themeColor, boxShadow: `0 0 60px ${cardGlow}` }}>
        <h2 style={{ ...styles.title, color: themeColor }}>Sign in to Dashboard</h2>
        <p style={styles.subtitle}>
          {roleLabel ? `Signing in as ${roleLabel}. ` : ''}Enter your credentials below to access your workspace
        </p>

        {errorMsg && <div style={styles.errorBox}>{errorMsg}</div>}

        <form onSubmit={handleLoginSubmit}>
          <div style={styles.formGroup}>
            <label style={{ ...styles.label, color: themeColor }} htmlFor="email-input">Email</label>
            <input
              id="email-input" type="email" placeholder="e.g. name@xema.demo"
              className="xema-login-input"
              style={{ ...styles.input, borderColor: themeColor }}
              value={email} onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading} required
            />
          </div>
          <div style={styles.formGroup}>
            <label style={{ ...styles.label, color: themeColor }} htmlFor="password-input">Password</label>
            <input
              id="password-input" type="password" placeholder="••••••••"
              className="xema-login-input"
              style={{ ...styles.input, borderColor: themeColor }}
              value={password} onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading} required
            />
          </div>
          <button
            type="submit" disabled={isLoading}
            className="xema-login-btn"
            style={{ ...styles.submitBtn, backgroundColor: themeColor }}
          >
            {isLoading ? (
              <>
                <span style={styles.spinner} />
                Verifying...
              </>
            ) : 'Login'}
          </button>
        </form>

        <div style={styles.backLinkWrap}>
          <Link to="/" style={{ ...styles.backLink, color: themeColor }}>&larr; Back to Role Selection</Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', backgroundColor: CREAM, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px' },
  navBar: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '48px' },
  navLogo: { height: '30px', cursor: 'pointer' },
  navTabs: { display: 'flex', gap: '4px', backgroundColor: '#D8ECE6', borderRadius: '999px', padding: '4px' },
  navTabActive: { backgroundColor: '#EDE79A', borderRadius: '999px', padding: '7px 18px', fontSize: '12px', fontWeight: 700, color: NAVY, cursor: 'pointer' },
  navTabInactive: { padding: '7px 18px', fontSize: '12px', fontWeight: 600, color: '#8A897F' },

  card: {
    width: '100%', maxWidth: '480px', borderRadius: '28px', border: '2px solid',
    padding: '40px', textAlign: 'center', marginTop: '20px',
  },
  title: { fontSize: '28px', fontWeight: 800, margin: '0 0 8px' },
  subtitle: { fontSize: '14px', color: '#5B5A52', margin: '0 0 28px' },
  errorBox: { background: '#FEF2F2', border: '1px solid #FEE2E2', color: '#B91C1C', borderRadius: '10px', padding: '12px 16px', fontSize: '13.5px', fontWeight: 500, marginBottom: '20px', textAlign: 'left' },

  formGroup: { marginBottom: '20px', textAlign: 'left' },
  label: { display: 'block', fontSize: '14px', fontWeight: 700, marginBottom: '6px' },
  input: {
    width: '100%', border: '1.5px solid', borderRadius: '10px', padding: '14px',
    fontSize: '15px', backgroundColor: '#FBF3D9', color: NAVY, boxSizing: 'border-box',
  },
  submitBtn: {
    width: '100%', color: '#FFFFFF', border: 'none', borderRadius: '999px',
    padding: '15px', fontSize: '16px', fontWeight: 700, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    boxSizing: 'border-box', marginTop: '8px',
  },
  spinner: {
    border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid #fff',
    borderRadius: '50%', width: '16px', height: '16px', animation: 'xema-spin 0.8s linear infinite',
  },
  backLinkWrap: { marginTop: '24px' },
  backLink: { fontSize: '13.5px', fontWeight: 600, textDecoration: 'none' },
};