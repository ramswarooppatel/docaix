"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSpeechToText } from "../hooks/useSpeechToText";
import { useSound } from "../hooks/useSound";
import { Mic, MicOff, X, MapPin } from "lucide-react";
import { Button } from "./ui/button";

interface Props {
  onVoiceCommand: (command: string) => void;
  onListeningChange?: (isListening: boolean) => void;
  disabled?: boolean;
}

const VoiceInput: React.FC<Props> = ({ onVoiceCommand, onListeningChange, disabled = false }) => {
  const { transcript, isListening, startListening, cancelListening, error } = useSpeechToText();
  const lastProcessedTranscript = useRef("");
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
  
  // Sound effects
  const startSound = useSound('../assets/sound/ting.mp3', { volume: 0.6 });
  const endSound = useSound('../assets/sound/ting.mp3', { volume: 0.4 });
  const cancelSound = useSound('../assets/sound/ting.mp3', { volume: 0.3 });

  // Get user location on component mount for location-aware commands
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          console.log('Voice input has access to user location:', position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.log('Voice input: Location access denied or failed');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    }
  }, []);

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

  // Process voice commands with location awareness
  useEffect(() => {
    if (
      transcript &&
      !isListening &&
      transcript !== lastProcessedTranscript.current &&
      transcript.trim().length > 0
    ) {
      lastProcessedTranscript.current = transcript;
      console.log("Auto-sending voice command:", transcript);
      
      let processedCommand = transcript;
      
      // Check for location-related commands and enhance them
      const locationCommands = [
        'find hospitals near me',
        'hospitals nearby',
        'emergency rooms near me',
        'nearest hospital',
        'find medical help',
        'where is the closest hospital'
      ];
      
      const isLocationCommand = locationCommands.some(cmd => 
        transcript.toLowerCase().includes(cmd.toLowerCase())
      );
      
      if (isLocationCommand && userLocation) {
        processedCommand = `${transcript} (Current location: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)})`;
        console.log('Enhanced location-aware command:', processedCommand);
      }
      
      // Play completion sound
      endSound.play();
      
      onVoiceCommand(processedCommand);
    }
  }, [transcript, isListening, onVoiceCommand, endSound, userLocation]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleVoiceStart = () => {
    if (!disabled) {
      startListening();
    }
  };

  const handleCancel = () => {
    console.log("Voice input cancelled by user");
    cancelSound.play();
    cancelListening();
  };

  if (isListening) {
    return (
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Cancel Button */}
        <Button
          onClick={handleCancel}
          variant="outline"
          size="sm"
          className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 p-0 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
          title="Cancel voice input"
        >
          <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
        </Button>

        {/* Listening Indicator - Mobile optimized */}
        <div className="flex items-center gap-1 sm:gap-2 bg-red-50 text-red-600 border border-red-200 rounded-md sm:rounded-lg px-2 py-1 sm:px-3 sm:py-1.5 animate-pulse">
          <div className="flex items-center gap-0.5 sm:gap-1">
            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 lg:w-2 lg:h-2 bg-red-500 rounded-full animate-pulse"></div>
            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 lg:w-2 lg:h-2 bg-red-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 lg:w-2 lg:h-2 bg-red-300 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <MicOff className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
          <span className="text-xs font-medium">
            <span className="hidden sm:inline">Listening... </span>
            {formatTimer(timer)}
          </span>
          {userLocation && (
            <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-green-600 hidden sm:inline" title={`Location available: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <Button
        onClick={handleVoiceStart}
        disabled={disabled}
        variant="outline"
        size="sm"
        className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 p-0 hover:bg-gray-100 hover:shadow-md disabled:opacity-50"
        title={userLocation ? `Voice input with location (${userLocation.lat.toFixed(2)}, ${userLocation.lng.toFixed(2)})` : "Start voice input"}
      >
        <Mic className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-600" />
        {userLocation && (
          <MapPin className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 text-green-600 bg-white rounded-full" />
        )}
      </Button>

      {/* Error Display - Mobile optimized */}
      {error && (
        <div className="absolute top-full right-0 mt-1 bg-red-50 border border-red-200 rounded-md px-2 py-1 text-xs text-red-600 whitespace-nowrap z-10 shadow-sm max-w-xs sm:max-w-none">
          <span className="hidden sm:inline">{error}</span>
          <span className="sm:hidden">Voice error</span>
        </div>
      )}
    </div>
  );
};

export default VoiceInput;