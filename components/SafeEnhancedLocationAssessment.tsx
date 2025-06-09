"use client";

import React from "react";
import { EnhancedLocationAssessment } from "./EnhancedLocationAssessment";

interface SafeEnhancedLocationAssessmentProps {
  locationAdvice: any;
}

export const SafeEnhancedLocationAssessment: React.FC<SafeEnhancedLocationAssessmentProps> = ({
  locationAdvice,
}) => {
  // Validate and sanitize the data structure
  if (!locationAdvice) {
    console.warn("SafeEnhancedLocationAssessment: No location advice provided");
    return (
      <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <p className="text-purple-800">Location assessment is being prepared...</p>
      </div>
    );
  }

  // Ensure required structure exists and handle different API response formats
  let safeAdvice;
  
  // Check if locationAdvice is the direct API response or wrapped
  if (locationAdvice.analysis) {
    // Direct API response format
    safeAdvice = locationAdvice;
  } else if (locationAdvice.location_advice?.analysis) {
    // Wrapped format
    safeAdvice = locationAdvice.location_advice;
  } else {
    // Try to construct from available data
    console.warn("Location advice structure not recognized, attempting to construct:", locationAdvice);
    
    // Create a safe structure from available data
    safeAdvice = {
      request_info: {
        latitude: locationAdvice.request_info?.latitude || 0,
        longitude: locationAdvice.request_info?.longitude || 0,
        condition_description: locationAdvice.request_info?.condition_description || "Medical assessment",
      },
      analysis: {
        severity_assessment: {
          severity_level: locationAdvice.analysis?.severity_assessment?.severity_level || "Medium",
          urgency: locationAdvice.analysis?.severity_assessment?.urgency || "Moderate",
          recommended_action: locationAdvice.analysis?.severity_assessment?.recommended_action || "Seek medical attention if symptoms persist",
        },
        location_context: {
          area_type: locationAdvice.analysis?.location_context?.area_type || "Urban",
          medical_accessibility: locationAdvice.analysis?.location_context?.medical_accessibility || "Good",
          nearest_emergency_services: locationAdvice.analysis?.location_context?.nearest_emergency_services || "Emergency services available",
        },
        immediate_actions: locationAdvice.analysis?.immediate_actions || [
          "Monitor your condition carefully",
          "Keep emergency contacts readily available",
          "Note any changes in symptoms"
        ],
      },
      emergency_note: locationAdvice.emergency_note || "For emergencies, contact local emergency services immediately.",
      local_resources: {
        nearby_hospitals: locationAdvice.local_resources?.nearby_hospitals || [
          {
            name: "Emergency Services",
            distance: "Available nationwide",
            specialties: ["Emergency Care"],
            contact: "108"
          }
        ],
        emergency_contacts: locationAdvice.local_resources?.emergency_contacts || ["108", "112"],
        local_services: locationAdvice.local_resources?.local_services || []
      }
    };
  }

  return <EnhancedLocationAssessment locationAdvice={safeAdvice} />;
};