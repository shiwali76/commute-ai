import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useRide } from '../context/RideContext';
import './RideSummary.css';

export default function RideSummary() {
  const navigate = useNavigate();
  const { pickup, destination, selectedRide, setCurrentRideId } = useRide();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const rideName = selectedRide?.name || 'CommuteAI Shared';
  const rideFare = selectedRide?.fare || '₹85';

  const handleBook = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/rides', {
        pickup,
        destination,
        rideType: rideName,
      });
      const rideId = res.data?.rideId || 'latest';
      setCurrentRideId(rideId);
      navigate('/track/' + rideId);
    } catch (err) {
      setError('Booking failed — redirecting…');
      setTimeout(() => navigate('/track/latest'), 1200);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page page--no-nav">
      <button className="back-btn" onClick={() => navigate('/choose-ride')}>←</button>
      <h2>Ride Summary</h2>

      {/* ── Mini Map ── */}
      <div className="ride-summary__map" />

      {/* ── Ride Card ── */}
      <div className="card ride-summary__card">
        <h3 className="ride-summary__vehicle">{rideName}</h3>

        <div className="ride-summary__price-row">
          <span className="ride-summary__fare">{rideFare}</span>
          <span className="ride-summary__rate">₹12/km</span>
        </div>

        <div className="ride-summary__rating">⭐ 4.8</div>

        <div className="ride-summary__divider" />

        {/* ── Driver ── */}
        <div className="ride-summary__driver">
          <div className="ride-summary__avatar">RK</div>
          <div className="ride-summary__driver-info">
            <span className="ride-summary__driver-name">Rajesh K.</span>
            <span className="ride-summary__driver-meta">KA-01-AB-1234</span>
            <span className="ride-summary__driver-meta">Hyundai i20</span>
          </div>
        </div>

        <div className="ride-summary__divider" />

        {/* ── Route Summary ── */}
        <div className="ride-summary__route">
          <div className="ride-summary__route-row">
            <span className="ride-summary__dot ride-summary__dot--green" />
            <span>{pickup || 'Current Location'}</span>
          </div>
          <div className="ride-summary__route-connector" />
          <div className="ride-summary__route-row">
            <span className="ride-summary__dot ride-summary__dot--blue" />
            <span>{destination || 'Destination'}</span>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <button
        className="btn btn-primary ride-summary__book"
        disabled={loading}
        onClick={handleBook}
      >
        {loading ? 'Booking...' : 'Book Now'}
      </button>
    </div>
  );
}
