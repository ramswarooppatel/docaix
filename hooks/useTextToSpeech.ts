"use client";

import { useState, useCallback, useEffect, useRef } from 'react';

interface UseTextToSpeechOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: SpeechSynthesisVoice | null;
}

export function useTextToSpeech(options: UseTextToSpeechOptions = {}) {
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const manuallyPausedRef = useRef(false); // Track manual pause state
  const hasUtteranceRef = useRef(false); // Track if we have an active utterance
  
  // Using your custom defaults from the first code
  const {
    rate = 0.85,
    pitch = 1.1,
    volume = 0.9,
    voice = null
  } = options;

  // Clean and format the text - FIXED VERSION
  const cleanTextForSpeech = useCallback((text: string): string => {
    return text
      // Remove FAQ sections completely - ADD THIS FIRST
      .replace(/Some FAQs relevant[\s\S]*$/i, "")
      .replace(/Frequently Asked Questions[\s\S]*$/i, "")
      .replace(/^Q\d*:\s.*$/gm, "")
      .replace(/^A\d*:\s.*$/gm, "")
      
      // Stop reading at Enhanced Treatment Plan or Location-Based Assessment
      .replace(/🏠 \*\*Enhanced Treatment Plan\*\*[\s\S]*$/i, "")
      .replace(/📍 \*\*Location-Based Medical Assessment\*\*[\s\S]*$/i, "")
      
      // Remove markdown formatting
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/\++/g, "")
      
      // Remove emojis and symbols
      .replace(/🚨|😕|🤔|🚑|🚿|🤲|💡|📍|🕒|⌄|❤️|🏥|💊|🩺|🔥|❄️|⚠️|✅|❌|🆘|📞|🎯/g, "")
      .replace(/[\u{1F600}-\u{1F64F}]/gu, "")
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, "")
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, "")
      .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, "")
      .replace(/[\u{2600}-\u{26FF}]/gu, "")
      .replace(/[\u{2700}-\u{27BF}]/gu, "")
      
      // Remove bullet points and markdown symbols
      .replace(/[•·]/g, "")
      .replace(/#+/g, "")
      .replace(/_{2,}/g, "")
      .replace(/={2,}/g, "")
      .replace(/\|/g, "")
      
      // Remove multiple + symbols (THIS WAS MISSING!)
      .replace(/\+{2,}/g, "")
      .replace(/\++/g, "")
      
      // Clean up whitespace first
      .replace(/\s+/g, " ")
      
      // Fix duplicate punctuation
      .replace(/\.\s*\./g, ".")
      .replace(/,\s*,/g, ",")
      .replace(/:\s*:/g, ":")
      
      // Add proper spacing to punctuation ONLY for sentence-ending periods
      .replace(/\.(?=\s*[A-Z])/g, ". ") // Only add space after periods before capital letters
      .replace(/,(?=\S)/g, ", ") // Add space after commas only if not followed by space
      .replace(/:(?=\S)/g, ": ") // Add space after colons only if not followed by space
      .replace(/;(?=\S)/g, "; ") // Add space after semicolons only if not followed by space
      
      // Replace newlines with pauses
      .replace(/\n/g, "   ")
      
      // Emphasize important words
      .replace(
        /\b(emergency|urgent|important|warning|caution|danger|critical|immediately|call|help)\b/gi,
        (match) => ` ${match} `
      )
      
      // Final cleanup
      .replace(/\s+/g, " ")
      .trim();
  }, []);

  // Voice selection (from first code)
  const findBestFemaleVoice = useCallback((availableVoices: SpeechSynthesisVoice[]) => {
    const preferred = [
      'Google UK English Female',
      'Google US English Female',
      'Google Australian English Female',
      'Microsoft Zira Desktop - English (United States)',
      'Microsoft Hazel Desktop - English (Great Britain)',
      'Microsoft Susan Desktop - English (United States)',
      'Samantha',
      'Victoria',
      'Karen',
      'Moira',
      'English United States Female',
      'English (United States) Female',
      'en-US-Female',
      'Female'
    ];

    for (const name of preferred) {
      const match = availableVoices.find(v => v.name === name && v.lang.startsWith('en'));
      if (match) return match;
    }

    const keywords = ['female', 'woman', 'girl', 'zira', 'hazel', 'susan', 'samantha', 'victoria', 'karen', 'moira'];
    const keywordMatch = availableVoices.find(v =>
      v.lang.startsWith('en') &&
      keywords.some(keyword => v.name.toLowerCase().includes(keyword))
    );
    if (keywordMatch) return keywordMatch;

    return availableVoices.find(v => v.lang.startsWith('en')) || null;
  }, []);

  // Check if speech synthesis is supported
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
      
      const updateVoices = () => {
        const availableVoices = speechSynthesis.getVoices();
        setVoices(availableVoices);
      };

      updateVoices();
      speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  // FIXED: Proper state monitoring that respects manual pause
  useEffect(() => {
    const interval = setInterval(() => {
      // If we manually paused, don't let the interval override our state
      if (manuallyPausedRef.current && hasUtteranceRef.current) {
        setIsSpeaking(true);
        setIsPaused(true);
        return;
      }

      // Normal state detection when not manually paused
      if (speechSynthesis.speaking && !speechSynthesis.paused) {
        setIsSpeaking(true);
        setIsPaused(false);
      } else if (speechSynthesis.speaking && speechSynthesis.paused) {
        setIsSpeaking(true);
        setIsPaused(true);
      } else if (!hasUtteranceRef.current) {
        // Only reset if we truly have no active utterance
        setIsSpeaking(false);
        setIsPaused(false);
        manuallyPausedRef.current = false;
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const speak = useCallback((text: string) => {
    if (!isSupported || !text.trim()) return;

    // Reset all states
    manuallyPausedRef.current = false;
    hasUtteranceRef.current = false;
    
    // Stop any current speech
    speechSynthesis.cancel();
    
    // Use the cleaned text
    const cleanedText = cleanTextForSpeech(text);
    const utterance = new SpeechSynthesisUtterance(cleanedText);
    
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;
    
    // Use voice selection logic from first code
    if (voice) {
      utterance.voice = voice;
    } else if (voices.length > 0) {
      const selected = findBestFemaleVoice(voices);
      if (selected) utterance.voice = selected;
    }

    utterance.onstart = () => {
      hasUtteranceRef.current = true;
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      hasUtteranceRef.current = false;
      manuallyPausedRef.current = false;
      setIsSpeaking(false);
      setIsPaused(false);
      utteranceRef.current = null;
    };

    utterance.onerror = () => {
      hasUtteranceRef.current = false;
      manuallyPausedRef.current = false;
      setIsSpeaking(false);
      setIsPaused(false);
      utteranceRef.current = null;
    };

    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
  }, [isSupported, rate, pitch, volume, voice, voices, cleanTextForSpeech, findBestFemaleVoice]);

  const stop = useCallback(() => {
    speechSynthesis.cancel();
    hasUtteranceRef.current = false;
    manuallyPausedRef.current = false;
    setIsSpeaking(false);
    setIsPaused(false);
    utteranceRef.current = null;
  }, []);

  // FIXED: Pause function that maintains state properly
  const pause = useCallback(() => {
    if (speechSynthesis.speaking && !speechSynthesis.paused && hasUtteranceRef.current) {
      speechSynthesis.pause();
      manuallyPausedRef.current = true; // Mark as manually paused
      setIsPaused(true);
      setIsSpeaking(true);
    }
  }, []);

  // FIXED: Resume function that clears manual pause state
  const resume = useCallback(() => {
    if (manuallyPausedRef.current && hasUtteranceRef.current) {
      speechSynthesis.resume();
      manuallyPausedRef.current = false; // Clear manual pause flag
      setIsPaused(false);
      setIsSpeaking(true);
    }
  }, []);

  // Enhanced playAgain function
  const playAgain = useCallback(() => {
    if (manuallyPausedRef.current && hasUtteranceRef.current) {
      speechSynthesis.resume();
      manuallyPausedRef.current = false;
      setIsPaused(false);
      setIsSpeaking(true);
      console.log("Speech resumed from pause");
    } else {
      console.warn("No paused speech to resume.");
    }
  }, []);

  return {
    isSupported,
    isSpeaking,
    isPaused,
    voices,
    speak,
    stop,
    pause,
    resume,
    playAgain,
  };
}