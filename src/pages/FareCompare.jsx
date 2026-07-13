import React from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useRide } from '../context/RideContext';
import BottomNav from '../components/BottomNav';
import './FareCompare.css';

const FARES = [
  { icon: '🚗', name: 'Uber', type: 'Sedan', time: '15 min', fare: '₹245', color: '#1e293b' },
  { icon: '🏍️', name: 'Rapido', type: 'Bike', time: '8 min', fare: '₹85', color: '#f59e0b' },
  { icon: '🚇', name: 'Metro', type: 'Rail', time: '25 min', fare: '₹35', color: '#2563eb' },
  { icon: '🤖', name: 'CommuteAI', type: 'Shared', time: '10 min', fare: '₹65', color: '#22c55e', best: true },
];

export default function FareCompare() {
  return (
    <>
      <div className="page">
        <h2>🤖 AI Fare Comparison</h2>
        <p className="text-muted">Real-time fare analysis across platforms</p>

        {/* fare cards */}
        {FARES.map((f) => (
          <div
            key={f.name}
            className={`fare-card${f.best ? ' fare-card--best' : ''}`}
          >
            {f.best && <span className="fare-card__pill">BEST VALUE</span>}

            <div
              className="fare-card__icon"
              style={{ background: `${f.color}1a` }}
            >
              {f.icon}
            </div>

            <div className="fare-card__center">
              <span className="fare-card__name">{f.name}</span>
              <span className="text-muted text-sm">
                {f.type} • {f.time}
              </span>
            </div>

            <span className="fare-card__fare">{f.fare}</span>
          </div>
        ))}

        {/* heatmap */}
        <h3 style={{ marginTop: 24 }}>Driver Availability Heatmap</h3>

        <div className="heatmap-legend">
          <span><span className="legend-dot legend-dot--green" /> High</span>
          <span><span className="legend-dot legend-dot--amber" /> Medium</span>
          <span><span className="legend-dot legend-dot--red" /> Low</span>
        </div>

        <div className="heatmap">
          <div className="heatmap__grid" />
        </div>
      </div>

      <BottomNav />
    </>
  );
}
