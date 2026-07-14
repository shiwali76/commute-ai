import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSSO, setShowSSO] = useState(false);

  const handleSSOSelect = (company) => {
    const emailMap = {
      Google: 'alex.j@google.com',
      Infosys: 'tony@infosys.com',
      Amazon: 'priya@amazon.com',
      Microsoft: 'sarah.m@microsoft.com',
    };
    setEmail(emailMap[company]);
    setPassword('testpwd123');
    setShowSSO(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      navigate('/dashboard');
    } catch (err) {
      // If the backend is unreachable, use demo mode so the app is explorable
      if (!err.response) {
        localStorage.setItem('token', 'demo-token');
        navigate('/dashboard');
        return;
      }
      setError(err.response?.data?.error || err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page page--no-nav">
      <div className="login">
        <button className="back-btn" onClick={() => navigate('/')}>
          ←
        </button>

        <h1 className="login__heading">Welcome back</h1>
        <p className="login__subheading">Log in to your account</p>

        <form className="login__form" onSubmit={handleLogin}>
          <div className="login__field">
            <label className="login__label" htmlFor="login-email">
              Email
            </label>
            <input
              id="login-email"
              className="input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="login__field">
            <label className="login__label" htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              className="input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="login__forgot-row">
            <a className="login__forgot" href="#forgot">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>

          {error && <div className="error-message">{error}</div>}
        </form>

        <button
          type="button"
          className="btn btn-outline"
          onClick={() => setShowSSO(true)}
        >
          🏢 Login with Company Email
        </button>

        <div className="login__divider">
          <span className="login__divider-line" />
          <span className="login__divider-text">OR CONTINUE WITH</span>
          <span className="login__divider-line" />
        </div>

        <div className="login__social-row">
          <button className="btn btn-secondary">G Google</button>
          <button className="btn btn-secondary"> Apple</button>
        </div>

        <p className="login__footer">
          Not a member?{' '}
          <span className="login__footer-link" onClick={() => navigate('/register')}>
            Register now
          </span>
        </p>
      </div>

      {showSSO && (
        <div className="sso-overlay" onClick={() => setShowSSO(false)}>
          <div className="sso-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="sso-title">Corporate Workspace SSO</h3>
            <p className="sso-desc">Choose a partner workspace to log in with your corporate SSO account.</p>
            <div className="sso-list">
              <button className="sso-btn" onClick={() => handleSSOSelect('Google')}>
                <span>🏢</span> Google Workspace
              </button>
              <button className="sso-btn" onClick={() => handleSSOSelect('Amazon')}>
                <span>🏢</span> Amazon AWS Directory
              </button>
              <button className="sso-btn" onClick={() => handleSSOSelect('Infosys')}>
                <span>🏢</span> Infosys Corporate Portal
              </button>
              <button className="sso-btn" onClick={() => handleSSOSelect('Microsoft')}>
                <span>🏢</span> Microsoft Azure AD
              </button>
            </div>
            <button className="sso-close" onClick={() => setShowSSO(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

