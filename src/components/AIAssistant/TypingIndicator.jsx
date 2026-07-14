/**
 * TypingIndicator.jsx
 * Animated three-dot typing indicator shown while Gemini is thinking.
 */
export default function TypingIndicator({ activeFunction }) {
  const labels = {
    search_rides: '🔍 Searching rides...',
    book_ride: '🎫 Booking your ride...',
    track_ride: '📍 Getting driver location...',
    get_dashboard: '📊 Loading stats...',
    get_profile: '👤 Loading profile...',
    find_carpool_matches: '🤝 Finding carpool matches...',
    navigate_to_destination: '🗺️ Opening map...',
  };

  const label = activeFunction ? labels[activeFunction] : null;

  return (
    <div className="ai-typing-indicator">
      <div className="ai-typing-bubble">
        {label ? (
          <span className="ai-typing-fn">{label}</span>
        ) : (
          <div className="ai-typing-dots">
            <span />
            <span />
            <span />
          </div>
        )}
      </div>
    </div>
  );
}
