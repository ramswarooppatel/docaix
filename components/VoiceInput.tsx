"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, X, MapPin } from 'lucide-react';
import { useSpeechToText } from '@/hooks/useSpeechToText';
import { useSettings } from '@/hooks/useSettings';
import { useSound } from '@/hooks/useSound';

interface VoiceInputProps {
  onVoiceCommand: (command: string) => void;
  onListeningChange?: (isListening: boolean) => void;
  disabled?: boolean;
}

const VoiceInput: React.FC<VoiceInputProps> = ({
  onVoiceCommand,
  onListeningChange,
  disabled = false,
}) => {
  const { getVoiceSettings } = useSettings();
  const voiceSettings = getVoiceSettings();
  
  const [microphoneState, setMicrophoneState] = useState<'idle' | 'listening' | 'processing' | 'error'>('idle');
  const [timer, setTimer] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'unknown'>('unknown');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  const lastProcessedTranscript = useRef<string>('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    transcript,
    isListening,
    startListening,
    stopListening,
    cancelListening,
  } = useSpeechToText();

  // Enhanced sound effects
  const volumeLevel = voiceSettings.volume;
  const startSound = useSound('../assets/sound/ting.mp3', {
    volume: volumeLevel
  });
  const endSound = useSound('../assets/sound/ting.mp3', {
    volume: volumeLevel * 0.7
  });
  const cancelSound = useSound('../assets/sound/ting.mp3', {
    volume: volumeLevel * 0.5
  });

  // Check microphone permissions
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        if (navigator.permissions) {
          const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          setMicPermission(result.state === 'granted' ? 'granted' : result.state === 'denied' ? 'denied' : 'unknown');
          
          result.addEventListener('change', () => {
            setMicPermission(result.state === 'granted' ? 'granted' : result.state === 'denied' ? 'denied' : 'unknown');
          });
        }
      } catch (error) {
        console.log('Permission API not supported');
      }
    };
    
    checkPermissions();
  }, []);

  // Get user location for enhanced commands
  useEffect(() => {
    const getLocation = () => {
      if (!navigator.geolocation) {
        console.log('Geolocation not supported');
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          console.log('Voice input location acquired:', {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          console.log('Voice input: Location access failed:', error.message);
        },
        options
      );
    };

    getLocation();
  }, []);

  // Handle listening state changes
  useEffect(() => {
    if (isListening) {
      setMicrophoneState('listening');
      startSound.play();
    } else if (error) {
      setMicrophoneState('error');
      const timeout = setTimeout(() => {
        setMicrophoneState('idle');
      }, 3000);
      return () => clearTimeout(timeout);
    } else {
      setMicrophoneState('idle');
    }
  }, [isListening, error, startSound]);

  // Timer for listening duration
  useEffect(() => {
    if (isListening) {
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

  // Notify parent component of listening state changes
  useEffect(() => {
    onListeningChange?.(isListening);
  }, [isListening, onListeningChange]);

  // Enhanced voice command processing
  useEffect(() => {
    if (transcript && !isListening && transcript !== lastProcessedTranscript.current && transcript.trim().length > 0) {
      lastProcessedTranscript.current = transcript;
      console.log("Voice command processed:", transcript);
      
      let processedCommand = transcript;
      
      // Enhanced location commands
      const locationCommands = [
        'find hospitals near me',
        'hospitals nearby',
        'emergency rooms near me',
        'nearest hospital',
        'find medical help',
        'where is the closest hospital',
        'emergency',
        'help me',
        'call ambulance'
      ];

      const isLocationCommand = locationCommands.some(cmd => 
        transcript.toLowerCase().includes(cmd.toLowerCase())
      );

      if (isLocationCommand && userLocation) {
        processedCommand = `${transcript} (Location: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)})`;
        console.log('Location-enhanced command:', processedCommand);
      }

      endSound.play();
      onVoiceCommand(processedCommand);
    }
  }, [transcript, isListening, onVoiceCommand, endSound, userLocation]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Voice start with permission handling
  const handleVoiceStart = async () => {
    if (disabled) return;

    // Request microphone permission explicitly
    if (micPermission !== 'granted') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        setMicPermission('granted');
        console.log('Microphone permission granted');
      } catch (error) {
        console.error('Microphone permission denied:', error);
        setMicPermission('denied');
        alert('Microphone access is required for voice input. Please enable microphone permissions in your browser settings.');
        return;
      }
    }

    console.log('Starting voice input');
    startListening();
  };

  const handleCancel = () => {
    console.log("Voice input cancelled");
    cancelSound.play();
    cancelListening();
  };

  // When microphone is listening - show persistent feedback
  if (isListening) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg shadow-md">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <Mic className="h-3 w-3 text-red-600 animate-pulse" />
          <span className="text-xs font-bold text-red-700">
            🎤 LISTENING... <span className="font-mono">{formatTimer(timer)}</span>
          </span>
          {userLocation && (
            <span title={`Location: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`}>
              <MapPin className="h-3 w-3 text-green-600 animate-pulse" />
            </span>
          )}
        </div>
        
        <Button
          onClick={handleCancel}
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 text-red-600 hover:bg-red-200 ml-2"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="relative">
      <Button
        onClick={handleVoiceStart}
        disabled={disabled || micPermission === 'denied'}
        variant="outline"
        size="sm"
        className={`h-8 w-8 p-0 relative transition-all duration-300 ${
          micPermission === 'denied' 
            ? 'border-red-300 bg-red-50 text-red-600' 
            : isListening
              ? 'border-green-400 bg-green-50 text-green-700 shadow-lg ring-4 ring-green-200 animate-pulse scale-110' 
              : microphoneState === 'processing' 
                ? 'border-blue-400 bg-blue-50 text-blue-700 ring-2 ring-blue-200' 
                : microphoneState === 'error' 
                  ? 'border-red-400 bg-red-50 text-red-700 ring-2 ring-red-200' 
                  : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50 hover:scale-105'
        } hover:shadow-md disabled:opacity-50 touch-manipulation`}
      >
        <Mic className={`h-3 w-3 transition-colors duration-300 ${
          isListening ? 'text-green-600' : 'text-gray-600'
        }`} />
        
        {/* Persistent status indicators */}
        {isListening && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse shadow-md" />
        )}
        
        {/* Active listening ring */}
        {isListening && (
          <div className="absolute inset-0 rounded-full border-2 border-green-400 animate-ping" />
        )}

        {/* Location indicator */}
        {userLocation && (
          <MapPin className="absolute -top-0.5 -right-0.5 w-2 h-2 text-green-600 bg-white rounded-full" />
        )}
        
        {/* Permission denied indicator */}
        {micPermission === 'denied' && (
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-red-500 rounded-full border border-white" />
        )}
      </Button>

      {/* Error display */}
      {error && (
        <div className="absolute top-full left-0 mt-1 text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1 whitespace-nowrap">
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default VoiceInput;