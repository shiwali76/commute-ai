/**
 * AIAssistant.jsx
 * The floating assistant button + chat window entry point.
 * Drop this into any page layout.
 */
import { useAssistant } from './AssistantContext';
import ChatWindow from './ChatWindow';

export default function AIAssistant() {
  const { isOpen, setIsOpen, isTyping, isListening, isSpeaking } = useAssistant();

  const isPulsing = isTyping || isListening || isSpeaking;

  return (
    <>
      {/* Floating button */}
      <button
        className={`ai-fab ${isPulsing ? 'ai-fab--pulse' : ''} ${isOpen ? 'ai-fab--open' : ''}`}
        onClick={() => setIsOpen((o) => !o)}
        aria-label={isOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
        title="CommuteAI Assistant"
      >
        {isOpen ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 5.92 2 10.71c0 2.76 1.44 5.21 3.72 6.86V21l3.79-2.09C10.28 19.29 11.12 19.43 12 19.43c5.52 0 10-3.92 10-8.71C22 5.92 17.52 2 12 2z"/>
            <circle cx="8" cy="10" r="1.2" fill="white"/>
            <circle cx="12" cy="10" r="1.2" fill="white"/>
            <circle cx="16" cy="10" r="1.2" fill="white"/>
          </svg>
        )}
      </button>

      {/* Chat window */}
      <ChatWindow />
    </>
  );
}
