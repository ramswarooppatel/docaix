"use client";

import React from 'react';
import { Button } from './ui/button';
import { Volume2, VolumeX, Pause, Play, Heart } from 'lucide-react';
import { useTextToSpeech } from '../hooks/useTextToSpeech';

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
  const { 
    isSupported, 
    isSpeaking, 
    isPaused, 
    speak, 
    stop, 
    pause, 
    resume 
  } = useTextToSpeech({
    rate: 0.85,     // Slower, more natural pace
    pitch: 1.2,     // Higher pitch for female voice
    volume: 0.9     // Softer volume
  });

  if (!isSupported) {
    return null; // Don't show button if speech synthesis is not supported
  }

  const handleClick = () => {
    if (isSpeaking && !isPaused) {
      pause();
    } else if (isPaused) {
      resume();
    } else if (isSpeaking) {
      stop();
    } else {
      speak(text);
    }
  };

  const getIcon = () => {
    if (isSpeaking && !isPaused) {
      return <Pause className="w-3 h-3" />;
    } else if (isPaused) {
      return <Play className="w-3 h-3" />;
    } else {
      return <Volume2 className="w-3 h-3" />;
    }
  };

  const getTooltip = () => {
    if (isSpeaking && !isPaused) {
      return "Pause DOCai's voice";
    } else if (isPaused) {
      return "Resume DOCai's voice";
    } else {
      return "Listen to DOCai's response";
    }
  };

  return (
    <Button
      onClick={handleClick}
      variant="ghost"
      size={size}
      className={`h-6 w-6 p-0 text-slate-400 hover:text-pink-600 hover:bg-pink-50 transition-all duration-200 group ${
        isSpeaking ? 'text-pink-600 bg-pink-50' : ''
      } ${className}`}
      title={getTooltip()}
      disabled={!text.trim()}
    >
      <div className="relative">
        {getIcon()}
        {/* Add a subtle heart indicator for the caring AI assistant */}
        {/* {isSpeaking && (
          <Heart className="w-1.5 h-1.5 absolute -top-1 -right-1 text-pink-400 animate-pulse" />
        )} */}
      </div>
    </Button>
  );
};

export default SpeakButton;