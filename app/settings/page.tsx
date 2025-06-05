"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SignalIndicators } from "@/components/signal-indicators";
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  User, 
  Phone, 
  Settings as SettingsIcon,
  Brain,
  MapPin,
  ExternalLink,
  Mic,
  Volume2,
  Bell,
  Shield,
  Eye,
  Globe,
  Smartphone,
  Battery,
  Wifi,
  Moon,
  Sun,
  RotateCcw,
  Download,
  Upload,
  Trash,
  Info,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
}

interface UserSettings {
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

const SettingsPage = () => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'contacts' | 'privacy' | 'voice' | 'display' | 'emergency' | 'data' | 'accessibility' | 'hospitals'>('contacts');
  
  // User settings state
  const [settings, setSettings] = useState<UserSettings>({
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
  });

  const [permissionStates, setPermissionStates] = useState({
    location: 'unknown' as 'granted' | 'denied' | 'unknown',
    microphone: 'unknown' as 'granted' | 'denied' | 'unknown',
    notifications: 'unknown' as 'granted' | 'denied' | 'unknown',
  });

  // Load settings and contacts on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load contacts
        const savedContacts = localStorage.getItem("emergencyContacts");
        if (savedContacts && savedContacts !== 'undefined') {
          const parsedContacts = JSON.parse(savedContacts);
          if (Array.isArray(parsedContacts)) {
            setContacts(parsedContacts);
          }
        }

