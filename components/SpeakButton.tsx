"use client";

import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Volume2, Pause, Play, Square } from 'lucide-react';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { useSettings } from '../hooks/useSettings';

interface SpeakButtonProps {
  text: string;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
}

const SpeakButton: React.FC<SpeakButtonProps> = ({ 
  text, 
  className = "",
  size = "sm" 
}) => {
  const { getVoiceSettings } = useSettings();
  const voiceSettings = getVoiceSettings();
  const [showWaves, setShowWaves] = useState(false);
  
  const { 
    isSupported, 
    isSpeaking, 
    isPaused, 
    speak, 
    stop, 
    pause, 
    resume 
  } = useTextToSpeech({
    rate: voiceSettings.speed,
    pitch: 1.2,
    volume: voiceSettings.volume
  });

  // Visual effects only when actively speaking
  useEffect(() => {
    setShowWaves(isSpeaking && !isPaused);
  }, [isSpeaking, isPaused]);

  if (!isSupported) {
    return null;
  }

  const getButtonSize = () => {
    switch (size) {
      case 'lg': return 'h-10 w-10';
      case 'default': return 'h-8 w-8';
      default: return 'h-6 w-6';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'lg': return 'w-5 h-5';
      case 'default': return 'w-4 h-4';
      default: return 'w-3 h-3';
    }
  };

  const handlePlayPause = () => {
    if (isPaused) {
      resume(); // or playAgain()
    } else if (isSpeaking) {
      pause();
    }
  };

  return (
    <div className="flex items-center gap-1">
      {/* Main Button - Changes based on state */}
      <Button
        onClick={() => {
          if (!isSpeaking && !isPaused) {
            // Start speaking
            speak(text);
          } else if (isSpeaking && !isPaused) {
            // Pause speaking
            pause();
          } else if (isPaused) {
            // Resume speaking
            resume();
          }
        }}
        variant="ghost"
        size={size}
        className={`${getButtonSize()} p-0 relative transition-all duration-200 ${
          isSpeaking || isPaused 
            ? 'text-pink-600 bg-pink-50 hover:bg-pink-100' 
            : 'text-slate-400 hover:text-pink-600 hover:bg-pink-50'
        } ${className}`}
        title={
          !isSpeaking && !isPaused 
            ? "Start speaking" 
            : isSpeaking && !isPaused 
            ? "Pause speaking" 
            : "Resume speaking"
        }
        disabled={!text.trim()}
      >
        <div className="relative">
          {/* Icon changes based on state */}
          {!isSpeaking && !isPaused && <Volume2 className={getIconSize()} />}
          {isSpeaking && !isPaused && <Pause className={getIconSize()} />}
          {isPaused && <Play className={getIconSize()} />}
          
          {/* Visual indicator when speaking */}
          {showWaves && (
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
          )}
        </div>
      </Button>

      {/* Stop Button - Only show when speaking or paused */}
      {(isSpeaking || isPaused) && (
        <Button
          onClick={stop}
          variant="ghost"
          size={size}
          className={`${getButtonSize()} p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200`}
          title="Stop speaking"
        >
          <Square className={getIconSize()} />
        </Button>
      )}

      {/* Status indicator */}
      {(isSpeaking || isPaused) && (
        <div className="ml-1 text-xs text-slate-500">
          {isSpeaking && !isPaused ? "Speaking..." : "Paused"}
        </div>
      )}
    </div>
  );
};

export default SpeakButton;