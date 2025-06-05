"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onstart: (event: Event) => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: any) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

// We don't need to redeclare the Window interface here
// as it's already defined in speech.d.ts

interface SpeechRecognitionEvent {
  results: {
    [key: number]: {
      [key: number]: {
        transcript: string;
        confidence: number;
      };
      isFinal: boolean;
    };
  };
}

export function useSpeechToText() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingRef = useRef(false);

  // Check browser support
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognitionClass =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognitionClass) {
        const recognition = new SpeechRecognitionClass();

        // Desktop optimized settings
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          console.log("Speech recognition started");
          setIsListening(true);
          setError(null);
          isProcessingRef.current = true;
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const result = event.results[0];
          if (result && result.isFinal) {
            const transcriptText = result[0].transcript;
            console.log("Speech recognition result:", transcriptText);
            setTranscript(transcriptText);
            isProcessingRef.current = false;
          }
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setError(`Voice recognition error: ${event.error}`);
          setIsListening(false);
          isProcessingRef.current = false;
        };

        recognition.onend = () => {
          console.log("Speech recognition ended");
          setIsListening(false);
          isProcessingRef.current = false;

          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
        };

        recognitionRef.current = recognition;
        setIsSupported(true);
      } else {
        setIsSupported(false);
        setError("Speech recognition not supported in this browser");
      }
    }
  }, []);

  const startListening = useCallback(async () => {
    if (!recognitionRef.current || isListening) return;

    try {
      // Clear any existing timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      // Request microphone permission
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
          channelCount: 1,
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      stream.getTracks().forEach((track) => track.stop());

      console.log("Starting speech recognition");
      setTranscript("");
      setError(null);

      recognitionRef.current.start();

      // Set timeout for maximum listening duration (30 seconds)
      timeoutRef.current = setTimeout(() => {
        if (recognitionRef.current && isProcessingRef.current) {
          console.log("Speech recognition timeout - stopping");
          recognitionRef.current.stop();
        }
      }, 30000);
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      setError("Failed to start voice recognition. Please check microphone permissions.");
      setIsListening(false);
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      console.log("Stopping speech recognition");
      recognitionRef.current.stop();
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [isListening]);

  const cancelListening = useCallback(() => {
    if (recognitionRef.current) {
      console.log("Cancelling speech recognition");
      recognitionRef.current.abort();
      setIsListening(false);
      setTranscript("");
      isProcessingRef.current = false;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return {
    isListening,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening,
    cancelListening,
  };
}