        // Load settings
        const savedSettings = localStorage.getItem("userSettings");
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          setSettings(prev => ({ ...prev, ...parsedSettings }));
        }

        // Check permission states
        await checkPermissions();
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadData();
  }, []);

  // Save settings when they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("userSettings", JSON.stringify(settings));
      applySettings();
    }
  }, [settings, isLoaded]);

  // Check browser permissions
  const checkPermissions = async () => {
    try {
      // Check location permission
      if ('permissions' in navigator) {
        const locationPerm = await navigator.permissions.query({ name: 'geolocation' });
        setPermissionStates(prev => ({ ...prev, location: locationPerm.state as any }));

        const micPerm = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        setPermissionStates(prev => ({ ...prev, microphone: micPerm.state as any }));
      }

      // Check notification permission
      if ('Notification' in window) {
        const notifPerm = Notification.permission;
        setPermissionStates(prev => ({ 
          ...prev, 
          notifications: notifPerm === 'granted' ? 'granted' : notifPerm === 'denied' ? 'denied' : 'unknown'
        }));
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  };
  // Apply settings to the application
  const applySettings = () => {
    // Apply dark mode
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Apply font size
    document.documentElement.style.fontSize = 
      settings.fontSize === 'small' ? '14px' :
      settings.fontSize === 'large' ? '18px' : '16px';

    // Apply reduce motion
    if (settings.reduceMotion) {
      document.documentElement.style.setProperty('--animation-duration', '0.01ms');
    } else {
      document.documentElement.style.removeProperty('--animation-duration');
    }

    // Apply high contrast
    if (settings.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }

    // Apply large buttons
    if (settings.largeButtons) {
      document.documentElement.classList.add('large-buttons');
    } else {
      document.documentElement.classList.remove('large-buttons');
    }

    // Apply animations preference
    if (!settings.animations) {
      document.documentElement.style.setProperty('--animation-duration', '0s');
    } else if (!settings.reduceMotion) {
      document.documentElement.style.removeProperty('--animation-duration');
    }

    // Store voice settings in localStorage for voice components to use
    localStorage.setItem('voiceSettings', JSON.stringify({
      autoStart: settings.voiceAutoStart,
      timeout: settings.voiceTimeout,
      volume: settings.voiceVolume,
      speed: settings.voiceSpeed,
      preferredVoice: settings.preferredVoice
    }));

    // Store emergency settings
    localStorage.setItem('emergencySettings', JSON.stringify({
      autoLocationShare: settings.autoLocationShare,
      emergencyContactsRequired: settings.emergencyContactsRequired,
      sosConfirmation: settings.sosConfirmation,
      quickAccess: settings.quickAccess
    }));

    // Apply haptic feedback preference (for mobile devices)
    if ('vibrate' in navigator && !settings.hapticFeedback) {
      // Disable haptic feedback by overriding vibrate
      (navigator as any).vibrate = () => {};
    }
  };

  // Request permissions
  const requestPermission = async (type: 'location' | 'microphone' | 'notifications') => {
    try {
      switch (type) {
        case 'location':
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          setPermissionStates(prev => ({ ...prev, location: 'granted' }));
          setSettings(prev => ({ ...prev, locationEnabled: true }));
          break;

        case 'microphone':
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach(track => track.stop());
          setPermissionStates(prev => ({ ...prev, microphone: 'granted' }));
          setSettings(prev => ({ ...prev, microphoneEnabled: true }));
          break;

        case 'notifications':
          const permission = await Notification.requestPermission();
          setPermissionStates(prev => ({ 
            ...prev, 
            notifications: permission === 'granted' ? 'granted' : 'denied'
          }));
          setSettings(prev => ({ ...prev, notificationsEnabled: permission === 'granted' }));
          break;
      }
    } catch (error) {
      console.error(`Error requesting ${type} permission:`, error);
      setPermissionStates(prev => ({ ...prev, [type]: 'denied' }));
    }
  };

  // Setting update helper
  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Export/Import settings
  const exportSettings = () => {
    const data = {
      settings,
      contacts,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `docai-settings-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.settings) setSettings(data.settings);
        if (data.contacts) setContacts(data.contacts);
        alert('Settings imported successfully!');
      } catch (error) {
        alert('Error importing settings. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  // Reset settings
  const resetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to default? This cannot be undone.')) {
      localStorage.removeItem('userSettings');
      localStorage.removeItem('emergencyContacts');
      window.location.reload();
    }
  };

  // Clear all data
  const clearAllData = () => {
    if (confirm('Are you sure you want to clear ALL data including contacts and settings? This cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  // Existing contact management functions
  const addContact = () => {
    if (!newName.trim() || !newPhone.trim()) return;
    const newContact: EmergencyContact = {
      id: Date.now().toString(),
      name: newName.trim(),
      phone: newPhone.trim(),
    };
    setContacts(prev => [...prev, newContact]);
    setNewName("");
    setNewPhone("");
    setShowAddForm(false);
  };

  const deleteContact = (id: string) => {
    setContacts(prev => prev.filter(contact => contact.id !== id));
  };

  const startEdit = (contact: EmergencyContact) => {
    setEditingId(contact.id);
    setEditName(contact.name);
    setEditPhone(contact.phone);
  };

  const saveEdit = () => {
    if (!editName.trim() || !editPhone.trim()) return;
    setContacts(prev => prev.map(contact => 
      contact.id === editingId 
        ? { ...contact, name: editName.trim(), phone: editPhone.trim() }
        : contact
    ));
    setEditingId(null);
    setEditName("");
    setEditPhone("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditPhone("");
  };

  const openHospitalMaps = () => {
    const googleMapsURL = "https://maps.app.goo.gl/NHbFRyMVtQGV1DbM7";
    window.open(googleMapsURL, "_blank");
  };

  // Permission status component
  const PermissionStatus = ({ status, type }: { status: string; type: string }) => {
    const getIcon = () => {
      switch (status) {
        case 'granted': return <CheckCircle className="w-4 h-4 text-green-600" />;
        case 'denied': return <XCircle className="w-4 h-4 text-red-600" />;
        default: return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      }
    };

    const getColor = () => {
      switch (status) {
        case 'granted': return 'text-green-600 bg-green-50 border-green-200';
        case 'denied': return 'text-red-600 bg-red-50 border-red-200';
        default: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      }
    };

    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${getColor()}`}>
        {getIcon()}
        <span className="text-sm font-medium capitalize">{status}</span>
        {status !== 'granted' && (
          <Button
            onClick={() => requestPermission(type as any)}
            size="sm"
            className="ml-2 h-6 text-xs"
          >
            Enable
          </Button>
        )}
      </div>
    );
  };

  if (!isLoaded) {
    return (
      <div className="flex flex-col h-screen w-full overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'contacts', label: 'Contacts', icon: User },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'voice', label: 'Voice', icon: Mic },
    { id: 'display', label: 'Display', icon: Eye },
    { id: 'emergency', label: 'Emergency', icon: AlertTriangle },
    { id: 'data', label: 'Data', icon: Globe },
    { id: 'accessibility', label: 'Access', icon: Eye },
    { id: 'hospitals', label: 'Hospitals', icon: MapPin },
  ];

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-lg border-b border-slate-200/60 px-3 sm:px-6 py-3 sm:py-4 z-10 shadow-sm">
        <div className="w-full max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link href="/chat">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Brain className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-sm sm:text-xl text-slate-800 truncate">
                Settings & Configuration
              </h1>
              <p className="text-xs text-slate-600 hidden sm:block">Customize your DOCai experience</p>
            </div>
          </div>
          <div className="flex-shrink-0 flex items-center gap-2">
            <Button
              onClick={exportSettings}
              variant="outline"
              size="sm"
              className="hidden sm:flex"
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
            <SignalIndicators className="scale-75 sm:scale-100" />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-slate-200 px-3 sm:px-6">
        <div className="w-full max-w-6xl mx-auto">
          <div className="flex space-x-0 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-1 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-slate-600 hover:text-slate-800'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-3 sm:px-6 py-4 sm:py-6 overflow-y-auto">
        <div className="w-full max-w-6xl mx-auto space-y-6">
          
          {/* Emergency Contacts Tab */}
          {activeTab === 'contacts' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg sm:text-xl font-bold text-slate-800">Emergency Contacts</h2>
                </div>
                <Button
                  onClick={() => setShowAddForm(!showAddForm)}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Contact
                </Button>
              </div>

              <p className="text-sm text-slate-600 mb-6">
                Add trusted contacts who will receive emergency messages when you use the SOS alert button.
              </p>

              {/* Add Contact Form */}
              {showAddForm && (
                <div className="bg-slate-50 rounded-lg p-4 mb-6 border border-slate-200">
                  <h3 className="font-semibold text-slate-800 mb-3">Add New Contact</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <Input
                      placeholder="Contact Name"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full"
                    />
                    <Input
                      placeholder="Phone Number"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={addContact}
                      disabled={!newName.trim() || !newPhone.trim()}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Save className="w-3 h-3 mr-1" />
                      Save Contact
                    </Button>
                    <Button 
                      onClick={() => {
                        setShowAddForm(false);
                        setNewName("");
                        setNewPhone("");
                      }}
                      variant="outline"
                      size="sm"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Contacts List */}
              {contacts.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <User className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p className="text-sm">No emergency contacts added yet.</p>
                  <p className="text-xs mt-1">Add contacts to enable SOS emergency alerts.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      {editingId === contact.id ? (
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="text-sm"
                          />
                          <Input
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value)}
                            className="text-sm"
                          />
                        </div>
                      ) : (
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-800 text-sm">
                            {contact.name}
                          </h3>
                          <p className="text-slate-600 text-xs">{contact.phone}</p>
                        </div>
                      )}

                      <div className="flex gap-1 ml-3">
                        {editingId === contact.id ? (
                          <>
                            <Button onClick={saveEdit} size="sm" variant="outline" className="p-1.5 h-7 w-7">
                              <Save className="w-3 h-3" />
                            </Button>
                            <Button onClick={cancelEdit} size="sm" variant="outline" className="p-1.5 h-7 w-7">
                              <X className="w-3 h-3" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button onClick={() => startEdit(contact)} size="sm" variant="outline" className="p-1.5 h-7 w-7">
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              onClick={() => deleteContact(contact.id)}
                              size="sm"
                              variant="outline"
                              className="p-1.5 h-7 w-7 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Info Box */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-700 text-sm font-medium mb-1">
                  📱 How Emergency Alerts Work
                </p>
                <p className="text-blue-600 text-xs leading-relaxed">
                  When you tap the SOS button, all contacts will receive an SMS with your location, 
                  timestamp, and emergency message. Make sure to add trusted contacts who can respond quickly.
                </p>
              </div>
            </div>
          )}

          {/* Privacy & Permissions Tab */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Shield className="w-5 h-5 text-green-600" />
                  <h2 className="text-lg sm:text-xl font-bold text-slate-800">Privacy & Permissions</h2>
                </div>

                <div className="space-y-6">
                  {/* Location Permission */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      <div>
                        <h3 className="font-semibold text-slate-800">Location Access</h3>
                        <p className="text-sm text-slate-600">Required for emergency services and hospital finding</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <PermissionStatus status={permissionStates.location} type="location" />
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.locationEnabled}
                          onChange={(e) => updateSetting('locationEnabled', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>

                  {/* Microphone Permission */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mic className="w-5 h-5 text-red-600" />
                      <div>
                        <h3 className="font-semibold text-slate-800">Microphone Access</h3>
                        <p className="text-sm text-slate-600">Required for voice commands and emergency calls</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <PermissionStatus status={permissionStates.microphone} type="microphone" />
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.microphoneEnabled}
                          onChange={(e) => updateSetting('microphoneEnabled', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>

                  {/* Notifications Permission */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-yellow-600" />
                      <div>
                        <h3 className="font-semibold text-slate-800">Notifications</h3>
                        <p className="text-sm text-slate-600">Receive important alerts and reminders</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <PermissionStatus status={permissionStates.notifications} type="notifications" />
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.notificationsEnabled}
                          onChange={(e) => updateSetting('notificationsEnabled', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>

                  {/* Haptic Feedback */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-purple-600" />
                      <div>
                        <h3 className="font-semibold text-slate-800">Haptic Feedback</h3>
                        <p className="text-sm text-slate-600">Vibration feedback for interactions</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.hapticFeedback}
                        onChange={(e) => updateSetting('hapticFeedback', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Voice Settings Tab */}
          {activeTab === 'voice' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Mic className="w-5 h-5 text-red-600" />
                  <h2 className="text-lg sm:text-xl font-bold text-slate-800">Voice Settings</h2>
                </div>

                <div className="space-y-6">
                  {/* Voice Auto-start */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-slate-800">Auto-start Voice Input</h3>
                      <p className="text-sm text-slate-600">Automatically activate voice input on page load</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.voiceAutoStart}
                        onChange={(e) => updateSetting('voiceAutoStart', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Voice Timeout */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-slate-800">Voice Timeout</h3>
                      <span className="text-sm text-slate-600">{settings.voiceTimeout}s</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="60"
                      value={settings.voiceTimeout}
                      onChange={(e) => updateSetting('voiceTimeout', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>10s</span>
                      <span>60s</span>
                    </div>
                  </div>

                  {/* Voice Volume */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-slate-800">Voice Response Volume</h3>
                      <span className="text-sm text-slate-600">{Math.round(settings.voiceVolume * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={settings.voiceVolume}
                      onChange={(e) => updateSetting('voiceVolume', parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>0%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Voice Speed */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-slate-800">Speech Speed</h3>
                      <span className="text-sm text-slate-600">{settings.voiceSpeed}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={settings.voiceSpeed}
                      onChange={(e) => updateSetting('voiceSpeed', parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>0.5x</span>
                      <span>2x</span>
                    </div>
                  </div>

                  {/* Preferred Voice */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-slate-800">Preferred Voice</h3>
                    <select
                      value={settings.preferredVoice}
                      onChange={(e) => updateSetting('preferredVoice', e.target.value)}
                      className="w-full p-3 border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="auto">Auto (Best Available)</option>
                      <option value="female">Female Voice</option>
                      <option value="male">Male Voice</option>
                      <option value="system">System Default</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Display & Theme Tab */}
          {activeTab === 'display' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Eye className="w-5 h-5 text-purple-600" />
                  <h2 className="text-lg sm:text-xl font-bold text-slate-800">Display & Theme</h2>
                </div>

                <div className="space-y-6">
                  {/* Dark Mode */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {settings.darkMode ? <Moon className="w-5 h-5 text-indigo-600" /> : <Sun className="w-5 h-5 text-yellow-600" />}
                      <div>
                        <h3 className="font-semibold text-slate-800">Dark Mode</h3>
                        <p className="text-sm text-slate-600">Switch between light and dark themes</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.darkMode}
                        onChange={(e) => updateSetting('darkMode', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Font Size */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-slate-800">Font Size</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {(['small', 'medium', 'large'] as const).map((size) => (
                        <button
                          key={size}
                          onClick={() => updateSetting('fontSize', size)}
                          className={`p-3 rounded-lg border-2 transition-colors ${
                            settings.fontSize === size
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="text-center">
                            <div className={`font-semibold ${
                              size === 'small' ? 'text-sm' : 
                              size === 'large' ? 'text-lg' : 'text-base'
                            }`}>
                              Aa
                            </div>
                            <div className="text-xs text-slate-600 mt-1 capitalize">{size}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Language */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-slate-800">Language</h3>
                    <select
                      value={settings.language}
                      onChange={(e) => updateSetting('language', e.target.value)}
                      className="w-full p-3 border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                      <option value="hi">हिन्दी</option>
                      <option value="zh">中文</option>
                    </select>
                  </div>

                  {/* Animations */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-slate-800">Animations</h3>
                      <p className="text-sm text-slate-600">Enable smooth transitions and animations</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.animations}
                        onChange={(e) => updateSetting('animations', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Emergency Settings Tab */}
          {activeTab === 'emergency' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-6">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <h2 className="text-lg sm:text-xl font-bold text-slate-800">Emergency Settings</h2>
                </div>

                <div className="space-y-6">
                  {/* Auto Location Share */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-slate-800">Auto Location Sharing</h3>
                      <p className="text-sm text-slate-600">Automatically include location in emergency messages</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.autoLocationShare}
                        onChange={(e) => updateSetting('autoLocationShare', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Emergency Contacts Required */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-slate-800">Require Emergency Contacts</h3>
                      <p className="text-sm text-slate-600">Prevent SOS activation without contacts added</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.emergencyContactsRequired}
                        onChange={(e) => updateSetting('emergencyContactsRequired', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* SOS Confirmation */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-slate-800">SOS Confirmation</h3>
                      <p className="text-sm text-slate-600">Ask for confirmation before sending emergency alerts</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.sosConfirmation}
                        onChange={(e) => updateSetting('sosConfirmation', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Quick Access */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-slate-800">Quick Access Emergency</h3>
                      <p className="text-sm text-slate-600">Show emergency buttons prominently on all pages</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.quickAccess}
                        onChange={(e) => updateSetting('quickAccess', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Data & Storage Tab */}
          {activeTab === 'data' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Globe className="w-5 h-5 text-green-600" />
                  <h2 className="text-lg sm:text-xl font-bold text-slate-800">Data & Storage</h2>
                </div>

                <div className="space-y-6">
                  {/* Cache Enabled */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-slate-800">Enable Caching</h3>
                      <p className="text-sm text-slate-600">Store data locally for faster loading</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.cacheEnabled}
                        onChange={(e) => updateSetting('cacheEnabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Offline Mode */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-slate-800">Offline Mode</h3>
                      <p className="text-sm text-slate-600">Enable basic functionality without internet</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.offlineMode}
                        onChange={(e) => updateSetting('offlineMode', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Data Usage Optimization */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-slate-800">Data Usage Optimization</h3>
                      <p className="text-sm text-slate-600">Reduce data consumption on mobile networks</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.dataUsageOptimization}
                        onChange={(e) => updateSetting('dataUsageOptimization', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Data Management Actions */}
                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-slate-800 mb-4">Data Management</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Button
                        onClick={exportSettings}
                        variant="outline"
                        className="flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Export Settings
                      </Button>
                      
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept=".json"
                          onChange={importSettings}
                          className="hidden"
                        />
                        <Button
                          variant="outline"
                          className="flex items-center justify-center gap-2 w-full"
                          type="button"
                        >
                          <Upload className="w-4 h-4" />
                          Import Settings
                        </Button>
                      </label>
                      
                      <Button
                        onClick={resetSettings}
                        variant="outline"
                        className="flex items-center justify-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Reset Settings
                      </Button>
                      
                      <Button
                        onClick={clearAllData}
                        variant="outline"
                        className="flex items-center justify-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Trash className="w-4 h-4" />
                        Clear All Data
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Accessibility Tab */}
          {activeTab === 'accessibility' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Eye className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-lg sm:text-xl font-bold text-slate-800">Accessibility</h2>
                </div>

                <div className="space-y-6">
                  {/* Screen Reader Support */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-slate-800">Screen Reader Support</h3>
                      <p className="text-sm text-slate-600">Enhanced support for screen reading software</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.screenReader}
                        onChange={(e) => updateSetting('screenReader', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* High Contrast */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-slate-800">High Contrast Mode</h3>
                      <p className="text-sm text-slate-600">Increase contrast for better visibility</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.highContrast}
                        onChange={(e) => updateSetting('highContrast', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Large Buttons */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-slate-800">Large Touch Targets</h3>
                      <p className="text-sm text-slate-600">Increase button sizes for easier interaction</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.largeButtons}
                        onChange={(e) => updateSetting('largeButtons', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Reduce Motion */}
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-slate-800">Reduce Motion</h3>
                      <p className="text-sm text-slate-600">Minimize animations for motion sensitivity</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.reduceMotion}
                        onChange={(e) => updateSetting('reduceMotion', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
                  </div>
                </div>
              )}
              
              {/* Hospitals Tab */}
              {activeTab === 'hospitals' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <MapPin className="w-5 h-5 text-red-600" />
                      <h2 className="text-lg sm:text-xl font-bold text-slate-800">Nearby Hospitals</h2>
                    </div>
                    
                    <div className="text-center py-6">
                      <Button onClick={openHospitalMaps} className="bg-blue-600 hover:bg-blue-700">
                        <MapPin className="w-4 h-4 mr-2" />
                        Find Nearby Hospitals
                      </Button>
                      <p className="text-sm text-slate-600 mt-3">
                        Opens Google Maps with nearby hospitals
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    };
    
    export default SettingsPage;