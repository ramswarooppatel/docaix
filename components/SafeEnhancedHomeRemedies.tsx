"use client";

import React from "react";
import { EnhancedHomeRemedies } from "./EnhancedHomeRemedies";

interface SafeEnhancedHomeRemediesProps {
  enhancedAdvice: any;
}

export const SafeEnhancedHomeRemedies: React.FC<SafeEnhancedHomeRemediesProps> = ({
  enhancedAdvice,
}) => {
  // Validate and sanitize the data structure
  if (!enhancedAdvice) {
    console.warn("SafeEnhancedHomeRemedies: No enhanced advice provided");
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">Enhanced advice is being prepared...</p>
      </div>
    );
  }

  // Ensure required structure exists and handle different API response formats
  const safeAdvice = {
    severity_assessment: {
      severity_level: enhancedAdvice.severity_assessment?.severity_level || "Medium",
      can_treat_at_home: enhancedAdvice.severity_assessment?.can_treat_at_home ?? true,
      severity_score: enhancedAdvice.severity_assessment?.severity_score || "5/10"
    },
    home_remedies: {
      immediate_relief: enhancedAdvice.home_remedies?.immediate_relief || [
        "Rest and monitor your condition",
        "Stay hydrated with water",
        "Avoid strenuous activities"
      ],
      natural_treatments: enhancedAdvice.home_remedies?.natural_treatments || [],
      dietary_remedies: enhancedAdvice.home_remedies?.dietary_remedies || [],
      lifestyle_adjustments: enhancedAdvice.home_remedies?.lifestyle_adjustments || []
    },
    needed_products: enhancedAdvice.needed_products || {
      pharmacy_items: [],
      household_items: [],
      herbal_supplements: [],
      grocery_items: []
    },
    step_by_step_treatment: enhancedAdvice.step_by_step_treatment || [
      "Monitor your symptoms carefully",
      "Follow basic first aid principles",
      "Seek medical attention if condition worsens"
    ],
    warning_signs: enhancedAdvice.warning_signs || [
      "Severe or worsening symptoms",
      "Difficulty breathing",
      "Persistent pain",
      "Signs of infection"
    ],
    recovery_timeline: enhancedAdvice.recovery_timeline || {
      expected_improvement: "Monitor condition and follow medical advice",
      full_recovery: "Consult healthcare provider for timeline",
      monitoring_frequency: "As recommended by healthcare provider"
    },
    prevention_tips: enhancedAdvice.prevention_tips || []
  };

  return <EnhancedHomeRemedies enhancedAdvice={safeAdvice} />;
};