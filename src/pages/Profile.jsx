import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useRide } from '../context/RideContext';
import BottomNav from '../components/BottomNav';
import './Profile.css';

const FALLBACK = {
  name: 'Alex Johnson',
  company: 'Google India',
  email: 'alex.j@google.com',
  rating: 4.9,
  ridesShared: 142,
  moneySaved: '₹12,400',
  carbonSaved: '28 kg',
};

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(FALLBACK);

  useEffect(() => {
    api
      .get('/profile')
      .then((res) => setProfile(res.data))
      .catch(() => {});
  }, []);

  const initials = profile.name
    .split(' ')
    .map((w) => w[0])
    .join('');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <>
      <div className="page">
        {/* avatar */}
        <div className="profile__header">
          <div className="profile__avatar">{initials}</div>
          <h2 className="profile__name">{profile.name}</h2>
          <p className="text-muted">{profile.company}</p>
          <span className="profile__verified">✓ Verified Employee</span>
          <p className="profile__rating">⭐ {profile.rating}</p>
        </div>

        {/* stats */}
        <div className="profile__stats card">
          <div className="profile__stat">
            <span className="profile__stat-emoji">🚗</span>
            <span className="profile__stat-value">{profile.ridesShared}</span>
            <span className="profile__stat-label">Rides Shared</span>
          </div>
          <div className="profile__stat">
            <span className="profile__stat-emoji">💰</span>
            <span className="profile__stat-value">{profile.moneySaved}</span>
            <span className="profile__stat-label">Money Saved</span>
          </div>
          <div className="profile__stat">
            <span className="profile__stat-emoji">🌱</span>
            <span className="profile__stat-value">{profile.carbonSaved}</span>
            <span className="profile__stat-label">CO₂ Saved</span>
          </div>
        </div>

        {/* menu */}
        <div className="profile__menu card">
          <div className="profile__menu-item">
            <span>👤 Edit Profile</span>
            <span>›</span>
          </div>
          <div className="profile__menu-item">
            <span>💳 Payment Methods</span>
            <span>›</span>
          </div>
          <div className="profile__menu-item">
            <span>🕐 Ride History</span>
            <span>›</span>
          </div>
          <div
            className="profile__menu-item"
            onClick={() => navigate('/settings')}
          >
            <span>⚙️ Settings</span>
            <span>›</span>
          </div>
          <div
            className="profile__menu-item profile__menu-item--logout"
            onClick={handleLogout}
          >
            <span>🚪 Log out</span>
          </div>
        </div>
      </div>

      <BottomNav />
    </>
  );
}
