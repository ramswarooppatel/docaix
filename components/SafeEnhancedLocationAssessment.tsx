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
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">Location-based advice is being prepared...</p>
      </div>
    );
  }

  // Ensure required structure exists and handle different API response formats
  const safeLocationAdvice = {
    request_info: locationAdvice.request_info || {
      latitude: 0,
      longitude: 0,
      condition_description: "General medical condition"
    },
    analysis: {
      severity_assessment: {
        severity_level: locationAdvice.analysis?.severity_assessment?.severity_level || "Medium",
        urgency: locationAdvice.analysis?.severity_assessment?.urgency || "Moderate",
        recommended_action: locationAdvice.analysis?.severity_assessment?.recommended_action || "Monitor condition",
        estimated_response_time: locationAdvice.analysis?.severity_assessment?.estimated_response_time || "Unknown"
      },
      location_context: {
        area_type: locationAdvice.analysis?.location_context?.area_type || "Unknown area",
        medical_accessibility: locationAdvice.analysis?.location_context?.medical_accessibility || "Moderate accessibility",
        nearest_emergency_services: locationAdvice.analysis?.location_context?.nearest_emergency_services || "Emergency services available",
        traffic_conditions: locationAdvice.analysis?.location_context?.traffic_conditions || "Normal",
        weather_impact: locationAdvice.analysis?.location_context?.weather_impact || "No significant impact",
        population_density: locationAdvice.analysis?.location_context?.population_density || "Moderate"
      },
      risk_factors: locationAdvice.analysis?.risk_factors || {
        distance_to_hospital: "Moderate distance",
        isolation_level: "Low isolation",
        communication_availability: "Good"
      },
      immediate_actions: locationAdvice.analysis?.immediate_actions || [
        "Stay calm and assess the situation",
        "Call for help if needed",
        "Follow basic first aid principles"
      ],
      evacuation_plan: locationAdvice.analysis?.evacuation_plan || {
        transport_options: ["Call emergency services"],
        route_recommendations: ["Use main roads"],
        estimated_time: "Unknown"
      }
    },
    emergency_note: locationAdvice.emergency_note || "For serious emergencies, call local emergency services immediately.",
    local_resources: locationAdvice.local_resources || {
      nearby_hospitals: [],
      emergency_contacts: ["108 - Emergency Services"],
      local_services: []
    }
  };

  return <EnhancedLocationAssessment locationAdvice={safeLocationAdvice} />;
};