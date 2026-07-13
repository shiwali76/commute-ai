import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import BottomNav from '../components/BottomNav';
import './Dashboard.css';

const fallbackRides = [
  { id: 1, route: 'Home → Office', date: '2 hours ago', fare: '₹145' },
  { id: 2, route: 'Office → Mall', date: 'Yesterday', fare: '₹220' },
  { id: 3, route: 'Home → Airport', date: '3 days ago', fare: '₹580' },
];

const quickActions = [
  { emoji: '🚗', label: 'Book Ride', color: '#dbeafe', path: '/search' },
  { emoji: '🤝', label: 'Carpool', color: '#dcfce7', path: '/match' },
  { emoji: '🚇', label: 'Metro', color: '#fef3c7' },
  { emoji: '🚌', label: 'Bus', color: '#fce7f3' },
  { emoji: '🚐', label: 'Shuttle', color: '#e0e7ff' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get('/dashboard')
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="spinner" />;
  }

  const ai = data?.aiRecommendation || {};
  const rides = data?.recentRides || fallbackRides;

  return (
    <>
      {error && <div className="error-message">{error}</div>}

      <div className="page">
        {/* ── Greeting row ── */}
        <div className="dashboard__greeting">
          <div>
            <h2>Hello Alex 👋</h2>
            <p className="text-muted">Where are you going today?</p>
          </div>
          <button className="dashboard__bell" aria-label="Notifications">
            🔔
            <span className="dashboard__bell-dot" />
          </button>
        </div>

        {/* ── Search box ── */}
        <div
          className="card dashboard__search"
          onClick={() => navigate('/search')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/search')}
        >
          <div className="dashboard__search-row">
            <span className="dashboard__dot dashboard__dot--green">●</span>
            <span>Current Location</span>
          </div>
          <div className="dashboard__search-connector" />
          <div className="dashboard__search-row">
            <span className="dashboard__dot dashboard__dot--blue">●</span>
            <span className="text-muted">Search destination...</span>
          </div>
        </div>

        {/* ── AI Recommendation card ── */}
        <div className="dashboard__ai-card">
          <div className="dashboard__ai-title">🤖 AI Recommendation</div>

          <div className="dashboard__ai-grid">
            <div className="dashboard__ai-cell">
              <span className="dashboard__ai-label">Waiting Time</span>
              <span className="dashboard__ai-value">{ai.waitingTime || '~5 min'}</span>
            </div>
            <div className="dashboard__ai-cell">
              <span className="dashboard__ai-label">Peak Traffic</span>
              <span className="dashboard__ai-value">{ai.peakTraffic || 'Moderate'}</span>
            </div>
            <div className="dashboard__ai-cell">
              <span className="dashboard__ai-label">Best Pickup</span>
              <span className="dashboard__ai-value">{ai.bestPickup || 'Gate 3'}</span>
            </div>
            <div className="dashboard__ai-cell">
              <span className="dashboard__ai-label">Recommended</span>
              <span className="dashboard__ai-value">{ai.recommended || 'Shared Cab'}</span>
            </div>
          </div>

          <div
            className="dashboard__ai-cta"
            onClick={() => navigate('/search')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate('/search')}
          >
            Book a shared ride now →
          </div>
        </div>

        {/* ── Quick actions ── */}
        <div className="dashboard__actions">
          {quickActions.map((action) => (
            <div
              className="dashboard__action"
              key={action.label}
              onClick={action.path ? () => navigate(action.path) : undefined}
              role={action.path ? 'button' : undefined}
              tabIndex={action.path ? 0 : undefined}
              onKeyDown={
                action.path
                  ? (e) => e.key === 'Enter' && navigate(action.path)
                  : undefined
              }
            >
              <div
                className="dashboard__action-icon"
                style={{ backgroundColor: action.color }}
              >
                {action.emoji}
              </div>
              <span className="dashboard__action-label">{action.label}</span>
            </div>
          ))}
        </div>

        {/* ── Recent Rides ── */}
        <div className="dashboard__recent">
          <h3>Recent Rides</h3>

          {rides.map((ride) => (
            <div className="dashboard__ride" key={ride.id}>
              <div className="dashboard__ride-icon">🚗</div>
              <div className="dashboard__ride-info">
                <span className="dashboard__ride-route">{ride.route}</span>
                <span className="dashboard__ride-date text-muted">{ride.date}</span>
              </div>
              <span className="dashboard__ride-fare">{ride.fare}</span>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </>
  );
}
