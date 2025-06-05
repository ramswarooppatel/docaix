"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useSettings } from "../hooks/useSettings";
import {
  Phone,
  MessageSquare,
  MapPin,
  Users,
  AlertTriangle,
} from "lucide-react";

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
  const { getEmergencySettings } = useSettings();
  const emergencySettings = getEmergencySettings();
  
  const [location, setLocation] = useState<string>("Getting location...");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [userCoordinates, setUserCoordinates] = useState<{lat: number; lng: number} | null>(null);

  // Get user's current location with coordinates
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
          
          // Store coordinates for hospital search
          setUserCoordinates({ lat: latitude, lng: longitude });
          
          try {
            // Try to get address from coordinates using a reverse geocoding service
            // You can replace this with your preferred geocoding service
            const locationString = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            setIsGettingLocation(false);
            resolve(locationString);
          } catch (error) {
            setIsGettingLocation(false);
            resolve(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          }
        },
        (error) => {
          setIsGettingLocation(false);
          console.error("Geolocation error:", error);
          resolve("Location access denied");
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 300000 }
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
        setEmergencyContacts([]);
        console.log('No emergency contacts found in localStorage');
      }
    };

    loadContacts();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "emergencyContacts") {
        loadContacts();
      }
    };

    const handleContactsUpdate = () => {
      loadContacts();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('emergencyContactsUpdated', handleContactsUpdate);

    // Get location on component mount
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

  // Open hospitals with user's real location - now uses the new hospital finder
  const findNearbyHospitals = async () => {
    try {
      let coordinates = userCoordinates;
      
      // If we don't have coordinates yet, get them now
      if (!coordinates) {
        setIsGettingLocation(true);
        await getCurrentLocation();
        coordinates = userCoordinates;
        setIsGettingLocation(false);
      }

      if (coordinates) {
        // Build Google Maps URL with user's real coordinates
        const { lat, lng } = coordinates;
        
        // Try to use our improved hospital search first
        try {
          const response = await fetch(`/api/nearby-hospitals?lat=${lat}&lng=${lng}&radius=10000`);
          if (response.ok) {
            const data = await response.json();
            if (data.results && data.results.length > 0) {
              // Open Google Maps with the nearest hospital
              const nearestHospital = data.results[0];
              const hospitalMapsURL = `https://www.google.com/maps/dir/${lat},${lng}/${nearestHospital.geometry.location.lat},${nearestHospital.geometry.location.lng}`;
              console.log(`Opening directions to nearest hospital: ${nearestHospital.name}`);
              window.open(hospitalMapsURL, "_blank");
              return;
            }
          }
        } catch (error) {
          console.log("Hospital search API failed, falling back to generic search");
        }
        
        // Fallback to generic hospital search
        const googleMapsURL = `https://www.google.com/maps/search/hospitals+near+me/@${lat},${lng},15z/data=!3m1!4b1?entry=ttu&g_ep=EgoyMDI1MDYwMy4wIKXMDSoASAFQAw%3D%3D`;
        console.log(`Opening hospitals near: ${lat}, ${lng}`);
        window.open(googleMapsURL, "_blank");
      } else {
        // Fallback to generic search if location is not available
        console.log("Location not available, using fallback URL");
        const fallbackURL = "https://maps.app.goo.gl/NHbFRyMVtQGV1DbM7";
        window.open(fallbackURL, "_blank");
      }
    } catch (error) {
      console.error("Error getting location for hospital search:", error);
      // Use fallback URL
      const fallbackURL = "https://maps.app.goo.gl/NHbFRyMVtQGV1DbM7";
      window.open(fallbackURL, "_blank");
    }
  };
  // Send emergency message to all saved contacts
  const sendEmergencyMessage = async () => {
    // Check if emergency contacts are required and none exist
    if (emergencySettings.emergencyContactsRequired) {
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
        alert(
          "No emergency contacts found. Please add emergency contacts in Settings first."
        );
        return;
      }
    }

    // SOS confirmation if enabled
    if (emergencySettings.sosConfirmation) {
      const confirmed = window.confirm(
        "🚨 EMERGENCY ALERT\n\nAre you sure you want to send emergency messages to all your contacts?\n\nThis will immediately notify them of your emergency situation."
      );
      if (!confirmed) {
        return;
      }
    }

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
      alert(
        "No emergency contacts found. Please add emergency contacts in Settings first."
      );
      return;
    }    let locationInfo = "Location not available";
    
    // Auto location sharing based on settings
    if (emergencySettings.autoLocationShare) {
      const currentLocationResult = await getCurrentLocation();
      setLocation(currentLocationResult);
      locationInfo = currentLocationResult;

      // Include coordinates in emergency message if available
      if (userCoordinates) {
        const { lat, lng } = userCoordinates;
        locationInfo = `${currentLocationResult}\n📍 GPS: ${lat.toFixed(6)}, ${lng.toFixed(6)}\n🗺️ Maps: https://www.google.com/maps?q=${lat},${lng}`;
      }
    } else {
      locationInfo = "Location sharing disabled in settings";
    }

    const emergencyMessage = `🚨 EMERGENCY ALERT 🚨
    
I need immediate help! This is an automated emergency message from DOCai Medical Assistant.

📍 My current location: ${locationInfo}

🕒 Time: ${new Date().toLocaleString()}

If you receive this message, please check on me immediately or call emergency services.

This message was sent automatically through the DOCai Emergency System.`;

    currentContacts.forEach((contact, index) => {
      setTimeout(() => {
        const smsUrl = `sms:${contact.phone}?body=${encodeURIComponent(
          emergencyMessage
        )}`;
        window.open(smsUrl, "_blank");
      }, index * 1000);
    });

    alert(`Emergency messages sent to ${currentContacts.length} contacts: ${currentContacts.map(c => c.name).join(', ')}`);
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Emergency Buttons - Mobile optimized grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-2 mb-2">
        {/* Call 108 Button */}
        <Button
          onClick={callEmergencyServices108}
          size="sm"
          suppressHydrationWarning={true}
          className="w-full h-7 sm:h-8 lg:h-9 bg-red-600 hover:bg-red-700 text-white rounded-md sm:rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-0.5 sm:gap-1 text-xs"
        >
          <Phone className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          <span className="hidden xs:inline sm:hidden lg:inline">Call</span>
          <span>108</span>
        </Button>

        {/* Call 112 Button */}
        <Button
          onClick={callEmergencyServices112}
          size="sm"
          suppressHydrationWarning={true}
          className="w-full h-7 sm:h-8 lg:h-9 bg-red-500 hover:bg-red-600 text-white rounded-md sm:rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-0.5 sm:gap-1 text-xs"
        >
          <Phone className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          <span className="hidden xs:inline sm:hidden lg:inline">Call</span>
          <span>112</span>
        </Button>

        {/* Find Hospitals Button - Now uses real user location */}
        <Button
          onClick={findNearbyHospitals}
          disabled={isGettingLocation}
          size="sm"
          suppressHydrationWarning={true}
          className="w-full h-7 sm:h-8 lg:h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-md sm:rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-0.5 sm:gap-1 text-xs disabled:opacity-50"
          title={userCoordinates ? `Find hospitals near ${userCoordinates.lat.toFixed(4)}, ${userCoordinates.lng.toFixed(4)}` : "Find nearby hospitals"}
        >
          {isGettingLocation ? (
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="hidden xs:inline sm:hidden lg:inline">Hospitals</span>
              <span className="xs:hidden sm:inline lg:hidden">🏥</span>
            </>
          )}
        </Button>

        {/* Emergency Message Button */}
        <Button
          onClick={sendEmergencyMessage}
          disabled={isGettingLocation}
          size="sm"
          suppressHydrationWarning={true}
          className="w-full h-7 sm:h-8 lg:h-9 bg-orange-600 hover:bg-orange-700 text-white rounded-md sm:rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-0.5 sm:gap-1 disabled:opacity-50 text-xs"
        >
          {isGettingLocation ? (
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <MessageSquare className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="hidden xs:inline sm:hidden lg:inline">Alert</span>
              <span className="xs:hidden sm:inline lg:hidden">SOS</span>
              {emergencyContacts.length > 0 && (
                <span className="hidden lg:inline text-xs opacity-75">
                  ({emergencyContacts.length})
                </span>
              )}
            </>
          )}
        </Button>
      </div>

      {/* Location Display - Mobile optimized */}
      {userCoordinates && (
        <div className="text-center text-xs text-slate-500 mt-1 truncate">
          📍 {userCoordinates.lat.toFixed(3)}, {userCoordinates.lng.toFixed(3)}
        </div>
      )}

      {/* Show contact count or prompt to add contacts */}
      {emergencyContacts.length === 0 && (
        <div className="text-center text-xs text-slate-500 mt-1 px-2">
          <span className="hidden sm:inline">Add emergency contacts in Settings to enable SOS alerts</span>
          <span className="sm:hidden">Add contacts in Settings for SOS</span>
        </div>
      )}
    </div>
  );
};
