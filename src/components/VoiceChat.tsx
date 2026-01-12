'use client';

import React, { useState, useEffect, useRef } from 'react';

interface VoiceChatProps {
  userId: string;
  onMessage: (message: string) => void;
  onResponse?: (text: string) => void;
  autoSpeak?: boolean;
}

export default function VoiceChat({ userId, onMessage, onResponse, autoSpeak = true }: VoiceChatProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState(false);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    // Check for browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const speechSynthesis = window.speechSynthesis;

    if (!SpeechRecognition || !speechSynthesis) {
      setError('Voice features not supported in this browser. Try Chrome or Edge.');
      return;
    }

    setSupported(true);

    // Initialize Speech Recognition
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: any) => {
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

      setTranscript(finalTranscript || interimTranscript);

      if (finalTranscript) {
        onMessage(finalTranscript);
        setTranscript('');
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setError(`Voice error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    synthRef.current = speechSynthesis;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [onMessage]);

  const startListening = () => {
    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('Failed to start recognition:', error);
      setError('Failed to start voice input. Please try again.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const speak = (text: string) => {
    if (!synthRef.current) return;

    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Try to find a natural-sounding voice
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(
      voice => voice.name.includes('Google') || voice.name.includes('Natural')
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  // Auto-speak responses if enabled
  useEffect(() => {
    if (autoSpeak && onResponse) {
      const originalOnResponse = onResponse;
      const wrappedOnResponse = (text: string) => {
        originalOnResponse(text);
        speak(text);
      };
      // This is a simplified version - in production, you'd use a proper event system
    }
  }, [autoSpeak, onResponse]);

  if (!supported) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
        <p className="text-yellow-800">
          Voice features require Chrome, Edge, or Safari.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex flex-col items-center space-y-4">
        {/* Voice Button */}
        <button
          onClick={isListening ? stopListening : startListening}
          className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
            isListening
              ? 'bg-red-500 hover:bg-red-600 animate-pulse'
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white shadow-lg`}
          disabled={isSpeaking}
        >
          {isListening ? (
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
              <rect x="6" y="6" width="8" height="8" />
            </svg>
          ) : (
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 4a3 3 0 016 0v6a3 3 0 11-6 0V4z" />
              <path d="M5.5 9.643a.75.75 0 00-1.5 0V10c0 3.06 2.29 5.585 5.25 5.954V17.5h-1.5a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-1.5v-1.546A6.001 6.001 0 0016 10v-.357a.75.75 0 00-1.5 0V10a4.5 4.5 0 01-9 0v-.357z" />
            </svg>
          )}
        </button>

        {/* Status Text */}
        <div className="text-center">
          {isListening && (
            <p className="text-blue-600 font-semibold">
              Listening... 🎤
            </p>
          )}
          {isSpeaking && (
            <p className="text-green-600 font-semibold">
              Speaking... 🔊
            </p>
          )}
          {!isListening && !isSpeaking && (
            <p className="text-gray-600">
              Click to talk with Adeline
            </p>
          )}
        </div>

        {/* Transcript */}
        {transcript && (
          <div className="w-full bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="text-gray-800 italic">"{transcript}"</p>
          </div>
        )}

        {/* Speaking Controls */}
        {isSpeaking && (
          <button
            onClick={stopSpeaking}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
          >
            Stop Speaking
          </button>
        )}

        {/* Error Display */}
        {error && (
          <div className="w-full bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Help Text */}
        <div className="text-center text-xs text-gray-500 max-w-md">
          <p>
            🎯 <strong>Tip:</strong> Voice chat is perfect for dyslexic learners, younger students, or hands-free learning (cooking, building, etc.)
          </p>
        </div>

        {/* Manual Speaking Test */}
        <div className="mt-4 pt-4 border-t border-gray-200 w-full">
          <p className="text-sm text-gray-600 mb-2">Test text-to-speech:</p>
          <button
            onClick={() => speak('Hello! I am Adeline, your AI learning companion. How can I help you learn today?')}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm"
            disabled={isSpeaking}
          >
            Test Voice
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Voice Journal Component
 * Spiritual reflection via voice
 */
export function VoiceJournal({ userId }: { userId: string }) {
  const [recording, setRecording] = useState(false);
  const [entry, setEntry] = useState('');

  const handleVoiceInput = (transcript: string) => {
    setEntry((prev) => prev + ' ' + transcript);
  };

  const saveEntry = async () => {
    if (!entry.trim()) return;

    try {
      await fetch('/api/journal/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          content: entry,
          isVoice: true,
          date: new Date().toISOString(),
        }),
      });

      setEntry('');
      alert('Journal entry saved! 📖');
    } catch (error) {
      console.error('Failed to save entry:', error);
      alert('Failed to save entry. Please try again.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Voice Journal 🎙️
      </h2>
      <p className="text-gray-600 mb-6">
        Reflect on your day, your learning, or your spiritual journey - all by voice.
      </p>

      <VoiceChat
        userId={userId}
        onMessage={handleVoiceInput}
        autoSpeak={false}
      />

      {entry && (
        <div className="mt-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Your Entry
          </label>
          <textarea
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Your journal entry will appear here..."
          />
          <button
            onClick={saveEntry}
            className="mt-4 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
          >
            Save Journal Entry
          </button>
        </div>
      )}
    </div>
  );
}
