"use client";

import React from "react";

interface VoiceWaveAnimationProps {
  isActive: boolean;
  className?: string;
}

const VoiceWaveAnimation: React.FC<VoiceWaveAnimationProps> = ({ 
  isActive, 
  className = "" 
}) => {
  if (!isActive) return null;

  return (
    <div className={`flex items-center justify-center gap-1 ${className}`}>
      {[...Array(7)].map((_, i) => (
        <div
          key={i}
          className="w-1 bg-red-400 rounded-full"
          style={{
            height: `${8 + Math.sin(Date.now() / 200 + i * 0.5) * 6}px`,
            animation: `voiceWave ${0.6 + i * 0.1}s ease-in-out infinite alternate`,
            animationDelay: `${i * 0.1}s`
          }}
        />
      ))}
      <style jsx>{`
        @keyframes voiceWave {
          0% { height: 4px; }
          50% { height: 16px; }
          100% { height: 8px; }
        }
      `}</style>
    </div>
  );
};

export default VoiceWaveAnimation;