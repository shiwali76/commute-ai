import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useRide } from '../context/RideContext';
import './RideSelection.css';

const FALLBACK_RIDES = [
  { id: 1, icon: '🚗', name: 'CommuteAI Shared', eta: '5 min', note: '2 seats left', fare: '₹85' },
  { id: 2, icon: '🛺', name: 'Auto Rickshaw', eta: '3 min', note: 'Nearby', fare: '₹65' },
  { id: 3, icon: '🚙', name: 'Premium Sedan', eta: '8 min', note: 'AC, spacious', fare: '₹180' },
  { id: 4, icon: '🚐', name: 'Shuttle', eta: '12 min', note: 'Fixed route', fare: '₹35' },
];

export default function RideSelection() {
  const navigate = useNavigate();
  const { pickup, destination, setSelectedRide } = useRide();

  const [rides, setRides] = useState(FALLBACK_RIDES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.post('/rides/search', { pickup, destination });
        if (!cancelled && res.data?.length) {
          const mapped = res.data.map(item => {
            let icon = '🚗';
            let note = 'Eco-friendly';
            if (item.type === 'Private') {
              icon = '🚙';
              note = 'Private Sedan';
            } else if (item.type === 'Electric Mini') {
              icon = '⚡';
              note = 'Green Commute';
            } else if (item.type === 'Shared Ride') {
              icon = '🤝';
              note = '2 seats left';
            }
            return {
              id: item.id,
              icon,
              name: item.type,
              eta: item.eta,
              note,
              fare: typeof item.fare === 'number' ? `₹${item.fare}` : item.fare,
              rawFare: item.fare,
              rawType: item.type
            };
          });
          setRides(mapped);
        }
      } catch (err) {
        if (err.response?.status === 401) return;
        setError(err.response?.data?.error || err.response?.data?.message || 'Failed to search ride options');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [pickup, destination]);

  const handleBook = () => {
    const ride = rides.find((r) => r.id === selectedId);
    if (ride) {
      setSelectedRide(ride);
      navigate('/ride-summary');
    }
  };

  return (
    <div className="ride-select">
      {/* ── Map Area ── */}
      <div className="ride-select__map">
        <div className="ride-select__map-road ride-select__map-road--h" />
        <div className="ride-select__map-road ride-select__map-road--v" />
        <div className="ride-select__search-bar">
          <button className="ride-select__back" onClick={() => navigate('/search')}>←</button>
          <span className="ride-select__dest-text">{destination || 'Destination'}</span>
        </div>
      </div>

      {/* ── Bottom Sheet ── */}
      <div className="ride-select__sheet">
        <h3>Choose a ride</h3>

        {loading && <div className="spinner" />}
        {error && <div className="error-message">{error}</div>}

        {!loading &&
          rides.map((ride) => (
            <div
              key={ride.id}
              className={
                'ride-select__option' +
                (selectedId === ride.id ? ' ride-select__option--selected' : '')
              }
              onClick={() => setSelectedId(ride.id)}
            >
              <div className="ride-select__option-icon">{ride.icon}</div>
              <div className="ride-select__option-info">
                <span className="ride-select__option-name">{ride.name}</span>
                <span className="ride-select__option-meta">
                  {ride.eta} · {ride.note}
                </span>
              </div>
              <span className="ride-select__option-fare">{ride.fare}</span>
            </div>
          ))}

        <div className="ride-select__comfort-row">🛋️ Ride comfort options ›</div>

        <div className="ride-select__actions">
          <button className="btn btn-secondary ride-select__btn-schedule">Schedule</button>
          <button
            className="btn btn-primary ride-select__btn-book"
            disabled={!selectedId}
            onClick={handleBook}
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}
