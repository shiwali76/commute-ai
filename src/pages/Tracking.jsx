import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useRide } from '../context/RideContext';
import './Tracking.css';

const FALLBACK = {
  driverName: 'Rajesh K.',
  vehicle: 'Hyundai i20 - KA01AB1234',
  eta: '5 min',
  arrivalTime: '9:15 AM',
  latestArrival: '9:25 AM',
  location: 'Near Silk Board Junction',
  currentLocation: 'Koramangala',
  destination: 'Tech Park, Whitefield',
};

export default function Tracking() {
  const { rideId } = useParams();
  const navigate = useNavigate();
  const [stage, setStage] = useState('eta');
  const [trackData, setTrackData] = useState(FALLBACK);

  useEffect(() => {
    const interval = setInterval(() => {
      api
        .get(`/rides/${rideId}/track`)
        .then((res) => setTrackData(res.data))
        .catch(() => {});
    }, 8000);
    return () => clearInterval(interval);
  }, [rideId]);

  const initials = trackData.driverName
    .split(' ')
    .map((w) => w[0])
    .join('');

  /* ── ETA stage ─────────────────────────────────────── */
  if (stage === 'eta') {
    return (
      <div className="page page--no-nav tracking">
        {/* top bar */}
        <div className="tracking__topbar">
          <button className="back-btn" onClick={() => navigate('/dashboard')}>
            ←
          </button>
          <h2>Live Tracking</h2>
        </div>

        {/* heading */}
        <p className="tracking__heading">
          <span className="pulse-dot" /> Heading your way…
        </p>

        {/* ETA */}
        <h1 className="tracking__eta-time">
          Estimated arrival {trackData.arrivalTime}
        </h1>

        {/* progress bar */}
        <div className="tracking__progress">
          <div className="tracking__seg tracking__seg--filled" />
          <div className="tracking__seg tracking__seg--filled" />
          <div className="tracking__seg" />
          <div className="tracking__seg" />
        </div>

        <p className="text-muted text-sm" style={{ marginTop: 8 }}>
          Latest arrival by {trackData.latestArrival}
        </p>

        {/* map placeholder */}
        <div className="tracking__map">
          <div className="tracking__map-road tracking__map-road--h" />
          <div className="tracking__map-road tracking__map-road--v" />
          <span className="tracking__map-tag">
            🚗 {trackData.eta} away
          </span>
        </div>

        {/* footer card */}
        <div className="tracking__footer-card">
          <div className="tracking__avatar">{initials}</div>
          <div className="tracking__driver-info">
            <span className="tracking__driver-name">{trackData.driverName}</span>
            <span className="text-muted text-sm">{trackData.vehicle}</span>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => setStage('onTrip')}
          >
            Start Trip
          </button>
        </div>
      </div>
    );
  }

  /* ── On-trip stage ─────────────────────────────────── */
  return (
    <div className="page page--no-nav tracking">
      {/* map */}
      <div className="tracking__map tracking__map--tall">
        <div className="tracking__map-road tracking__map-road--h" />
        <div className="tracking__map-road tracking__map-road--v" />
        <span className="tracking__map-tag">
          🚗 {trackData.eta} away
        </span>
        <span className="tracking__map-pickup">📍 Pickup</span>
      </div>

      {/* bottom sheet */}
      <div className="tracking__sheet">
        <h3>
          <span className="pulse-dot" /> On Trip
        </h3>

        {/* action buttons */}
        <div className="tracking__actions">
          <div className="tracking__action-btn">
            <span>📞</span>
            <small>Call</small>
          </div>
          <div className="tracking__action-btn">
            <span>💬</span>
            <small>Message</small>
          </div>
          <div className="tracking__action-btn">
            <span>⚠️</span>
            <small>SOS</small>
          </div>
        </div>

        <p className="text-muted" style={{ textAlign: 'center', margin: '8px 0' }}>
          {trackData.currentLocation} → {trackData.destination}
        </p>

        {/* route rows */}
        <div className="tracking__route-row">
          <span className="tracking__dot tracking__dot--green">●</span>
          <span>{trackData.currentLocation}</span>
          <button className="btn btn-primary btn--sm" style={{ marginLeft: 'auto' }}>
            Navigate
          </button>
        </div>
        <div className="tracking__route-row">
          <span className="tracking__dot tracking__dot--blue">●</span>
          <span>{trackData.destination}</span>
        </div>

        <hr className="divider" />

        <button
          className="btn tracking__end-btn"
          onClick={() => navigate('/dashboard')}
        >
          End Trip
        </button>
      </div>
    </div>
  );
}
