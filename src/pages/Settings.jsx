import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useRide } from '../context/RideContext';
import './Settings.css';

export default function Settings() {
  const navigate = useNavigate();

  const [pushNotifications, setPushNotifications] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState(true);
  const [autoMatch, setAutoMatch] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const toggles = [
    { label: 'Push Notifications', value: pushNotifications, set: setPushNotifications },
    { label: 'AI Ride Suggestions', value: aiSuggestions, set: setAiSuggestions },
    { label: 'Auto-match Carpool', value: autoMatch, set: setAutoMatch },
    { label: 'Dark Mode', value: darkMode, set: setDarkMode },
  ];

  return (
    <div className="page page--no-nav settings">
      {/* top bar */}
      <div className="settings__topbar">
        <button className="back-btn" onClick={() => navigate('/profile')}>
          ←
        </button>
        <h2>Settings</h2>
      </div>

      {/* Preferences */}
      <h4 className="settings__section-title">Preferences</h4>
      <div className="card">
        {toggles.map((t, i) => (
          <div
            key={t.label}
            className={`settings__toggle-row${i === toggles.length - 1 ? ' settings__toggle-row--last' : ''}`}
          >
            <span>{t.label}</span>
            <label className="toggle">
              <input
                type="checkbox"
                checked={t.value}
                onChange={() => t.set(!t.value)}
              />
              <span className="toggle-slider" />
            </label>
          </div>
        ))}
      </div>

      {/* Privacy & Security */}
      <h4 className="settings__section-title">Privacy &amp; Security</h4>
      <div className="card">
        <div className="settings__link-row">
          <span>🔒 Change Password</span>
          <span>›</span>
        </div>
        <div className="settings__link-row">
          <span>📍 Location Sharing</span>
          <span>›</span>
        </div>
        <div className="settings__link-row settings__link-row--last">
          <span>🏢 Company Access</span>
          <span>›</span>
        </div>
      </div>

      {/* About */}
      <h4 className="settings__section-title">About</h4>
      <div className="card">
        <div className="settings__link-row">
          <span>❓ Help &amp; Support</span>
          <span>›</span>
        </div>
        <div className="settings__link-row settings__link-row--last">
          <span>📄 Terms &amp; Conditions</span>
          <span>›</span>
        </div>
      </div>

      {/* footer */}
      <p className="settings__footer">CommuteAI v1.0.0</p>
    </div>
  );
}
