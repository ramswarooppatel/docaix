"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSpeechToText } from "../hooks/useSpeechToText";
import { useSettings } from "../hooks/useSettings";
import { Mic, MicOff, X, MapPin, Smartphone } from "lucide-react";
import { Button } from "./ui/button";

interface Props {
  onVoiceCommand: (command: string) => void;
  onListeningChange?: (isListening: boolean) => void;
  disabled?: boolean;
}

const VoiceInput: React.FC<Props> = ({
  onVoiceCommand,
  onListeningChange,
  disabled = false,
}) => {
  const { settings, getVoiceSettings } = useSettings();
  const voiceSettings = getVoiceSettings();

  const {
    transcript,
    isListening,
    startListening,
    cancelListening,
    error,
    isSupported,
  } = useSpeechToText();
  const lastProcessedTranscript = useRef("");
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  const [micPermission, setMicPermission] = useState<
    "unknown" | "granted" | "denied"
  >("unknown");

  // Simple sound fallback without external files
  const playSound = (frequency: number = 800, duration: number = 100) => {
    try {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + duration / 1000
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (error) {
      console.log("Sound not available:", error);
    }
  };

  // Detect mobile device and iOS specifically
  useEffect(() => {
    const detectMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileKeywords = [
        "mobile",
        "android",
        "iphone",
        "ipad",
        "ipod",
        "blackberry",
        "windows phone",
      ];
      const isMobileDevice =
        mobileKeywords.some((keyword) => userAgent.includes(keyword)) ||
        window.innerWidth <= 768 ||
        "ontouchstart" in window;

      const isIOS =
        /ipad|iphone|ipod/.test(userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

      setIsMobile(isMobileDevice);
      setIsIOSDevice(isIOS);

      console.log("Device detection:", {
        isMobile: isMobileDevice,
        isIOS: isIOS,
        userAgent: userAgent,
        windowWidth: window.innerWidth,
        isSupported: isSupported,
      });
    };

    detectMobile();
    window.addEventListener("resize", detectMobile);
    return () => window.removeEventListener("resize", detectMobile);
  }, [isSupported]);

  // Check microphone permissions
  useEffect(() => {
    const checkMicPermission = async () => {
      try {
        if ("permissions" in navigator) {
          const permission = await navigator.permissions.query({
            name: "microphone" as PermissionName,
          });

          const mapPermissionState = (
            state: PermissionState
          ): "unknown" | "granted" | "denied" => {
            if (state === "granted") return "granted";
            if (state === "denied") return "denied";
            return "unknown";
          };

          setMicPermission(mapPermissionState(permission.state));
          console.log("Microphone permission status:", permission.state);

          permission.addEventListener("change", () => {
            setMicPermission(mapPermissionState(permission.state));
            console.log("Microphone permission changed to:", permission.state);
          });
        }
      } catch (error) {
        console.log("Permission API not supported or error:", error);
      }
    };

    checkMicPermission();
  }, []);

  // Enhanced location access for mobile (optional, won't block voice input)
  useEffect(() => {
    const getMobileLocation = () => {
      if (!navigator.geolocation) {
        console.log("Geolocation not supported on this device");
        return;
      }

      const options = {
        enableHighAccuracy: false, // Faster but less accurate
        timeout: 5000, // Short timeout
        maximumAge: 600000, // 10 minutes cache
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          console.log("Voice input location acquired");
        },
        (error) => {
          console.log(
            "Voice input: Location access failed (this is optional):",
            error.message
          );
          // Don't block voice input if location fails
        },
        options
      );
    };

    // Only try to get location if it hasn't been permanently denied
    if (navigator.permissions) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((permission) => {
          if (permission.state !== "denied") {
            getMobileLocation();
          }
        })
        .catch(() => {
          // Fallback for browsers without permission API
          getMobileLocation();
        });
    } else {
      getMobileLocation();
    }
  }, []);

  // Enhanced timer for mobile
  useEffect(() => {
    if (isListening) {
      setTimer(0);
      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          const newTime = prev + 1;
          // Auto-stop after 30 seconds to save battery
          if (newTime >= 30) {
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

  // Enhanced voice command processing
  useEffect(() => {
    if (
      transcript &&
      !isListening &&
      transcript !== lastProcessedTranscript.current &&
      transcript.trim().length > 0
    ) {
      lastProcessedTranscript.current = transcript;
      console.log("Voice command processed:", transcript);

      let processedCommand = transcript;

      // Enhanced location commands
      const locationCommands = [
        "find hospitals near me",
        "hospitals nearby",
        "emergency rooms near me",
        "nearest hospital",
        "find medical help",
        "where is the closest hospital",
      ];

      const isLocationCommand = locationCommands.some((cmd) =>
        transcript.toLowerCase().includes(cmd.toLowerCase())
      );

      if (isLocationCommand && userLocation) {
        processedCommand = `${transcript} (Location: ${userLocation.lat.toFixed(
          4
        )}, ${userLocation.lng.toFixed(4)})`;
        console.log("Location-enhanced command:", processedCommand);
      }

      // Mobile haptic feedback for completion
      if (isMobile && "vibrate" in navigator) {
        navigator.vibrate([100, 50, 100]); // Success pattern
      }

      playSound(1000, 100); // Success sound
      onVoiceCommand(processedCommand);
    }
  }, [transcript, isListening, onVoiceCommand, userLocation, isMobile]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Enhanced mobile voice start with permission handling
  const handleVoiceStart = async () => {
    if (disabled || !isSupported) return;

    // Request microphone permission explicitly
    if (micPermission !== "granted") {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        stream.getTracks().forEach((track) => track.stop());
        setMicPermission("granted");
        console.log("Microphone permission granted");
      } catch (error) {
        console.error("Microphone permission denied:", error);
        setMicPermission("denied");
        alert(
          "Microphone access is required for voice input. Please enable microphone permissions in your browser settings."
        );
        return;
      }
    }

    console.log("Starting voice input");
    playSound(800, 100); // Start sound
    startListening();
  };

  const handleCancel = () => {
    console.log("Voice input cancelled");

    // Mobile haptic feedback for cancellation
    if (isMobile && "vibrate" in navigator) {
      navigator.vibrate(200); // Cancel vibration
    }

    playSound(400, 200); // Cancel sound
    cancelListening();
  };

  // Show error state if not supported
  if (!isSupported) {
    return (
      <div className="relative">
        <Button
          disabled={true}
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0 opacity-50"
          title="Voice input not supported in this browser"
        >
          <MicOff className="h-4 w-4 text-gray-400" />
        </Button>
        <div className="absolute top-full right-0 mt-1 text-xs text-gray-500 whitespace-nowrap">
          Voice not supported
        </div>
      </div>
    );
  }

  // Mobile listening UI with larger touch targets
  if (isListening) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-6 max-w-sm w-full mx-auto shadow-2xl">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center animate-pulse">
              <MicOff className="w-8 h-8 text-red-600" />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Listening...
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Speak clearly into your microphone
              </p>
              <div className="text-lg font-mono text-blue-600 mt-2">
                {formatTimer(timer)}
              </div>
            </div>

            {userLocation && (
              <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                <MapPin className="w-4 h-4" />
                <span>Location enabled</span>
              </div>
            )}

            <Button
              onClick={handleCancel}
              variant="outline"
              className="w-full bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <Button
        onClick={handleVoiceStart}
        disabled={disabled || micPermission === "denied"}
        variant="outline"
        size="sm"
        className="h-8 w-8 p-0 hover:bg-gray-100 hover:shadow-md disabled:opacity-50 touch-manipulation"
        title={
          micPermission === "denied"
            ? "Microphone access denied"
            : userLocation
            ? `Voice input with location`
            : "Start voice input"
        }
      >
        <Mic className="h-4 w-4 text-gray-600" />

        {/* Enhanced indicators */}
        {userLocation && (
          <MapPin className="absolute -top-1 -right-1 w-3 h-3 text-green-600 bg-white rounded-full" />
        )}

        {isMobile && (
          <Smartphone className="absolute -bottom-0.5 -right-0.5 w-2 h-2 text-blue-600 bg-white rounded-full" />
        )}

        {micPermission === "denied" && (
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-red-500 rounded-full border border-white" />
        )}
      </Button>

      {/* Enhanced Error Display */}
      {error && (
        <div className="absolute top-full right-0 mt-2 max-w-xs bg-red-50 border border-red-200 rounded-md px-3 py-2 text-sm text-red-600 z-10 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
            <span>{error}</span>
          </div>
          {micPermission === "denied" && (
            <div className="mt-1 text-xs text-red-500">
              Enable microphone in browser settings
            </div>
          )}
        </div>
      )}

      {/* Mobile-specific help text */}
      {isMobile && micPermission === "unknown" && (
        <div className="absolute top-full right-0 mt-1 text-xs text-gray-500 whitespace-nowrap">
          Touch to enable voice
        </div>
      )}
    </div>
  );
};

export default VoiceInput;
