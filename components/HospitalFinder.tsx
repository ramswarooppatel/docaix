"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Navigation,
  Phone,
  Clock,
  Star,
  ExternalLink,
  Loader2,
  AlertCircle,
  Shield,
  Building2,
  Globe,
} from "lucide-react";

interface Hospital {
  place_id: string;
  name: string;
  vicinity: string;
  rating?: number;
  user_ratings_total?: number;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  opening_hours?: {
    open_now: boolean;
  };
  formatted_phone_number?: string;
  website?: string;
  types: string[];
  distance_km?: number;
  facility_type?: string;
  emergency_services?: boolean;
  operator?: string;
}

interface HospitalFinderProps {
  className?: string;
}

export const HospitalFinder: React.FC<HospitalFinderProps> = ({
  className = "",
}) => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [dataSource, setDataSource] = useState<string>("");

  // Get user's current location
  const getCurrentLocation = async (): Promise<{lat: number; lng: number}> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
          setLocationPermission('granted');
          resolve(location);
        },
        (error) => {
          setLocationPermission('denied');
          reject(new Error("Location access denied"));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    });
  };

  // Find nearby hospitals using OpenStreetMap Overpass API
  const findNearbyHospitals = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const location = await getCurrentLocation();
      
      console.log(`Searching for hospitals near: ${location.lat}, ${location.lng}`);
      
      const response = await fetch(
        `/api/nearby-hospitals?lat=${location.lat}&lng=${location.lng}&radius=10000`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch hospitals');
      }

      const data = await response.json();
      setHospitals(data.results || []);
      setDataSource(data.source || "unknown");
      
      console.log(`Found ${data.results?.length || 0} hospitals from ${data.source}`);
      
      if (data.message) {
        console.log('API Message:', data.message);
      }
      
    } catch (error) {
      console.error('Error finding hospitals:', error);
      setError(error instanceof Error ? error.message : 'Failed to find hospitals');
      setHospitals([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate distance between two points (fallback if not provided by API)
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): string => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  // Open directions in Google Maps
  const openDirections = (hospital: Hospital) => {
    if (userLocation) {
      const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${hospital.geometry.location.lat},${hospital.geometry.location.lng}`;
      window.open(url, '_blank');
    } else {
      const url = `https://www.google.com/maps/search/${encodeURIComponent(hospital.name + ' ' + hospital.vicinity)}`;
      window.open(url, '_blank');
    }
  };

  // Call hospital
  const callHospital = (phone: string) => {
    // Clean phone number for calling
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    window.location.href = `tel:${cleanPhone}`;
  };

  // Open website
  const openWebsite = (website: string) => {
    let url = website;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    window.open(url, '_blank');
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-red-600" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-800">Nearby Hospitals</h2>
            {dataSource && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                {dataSource === "openstreetmap" ? "🗺️ OSM" : 
                 dataSource === "demo_data" ? "📋 Demo" : 
                 dataSource === "fallback_data" ? "⚠️ Fallback" : "📍 Live"}
              </span>
            )}
          </div>
          <Button
            onClick={findNearbyHospitals}
            disabled={isLoading}
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                Finding...
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4 mr-1" />
                Find Hospitals
              </>
            )}
          </Button>
        </div>

        <p className="text-sm text-slate-600 mb-4">
          Find nearby hospitals and emergency medical centers using OpenStreetMap data.
        </p>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Location Permission */}
        {locationPermission === 'denied' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <p className="text-yellow-700 text-sm">
              Location access is required to find nearby hospitals. Please enable location permissions and try again.
            </p>
          </div>
        )}

        {/* Hospitals List */}
        {hospitals.length > 0 && (
          <div className="space-y-3">
            {hospitals.map((hospital) => (
              <div
                key={hospital.place_id}
                className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-800 text-sm sm:text-base">
                        {hospital.name}
                      </h3>
                      {hospital.emergency_services && (
                        <Shield className="w-4 h-4 text-red-600" title="Emergency Services Available" />
                      )}
                      {hospital.facility_type && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          {hospital.facility_type}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 text-xs sm:text-sm mb-1">
                      {hospital.vicinity}
                    </p>
                    {hospital.operator && (
                      <p className="text-slate-500 text-xs flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {hospital.operator}
                      </p>
                    )}
                  </div>
                  {(hospital.distance_km !== undefined || userLocation) && (
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                      {hospital.distance_km !== undefined 
                        ? `${hospital.distance_km}km`
                        : calculateDistance(
                            userLocation!.lat,
                            userLocation!.lng,
                            hospital.geometry.location.lat,
                            hospital.geometry.location.lng
                          )}
                    </span>
                  )}
                </div>

                {/* Hospital Info */}
                <div className="flex items-center gap-4 mb-3 text-xs flex-wrap">
                  {hospital.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-slate-600">
                        {hospital.rating} ({hospital.user_ratings_total})
                      </span>
                    </div>
                  )}
                  {hospital.opening_hours && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span className={hospital.opening_hours.open_now ? "text-green-600" : "text-red-600"}>
                        {hospital.opening_hours.open_now ? "Open" : "Closed"}
                      </span>
                    </div>
                  )}
                  {hospital.emergency_services && (
                    <div className="flex items-center gap-1">
                      <Shield className="w-3 h-3 text-red-600" />
                      <span className="text-red-600 font-medium">24/7 Emergency</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 flex-wrap">
                  <Button
                    onClick={() => openDirections(hospital)}
                    size="sm"
                    variant="outline"
                    className="text-xs"
                  >
                    <Navigation className="w-3 h-3 mr-1" />
                    Directions
                  </Button>
                  
                  {hospital.formatted_phone_number && (
                    <Button
                      onClick={() => callHospital(hospital.formatted_phone_number!)}
                      size="sm"
                      variant="outline"
                      className="text-xs text-green-600 border-green-200 hover:bg-green-50"
                    >
                      <Phone className="w-3 h-3 mr-1" />
                      Call
                    </Button>
                  )}
                  
                  {hospital.website && (
                    <Button
                      onClick={() => openWebsite(hospital.website!)}
                      size="sm"
                      variant="outline"
                      className="text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      <Globe className="w-3 h-3 mr-1" />
                      Website
                    </Button>
                  )}
                  
                  <Button
                    onClick={() => {
                      const mapUrl = `https://www.google.com/maps/search/${encodeURIComponent(hospital.name)}/@${hospital.geometry.location.lat},${hospital.geometry.location.lng},15z`;
                      window.open(mapUrl, '_blank');
                    }}
                    size="sm"
                    variant="outline"
                    className="text-xs"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!isLoading && hospitals.length === 0 && !error && (
          <div className="text-center py-8 text-slate-500">
            <MapPin className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-sm">Click "Find Hospitals" to locate nearby medical facilities using OpenStreetMap data.</p>
          </div>
        )}

        {/* Emergency Note */}
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-xs font-medium">
            🚨 For life-threatening emergencies, call 108 or 112 immediately instead of traveling to a hospital.
          </p>
        </div>

        {/* Data Source Info */}
        {dataSource && (
          <div className="mt-2 text-xs text-slate-500 text-center">
            Data source: {dataSource === "openstreetmap" ? "OpenStreetMap via Overpass API" : 
                         dataSource === "demo_data" ? "Demo data (no hospitals found in area)" :
                         dataSource === "fallback_data" ? "Fallback data (API error)" : "Unknown"}
          </div>
        )}
      </div>
    </div>
  );
};