import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRide } from '../context/RideContext';
import './SearchRide.css';

const suggestions = [
  { icon: '🏢', name: 'Tech Park, Whitefield', sub: 'Electronic City' },
  { icon: '🏥', name: 'City Hospital', sub: 'MG Road' },
  { icon: '✈️', name: 'Airport Terminal 1', sub: 'International Airport Road' },
];

export default function SearchRide() {
  const navigate = useNavigate();
  const { destination, setDestination } = useRide();
  const [localDest, setLocalDest] = useState(destination || '');

  const handleChange = (e) => {
    setLocalDest(e.target.value);
    setDestination(e.target.value);
  };

  const handleSuggestionClick = (name) => {
    setLocalDest(name);
    setDestination(name);
  };

  return (
    <div className="page page--no-nav">
      <button className="back-btn" onClick={() => navigate('/dashboard')}>←</button>
      <h2>Search Destination</h2>

      <div className="card search-ride__card">
        <div className="search-ride__input-row">
          <span className="search-ride__dot search-ride__dot--green">●</span>
          <input
            className="search-ride__input search-ride__input--muted"
            value="Current Location"
            readOnly
          />
        </div>
        <div className="search-ride__connector" />
        <div className="search-ride__input-row">
          <span className="search-ride__dot search-ride__dot--blue">●</span>
          <input
            className="search-ride__input"
            placeholder="Where to?"
            value={localDest}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="search-ride__action-row">
        <span>📍 Pick on map</span>
        <span className="search-ride__chevron">›</span>
      </div>
      <div className="search-ride__action-row">
        <span>⭐ My favorites</span>
        <span className="search-ride__chevron">›</span>
      </div>

      <h3 className="search-ride__suggestions-label">Suggestions</h3>

      {suggestions.map((s) => (
        <div
          key={s.name}
          className="search-ride__suggestion"
          onClick={() => handleSuggestionClick(s.name)}
        >
          <span className="search-ride__suggestion-icon">{s.icon}</span>
          <div className="search-ride__suggestion-text">
            <span className="search-ride__suggestion-name">{s.name}</span>
            <span className="search-ride__suggestion-sub">{s.sub}</span>
          </div>
        </div>
      ))}

      <button
        className="btn btn-primary search-ride__confirm"
        disabled={!localDest}
        onClick={() => navigate('/choose-ride')}
      >
        Confirm Destination
      </button>
    </div>
  );
}
