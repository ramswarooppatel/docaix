"use client";

import { useState, useRef, useEffect, useCallback } from "react";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function useSpeechToText() {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingRef = useRef(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const detectMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileKeywords = ['mobile', 'android', 'iphone', 'ipad', 'ipod'];
      return mobileKeywords.some(keyword => userAgent.includes(keyword)) || 
             window.innerWidth <= 768 ||
             'ontouchstart' in window;
    };

    setIsMobile(detectMobile());
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Enhanced browser support detection for mobile
    const SpeechRecognitionClass = 
      window.SpeechRecognition || 
      window.webkitSpeechRecognition;

    if (SpeechRecognitionClass) {
      const recognition = new SpeechRecognitionClass();
      
      // Mobile-optimized settings
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";
      recognition.maxAlternatives = 1;
      
      // Mobile-specific optimizations
    

      recognition.onstart = () => {
        console.log("Speech recognition started on", isMobile ? "mobile" : "desktop");
        setIsListening(true);
        setError(null);
        isProcessingRef.current = true;
        
        // Shorter timeout for mobile to save battery
        const timeout = isMobile ? 20000 : 30000;
        timeoutRef.current = setTimeout(() => {
          if (recognitionRef.current && isProcessingRef.current) {
            console.log("Speech recognition timeout - stopping");
            recognition.stop();
          }
        }, timeout);
      };

      recognition.onresult = (event: any) => {
        console.log("Speech recognition result received");
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        const transcript = event.results[0][0].transcript;
        const confidence = event.results[0][0].confidence;
        
        console.log("Transcript:", transcript, "Confidence:", confidence);
        
        // Mobile devices often have lower confidence scores
        const minConfidence = isMobile ? 0.3 : 0.5;
        
        if (confidence >= minConfidence) {
          setTranscript(transcript);
        } else {
          console.warn("Low confidence transcript, using anyway on mobile:", transcript);
          setTranscript(transcript); // Use anyway on mobile due to lower accuracy
        }
        
        setIsListening(false);
        isProcessingRef.current = false;
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        const errorType = event.error;
        let errorMessage = "";

        switch (errorType) {
          case "no-speech":
            errorMessage = isMobile ? "No speech detected. Try again." : "No speech detected. Please try again.";
            break;
          case "audio-capture":
            errorMessage = isMobile ? "Mic not accessible." : "Microphone not accessible. Please check your microphone.";
            break;
          case "not-allowed":
            errorMessage = isMobile ? "Mic access denied." : "Microphone access denied. Please allow microphone access and refresh the page.";
            break;
          case "network":
            errorMessage = isMobile ? "Network error." : "Network error. Please check your connection.";
            break;
          case "aborted":
            errorMessage = null; // Don't show error for manual cancellation
            break;
          default:
            errorMessage = isMobile ? `Error: ${errorType}` : `Recognition error: ${errorType}`;
        }

        if (errorMessage) {
          setError(errorMessage);
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
    } else {
      console.error("Speech recognition not supported");
      setError(isMobile ? "Voice not supported" : "Speech recognition not supported in this browser");
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isMobile]);

  const startListening = useCallback(async () => {
    if (!recognitionRef.current || isListening) return;

    try {
      // Enhanced permission request for mobile
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          ...(isMobile && {
            sampleRate: 16000, // Lower sample rate for mobile
            channelCount: 1     // Mono for mobile
          })
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      stream.getTracks().forEach(track => track.stop());

      isProcessingRef.current = false;
      setError(null);
      setTranscript("");
      
      console.log("Starting speech recognition on", isMobile ? "mobile device" : "desktop");
      recognitionRef.current.start();
    } catch (err) {
      console.error("Error accessing microphone:", err);
      const errorMessage = isMobile 
        ? "Cannot access microphone. Check permissions." 
        : "Could not access microphone. Please ensure microphone permissions are granted.";
      setError(errorMessage);
      setIsListening(false);
    }
  }, [isListening, isMobile]);

  const stopListening = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    if (recognitionRef.current && isListening) {
      console.log("Stopping speech recognition");
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const cancelListening = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    if (recognitionRef.current) {
      console.log("Cancelling speech recognition");
      recognitionRef.current.abort();
      setIsListening(false);
      setTranscript("");
      isProcessingRef.current = false;
    }
  }, []);

  return {
    transcript,
    isListening,
    error,
    startListening,
    stopListening,
    cancelListening,
    isSupported: !!recognitionRef.current,
    isMobile
  };
}
