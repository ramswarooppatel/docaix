"use client";

import { useRef, useCallback } from 'react';

interface UseSoundOptions {
  volume?: number;
  loop?: boolean;
  preload?: boolean;
}

export const useSound = (src: string, options: UseSoundOptions = {}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { volume = 0.5, loop = false, preload = true } = options;

  // Initialize audio
  const initAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(src);
      audioRef.current.volume = volume;
      audioRef.current.loop = loop;
      
      if (preload) {
        audioRef.current.load();
      }
    }
  }, [src, volume, loop, preload]);

  // Play sound
  const play = useCallback(async () => {
    try {
      if (!audioRef.current) {
        initAudio();
      }
      
      if (audioRef.current) {
        audioRef.current.currentTime = 0; // Reset to beginning
        await audioRef.current.play();
      }
    } catch (error) {
      console.warn('Could not play sound:', error);
    }
  }, [initAudio]);

  // Stop sound
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  // Pause sound
  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  // Set volume
  const setVolume = useCallback((newVolume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, newVolume));
    }
  }, []);

  return {
    play,
    stop,
    pause,
    setVolume,
  };
};