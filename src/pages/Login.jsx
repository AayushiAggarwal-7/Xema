import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase.js';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Pre-fill email if passed from role card click
  useEffect(() => {
    if (location.state && location.state.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  // If already logged in, redirect directly to dashboard
  useEffect(() => {
    if (user) {
      const role = user.role?.toLowerCase();
      if (role === 'dho') {
        navigate('/dho/dashboard', { replace: true });
      } else if (role === 'medical_officer') {
        navigate('/medical-officer/dashboard', { replace: true });
      } else if (role === 'pharmacist') {
        navigate('/pharmacist/dashboard', { replace: true });
      } else if (role === 'mp') {
        navigate('/mp/overview', { replace: true });
      }
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
      // 1. Authenticate with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // 2. Fetch corresponding Firestore User document
      const userDocRef = doc(db, 'Users', uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const role = userData.role?.toLowerCase();

        // 3. Dynamic role-based redirection
        if (role === 'dho') {
          navigate('/dho/dashboard');
        } else if (role === 'medical_officer') {
          navigate('/medical-officer/dashboard');
        } else if (role === 'pharmacist') {
          navigate('/pharmacist/dashboard');
        } else if (role === 'mp') {
          navigate('/mp/overview');
        } else {
          setErrorMsg('Authentication successful, but no recognized role is assigned to this account.');
        }
      } else {
        setErrorMsg('Authentication successful, but your user profile does not exist in the database.');
      }
    } catch (error) {
      console.error('Firebase Auth error during sign-in:', error);
      
      // Clear user-friendly error translation
      if (
        error.code === 'auth/invalid-credential' ||
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/user-not-found'
      ) {
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

  return (
    <div className="login-page-root">
      <style>{`
        .login-page-root {
          font-family: var(--sans);
          background: linear-gradient(135deg, #fdfbfe 0%, #f7f3fb 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          box-sizing: border-box;
        }

        .login-card {
          background: #ffffff;
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 40px;
          width: 100%;
          max-width: 440px;
          box-shadow: var(--shadow);
          box-sizing: border-box;
        }

        .login-header-group {
          text-align: center;
          margin-bottom: 32px;
        }

        .login-logo-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          margin-bottom: 12px;
        }

        .login-logo {
          height: 36px;
        }

        .login-logo-text {
          font-size: 20px;
          font-weight: 700;
          color: var(--text-h);
          letter-spacing: -0.5px;
        }

        .login-title-text {
          font-size: 24px;
          font-weight: 700;
          color: var(--text-h);
          margin: 0 0 8px 0;
        }

        .login-subtitle-text {
          font-size: 14px;
          color: var(--text);
          margin: 0;
        }

        .form-group {
          margin-bottom: 20px;
          text-align: left;
        }

        .form-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-h);
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .form-input {
          width: 100%;
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 12px;
          font-size: 15px;
          background: #ffffff;
          color: var(--text-h);
          box-sizing: border-box;
          transition: all 0.2s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-bg);
        }

        .error-alert-box {
          background: #fef2f2;
          border: 1px solid #fee2e2;
          color: #b91c1c;
          border-radius: 10px;
          padding: 12px 16px;
          font-size: 13.5px;
          font-weight: 500;
          margin-bottom: 20px;
          text-align: left;
        }

        .login-submit-btn {
          width: 100%;
          background: var(--accent);
          color: #ffffff;
          border: none;
          border-radius: 10px;
          padding: 14px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
        }

        .login-submit-btn:hover:not(:disabled) {
          opacity: 0.95;
          transform: translateY(-1px);
        }

        .login-submit-btn:disabled {
          background: var(--border);
          color: var(--text);
          cursor: not-allowed;
        }

        .spinner {
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid #ffffff;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          animation: spin 0.8s linear infinite;
          margin-right: 8px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .back-link-wrapper {
          margin-top: 24px;
          text-align: center;
        }

        .back-home-link {
          font-size: 13.5px;
          font-weight: 550;
          color: var(--accent);
          text-decoration: none;
          transition: opacity 0.2s ease;
        }

        .back-home-link:hover {
          opacity: 0.8;
          text-decoration: underline;
        }
      `}</style>

      <div className="login-card">
        {/* Header */}
        <div className="login-header-group">
          <Link to="/" className="login-logo-link">
            <img src="/logo.svg" alt="Xema Logo" className="login-logo" />
            <span className="login-logo-text">XEMA</span>
          </Link>
          <h2 className="login-title-text">Sign In to Dashboard</h2>
          <p className="login-subtitle-text">Enter your credentials below to access your workspace</p>
        </div>

        {/* Error Messaging */}
        {errorMsg && <div className="error-alert-box">{errorMsg}</div>}

        {/* Form */}
        <form onSubmit={handleLoginSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email-input">Email Address</label>
            <input
              id="email-input"
              type="email"
              placeholder="e.g. name@xema.demo"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password-input">Password</label>
            <input
              id="password-input"
              type="password"
              placeholder="••••••••"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <button className="login-submit-btn" type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="spinner" />
                Verifying Credentials...
              </>
            ) : (
              'Authenticate'
            )}
          </button>
        </form>

        {/* Back Link */}
        <div className="back-link-wrapper">
          <Link to="/" className="back-home-link">
            &larr; Back to Role Selection
          </Link>
        </div>
      </div>
    </div>
  );
}