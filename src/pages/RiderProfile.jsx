import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRide } from '../context/RideContext';
import './RiderProfile.css';

const FALLBACK_RIDER = {
  id: '1',
  name: 'Priya S.',
  initial: 'P',
  verified: true,
  org: 'Infosys',
  rating: 4.8,
  points: 120,
  seats: 3,
};

export default function RiderProfile() {
  const navigate = useNavigate();
  const { riderId } = useParams();
  const { matchedRider, setMatchedRider } = useRide();

  const rider = matchedRider || FALLBACK_RIDER;
  const firstName = rider.name.split(' ')[0];

  return (
    <div className="rider-profile">
      {/* Banner */}
      <div className="rider-profile__banner">
        <button className="rider-profile__back" onClick={() => navigate('/match')}>
          ← Back
        </button>
      </div>

      <div className="rider-profile__body">
        {/* Avatar */}
        <div className="rider-profile__avatar">
          {rider.initial}
        </div>

        {/* Name */}
        <div className="rider-profile__name-row">
          <h2>{rider.name}</h2>
          {rider.verified && <span className="verified-badge">✓</span>}
        </div>

        <p className="rider-profile__org">{rider.org}</p>

        {/* Verified Pill */}
        {rider.verified && (
          <div className="rider-profile__verified-pill">
            ✓ Organisation &amp; Government ID Verified
          </div>
        )}

        {/* Stats Card */}
        <div className="rider-profile__stats-card">
          <div className="rider-profile__stat">
            <span className="rider-profile__stat-value">156</span>
            <span className="rider-profile__stat-label">Total Rides</span>
          </div>
          <div className="rider-profile__stat">
            <span className="rider-profile__stat-value">{rider.rating}⭐</span>
            <span className="rider-profile__stat-label">Rating</span>
          </div>
          <div className="rider-profile__stat">
            <span className="rider-profile__stat-value">{rider.seats}</span>
            <span className="rider-profile__stat-label">Seats</span>
          </div>
        </div>

        {/* Vehicle Details */}
        <div className="rider-profile__vehicle-card">
          <h3>Vehicle Details</h3>
          <div className="rider-profile__vehicle-row">
            <span className="rider-profile__vehicle-label">Type</span>
            <span>Hyundai i20 Sportz</span>
          </div>
          <div className="rider-profile__vehicle-row">
            <span className="rider-profile__vehicle-label">Plate</span>
            <span>KA-01-AB-1234</span>
          </div>
          <div className="rider-profile__vehicle-row">
            <span className="rider-profile__vehicle-label">Points</span>
            <span>10 pts/km</span>
          </div>
          <div className="rider-profile__vehicle-row">
            <span className="rider-profile__vehicle-label">Seats</span>
            <span>{rider.seats}</span>
          </div>
        </div>

        {/* Action Links */}
        <div className="rider-profile__actions">
          <div className="rider-profile__action-link">⭐ Rate {rider.name}</div>
          <div className="rider-profile__action-link rider-profile__action-link--warn">
            ⚠️ Not a genuine profile? Report
          </div>
          <div className="rider-profile__action-link rider-profile__action-link--danger">
            🚫 Block {rider.name}
          </div>
        </div>

        {/* Join Button */}
        <button
          className="btn btn-primary rider-profile__join-btn"
          onClick={() => navigate('/match/confirmed')}
        >
          Join with {firstName}
        </button>
      </div>
    </div>
  );
}
