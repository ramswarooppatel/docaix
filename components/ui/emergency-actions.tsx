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

  // Load emergency contacts from localStorage
  useEffect(() => {
    const savedContacts = localStorage.getItem("emergencyContacts");
    if (savedContacts) {
      setEmergencyContacts(JSON.parse(savedContacts));
    } else {
      // Set default emergency contacts if none exist
      const defaultContacts: EmergencyContact[] = [
        { id: "1", name: "Emergency Contact 1", phone: "+1234567890" },
        { id: "2", name: "Emergency Contact 2", phone: "+0987654321" },
      ];
      setEmergencyContacts(defaultContacts);
      localStorage.setItem("emergencyContacts", JSON.stringify(defaultContacts));
    }

    // Get initial location
    getCurrentLocation().then(setLocation);
  }, []);

  // Call emergency services (108)
  const callEmergencyServices = () => {
    // Create a phone link that works on mobile
    window.location.href = "tel:108";
  };

  // Send emergency message to all saved contacts
  const sendEmergencyMessage = async () => {
    if (emergencyContacts.length === 0) {
      alert("No emergency contacts found. Please add emergency contacts first.");
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
    emergencyContacts.forEach((contact, index) => {
      setTimeout(() => {
        const smsUrl = `sms:${contact.phone}?body=${encodeURIComponent(emergencyMessage)}`;
        window.open(smsUrl, '_blank');
      }, index * 1000); // Stagger the messages by 1 second each
    });

    alert(`Emergency messages sent to ${emergencyContacts.length} contacts!`);
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Emergency Buttons - Small and Horizontal */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        {/* Call 108 Button - Smaller */}
        <Button
          onClick={callEmergencyServices}
          size="sm"
          className="w-full h-8 sm:h-9 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-1.5 text-xs sm:text-sm"
        >
          <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span>Call 108</span>
        </Button>

        {/* Emergency Message Button - Smaller */}
        <Button
          onClick={sendEmergencyMessage}
          disabled={isGettingLocation}
          size="sm"
          className="w-full h-8 sm:h-9 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-1.5 disabled:opacity-50 text-xs sm:text-sm"
        >
          {isGettingLocation ? (
            <>
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span className="hidden sm:inline">Getting...</span>
            </>
          ) : (
            <>
              <MessageSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Alert Contacts</span>
            </>
          )}
        </Button>
      </div>

      {/* Compact Location and Contacts Info */}
      {/* <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 space-y-1.5">
        <div className="flex items-start gap-1.5 text-xs">
          <MapPin className="w-3 h-3 text-slate-600 flex-shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <div className="font-medium text-slate-700">Location:</div>
            <div className="text-slate-600 break-words text-xs leading-tight">{location}</div>
          </div>
        </div>

        <div className="flex items-start gap-1.5 text-xs">
          <Users className="w-3 h-3 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <div className="font-medium text-blue-700">Contacts ({emergencyContacts.length}):</div>
            <div className="space-y-0.5">
              {emergencyContacts.length > 0 ? (
                emergencyContacts.slice(0, 2).map((contact, index) => (
                  <div key={contact.id} className="text-blue-600 text-xs leading-tight">
                    {index + 1}. {contact.name}
                  </div>
                ))
              ) : (
                <div className="text-blue-600 text-xs italic">No contacts added</div>
              )}
              {emergencyContacts.length > 2 && (
                <div className="text-blue-600 text-xs">
                  +{emergencyContacts.length - 2} more
                </div>
              )}
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
};