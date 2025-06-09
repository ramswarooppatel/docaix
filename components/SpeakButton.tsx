"use client";

import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Button } from './ui/button';

export interface SpeakButtonProps {
  text: string;
  structuredData?: {
    header?: string;
    emergency?: string;
    steps?: string[];
    doctorAdvice?: string[];
    faqs?: { question: string; answer: string }[];
    enhanced_advice?: any;
    location_advice?: any;
  };
  className?: string;
  size?: "sm" | "default" | "lg";
}

const SpeakButton: React.FC<SpeakButtonProps> = ({ 
  text, 
  structuredData,
  className = "",
  size = "sm" 
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = () => {
    if (!text) return;
    
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <Button 
      onClick={handleSpeak} 
      variant="ghost" 
      size={size}
      className={`p-0 h-6 hover:bg-slate-100 ${className}`}
    >
      {isSpeaking ? (
        <VolumeX className="w-3 h-3 text-slate-500" />
      ) : (
        <Volume2 className="w-3 h-3 text-slate-500" />
      )}
      <span className="ml-1 text-xs">{isSpeaking ? 'Stop' : 'Speak'}</span>
    </Button>
  );
};

export default SpeakButton;