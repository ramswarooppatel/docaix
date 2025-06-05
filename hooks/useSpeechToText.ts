"use client";

import { useState, useRef, useEffect, useCallback } from "react";

export function useSpeechToText() {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognitionClass =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognitionClass();

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        console.log("Speech recognition started");
        setIsListening(true);
        setError(null);
        isProcessingRef.current = true;

        // Set a timeout for maximum listening duration (30 seconds)
        timeoutRef.current = setTimeout(() => {
          if (recognitionRef.current && isProcessingRef.current) {
            console.log("Speech recognition timeout - stopping");
            recognition.stop();
          }
        }, 30000);
      };

      recognition.onresult = (event) => {
        console.log("Speech recognition result received");

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        const transcript = event.results[0][0].transcript;
        console.log("Transcript:", transcript);

        setTranscript(transcript);
        setIsListening(false);
        isProcessingRef.current = false;
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        const errorType = event.error;
        switch (errorType) {
          case "no-speech":
            setError("No speech detected. Please try again.");
            break;
          case "audio-capture":
            setError("Microphone not accessible. Please check your microphone.");
            break;
          case "not-allowed":
            setError("Microphone access denied. Please allow microphone access and refresh the page.");
            break;
          case "network":
            setError("Network error. Please check your connection.");
            break;
          case "aborted":
            setError(null); // Don't show error for manual cancellation
            break;
          default:
            setError(`Recognition error: ${errorType}`);
        }

        setIsListening(false);
        isProcessingRef.current = false;
      };

      recognition.onend = () => {
        console.log("Speech recognition ended");

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        setIsListening(false);
        isProcessingRef.current = false;
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const startListening = useCallback(async () => {
    if (!recognitionRef.current || isListening) return;

    try {
      // Request microphone permission explicitly
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop()); // Stop the stream, we just needed permission

      isProcessingRef.current = false;
      setError(null);
      setTranscript("");

      console.log("Starting speech recognition...");
      recognitionRef.current.start();
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Could not access microphone. Please ensure microphone permissions are granted.");
      setIsListening(false);
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (recognitionRef.current && isListening) {
      console.log("Manually stopping speech recognition...");
      recognitionRef.current.abort(); // Use abort instead of stop for immediate cancellation
      setIsListening(false);
      isProcessingRef.current = false;
      setError(null); // Clear any errors
    }
  }, [isListening]);

  const cancelListening = useCallback(() => {
    console.log("Cancelling speech recognition...");
    stopListening();
    setTranscript(""); // Also clear transcript on cancel
  }, [stopListening]);

  return {
    transcript,
    isListening,
    error,
    startListening,
    stopListening,
    cancelListening, // New cancel function
    isSupported: !!recognitionRef.current,
  };
}
