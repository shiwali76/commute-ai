import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

const features = [
  'AI Ride Prediction',
  'Smart Carpool',
  'Lowest Waiting Time',
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      <div className="landing__content">
        <div className="landing__icon">🚌</div>

        <h1 className="landing__title">CommuteAI</h1>
        <p className="landing__tagline">AI Powered Smart Commute Platform</p>

        <ul className="landing__features">
          {features.map((feature, index) => (
            <li
              key={feature}
              className="landing__feature"
              style={{ animationDelay: `${0.4 + index * 0.2}s` }}
            >
              <span className="landing__feature-check">✓</span>
              <span className="landing__feature-text">{feature}</span>
            </li>
          ))}
        </ul>

        <button
          className="btn btn-white"
          onClick={() => navigate('/login')}
        >
          Get Started
        </button>

        <p className="landing__login-link">
          Already have an account?{' '}
          <span
            className="landing__login-action"
            onClick={() => navigate('/login')}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
