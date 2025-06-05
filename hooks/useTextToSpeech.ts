"use client";

import { useState, useCallback, useRef } from 'react';

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

  const {
    rate = 0.85,    // Slower rate for more natural speech
    pitch = 1.1,    // Slightly higher pitch for female voice
    volume = 0.9,   // Slightly lower volume for softer tone
    voice = null
  } = options;

  // Function to find the best female voice
  const findBestFemaleVoice = useCallback((availableVoices: SpeechSynthesisVoice[]) => {
    // Priority list of preferred female voices
    const preferredFemaleVoices = [
      // Google voices (usually highest quality)
      'Google UK English Female',
      'Google US English Female',
      'Google Australian English Female',
      // Microsoft voices
      'Microsoft Zira Desktop - English (United States)',
      'Microsoft Hazel Desktop - English (Great Britain)',
      'Microsoft Susan Desktop - English (United States)',
      // Apple voices
      'Samantha',
      'Victoria',
      'Karen',
      'Moira',
      // Other quality female voices
      'English United States Female',
      'English (United States) Female',
      'en-US-Female',
      'Female'
    ];

    // First, try to find exact matches from preferred list
    for (const preferredName of preferredFemaleVoices) {
      const exactMatch = availableVoices.find(v => 
        v.name === preferredName && v.lang.startsWith('en')
      );
      if (exactMatch) {
        console.log('Selected preferred female voice:', exactMatch.name);
        return exactMatch;
      }
    }

    // Then try partial matches for female voices
    const femaleKeywords = ['female', 'woman', 'girl', 'zira', 'hazel', 'susan', 'samantha', 'victoria', 'karen', 'moira'];
    const femaleVoice = availableVoices.find(v => 
      v.lang.startsWith('en') && 
      femaleKeywords.some(keyword => v.name.toLowerCase().includes(keyword))
    );
    
    if (femaleVoice) {
      console.log('Selected female voice by keyword:', femaleVoice.name);
      return femaleVoice;
    }

    // Look for voices that typically indicate female voices by their characteristics
    const likelyFemaleVoice = availableVoices.find(v => 
      v.lang.startsWith('en') && (
        v.name.includes('2') || // Often the second voice is female
        v.name.includes('B') || // Voice B is often female
        v.name.toLowerCase().includes('natural')
      )
    );

    if (likelyFemaleVoice) {
      console.log('Selected likely female voice:', likelyFemaleVoice.name);
      return likelyFemaleVoice;
    }

    // Fallback to any English voice
    const englishVoice = availableVoices.find(v => v.lang.startsWith('en'));
    if (englishVoice) {
      console.log('Selected fallback English voice:', englishVoice.name);
      return englishVoice;
    }

    console.log('No suitable voice found, using default');
    return null;
  }, []);

  // Initialize speech synthesis
  const initializeSpeech = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
      
      // Load voices
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        console.log('Available voices:', availableVoices.map(v => `${v.name} (${v.lang})`));
        setVoices(availableVoices);
      };

      // Load voices immediately
      loadVoices();
      
      // Some browsers load voices asynchronously
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }

      // Fallback: try loading voices after a short delay
      setTimeout(loadVoices, 100);
    }
  }, []);

  // Initialize on first render
  useState(() => {
    initializeSpeech();
  });

  const speak = useCallback((text: string) => {
    if (!isSupported || !text.trim()) return;

    // Stop any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice properties for natural female speech
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;
    
    // Enhanced voice selection
    if (voice && voices.includes(voice)) {
      utterance.voice = voice;
      console.log('Using specified voice:', voice.name);
    } else {
      // Find the best female voice
      const selectedVoice = findBestFemaleVoice(voices);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }

    // Add natural pauses and emphasis for medical content
    const processedText = text
      .replace(/\./g, '.\u00A0\u00A0') // Add slight pause after periods
      .replace(/,/g, ',\u00A0') // Add slight pause after commas
      .replace(/:/g, ':\u00A0') // Add slight pause after colons
      .replace(/;/g, ';\u00A0') // Add slight pause after semicolons
      .replace(/\n/g, '\u00A0\u00A0\u00A0') // Replace newlines with longer pauses
      // Add emphasis to important medical terms
      .replace(/\b(emergency|urgent|important|warning|caution|danger|critical)\b/gi, 
        (match) => `\u00A0${match}\u00A0`)
      // Slow down numbers and medical terms
      .replace(/\b\d+\b/g, (match) => `\u00A0${match}\u00A0`);

    utterance.text = processedText;

    // Event handlers
    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
      console.log('Started speaking with voice:', utterance.voice?.name || 'default');
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      utteranceRef.current = null;
      console.log('Finished speaking');
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
      setIsPaused(false);
      utteranceRef.current = null;
    };

    utterance.onpause = () => {
      setIsPaused(true);
    };

    utterance.onresume = () => {
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isSupported, rate, pitch, volume, voice, voices, findBestFemaleVoice]);

  const stop = useCallback(() => {
    if (isSupported && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
      utteranceRef.current = null;
    }
  }, [isSupported]);

  const pause = useCallback(() => {
    if (isSupported && window.speechSynthesis.speaking && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isSupported, isPaused]);

  const resume = useCallback(() => {
    if (isSupported && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, [isSupported, isPaused]);

  return {
    isSupported,
    isSpeaking,
    isPaused,
    voices,
    speak,
    stop,
    pause,
    resume
  };
}