"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

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
    rate = 0.85,
    pitch = 1.1,
    volume = 0.9,
    voice = null
  } = options;

  // Function to clean text for speech synthesis
  const cleanTextForSpeech = useCallback((text: string): string => {
    return text
      // Remove asterisks used for bold/italic formatting
      .replace(/\*\*/g, '') // Remove ** (bold)
      .replace(/\*/g, '') // Remove * (italic)
      
      // Remove common emojis
      .replace(/🚨|😕|🤔|🚑|🚿|🤲|💡|📍|🕒|⌄|❤️|🏥|💊|🩺|🔥|❄️|⚠️|✅|❌|🆘|📞|🎯/g, '')
      
      // Remove emoji ranges (most common emoji blocks)
      .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Symbols & Pictographs
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport & Map
      .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') // Flags
      .replace(/[\u{2600}-\u{26FF}]/gu, '') // Miscellaneous Symbols
      .replace(/[\u{2700}-\u{27BF}]/gu, '') // Dingbats
      
      // Clean up formatting symbols
      .replace(/[•·]/g, '') // Remove bullet points
      .replace(/#+/g, '') // Remove hash symbols
      .replace(/_{2,}/g, '') // Remove underscores
      .replace(/={2,}/g, '') // Remove equals
      .replace(/\|/g, '') // Remove pipes
      
      // Clean up spacing and punctuation
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/\.\s*\./g, '.') // Remove duplicate periods
      .replace(/,\s*,/g, ',') // Remove duplicate commas
      .replace(/:\s*:/g, ':') // Remove duplicate colons
      
      // Add natural pauses
      .replace(/\./g, '. ') // Add pause after periods
      .replace(/,/g, ', ') // Add pause after commas
      .replace(/:/g, ': ') // Add pause after colons
      .replace(/;/g, '; ') // Add pause after semicolons
      .replace(/\n/g, '   ') // Replace newlines with longer pauses
      
      // Add emphasis pauses around important terms
      .replace(/\b(emergency|urgent|important|warning|caution|danger|critical|immediately|call|help)\b/gi, 
        (match) => ` ${match} `)
      
      // Clean up extra spaces
      .replace(/\s+/g, ' ')
      .trim();
  }, []);

  // Find best female voice function
  const findBestFemaleVoice = useCallback((availableVoices: SpeechSynthesisVoice[]) => {
    const preferredFemaleVoices = [
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

    for (const preferredName of preferredFemaleVoices) {
      const exactMatch = availableVoices.find(v => 
        v.name === preferredName && v.lang.startsWith('en')
      );
      if (exactMatch) {
        console.log('Selected preferred female voice:', exactMatch.name);
        return exactMatch;
      }
    }

    const femaleKeywords = ['female', 'woman', 'girl', 'zira', 'hazel', 'susan', 'samantha', 'victoria', 'karen', 'moira'];
    const femaleVoice = availableVoices.find(v => 
      v.lang.startsWith('en') && 
      femaleKeywords.some(keyword => v.name.toLowerCase().includes(keyword))
    );
    
    if (femaleVoice) {
      console.log('Selected female voice by keyword:', femaleVoice.name);
      return femaleVoice;
    }

    const likelyFemaleVoice = availableVoices.find(v => 
      v.lang.startsWith('en') && (
        v.name.includes('2') || 
        v.name.includes('B') || 
        v.name.toLowerCase().includes('natural')
      )
    );

    if (likelyFemaleVoice) {
      console.log('Selected likely female voice:', likelyFemaleVoice.name);
      return likelyFemaleVoice;
    }

    const defaultEnglishVoice = availableVoices.find(v => v.lang.startsWith('en'));
    if (defaultEnglishVoice) {
      console.log('Selected default English voice:', defaultEnglishVoice.name);
      return defaultEnglishVoice;
    }

    return null;
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
      
      const updateVoices = () => {
        const availableVoices = speechSynthesis.getVoices();
        setVoices(availableVoices);
        console.log('Available voices:', availableVoices.map(v => `${v.name} (${v.lang})`));
      };

      updateVoices();
      speechSynthesis.addEventListener('voiceschanged', updateVoices);
      
      return () => {
        speechSynthesis.removeEventListener('voiceschanged', updateVoices);
      };
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!isSupported || !text.trim()) return;

    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }

    // Clean the text for speech
    const cleanedText = cleanTextForSpeech(text);
    console.log('Original text:', text);
    console.log('Cleaned text for speech:', cleanedText);

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utteranceRef.current = utterance;

    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    if (voice) {
      utterance.voice = voice;
    } else if (voices.length > 0) {
      const selectedVoice = findBestFemaleVoice(voices);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }

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

    speechSynthesis.speak(utterance);
  }, [isSupported, rate, pitch, volume, voice, voices, findBestFemaleVoice, cleanTextForSpeech]);

  const stop = useCallback(() => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsPaused(false);
    utteranceRef.current = null;
  }, []);

  const pause = useCallback(() => {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause();
    }
  }, []);

  const resume = useCallback(() => {
    if (speechSynthesis.paused) {
      speechSynthesis.resume();
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
    resume
  };
}