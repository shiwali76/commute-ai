import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRide } from '../context/RideContext';
import './MatchConfirmed.css';

const CONFETTI_COLORS = ['#fff', '#fef3c7', '#dbeafe', '#fce7f3'];

function generateConfetti(count) {
  const dots = [];
  for (let i = 0; i < count; i++) {
    dots.push({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${60 + Math.random() * 40}%`,
      size: 8 + Math.random() * 4,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      duration: 2 + Math.random() * 3,
      delay: Math.random() * 2,
    });
  }
  return dots;
}

const confettiDots = generateConfetti(12);

export default function MatchConfirmed() {
  const navigate = useNavigate();
  const { matchedRider } = useRide();

  const name = matchedRider?.name || 'Priya S.';
  const initial = matchedRider?.initial || name.charAt(0);

  return (
    <div className="match-confirmed">
      {/* Confetti */}
      {confettiDots.map((dot) => (
        <div
          key={dot.id}
          className="confetti-dot"
          style={{
            left: dot.left,
            top: dot.top,
            width: dot.size,
            height: dot.size,
            background: dot.color,
            animationDuration: `${dot.duration}s`,
            animationDelay: `${dot.delay}s`,
          }}
        />
      ))}

      {/* Content */}
      <div className="match-confirmed__content">
        <div className="match-confirmed__avatar">
          {initial}
        </div>

        <h1 className="match-confirmed__title">It's a match! 🎉</h1>
        <p className="match-confirmed__subtitle">
          {name} has confirmed your carpool trip
        </p>

        {/* Trip Card */}
        <div className="match-confirmed__card">
          <div className="match-confirmed__card-row">
            <div className="match-confirmed__card-left">
              <span className="match-confirmed__card-line">📅 Tomorrow</span>
              <span className="match-confirmed__card-line match-confirmed__card-line--muted">
                🕐 9:00 - 9:30 AM
              </span>
            </div>
            <div className="match-confirmed__card-right">
              <span className="match-confirmed__card-fare">₹45</span>
              <span className="match-confirmed__card-line match-confirmed__card-line--muted">
                92% match
              </span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="match-confirmed__buttons">
          <button
            className="match-confirmed__btn match-confirmed__btn--exit"
            onClick={() => navigate('/dashboard')}
          >
            Exit
          </button>
          <button
            className="match-confirmed__btn match-confirmed__btn--trip"
            onClick={() => navigate('/track/latest')}
          >
            See Trip
          </button>
        </div>
      </div>
    </div>
  );
}
