"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Phone,
  MapPin,
  AlertTriangle,
  Clock,
  Heart,
  Users,
  Shield,
  Volume2,
} from "lucide-react";

const EmergencySOSPage = () => {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState(null);
  const [emergencyActive, setEmergencyActive] = useState(false);

  const startEmergencyCountdown = () => {
    setCountdown(10);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          triggerEmergencyCall();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const triggerEmergencyCall = () => {
    setEmergencyActive(true);
    // Trigger emergency protocols
    window.open('tel:108', '_self');
    // Send SMS to emergency contacts
    // Share location
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Emergency Header */}
        <Card className="border-red-300 bg-red-50 border-2">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-red-800">
              <AlertTriangle className="w-8 h-8" />
              🚨 EMERGENCY SOS
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Emergency Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* SOS Button */}
          <Card className="border-red-400">
            <CardHeader>
              <CardTitle className="text-red-800">Emergency SOS</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              {countdown ? (
                <div className="space-y-4">
                  <div className="text-6xl font-bold text-red-600 animate-pulse">
                    {countdown}
                  </div>
                  <p className="text-red-700">Calling emergency services...</p>
                  <Button 
                    onClick={() => setCountdown(null)}
                    variant="outline"
                    className="border-red-300"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={startEmergencyCountdown}
                  className="w-32 h-32 rounded-full bg-red-600 hover:bg-red-700 text-white text-xl font-bold"
                >
                  <div className="text-center">
                    <Phone className="w-8 h-8 mx-auto mb-2" />
                    SOS
                  </div>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Emergency Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full bg-red-600 hover:bg-red-700">
                <Phone className="w-4 h-4 mr-2" />
                Call 108 (Ambulance)
              </Button>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                <Phone className="w-4 h-4 mr-2" />
                Call 112 (Emergency)
              </Button>
              <Button className="w-full bg-orange-600 hover:bg-orange-700">
                <Users className="w-4 h-4 mr-2" />
                Alert Emergency Contacts
              </Button>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                <MapPin className="w-4 h-4 mr-2" />
                Share Live Location
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmergencySOSPage;