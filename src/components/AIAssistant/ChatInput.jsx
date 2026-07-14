/**
 * ChatInput.jsx
 * Text input + voice button + send button for the chat.
 */
import { useState, useRef, useEffect } from 'react';
import VoiceButton from './VoiceButton';

export default function ChatInput({ onSend, isTyping, isListening, onStartListening, onStopListening }) {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  // Quick suggestion chips
  const suggestions = [
    'Book a ride to Tech Park',
    'Where is my driver?',
    'Show my stats',
    'Find carpool matches',
  ];

  const handleSend = () => {
    const text = value.trim();
    if (!text || isTyping) return;
    setValue('');
    onSend(text);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="ai-chat-input-area">
      {/* Quick suggestion chips */}
      <div className="ai-suggestions">
        {suggestions.map((s) => (
          <button
            key={s}
            className="ai-suggestion-chip"
            onClick={() => { setValue(''); onSend(s); }}
            disabled={isTyping}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="ai-input-row">
        <VoiceButton
          isListening={isListening}
          onStart={onStartListening}
          onStop={onStopListening}
          disabled={isTyping}
        />
        <input
          ref={inputRef}
          className="ai-text-input"
          type="text"
          placeholder={isListening ? '🎤 Listening...' : 'Ask me anything...'}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isTyping || isListening}
        />
        <button
          className="ai-send-btn"
          onClick={handleSend}
          disabled={!value.trim() || isTyping}
          aria-label="Send message"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
