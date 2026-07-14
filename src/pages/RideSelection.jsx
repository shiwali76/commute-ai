import React, { useState, useEffect, useRef } from 'react';
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
  const { 
    pickup, 
    destination, 
    pickupCoords, 
    destinationCoords, 
    setDistance, 
    setTravelTime, 
    setSelectedRide 
  } = useRide();

  const [rides, setRides] = useState(FALLBACK_RIDES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const performSearch = async (dist, time) => {
      try {
        setLoading(true);
        const res = await api.post('/rides/search', { 
          pickup, 
          destination, 
          distance: dist, 
          travelTime: time 
        });
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
    };

    if (window.google && window.google.maps && mapRef.current) {
      // 1. Initialize Google Map
      const map = new window.google.maps.Map(mapRef.current, {
        center: pickupCoords || { lat: 12.9716, lng: 77.5946 },
        zoom: 12,
        disableDefaultUI: true,
      });

      // 2. Fetch directions
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
          if (!cancelled) {
            if (status === 'OK') {
              directionsRenderer.setDirections(result);
              const leg = result.routes[0].legs[0];
              const dist = leg.distance.value / 1000;
              const time = Math.round(leg.duration.value / 60);
              
              setDistance(dist);
              setTravelTime(time);
              performSearch(dist, time);
            } else {
              // Proximity calculation fallback if Directions Service fails
              const dist = Math.max((pickup.length + destination.length) * 0.5, 2);
              const time = Math.round(dist * 2.5);
              setDistance(dist);
              setTravelTime(time);
              performSearch(dist, time);
            }
          }
        }
      );
    } else {
      // Proximity calculation fallback if Google Maps is unavailable
      const dist = Math.max((pickup.length + (destination || '').length) * 0.5, 2);
      const time = Math.round(dist * 2.5);
      setDistance(dist);
      setTravelTime(time);
      performSearch(dist, time);
    }

    return () => { cancelled = true; };
  }, [pickup, destination, pickupCoords, destinationCoords, setDistance, setTravelTime]);

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
        <div ref={mapRef} style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} />
        {!window.google && <div className="ride-select__map-road ride-select__map-road--h" />}
        {!window.google && <div className="ride-select__map-road ride-select__map-road--v" />}
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
