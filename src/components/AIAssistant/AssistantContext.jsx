/**
 * AssistantContext.jsx
 * Global context for the AI assistant state.
 */
import { createContext, useContext, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useRide } from '../../context/RideContext';
import { sendToGemini } from './GeminiService';
import { SpeechRecognitionService, SpeechSynthesisService } from './SpeechService';

const AssistantContext = createContext();

export function AssistantProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hi! I\'m your CommuteAI assistant 🚗\n\nYou can ask me to:\n• Book a ride to Tech Park\n• Find carpool matches\n• Check where your driver is\n• Show your dashboard stats\n\nJust type or tap the mic to speak!',
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [error, setError] = useState('');
  const [activeFunction, setActiveFunction] = useState(null);

  const speechRec = useRef(new SpeechRecognitionService());
  const speechSyn = useRef(new SpeechSynthesisService());

  const navigate = useNavigate();
  const rideContext = useRide();

  const addMessage = useCallback((role, content) => {
    const msg = { id: Date.now() + Math.random(), role, content, timestamp: new Date() };
    setMessages((prev) => [...prev, msg]);
    return msg;
  }, []);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return;
    setError('');

    addMessage('user', text);
    setIsTyping(true);
    setActiveFunction(null);

    // Build conversation history (last 10 messages for context window)
    const history = messages
      .filter((m) => m.id !== 'welcome')
      .slice(-10)
      .map((m) => ({ role: m.role === 'user' ? 'user' : 'model', content: m.content }));

    history.push({ role: 'user', content: text });

    try {
      const reply = await sendToGemini(
        history,
        api,
        rideContext,
        (fnName, fnArgs) => {
          setActiveFunction(fnName);
          // Handle navigation function
          if (fnName === 'navigate_to_destination' && fnArgs?.destination) {
            rideContext.setDestination(fnArgs.destination);
            setTimeout(() => navigate('/choose-ride'), 800);
          }
        }
      );

      setIsTyping(false);
      setActiveFunction(null);
      addMessage('assistant', reply);

      // Speak the reply if voice is enabled
      if (voiceEnabled) {
        setIsSpeaking(true);
        speechSyn.current.speak(reply);
        setTimeout(() => setIsSpeaking(false), 3000);
      }
    } catch (err) {
      setIsTyping(false);
      setActiveFunction(null);
      const errMsg = 'Something went wrong. Please try again.';
      setError(errMsg);
      addMessage('assistant', errMsg);
    }
  }, [messages, addMessage, rideContext, voiceEnabled, navigate]);

  const startListening = useCallback(() => {
    setIsListening(true);
    setError('');
    speechSyn.current.stop(); // Stop any ongoing speech

    let accumulated = '';

    speechRec.current.start(
      (interim) => { /* interim shown in input */ },
      (final) => {
        accumulated += final;
        setIsListening(false);
        if (accumulated.trim()) {
          sendMessage(accumulated.trim());
        }
      },
      (err) => {
        setIsListening(false);
        setError(err);
      }
    );
  }, [sendMessage]);

  const stopListening = useCallback(() => {
    speechRec.current.stop();
    setIsListening(false);
  }, []);

  const toggleVoice = useCallback(() => {
    setVoiceEnabled((v) => {
      speechSyn.current.setEnabled(!v);
      return !v;
    });
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Chat cleared! How can I help you?',
        timestamp: new Date(),
      },
    ]);
  }, []);

  return (
    <AssistantContext.Provider
      value={{
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
      }}
    >
      {children}
    </AssistantContext.Provider>
  );
}

export function useAssistant() {
  const ctx = useContext(AssistantContext);
  if (!ctx) throw new Error('useAssistant must be used within AssistantProvider');
  return ctx;
}
