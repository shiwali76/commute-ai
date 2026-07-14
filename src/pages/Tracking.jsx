import React, { useState, useEffect, useRef } from 'react';
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
  const mapRef = useRef(null);

  useEffect(() => {
    const fetchTracking = () => {
      api
        .get(`/rides/${rideId}/track`)
        .then((res) => setTrackData(res.data))
        .catch(() => {});
    };
    fetchTracking();
    const interval = setInterval(fetchTracking, 8000);
    return () => clearInterval(interval);
  }, [rideId]);

  // Google Map Rendering with Route Directions and Driver Location Marker
  useEffect(() => {
    if (window.google && window.google.maps && mapRef.current && trackData) {
      // 1. Center map around current driver location (or default Bangalore coordinates)
      const lat = trackData.location?.lat || 12.9716;
      const lng = trackData.location?.lng || 77.5946;

      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat, lng },
        zoom: 13,
        disableDefaultUI: true,
      });

      // 2. Fetch directions
      const directionsService = new window.google.maps.DirectionsService();
      const directionsRenderer = new window.google.maps.DirectionsRenderer({
        map,
        suppressMarkers: true, // Hide default marker icons to use custom icons
      });

      const origin = trackData.currentLocation || "Koramangala";
      const dest = trackData.destination || "Whitefield";

      directionsService.route(
        {
          origin,
          destination: dest,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === 'OK') {
            directionsRenderer.setDirections(result);
            
            // Draw Pickup Marker
            const leg = result.routes[0].legs[0];
            new window.google.maps.Marker({
              position: leg.start_location,
              map,
              title: "Pickup",
              icon: {
                url: "data:image/svg+xml;utf-8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='%2322C55E'><circle cx='12' cy='12' r='8' stroke='white' stroke-width='2'/></svg>",
                scaledSize: new window.google.maps.Size(24, 24),
              }
            });

            // Draw Dropoff Marker
            new window.google.maps.Marker({
              position: leg.end_location,
              map,
              title: "Dropoff",
              icon: {
                url: "data:image/svg+xml;utf-8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='%232563EB'><path d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/></svg>",
                scaledSize: new window.google.maps.Size(24, 24),
              }
            });
          }
        }
      );

      // 3. Draw Dynamic Driver (Car) Marker
      if (trackData.location && typeof trackData.location === 'object') {
        new window.google.maps.Marker({
          position: trackData.location,
          map,
          title: "Driver Location",
          icon: {
            url: "data:image/svg+xml;utf-8,<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='%232563EB'><path d='M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-5h14v5z'/><circle cx='7.5' cy='14.5' r='1.5' fill='%2394A3B8'/><circle cx='16.5' cy='14.5' r='1.5' fill='%2394A3B8'/></svg>",
            scaledSize: new window.google.maps.Size(32, 32),
          }
        });
      }
    }
  }, [stage, trackData]);

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

        {/* map container */}
        <div className="tracking__map">
          <div ref={mapRef} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} />
          {!window.google && <div className="tracking__map-road tracking__map-road--h" />}
          {!window.google && <div className="tracking__map-road tracking__map-road--v" />}
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
        <div ref={mapRef} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} />
        {!window.google && <div className="tracking__map-road tracking__map-road--h" />}
        {!window.google && <div className="tracking__map-road tracking__map-road--v" />}
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
