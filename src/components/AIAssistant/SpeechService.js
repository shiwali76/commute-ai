/**
 * SpeechService.js
 * Handles Speech-to-Text (Web Speech API) and Text-to-Speech (SpeechSynthesis)
 */

// ── Speech Recognition (Speech → Text) ──────────────────────────
export class SpeechRecognitionService {
  constructor() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      this.supported = false;
      return;
    }
    this.supported = true;
    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'en-IN';
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
  }

  start(onInterim, onFinal, onError) {
    if (!this.supported) {
      onError('Speech recognition is not supported in this browser. Please use Chrome.');
      return;
    }

    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      if (interimTranscript) onInterim(interimTranscript);
      if (finalTranscript) onFinal(finalTranscript);
    };

    this.recognition.onerror = (event) => {
      if (event.error === 'not-allowed') {
        onError('Microphone permission denied. Please allow microphone access.');
      } else if (event.error === 'no-speech') {
        onError('No speech detected. Please try again.');
      } else {
        onError(`Speech error: ${event.error}`);
      }
    };

    this.recognition.start();
  }

  stop() {
    if (this.supported && this.recognition) {
      this.recognition.stop();
    }
  }
}

// ── Text-to-Speech (Text → Voice) ───────────────────────────────
export class SpeechSynthesisService {
  constructor() {
    this.supported = 'speechSynthesis' in window;
    this.speaking = false;
    this.enabled = true; // User can toggle voice on/off
  }

  speak(text) {
    if (!this.supported || !this.enabled) return;
    // Cancel any current speech
    window.speechSynthesis.cancel();
    // Strip markdown characters for cleaner speech
    const cleanText = text
      .replace(/[*_#`~]/g, '')
      .replace(/₹/g, 'Rupees ')
      .replace(/\n/g, '. ');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-IN';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    // Prefer a natural-sounding voice
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(
      (v) =>
        v.lang.startsWith('en') &&
        (v.name.includes('Google') || v.name.includes('Female') || v.name.includes('Priya'))
    );
    if (preferred) utterance.voice = preferred;
    this.speaking = true;
    utterance.onend = () => { this.speaking = false; };
    window.speechSynthesis.speak(utterance);
  }

  stop() {
    if (this.supported) window.speechSynthesis.cancel();
    this.speaking = false;
  }

  setEnabled(val) {
    this.enabled = val;
    if (!val) this.stop();
  }
}
