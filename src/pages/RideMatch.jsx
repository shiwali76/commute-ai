import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useRide } from '../context/RideContext';
import './RideMatch.css';

const AVATAR_COLORS = ['#dbeafe', '#fce7f3', '#dcfce7', '#fef3c7'];

const FALLBACK_RIDERS = [
  { id: '1', name: 'Priya S.', initial: 'P', verified: true, org: 'Infosys', rating: 4.8, points: 120, seats: 3, time: '9:00 AM', fare: '₹45', match: 92 },
  { id: '2', name: 'Arun K.', initial: 'A', verified: true, org: 'Wipro', rating: 4.5, points: 85, seats: 2, time: '9:15 AM', fare: '₹55', match: 87 },
  { id: '3', name: 'Meena R.', initial: 'M', verified: false, org: 'TCS', rating: 4.2, points: 60, seats: 4, time: '8:45 AM', fare: '₹40', match: 78 },
  { id: '4', name: 'Suresh V.', initial: 'S', verified: true, org: 'Google', rating: 4.9, points: 200, seats: 1, time: '9:30 AM', fare: '₹50', match: 95 },
];

const FILTER_PILLS = ['Sort', '🚗 Car', '✓ Verified', '● Active'];

export default function RideMatch() {
  const navigate = useNavigate();
  const { 
    pickup, 
    destination, 
    pickupCoords, 
    destinationCoords, 
    distance, 
    travelTime, 
    selectedRide, 
    setMatchedRider 
  } = useRide();

  const [riders, setRiders] = useState(FALLBACK_RIDERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilters, setActiveFilters] = useState(new Set());

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    api.post('/api/ai/match', { 
      pickup: pickup || 'Current Location', 
      drop: destination || 'Tech Park', 
      time: 'now',
      pickupLatitude: pickupCoords?.lat || null,
      pickupLongitude: pickupCoords?.lng || null,
      destinationLatitude: destinationCoords?.lat || null,
      destinationLongitude: destinationCoords?.lng || null,
      distance: distance || null,
      travelTime: travelTime || null,
      rideType: selectedRide?.rawType || null
    })
      .then((res) => {
        if (!cancelled && res.data && Array.isArray(res.data)) {
          setRiders(res.data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Could not reach server — showing cached riders');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [pickup, destination, pickupCoords, destinationCoords, distance, travelTime, selectedRide]);

  const toggleFilter = (pill) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(pill)) {
        next.delete(pill);
      } else {
        next.add(pill);
      }
      return next;
    });
  };

  const handleCardClick = (rider) => {
    setMatchedRider(rider);
    navigate(`/match/${rider.id}`);
  };

  return (
    <div className="page page--no-nav">
      <button className="back-btn" onClick={() => navigate('/dashboard')}>← Back</button>
      <h2>🤝 Matching Riders</h2>

      <div className="filter-pills-row">
        {FILTER_PILLS.map((pill) => (
          <button
            key={pill}
            className={`pill filter-pill${activeFilters.has(pill) ? ' filter-pill--active' : ''}`}
            onClick={() => toggleFilter(pill)}
          >
            {pill}
          </button>
        ))}
      </div>

      {loading && <p className="status-msg">Finding best matches…</p>}
      {error && <p className="status-msg status-msg--error">{error}</p>}

      <div className="match-list">
        {riders.map((rider, idx) => (
          <div
            key={rider.id}
            className="match-card"
            onClick={() => handleCardClick(rider)}
          >
            <div
              className="match-card__avatar"
              style={{ background: AVATAR_COLORS[idx % AVATAR_COLORS.length] }}
            >
              {rider.initial}
            </div>

            <div className="match-card__center">
              <div className="match-card__name-row">
                <span className="match-card__name">{rider.name}</span>
                {rider.verified && <span className="verified-badge">✓</span>}
              </div>
              <span className="match-card__org">{rider.org}</span>
              <span className="match-card__rating">⭐ {rider.rating}</span>
              <div className="match-card__tags">
                <span className="tag">{rider.points} pts</span>
                <span className="tag">{rider.seats} seats</span>
                <span className="tag">{rider.time}</span>
              </div>
            </div>

            <div className="match-card__right">
              <span className="match-card__fare">{rider.fare}</span>
              <span className="match-card__percent">{rider.match}% match</span>
              <button
                className="btn btn-primary match-card__join"
                onClick={(e) => { e.stopPropagation(); handleCardClick(rider); }}
              >
                Join
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
