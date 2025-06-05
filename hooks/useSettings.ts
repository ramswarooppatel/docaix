"use client";

import { useState, useEffect } from 'react';

export interface UserSettings {
  // Privacy & Permissions
  locationEnabled: boolean;
  microphoneEnabled: boolean;
  notificationsEnabled: boolean;
  hapticFeedback: boolean;
  
  // Voice Settings
  voiceAutoStart: boolean;
  voiceTimeout: number;
  voiceVolume: number;
  voiceSpeed: number;
  preferredVoice: string;
  
  // Display & Theme
  darkMode: boolean;
  fontSize: 'small' | 'medium' | 'large';
  language: string;
  animations: boolean;
  
  // Emergency Settings
  autoLocationShare: boolean;
  emergencyContactsRequired: boolean;
  sosConfirmation: boolean;
  quickAccess: boolean;
  
  // Data & Storage
  cacheEnabled: boolean;
  offlineMode: boolean;
  dataUsageOptimization: boolean;
  
  // Accessibility
  screenReader: boolean;
  highContrast: boolean;
  largeButtons: boolean;
  reduceMotion: boolean;
}

const defaultSettings: UserSettings = {
  // Privacy & Permissions
  locationEnabled: true,
  microphoneEnabled: true,
  notificationsEnabled: true,
  hapticFeedback: true,
  
  // Voice Settings
  voiceAutoStart: false,
  voiceTimeout: 30,
  voiceVolume: 0.8,
  voiceSpeed: 1.0,
  preferredVoice: 'auto',
  
  // Display & Theme
  darkMode: false,
  fontSize: 'medium',
  language: 'en',
  animations: true,
  
  // Emergency Settings
  autoLocationShare: true,
  emergencyContactsRequired: true,
  sosConfirmation: true,
  quickAccess: true,
  
  // Data & Storage
  cacheEnabled: true,
  offlineMode: false,
  dataUsageOptimization: true,
  
  // Accessibility
  screenReader: false,
  highContrast: false,
  largeButtons: false,
  reduceMotion: false,
};

export const useSettings = () => {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    try {
      const savedSettings = localStorage.getItem('userSettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsedSettings }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      
      // Save to localStorage
      try {
        localStorage.setItem('userSettings', JSON.stringify(newSettings));
      } catch (error) {
        console.error('Error saving settings:', error);
      }
      
      return newSettings;
    });
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    try {
      localStorage.removeItem('userSettings');
    } catch (error) {
      console.error('Error clearing settings:', error);
    }
  };

  // Get voice settings for voice components
  const getVoiceSettings = () => {
    return {
      autoStart: settings.voiceAutoStart,
      timeout: settings.voiceTimeout,
      volume: settings.voiceVolume,
      speed: settings.voiceSpeed,
      preferredVoice: settings.preferredVoice,
      enabled: settings.microphoneEnabled
    };
  };

  // Get emergency settings
  const getEmergencySettings = () => {
    return {
      autoLocationShare: settings.autoLocationShare,
      emergencyContactsRequired: settings.emergencyContactsRequired,
      sosConfirmation: settings.sosConfirmation,
      quickAccess: settings.quickAccess
    };
  };

  // Get accessibility settings
  const getAccessibilitySettings = () => {
    return {
      screenReader: settings.screenReader,
      highContrast: settings.highContrast,
      largeButtons: settings.largeButtons,
      reduceMotion: settings.reduceMotion,
      fontSize: settings.fontSize
    };
  };

  return {
    settings,
    updateSetting,
    resetSettings,
    isLoaded,
    getVoiceSettings,
    getEmergencySettings,
    getAccessibilitySettings
  };
};
