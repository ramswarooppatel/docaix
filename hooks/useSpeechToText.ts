import { useEffect, useRef, useState, useCallback } from "react";

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

export function useSpeechToText() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isProcessingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize recognition only once
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognitionAPI =
      (window as any).webkitSpeechRecognition ||
      (window as any).SpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setError("Speech recognition not supported in this browser.");
      return;
    }

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognitionAPI();

      // More permissive settings for better detection
      recognition.continuous = true; // Keep listening for speech
      recognition.interimResults = true; // Show interim results
      recognition.lang = "en-US";
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        console.log("Speech recognition started");
        setIsListening(true);

        // Longer timeout for better user experience
        timeoutRef.current = setTimeout(() => {
          if (recognitionRef.current) {
            recognition.stop();
          }
        }, 15000); // 15 seconds timeout
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        console.log("Speech recognition result received");

        if (isProcessingRef.current) return;

        let finalTranscript = "";
        let interimTranscript = "";

        // Process all results
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;

          if (result.isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        // If we have a final result, use it
        if (finalTranscript.trim()) {
          console.log("Final transcript:", finalTranscript);

          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }

          isProcessingRef.current = true;
          setTranscript(finalTranscript.trim());
          recognition.stop();
        }
        // Show interim results for user feedback
        else if (interimTranscript.trim()) {
          console.log("Interim transcript:", interimTranscript);
          // Optionally show interim results (uncomment if needed)
          // setTranscript(interimTranscript.trim());
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error);

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        const errorType = event.error;

        switch (errorType) {
          case "no-speech":
            console.log(
              "No speech detected. Please try speaking louder or closer to the microphone."
            );
            setError("No speech detected. Please try again.");
            break;
          case "audio-capture":
            setError(
              "Microphone not accessible. Please check your microphone."
            );
            break;
          case "not-allowed":
            setError(
              "Microphone access denied. Please allow microphone access and refresh the page."
            );
            break;
          case "network":
            setError("Network error. Please check your connection.");
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
  }, []); // Empty dependency array - run only once

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
      setError(
        "Could not access microphone. Please ensure microphone permissions are granted."
      );
      setIsListening(false);
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  return {
    transcript,
    isListening,
    error,
    startListening,
    stopListening,
  };
}
