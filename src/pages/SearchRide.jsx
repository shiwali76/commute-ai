import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRide } from '../context/RideContext';
import './SearchRide.css';

const suggestions = [
  { icon: '🏢', name: 'Tech Park, Whitefield', sub: 'Electronic City', lat: 12.9698, lng: 77.7499 },
  { icon: '🏥', name: 'City Hospital', sub: 'MG Road', lat: 12.9748, lng: 77.6085 },
  { icon: '✈️', name: 'Airport Terminal 1', sub: 'International Airport Road', lat: 13.1986, lng: 77.7066 },
];

export default function SearchRide() {
  const navigate = useNavigate();
  const { 
    pickup, 
    setPickup, 
    destination, 
    setDestination, 
    setPickupCoords, 
    setDestinationCoords 
  } = useRide();
  
  const [localDest, setLocalDest] = useState(destination || '');
  const inputRef = useRef(null);

  // 1. Get browser Geolocation on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setPickupCoords(coords);
          
          // Reverse geocode if google maps is available
          if (window.google && window.google.maps) {
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: coords }, (results, status) => {
              if (status === 'OK' && results[0]) {
                setPickup(results[0].formatted_address);
              }
            });
          }
        },
        () => {
          // Fallback to default Bangalore coordinates (already configured in context)
        }
      );
    }
  }, [setPickupCoords, setPickup]);

  // 2. Bind Places Autocomplete to destination input field
  useEffect(() => {
    // Check if google maps script has loaded
    if (!window.google || !window.google.maps || !window.google.maps.places) return;

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['geocode', 'establishment'],
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (place.geometry && place.geometry.location) {
        const address = place.formatted_address || place.name;
        setLocalDest(address);
        setDestination(address);
        setDestinationCoords({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
      }
    });
  }, [setDestination, setDestinationCoords]);

  const handleChange = (e) => {
    setLocalDest(e.target.value);
    setDestination(e.target.value);
    // Reset coordinates if typing manually
    setDestinationCoords(null);
  };

  const handleSuggestionClick = (s) => {
    setLocalDest(s.name);
    setDestination(s.name);
    setDestinationCoords({ lat: s.lat, lng: s.lng });
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
            value={pickup || 'Current Location'}
            readOnly
          />
        </div>
        <div className="search-ride__connector" />
        <div className="search-ride__input-row">
          <span className="search-ride__dot search-ride__dot--blue">●</span>
          <input
            ref={inputRef}
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
          onClick={() => handleSuggestionClick(s)}
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
