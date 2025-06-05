"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSpeechToText } from "../hooks/useSpeechToText";
import { useSettings } from "../hooks/useSettings";
import { useSound } from "../hooks/useSound";
import { Mic, MicOff, X, MapPin, Smartphone } from "lucide-react";
import { Button } from "./ui/button";

interface Props {
  onVoiceCommand: (command: string) => void;
  onListeningChange?: (isListening: boolean) => void;
  disabled?: boolean;
}

const VoiceInput: React.FC<Props> = ({ onVoiceCommand, onListeningChange, disabled = false }) => {
  const { settings, getVoiceSettings } = useSettings();
  const voiceSettings = getVoiceSettings();
  
  const { transcript, isListening, startListening, cancelListening, error } = useSpeechToText();
  const lastProcessedTranscript = useRef("");
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  const [micPermission, setMicPermission] = useState<'unknown' | 'granted' | 'denied'>('unknown');
  
  // Enhanced sound effects with settings-based volumes
  const volumeLevel = voiceSettings.volume * (isMobile ? 0.5 : 1);
  const startSound = useSound('../assets/sound/ting.mp3', { volume: volumeLevel });
  const endSound = useSound('../assets/sound/ting.mp3', { volume: volumeLevel * 0.7 });
  const cancelSound = useSound('../assets/sound/ting.mp3', { volume: volumeLevel * 0.5 });

  // Detect mobile device and iOS specifically
  useEffect(() => {
    const detectMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileKeywords = ['mobile', 'android', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone'];
      const isMobileDevice = mobileKeywords.some(keyword => userAgent.includes(keyword)) || 
                            window.innerWidth <= 768 ||
                            'ontouchstart' in window;
      
      const isIOS = /ipad|iphone|ipod/.test(userAgent) || 
                   (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      
      setIsMobile(isMobileDevice);
      setIsIOSDevice(isIOS);
      
      console.log('Device detection:', { 
        isMobile: isMobileDevice, 
        isIOS: isIOS, 
        userAgent: userAgent,
        windowWidth: window.innerWidth 
      });
    };

    detectMobile();
    window.addEventListener('resize', detectMobile);
    return () => window.removeEventListener('resize', detectMobile);
  }, []);

  // Check microphone permissions for mobile
  useEffect(() => {
    const checkMicPermission = async () => {
          try {
            if ('permissions' in navigator) {
              const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
              
              const mapPermissionState = (state: PermissionState): 'unknown' | 'granted' | 'denied' => {
                if (state === 'granted') return 'granted';
                if (state === 'denied') return 'denied';
                return 'unknown'; // Maps 'prompt' to 'unknown'
              };
              
              setMicPermission(mapPermissionState(permission.state));
              console.log('Microphone permission status:', permission.state);
              
              permission.addEventListener('change', () => {
                setMicPermission(mapPermissionState(permission.state));
                console.log('Microphone permission changed to:', permission.state);
              });
            }
          } catch (error) {
            console.log('Permission API not supported or error:', error);
          }
        };

    checkMicPermission();
  }, []);

  // Enhanced location access for mobile
  useEffect(() => {
    const getMobileLocation = () => {
      if (!navigator.geolocation) {
        console.log('Geolocation not supported on this device');
        return;
      }

      const options = {
        enableHighAccuracy: !isMobile, // Less accurate but faster on mobile
        timeout: isMobile ? 15000 : 10000, // Longer timeout for mobile
        maximumAge: isMobile ? 600000 : 300000 // Longer cache for mobile to save battery
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
            accuracy: position.coords.accuracy,
            isMobile
          });
        },
        (error) => {
          console.log('Voice input: Location access failed:', error.message);
          if (error.code === error.PERMISSION_DENIED) {
            console.log('Location permission denied on mobile device');
          }
        },
        options
      );
    };

    getMobileLocation();
  }, [isMobile]);

  // Mobile-optimized sound effects
  useEffect(() => {
    if (isListening && isMobile) {
      // Provide haptic feedback on mobile if available
      if ('vibrate' in navigator) {
        navigator.vibrate(50); // Short vibration to indicate start
      }
      startSound.play();
    }
  }, [isListening, isMobile, startSound]);
  // Enhanced timer for mobile
  useEffect(() => {
    if (isListening) {
      setTimer(0);
      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          const newTime = prev + 1;
          // Auto-stop after configured timeout (default 30 seconds on mobile to save battery)
          const timeoutSeconds = voiceSettings.timeout / 1000;
          if (newTime >= timeoutSeconds) {
            handleCancel();
            return prev;
          }
          return newTime;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setTimer(0);
    }    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isListening, isMobile, voiceSettings.timeout]);

  // Notify parent of listening state changes
  useEffect(() => {
    onListeningChange?.(isListening);
  }, [isListening, onListeningChange]);

  // Enhanced voice command processing for mobile
  useEffect(() => {
    if (
      transcript &&
      !isListening &&
      transcript !== lastProcessedTranscript.current &&
      transcript.trim().length > 0
    ) {
      lastProcessedTranscript.current = transcript;
      console.log("Mobile voice command processed:", transcript);
      
      let processedCommand = transcript;
      
      // Enhanced location commands for mobile
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
        processedCommand = `${transcript} (Mobile location: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)})`;
        console.log('Mobile location-enhanced command:', processedCommand);
      }
      
      // Mobile haptic feedback for completion
      if (isMobile && 'vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]); // Success pattern
      }
      
      endSound.play();
      onVoiceCommand(processedCommand);
    }
  }, [transcript, isListening, onVoiceCommand, endSound, userLocation, isMobile]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Enhanced mobile voice start with permission handling
  const handleVoiceStart = async () => {
    if (disabled) return;

    // Request microphone permission explicitly on mobile
    if (isMobile && micPermission !== 'granted') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        setMicPermission('granted');
        console.log('Mobile microphone permission granted');
      } catch (error) {
        console.error('Mobile microphone permission denied:', error);
        setMicPermission('denied');
        alert('Microphone access is required for voice input. Please enable microphone permissions in your browser settings.');
        return;
      }
    }

    // iOS-specific handling
    if (isIOSDevice) {
      console.log('Starting voice input on iOS device');
      // iOS Safari requires user interaction to start speech recognition
      document.addEventListener('touchstart', () => {}, { once: true });
    }

    console.log('Starting mobile voice input');
    startListening();
  };

  const handleCancel = () => {
    console.log("Mobile voice input cancelled");
    
    // Mobile haptic feedback for cancellation
    if (isMobile && 'vibrate' in navigator) {
      navigator.vibrate(200); // Cancel vibration
    }
    
    cancelSound.play();
    cancelListening();
  };

  // Mobile listening UI with larger touch targets
  if (isListening) {
    return (
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Cancel Button - Larger for mobile */}
        <Button
          onClick={handleCancel}
          variant="outline"
          size="sm"
          className={`${
            isMobile 
              ? 'h-8 w-8 p-0' 
              : 'h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 p-0'
          } border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 touch-manipulation`}
          title="Cancel voice input"
        >
          <X className={`${isMobile ? 'h-4 w-4' : 'h-2.5 w-2.5 sm:h-3 sm:w-3'}`} />
        </Button>

        {/* Enhanced Listening Indicator for Mobile */}
        <div className={`flex items-center gap-2 px-3 py-2 ${
          isMobile ? 'bg-red-100' : 'bg-red-50'
        } border border-red-200 rounded-lg animate-pulse`}>
          <div className="flex items-center gap-1.5">
            <div className={`${
              isMobile ? 'w-3 h-3' : 'w-2 h-2'
            } bg-red-500 rounded-full animate-pulse`} />
            <MicOff className={`${
              isMobile ? 'h-4 w-4' : 'h-2.5 w-2.5 sm:h-3 sm:w-3'
            } text-red-600`} />
            <span className={`${
              isMobile ? 'text-sm' : 'text-xs'
            } font-medium text-red-700`}>
              <span className={`${isMobile ? 'inline' : 'hidden sm:inline'}`}>
                {isMobile ? 'Listening' : 'Listening...'}
              </span>
              <span className="ml-1">{formatTimer(timer)}</span>
            </span>
            {userLocation && (
              <span title={`Location: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`}>
                <MapPin 
                  className={`${
                    isMobile ? 'h-4 w-4' : 'h-2.5 w-2.5 sm:h-3 sm:w-3'
                  } text-green-600`} 
                />
              </span>
            )}
            {isMobile && (
              <span title="Mobile optimized">
                <Smartphone className="h-3 w-3 text-blue-600" />
              </span>
            )}
          </div>
        </div>
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
        className={`${
          isMobile 
            ? 'h-8 w-8 p-0' 
            : 'h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 p-0'
        } hover:bg-gray-100 hover:shadow-md disabled:opacity-50 touch-manipulation relative`}
        title={
          micPermission === 'denied' 
            ? 'Microphone access denied'
            : userLocation 
              ? `Voice input with location (${userLocation.lat.toFixed(2)}, ${userLocation.lng.toFixed(2)})` 
              : isMobile 
                ? "Touch to start voice input" 
                : "Start voice input"
        }
      >
        <Mic className={`${
          isMobile ? 'h-4 w-4' : 'h-2.5 w-2.5 sm:h-3 sm:w-3'
        } text-gray-600`} />
        
        {/* Enhanced indicators for mobile */}
        {userLocation && (
          <MapPin className={`absolute ${
            isMobile ? '-top-1 -right-1 w-3 h-3' : '-top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-1.5 h-1.5 sm:w-2 sm:h-2'
          } text-green-600 bg-white rounded-full`} />
        )}
        
        {isMobile && (
          <Smartphone className="absolute -bottom-0.5 -right-0.5 w-2 h-2 text-blue-600 bg-white rounded-full" />
        )}
        
        {micPermission === 'denied' && (
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-red-500 rounded-full border border-white" />
        )}
      </Button>

      {/* Enhanced Error Display for Mobile */}
      {error && (
        <div className={`absolute top-full right-0 mt-2 ${
          isMobile ? 'max-w-xs' : 'max-w-xs sm:max-w-none'
        } bg-red-50 border border-red-200 rounded-md px-3 py-2 text-sm text-red-600 z-10 shadow-lg`}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
            <span>{isMobile ? 'Voice error' : error}</span>
          </div>
          {isMobile && micPermission === 'denied' && (
            <div className="mt-1 text-xs text-red-500">
              Enable microphone in browser settings
            </div>
          )}
        </div>
      )}

      {/* Mobile-specific help text */}
      {isMobile && micPermission === 'unknown' && (
        <div className="absolute top-full right-0 mt-1 text-xs text-gray-500 whitespace-nowrap">
          Touch to enable voice
        </div>
      )}
    </div>
  );
};

export default VoiceInput;