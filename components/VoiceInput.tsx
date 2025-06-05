"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSpeechToText } from "../hooks/useSpeechToText";
import { useSettings } from "../hooks/useSettings";
import {
  Mic,
  MicOff,
  X,
  MapPin,
  Smartphone,
  SendHorizonal,
} from "lucide-react";
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

      // Check for cancel commands
      const cancelCommands = ["stop", "cancel", "never mind", "quit", "exit"];
      const isCancelCommand = cancelCommands.some((cmd) =>
        transcript.toLowerCase().includes(cmd.toLowerCase())
      );

      if (isCancelCommand) {
        console.log("Cancel command detected, stopping voice input");
        handleCancel();
        return;
      }

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

      playSound(1000, 150); // Success sound
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

  // Enhanced cancel handler with voice command detection
  const handleCancel = () => {
    console.log("Voice input cancelled by user");

    // Mobile haptic feedback for cancellation
    if (isMobile && "vibrate" in navigator) {
      navigator.vibrate([200, 100, 200]); // Cancel vibration pattern
    }

    playSound(400, 300); // Cancel sound - lower frequency, longer duration
    cancelListening();
  };

  // Simple listening indicator - just change the icon
  if (isListening) {
    return (
      <div className="relative">
        <Button
          onClick={handleCancel}
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0 bg-red-50 border-red-300 hover:bg-red-100 hover:border-red-400 touch-manipulation transition-all duration-200 animate-pulse"
          title="Click to stop listening"
        >
          <MicOff className="h-4 w-4 text-red-600" />
        </Button>

        {/* Timer indicator */}
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-mono">
          {timer}
        </div>

        {/* Live transcript tooltip */}
        {transcript && transcript.trim() && (
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 max-w-xs bg-black/80 text-white text-xs rounded-lg px-3 py-2 z-10">
            <div className="text-center">
              <p className="opacity-60">You said:</p>
              <p className="font-medium">
                "{transcript.substring(0, 50)}
                {transcript.length > 50 ? "..." : ""}"
              </p>
            </div>
            {/* Arrow pointing up */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-black/80"></div>
          </div>
        )}

        {/* Location indicator */}
        {userLocation && (
          <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-green-500 rounded-full border border-white flex items-center justify-center">
            <MapPin className="w-2 h-2 text-white" />
          </div>
        )}
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
        className={`h-8 w-8 p-0 hover:bg-blue-50 hover:border-blue-300 hover:shadow-md disabled:opacity-50 touch-manipulation transition-all duration-200 ${
          micPermission === "granted" ? "border-green-300 bg-green-50" : ""
        }`}
        title={
          micPermission === "denied"
            ? "Microphone access denied - click to retry"
            : userLocation
            ? `Voice input with location`
            : "Start voice input - speak your medical question"
        }
      >
        <Mic
          className={`h-4 w-4 ${
            micPermission === "granted" ? "text-green-600" : "text-gray-600"
          }`}
        />

        {/* Enhanced status indicators */}
        {userLocation && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white flex items-center justify-center">
            <MapPin className="w-2 h-2 text-white" />
          </div>
        )}

        {isMobile && (
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border border-white flex items-center justify-center">
            <Smartphone className="w-2 h-2 text-white" />
          </div>
        )}

        {micPermission === "denied" && (
          <div className="absolute -top-1 -left-1 w-3 h-3 bg-red-500 rounded-full border border-white animate-pulse" />
        )}

        {micPermission === "granted" && !userLocation && !isMobile && (
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-green-500 rounded-full border border-white" />
        )}
      </Button>

      {/* Enhanced Error Display with retry option */}
      {error && (
        <div className="absolute top-full right-0 mt-2 max-w-xs bg-red-50 border border-red-200 rounded-lg px-3 py-3 text-sm text-red-600 z-10 shadow-lg">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-1" />
            <div className="space-y-2">
              <span className="font-medium">{error}</span>
              {micPermission === "denied" && (
                <div className="text-xs text-red-500">
                  <p>To enable microphone:</p>
                  <p>• Click the 🔒 icon in address bar</p>
                  <p>• Allow microphone access</p>
                  <p>• Refresh the page</p>
                </div>
              )}
              <Button
                onClick={handleVoiceStart}
                size="sm"
                variant="outline"
                className="text-xs h-6 px-2 mt-1 border-red-300 text-red-600 hover:bg-red-50"
              >
                Retry
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile-specific help text */}
      {isMobile && micPermission === "unknown" && !isListening && (
        <div className="absolute top-full right-0 mt-1 text-xs text-gray-500 bg-white border border-gray-200 rounded px-2 py-1 shadow-sm whitespace-nowrap">
          👆 Touch to enable voice
        </div>
      )}
    </div>
  );
};

export default VoiceInput;
