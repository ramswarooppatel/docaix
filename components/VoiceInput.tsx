"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSpeechToText } from "../hooks/useSpeechToText";
import { useSound } from "../hooks/useSound";
import { Mic } from "lucide-react";
import { Button } from "./ui/button";

interface Props {
  onVoiceCommand: (command: string) => void;
  onListeningChange?: (isListening: boolean) => void;
}

const VoiceInput: React.FC<Props> = ({ onVoiceCommand, onListeningChange }) => {
  const { transcript, isListening, startListening } = useSpeechToText();
  const lastProcessedTranscript = useRef("");
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Sound effects
  const startSound = useSound('/assets/sound/ting.mp3', { volume: 0.6 });
  const endSound = useSound('/assets/sound/ting.mp3', { volume: 0.4 });

  // Play sound effect when voice listening starts
  useEffect(() => {
    if (isListening) {
      startSound.play();
    }
  }, [isListening, startSound]);

  // Timer effect
  useEffect(() => {
    if (isListening) {
      setTimer(0);
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setTimer(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isListening]);

  // Notify parent of listening state changes
  useEffect(() => {
    onListeningChange?.(isListening);
  }, [isListening, onListeningChange]);

  // Play sound when voice command is processed
  useEffect(() => {
    if (
      transcript &&
      !isListening &&
      transcript !== lastProcessedTranscript.current &&
      transcript.trim().length > 0
    ) {
      lastProcessedTranscript.current = transcript;
      console.log("Auto-sending voice command:", transcript);
      
      // Play completion sound
      endSound.play();
      
      onVoiceCommand(transcript);
    }
  }, [transcript, isListening, onVoiceCommand, endSound]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleVoiceStart = () => {
    startListening();
  };

  return (
    <div className="relative">
      <Button
        onClick={handleVoiceStart}
        disabled={isListening}
        variant="outline"
        className={`h-10 sm:h-12 px-3 sm:px-4 transition-all duration-200 ${
          isListening
            ? "bg-red-50 text-red-600 border-red-200 animate-pulse shadow-lg"
            : "hover:bg-gray-100 hover:shadow-md"
        }`}
      >
        <Mic
          className={`h-4 w-4 sm:h-5 sm:w-5 transition-colors duration-200 ${
            isListening ? "text-red-500 animate-pulse" : "text-gray-500"
          }`}
        />
        <span className="sr-only">
          {isListening ? "Listening..." : "Start voice input"}
        </span>
      </Button>

      {/* Timer display with sound indicator */}
      {isListening && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-mono shadow-lg animate-bounce flex items-center gap-1">
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          {formatTimer(timer)}
        </div>
      )}
    </div>
  );
};

export default VoiceInput;