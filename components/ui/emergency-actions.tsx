"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Phone, MessageSquare, MapPin, Users, AlertTriangle } from "lucide-react";

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
}

interface EmergencyActionsProps {
  className?: string;
}

export const EmergencyActions: React.FC<EmergencyActionsProps> = ({
  className = "",
}) => {
  const [location, setLocation] = useState<string>("Getting location...");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);

  // Get user's current location
  const getCurrentLocation = async (): Promise<string> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve("Geolocation not supported");
        return;
      }

      setIsGettingLocation(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            // Try to get address from coordinates (reverse geocoding)
            const response = await fetch(
              `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=YOUR_API_KEY`
            );
            if (response.ok) {
              const data = await response.json();
              const address = data.results[0]?.formatted || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
              setIsGettingLocation(false);
              resolve(address);
            } else {
              setIsGettingLocation(false);
              resolve(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            }
          } catch (error) {
            setIsGettingLocation(false);
            resolve(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          }
        },
        (error) => {
          setIsGettingLocation(false);
          resolve("Location access denied");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    });
  };

  // Load emergency contacts from localStorage and listen for changes
  useEffect(() => {
    const loadContacts = () => {
      const savedContacts = localStorage.getItem("emergencyContacts");
      if (savedContacts) {
        try {
          const parsedContacts = JSON.parse(savedContacts);
          setEmergencyContacts(parsedContacts);
          console.log('Loaded emergency contacts:', parsedContacts);
        } catch (error) {
          console.error('Error parsing emergency contacts:', error);
          setEmergencyContacts([]);
        }
      } else {
        // No default contacts - let user add them through settings
        setEmergencyContacts([]);
        console.log('No emergency contacts found in localStorage');
      }
    };

    // Load contacts initially
    loadContacts();

    // Listen for localStorage changes (when contacts are updated in settings)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "emergencyContacts") {
        loadContacts();
      }
    };

    // Listen for custom events when contacts are updated within the same tab
    const handleContactsUpdate = () => {
      loadContacts();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('emergencyContactsUpdated', handleContactsUpdate);

    // Get initial location
    getCurrentLocation().then(setLocation);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('emergencyContactsUpdated', handleContactsUpdate);
    };
  }, []);

  // Call emergency services (108)
  const callEmergencyServices108 = () => {
    window.location.href = "tel:108";
  };

  // Call emergency services (112)
  const callEmergencyServices112 = () => {
    window.location.href = "tel:112";
  };

  // Send emergency message to all saved contacts
  const sendEmergencyMessage = async () => {
    // Reload contacts from localStorage to ensure we have the latest
    const savedContacts = localStorage.getItem("emergencyContacts");
    let currentContacts: EmergencyContact[] = [];
    
    if (savedContacts) {
      try {
        currentContacts = JSON.parse(savedContacts);
      } catch (error) {
        console.error('Error parsing emergency contacts:', error);
      }
    }

    if (currentContacts.length === 0) {
      alert("No emergency contacts found. Please add emergency contacts in Settings first.");
      return;
    }

    const currentLocation = await getCurrentLocation();
    setLocation(currentLocation);

    const emergencyMessage = `🚨 EMERGENCY ALERT 🚨
    
I need immediate help! This is an automated emergency message from DOCai Medical Assistant.

📍 My current location: ${currentLocation}

🕒 Time: ${new Date().toLocaleString()}

If you receive this message, please check on me immediately or call emergency services.

This message was sent automatically through the DOCai Emergency System.`;

    // Create SMS links for each contact
    currentContacts.forEach((contact, index) => {
      setTimeout(() => {
        const smsUrl = `sms:${contact.phone}?body=${encodeURIComponent(emergencyMessage)}`;
        window.open(smsUrl, '_blank');
      }, index * 1000);
    });

    alert(`Emergency messages sent to ${currentContacts.length} contacts: ${currentContacts.map(c => c.name).join(', ')}`);
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Emergency Buttons - Three buttons in a row */}
      <div className="grid grid-cols-3 gap-2 mb-2">
        {/* Call 108 Button - First third */}
        <Button
          onClick={callEmergencyServices108}
          size="sm"
          className="w-full h-8 sm:h-9 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-1 text-xs sm:text-sm"
        >
          <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span className="hidden sm:inline">Call</span>
          <span>108</span>
        </Button>

        {/* Call 112 Button - Second third */}
        <Button
          onClick={callEmergencyServices112}
          size="sm"
          className="w-full h-8 sm:h-9 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-1 text-xs sm:text-sm"
        >
          <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span className="hidden sm:inline">Call</span>
          <span>112</span>
        </Button>

        {/* Emergency Message Button - Third */}
        <Button
          onClick={sendEmergencyMessage}
          disabled={isGettingLocation}
          size="sm"
          className="w-full h-8 sm:h-9 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-1 disabled:opacity-50 text-xs sm:text-sm"
        >
          {isGettingLocation ? (
            <>
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span className="hidden sm:inline">Getting...</span>
            </>
          ) : (
            <>
              <MessageSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline">Alert</span>
              <span className="sm:hidden">SOS</span>
              {emergencyContacts.length > 0 && (
                <span className="hidden sm:inline text-xs opacity-75">
                  ({emergencyContacts.length})
                </span>
              )}
            </>
          )}
        </Button>
      </div>

      {/* Show contact count or prompt to add contacts */}
      {emergencyContacts.length === 0 && (
        <div className="text-center text-xs text-slate-500 mt-1">
          Add emergency contacts in Settings to enable SOS alerts
        </div>
      )}
    </div>
  );
};