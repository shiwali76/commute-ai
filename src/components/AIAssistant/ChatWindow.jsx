/**
 * ChatWindow.jsx
 * The full floating chat window UI for the AI assistant.
 */
import { useEffect, useRef } from 'react';
import { useAssistant } from './AssistantContext';
import Message from './Message';
import TypingIndicator from './TypingIndicator';
import ChatInput from './ChatInput';

export default function ChatWindow() {
  const {
    isOpen,
    setIsOpen,
    messages,
    isTyping,
    isListening,
    isSpeaking,
    voiceEnabled,
    error,
    activeFunction,
    sendMessage,
    startListening,
    stopListening,
    toggleVoice,
    clearMessages,
  } = useAssistant();

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new message arrives
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="ai-chat-window" role="dialog" aria-label="CommuteAI Assistant">
      {/* ── Header ── */}
      <div className="ai-chat-header">
        <div className="ai-chat-header-left">
          <div className="ai-chat-avatar">
            <span>🤖</span>
            <span className="ai-chat-online-dot" />
          </div>
          <div>
            <div className="ai-chat-title">CommuteAI Assistant</div>
            <div className="ai-chat-subtitle">
              {isTyping
                ? 'Thinking...'
                : isListening
                ? '🎤 Listening...'
                : isSpeaking
                ? '🔊 Speaking...'
                : 'Powered by Gemini'}
            </div>
          </div>
        </div>
        <div className="ai-chat-header-actions">
          {/* Voice toggle */}
          <button
            className={`ai-header-btn ${voiceEnabled ? 'ai-header-btn--active' : ''}`}
            onClick={toggleVoice}
            title={voiceEnabled ? 'Mute voice' : 'Unmute voice'}
          >
            {voiceEnabled ? '🔊' : '🔇'}
          </button>
          {/* Clear chat */}
          <button className="ai-header-btn" onClick={clearMessages} title="Clear chat">
            🗑️
          </button>
          {/* Close */}
          <button className="ai-header-btn" onClick={() => setIsOpen(false)} title="Close">
            ✕
          </button>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="ai-messages-container">
        {messages.map((msg) => (
          <Message key={msg.id} message={msg} />
        ))}

        {/* Typing indicator */}
        {isTyping && <TypingIndicator activeFunction={activeFunction} />}

        {/* Error message */}
        {error && (
          <div className="ai-error-msg">⚠️ {error}</div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input ── */}
      <ChatInput
        onSend={sendMessage}
        isTyping={isTyping}
        isListening={isListening}
        onStartListening={startListening}
        onStopListening={stopListening}
      />
    </div>
  );
}
