"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MapPin,
  Navigation,
  Phone,
  Clock,
  ExternalLink,
  Loader2,
  AlertCircle,
  Shield,
  Building2,
  ArrowLeft,
  RefreshCw,
  Target,
  Heart,
  Stethoscope,
} from "lucide-react";
import Link from "next/link";

interface Hospital {
  name: string;
  contact: string;
  address: string;
  type: string;
  google_maps_link: string;
}

interface ApiResponse {
  location: {
    latitude: number;
    longitude: number;
  };
  nearby_hospitals: Hospital[];
  note: string;
}

const HospitalsPage = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [error, setError] = useState<string>("");
  const [locationPermission, setLocationPermission] = useState<
    "granted" | "denied" | "prompt"
  >("prompt");

  // Get user's current location
  const getCurrentLocation = async (): Promise<{
    lat: number;
    lng: number;
  }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }

      setIsGettingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
          setLocationPermission("granted");
          setIsGettingLocation(false);
          resolve(location);
        },
        (error) => {
          setLocationPermission("denied");
          setIsGettingLocation(false);
          reject(new Error("Location access denied"));
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 300000 }
      );
    });
  };

  // Find nearby hospitals using the external API
  const findNearbyHospitals = async (location?: {
    lat: number;
    lng: number;
  }) => {
    setIsLoading(true);
    setError("");

    try {
      let currentLocation = location || userLocation;

      // If no location provided, get current location
      if (!currentLocation) {
        currentLocation = await getCurrentLocation();
      }

      // Use the existing nearby-hospitals endpoint instead of nearby-hospitals-external
      const response = await fetch(
        `/api/nearby-hospitals?lat=${currentLocation.lat}&lng=${currentLocation.lng}&radius=10000`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();

      // Transform the data to match the expected format
      const hospitals =
        data.results?.map((hospital: any) => ({
          name: hospital.name,
          contact: hospital.formatted_phone_number || "Contact not available",
          address: hospital.vicinity,
          type: hospital.facility_type || "Medical Facility",
          google_maps_link: `https://www.google.com/maps/dir/${currentLocation.lat},${currentLocation.lng}/${hospital.geometry.location.lat},${hospital.geometry.location.lng}`,
        })) || [];

      setHospitals(hospitals);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to find hospitals"
      );

      // Provide fallback hospitals data
      const fallbackHospitals = [
        {
          name: "Emergency Services",
          contact: "108",
          address: "Emergency hotline - available nationwide",
          type: "Emergency",
          google_maps_link: `https://www.google.com/maps/search/hospitals+near+me/@${
            userLocation?.lat || 0
          },${userLocation?.lng || 0},15z`,
        },
        {
          name: "Apollo Hospitals",
          contact: "+91-9876543210",
          address: "Check local directory for nearest Apollo location",
          type: "Hospital",
          google_maps_link: `https://www.google.com/maps/search/apollo+hospital/@${
            userLocation?.lat || 0
          },${userLocation?.lng || 0},13z`,
        },
        {
          name: "Fortis Healthcare",
          contact: "+91-9876543211",
          address: "Check local directory for nearest Fortis location",
          type: "Hospital",
          google_maps_link: `https://www.google.com/maps/search/fortis+hospital/@${
            userLocation?.lat || 0
          },${userLocation?.lng || 0},13z`,
        },
      ];

      setHospitals(fallbackHospitals);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-load hospitals on page load if location permission was previously granted
  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        if (result.state === "granted") {
          findNearbyHospitals();
        }
      });
    }
  }, []);

  // Get hospital type color
  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "hospital":
        return "bg-red-100 text-red-700";
      case "clinic":
        return "bg-blue-100 text-blue-700";
      case "emergency center":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "hospital":
        return <Building2 className="w-4 h-4" />;
      case "clinic":
        return <Stethoscope className="w-4 h-4" />;
      case "emergency center":
        return <Shield className="w-4 h-4" />;
      default:
        return <Heart className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-lg border-b border-slate-200/60 px-3 sm:px-6 py-3 sm:py-4 z-10 shadow-sm">
        <div className="w-full max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="p-1.5 sm:p-2 h-8 w-8 sm:h-9 sm:w-9 hover:bg-slate-100 transition-colors"
              >
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 text-slate-600" />
              </Button>
            </Link>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-xs sm:text-sm lg:text-xl text-slate-800 truncate">
                Nearby Hospitals
                {userLocation && (
                  <span className="hidden sm:inline text-xs text-green-600 ml-2">
                    📍 Location: {userLocation.lat.toFixed(4)},{" "}
                    {userLocation.lng.toFixed(4)}
                  </span>
                )}
              </h1>
              <p className="text-xs text-slate-600 hidden sm:block">
                Find medical facilities near you
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => findNearbyHospitals()}
              disabled={isLoading || isGettingLocation}
              size="sm"
              variant="outline"
            >
              <RefreshCw
                className={`w-4 h-4 mr-1 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-3 sm:px-6 py-4 sm:py-6">
        <div className="w-full max-w-6xl mx-auto space-y-6">
          {/* Search Section */}
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-600" />
                Find Nearby Medical Facilities
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <p className="text-slate-600">
                  Discover hospitals, clinics, and emergency centers in your
                  area using AI-powered location services.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => findNearbyHospitals()}
                    disabled={isLoading || isGettingLocation}
                    className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {isLoading || isGettingLocation ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        {isGettingLocation
                          ? "Getting Location..."
                          : "Finding Hospitals..."}
                      </>
                    ) : (
                      <>
                        <Target className="w-5 h-5 mr-2" />
                        Find Hospitals Near Me
                      </>
                    )}
                  </Button>

                  {userLocation && (
                    <Button
                      onClick={() => {
                        const url = `https://www.google.com/maps/search/hospitals+near+me/@${userLocation.lat},${userLocation.lng},15z`;
                        window.open(url, "_blank");
                      }}
                      variant="outline"
                      className="px-6 py-3 rounded-xl border-2 border-red-300 hover:border-red-500 hover:bg-red-50"
                    >
                      <ExternalLink className="w-5 h-5 mr-2" />
                      Open in Google Maps
                    </Button>
                  )}
                </div>

                {/* Location Status */}
                {locationPermission === "denied" && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                      <p className="text-yellow-700 text-sm">
                        Location access is required to find nearby hospitals.
                        Please enable location permissions and try again.
                      </p>
                    </div>
                  </div>
                )}

                {/* Error Display */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <p className="text-red-700 text-sm">{error}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Hospitals List */}
          {hospitals.length > 0 && (
            <Card className="shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-green-600" />
                  Found {hospitals.length} Medical Facilities
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {hospitals.map((hospital, index) => (
                    <div
                      key={index}
                      className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-slate-800 text-base">
                              {hospital.name}
                            </h3>
                            <span
                              className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${getTypeColor(
                                hospital.type
                              )}`}
                            >
                              {getTypeIcon(hospital.type)}
                              {hospital.type}
                            </span>
                          </div>

                          <div className="space-y-1 text-sm text-slate-600">
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                              <span>{hospital.address}</span>
                            </div>

                            {hospital.contact && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                <span>{hospital.contact}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          onClick={() =>
                            window.open(hospital.google_maps_link, "_blank")
                          }
                          size="sm"
                          variant="outline"
                          className="text-xs flex-1"
                        >
                          <Navigation className="w-3 h-3 mr-1" />
                          Directions
                        </Button>

                        {hospital.contact && (
                          <Button
                            onClick={() =>
                              (window.location.href = `tel:${hospital.contact}`)
                            }
                            size="sm"
                            variant="outline"
                            className="text-xs text-green-600 border-green-200 hover:bg-green-50"
                          >
                            <Phone className="w-3 h-3 mr-1" />
                            Call
                          </Button>
                        )}

                        <Button
                          onClick={() => {
                            const mapUrl = `https://www.google.com/maps/search/${encodeURIComponent(
                              hospital.name
                            )}`;
                            window.open(mapUrl, "_blank");
                          }}
                          size="sm"
                          variant="outline"
                          className="text-xs"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Results */}
          {!isLoading && hospitals.length === 0 && !error && (
            <Card className="shadow-lg border-0">
              <CardContent className="p-8 text-center">
                <Building2 className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">
                  No Hospitals Found Yet
                </h3>
                <p className="text-slate-600 mb-4">
                  Click "Find Hospitals Near Me" to discover medical facilities
                  in your area.
                </p>
                <Button
                  onClick={() => findNearbyHospitals()}
                  disabled={isLoading || isGettingLocation}
                  className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Get Started
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Emergency Notice */}
          <Card className="shadow-lg border-2 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-red-800 mb-2">
                    🚨 Emergency Notice
                  </h3>
                  <p className="text-sm text-red-700">
                    For life-threatening emergencies, call 108 or 112
                    immediately instead of traveling to a hospital. This tool is
                    for finding nearby medical facilities for non-emergency
                    care.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/chat">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4 text-center">
                  <Heart className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <h3 className="font-semibold text-slate-800 mb-1">
                    Medical Chat
                  </h3>
                  <p className="text-xs text-slate-600">
                    Get AI medical assistance
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/healthprofile">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-4 text-center">
                  <Target className="w-8 h-8 mx-auto mb-2 text-green-600" />
                  <h3 className="font-semibold text-slate-800 mb-1">
                    Health Profile
                  </h3>
                  <p className="text-xs text-slate-600">
                    Analyze your health data
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Card
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => (window.location.href = "tel:108")}
            >
              <CardContent className="p-4 text-center">
                <Phone className="w-8 h-8 mx-auto mb-2 text-red-600" />
                <h3 className="font-semibold text-slate-800 mb-1">
                  Emergency Call
                </h3>
                <p className="text-xs text-slate-600">Call 108 immediately</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalsPage;
