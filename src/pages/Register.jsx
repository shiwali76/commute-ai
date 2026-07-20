import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import './Register.css';

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSSO, setShowSSO] = useState(false);

  const handleSSOSelect = (comp) => {
    const dataMap = {
      Google: { name: 'Alex Johnson', email: 'alex.j@google.com' },
      Infosys: { name: 'Tony Stark', email: 'tony@infosys.com' },
      Amazon: { name: 'Priya Singh', email: 'priya@amazon.com' },
      Microsoft: { name: 'Sarah Miller', email: 'sarah.m@microsoft.com' },
    };
    setName(dataMap[comp].name);
    setEmail(dataMap[comp].email);
    setCompany(comp);
    setPassword('testpwd123');
    setConfirmPassword('testpwd123');
    setShowSSO(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/api/auth/register', { name, email, password, company });
      localStorage.setItem('token', response.data.token);
      navigate('/dashboard');
    } catch (err) {
      // Demo mode fallback when backend is unreachable
      if (!err.response) {
        localStorage.setItem('token', 'demo-token');
        navigate('/dashboard');
        return;
      }
      setError(err.response?.data?.error || err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page page--no-nav">
      <div className="register">
        <button className="back-btn" onClick={() => navigate('/login')}>
          ←
        </button>

        <h1 className="register__heading">Create account</h1>
        <p className="register__subheading">Join CommuteAI and start commuting smarter</p>

        <form className="register__form" onSubmit={handleRegister}>
          <div className="register__field">
            <label className="register__label" htmlFor="reg-name">Full Name</label>
            <input
              id="reg-name"
              className="input"
              type="text"
              placeholder="Alex Johnson"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="register__field">
            <label className="register__label" htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              className="input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="register__field">
            <label className="register__label" htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              className="input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div className="register__field">
            <label className="register__label" htmlFor="reg-confirm">Confirm Password</label>
            <input
              id="reg-confirm"
              className="input"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          {error && <div className="error-message">{error}</div>}
        </form>

        <button
          type="button"
          className="btn btn-outline"
          onClick={() => setShowSSO(true)}
        >
          🏢 Register with Company Email
        </button>

        <div className="register__divider">
          <span className="register__divider-line" />
          <span className="register__divider-text">OR CONTINUE WITH</span>
          <span className="register__divider-line" />
        </div>

        <div className="register__social-row">
          <button className="btn btn-secondary">G Google</button>
          <button className="btn btn-secondary"> Apple</button>
        </div>

        <p className="register__footer">
          Already a member?{' '}
          <span className="register__footer-link" onClick={() => navigate('/login')}>
            Log in
          </span>
        </p>
      </div>

      {showSSO && (
        <div className="sso-overlay" onClick={() => setShowSSO(false)}>
          <div className="sso-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="sso-title">Corporate Workspace SSO</h3>
            <p className="sso-desc">Choose a partner workspace to register with your corporate SSO account.</p>
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
