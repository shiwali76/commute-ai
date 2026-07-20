import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useRide } from '../context/RideContext';
import './RideSummary.css';

export default function RideSummary() {
  const navigate = useNavigate();
  const { 
    pickup, 
    destination, 
    pickupCoords, 
    destinationCoords, 
    distance, 
    travelTime, 
    selectedRide, 
    setCurrentRideId 
  } = useRide();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const mapRef = useRef(null);

  const rideName = selectedRide?.name || 'CommuteAI Shared';
  const rideFare = selectedRide?.fare || '₹85';

  // Render Google Map with Route Directions
  useEffect(() => {
    if (window.google && window.google.maps && mapRef.current) {
      const map = new window.google.maps.Map(mapRef.current, {
        center: pickupCoords || { lat: 12.9716, lng: 77.5946 },
        zoom: 12,
        disableDefaultUI: true,
      });

      const directionsService = new window.google.maps.DirectionsService();
      const directionsRenderer = new window.google.maps.DirectionsRenderer({ map });

      const origin = pickupCoords || pickup;
      const dest = destinationCoords || destination;

      directionsService.route(
        {
          origin,
          destination: dest,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === 'OK') {
            directionsRenderer.setDirections(result);
          }
        }
      );
    }
  }, [pickup, destination, pickupCoords, destinationCoords]);

  const handleBook = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/rides', {
        pickup,
        destination,
        rideType: selectedRide?.rawType || rideName,
        pickupLatitude: pickupCoords?.lat || null,
        pickupLongitude: pickupCoords?.lng || null,
        destinationLatitude: destinationCoords?.lat || null,
        destinationLongitude: destinationCoords?.lng || null,
        distance: distance || null,
        travelTime: travelTime || null
      });
      const rideId = res.data?.rideId;
      if (!rideId) {
        throw new Error('Did not receive a valid ride ID from the server.');
      }
      setCurrentRideId(rideId);
      navigate('/track/' + rideId);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || err.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page page--no-nav">
      <button className="back-btn" onClick={() => navigate('/choose-ride')}>←</button>
      <h2>Ride Summary</h2>

      {/* ── Mini Map ── */}
      <div className="ride-summary__map">
        <div ref={mapRef} style={{ width: '100%', height: '100%', borderRadius: '16px' }} />
      </div>

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
          <div className="ride-summary__avatar">🤖</div>
          <div className="ride-summary__driver-info">
            <span className="ride-summary__driver-name">Matching Driver...</span>
            <span className="ride-summary__driver-meta">Assigned immediately after booking</span>
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
