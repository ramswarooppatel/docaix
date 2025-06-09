"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTextToSpeech } from "../hooks/useTextToSpeech";
import {
  MapPin,
  Shield,
  Clock,
  AlertTriangle,
  Navigation,
  Phone,
  Building2,
  Car,
  Ambulance,
  Target,
  Activity,
  ExternalLink,
  Star,
  CheckCircle,
  Eye,
  Lightbulb,
  ChevronRight,
  Timer,
  Map,
  Compass,
  Route,
  Home,
  Hospital,
  HeartHandshake,
  Zap,
  Bell,
  X,
} from "lucide-react";

interface LocationAssessmentProps {
  locationAdvice: {
    request_info?: {
      latitude: number;
      longitude: number;
      condition_description: string;
    };
    analysis: {
      severity_assessment: {
        severity_level: string;
        urgency: string;
        recommended_action: string;
        estimated_response_time?: string;
      };
      location_context: {
        area_type: string;
        medical_accessibility: string;
        nearest_emergency_services: string;
        traffic_conditions?: string;
        weather_impact?: string;
        population_density?: string;
      };
      risk_factors?: {
        distance_to_hospital: string;
        isolation_level: string;
        communication_availability: string;
      };
      immediate_actions?: string[];
      evacuation_plan?: {
        transport_options: string[];
        route_recommendations: string[];
        estimated_time: string;
      };
    };
    emergency_note: string;
    local_resources?: {
      nearby_hospitals: Array<{
        name: string;
        distance: string;
        specialties: string[];
        contact?: string;
      }>;
      emergency_contacts: string[];
      local_services: string[];
    };
  };
}

export const EnhancedLocationAssessment: React.FC<LocationAssessmentProps> = ({
  locationAdvice,
}) => {
  const [activeTab, setActiveTab] = useState("assessment");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Add TTS integration
  const { speak, isSpeaking, isPaused, pause, resume, stop } = useTextToSpeech();

  // Add safety checks for locationAdvice structure
  if (!locationAdvice) {
    console.error("EnhancedLocationAssessment: locationAdvice is undefined");
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">Location assessment data is not available.</p>
      </div>
    );
  }

  if (!locationAdvice.analysis) {
    console.error("EnhancedLocationAssessment: analysis is undefined", locationAdvice);
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">Location assessment data structure is incomplete.</p>
      </div>
    );
  }

  // Add speech function for location assessment
  const handleSpeakAssessment = () => {
    const assessmentText = `
      Location-based medical assessment completed.
      
      Severity level: ${locationAdvice.analysis.severity_assessment.severity_level}.
      Urgency: ${locationAdvice.analysis.severity_assessment.urgency}.
      
      Recommended action: ${locationAdvice.analysis.severity_assessment.recommended_action}
      
      Your location context: You are in a ${locationAdvice.analysis.location_context.area_type} area with ${locationAdvice.analysis.location_context.medical_accessibility} medical accessibility.
      
      Emergency services: ${locationAdvice.analysis.location_context.nearest_emergency_services}
      
      ${locationAdvice.analysis.immediate_actions ? 
        `Immediate actions recommended: ${locationAdvice.analysis.immediate_actions.slice(0, 3).join('. ')}.` : ''}
      
      Emergency note: ${locationAdvice.emergency_note}
      
      Remember to call 108 or 112 for life-threatening emergencies.
    `;

    if (isSpeaking) {
      if (isPaused) {
        resume();
      } else {
        pause();
      }
    } else {
      speak(assessmentText);
    }
  };

  const getSeverityColor = (level: string) => {
    if (!level) return "text-blue-600 bg-blue-50 border-blue-200";
    
    switch (level.toLowerCase()) {
      case "low":
      case "mild":
        return "text-green-600 bg-green-50 border-green-200";
      case "medium":
      case "moderate":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "high":
      case "severe":
      case "critical":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-blue-600 bg-blue-50 border-blue-200";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    if (!urgency) return "text-blue-600 bg-blue-50";
    
    switch (urgency.toLowerCase()) {
      case "immediate":
      case "urgent":
        return "text-red-600 bg-red-50";
      case "moderate":
      case "soon":
        return "text-orange-600 bg-orange-50";
      case "low":
      case "routine":
        return "text-green-600 bg-green-50";
      default:
        return "text-blue-600 bg-blue-50";
    }
  };

  const getAreaTypeIcon = (areaType: string) => {
    if (!areaType) return <MapPin className="w-5 h-5" />;
    
    switch (areaType.toLowerCase()) {
      case "urban":
        return <Building2 className="w-5 h-5" />;
      case "suburban":
        return <Home className="w-5 h-5" />;
      case "rural":
      case "remote":
        return <Map className="w-5 h-5" />;
      default:
        return <MapPin className="w-5 h-5" />;
    }
  };

  const tabs = [
    { id: "assessment", label: "Assessment", icon: Target },
    { id: "location", label: "Location Info", icon: MapPin },
    { id: "resources", label: "Resources", icon: Hospital },
    { id: "actions", label: "Action Plan", icon: Shield },
  ];

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Speech Controls */}
      <Card className={`border-l-4 ${getSeverityColor(locationAdvice.analysis.severity_assessment.severity_level)}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MapPin className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800">Location-Based Medical Assessment</h3>
                <p className="text-sm text-slate-600 mt-1">Personalized guidance based on your current location</p>
              </div>
            </CardTitle>
            
            <div className="flex items-center gap-3">
              {/* Speech Control Button */}
              <Button
                onClick={handleSpeakAssessment}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                {isSpeaking ? (
                  isPaused ? (
                    <>
                      <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                      <span>Resume</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      <span>Pause</span>
                    </>
                  )
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 5v10l5-5-5-5z"/>
                    </svg>
                    <span>Listen</span>
                  </>
                )}
              </Button>

              {/* Stop Button (when speaking) */}
              {isSpeaking && (
                <Button
                  onClick={stop}
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}

              <div className={`px-3 py-1 rounded-full border ${getSeverityColor(locationAdvice.analysis.severity_assessment.severity_level)}`}>
                <span className="text-sm font-medium">
                  {locationAdvice.analysis.severity_assessment.severity_level} Risk
                </span>
              </div>
              <div className={`px-3 py-1 rounded-full ${getUrgencyColor(locationAdvice.analysis.severity_assessment.urgency)}`}>
                <span className="text-sm font-medium">
                  {locationAdvice.analysis.severity_assessment.urgency} Priority
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              {getAreaTypeIcon(locationAdvice.analysis.location_context.area_type)}
              <span className="text-slate-700 font-medium">
                {locationAdvice.analysis.location_context.area_type} Area
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <span className="text-slate-600">
                Medical Access: {locationAdvice.analysis.location_context.medical_accessibility}
              </span>
            </div>
            
            {/* Speech Status Indicator */}
            {isSpeaking && (
              <div className="flex items-center gap-2 text-purple-600">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium">
                  {isPaused ? "Speech Paused" : "Now Speaking..."}
                </span>
              </div>
            )}
            
            {locationAdvice.request_info && (
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-green-600" />
                <span className="text-slate-600 text-xs">
                  📍 {locationAdvice.request_info.latitude.toFixed(4)}, {locationAdvice.request_info.longitude.toFixed(4)}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 p-1 bg-slate-100 rounded-lg">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            variant={activeTab === tab.id ? "default" : "ghost"}
            size="sm"
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
              activeTab === tab.id
                ? "bg-white shadow-sm text-purple-600"
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {/* Assessment Tab */}
        {activeTab === "assessment" && (
          <div className="space-y-4">
            {/* Severity Assessment */}
            <Card className="border-red-200 bg-red-50/30">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-red-800">
                  <AlertTriangle className="w-5 h-5" />
                  Severity & Risk Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-lg border border-red-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-full ${getSeverityColor(locationAdvice.analysis.severity_assessment.severity_level)}`}>
                        <Shield className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800">Severity Level</h4>
                        <p className="text-sm text-slate-600">{locationAdvice.analysis.severity_assessment.severity_level}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-white rounded-lg border border-red-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-full ${getUrgencyColor(locationAdvice.analysis.severity_assessment.urgency)}`}>
                        <Timer className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800">Response Urgency</h4>
                        <p className="text-sm text-slate-600">{locationAdvice.analysis.severity_assessment.urgency}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Recommended Action */}
                <div className="mt-4 p-4 bg-white rounded-lg border-2 border-red-300">
                  <div className="flex items-start gap-3">
                    <Bell className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-red-800 mb-2">Recommended Action</h4>
                      <p className="text-red-700">{locationAdvice.analysis.severity_assessment.recommended_action}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk Factors */}
            {locationAdvice.analysis.risk_factors && (
              <Card className="border-orange-200 bg-orange-50/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-800">
                    <Eye className="w-5 h-5" />
                    Risk Assessment Factors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-3 bg-white rounded-lg border border-orange-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Route className="w-4 h-4 text-orange-600" />
                        <span className="font-medium text-slate-800">Distance</span>
                      </div>
                      <p className="text-sm text-slate-600">{locationAdvice.analysis.risk_factors.distance_to_hospital}</p>
                    </div>
                    
                    <div className="p-3 bg-white rounded-lg border border-orange-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Map className="w-4 h-4 text-orange-600" />
                        <span className="font-medium text-slate-800">Isolation</span>
                      </div>
                      <p className="text-sm text-slate-600">{locationAdvice.analysis.risk_factors.isolation_level}</p>
                    </div>
                    
                    <div className="p-3 bg-white rounded-lg border border-orange-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Phone className="w-4 h-4 text-orange-600" />
                        <span className="font-medium text-slate-800">Communication</span>
                      </div>
                      <p className="text-sm text-slate-600">{locationAdvice.analysis.risk_factors.communication_availability}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Location Info Tab */}
        {activeTab === "location" && (
          <div className="space-y-4">
            <Card className="border-blue-200 bg-blue-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Building2 className="w-5 h-5" />
                  Location Context Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                        {getAreaTypeIcon(locationAdvice.analysis.location_context.area_type)}
                        Area Type
                      </h4>
                      <p className="text-slate-700">{locationAdvice.analysis.location_context.area_type}</p>
                    </div>
                    
                    <div className="p-4 bg-white rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Medical Accessibility
                      </h4>
                      <p className="text-slate-700">{locationAdvice.analysis.location_context.medical_accessibility}</p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-white rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                      <Ambulance className="w-4 h-4" />
                      Emergency Services Coverage
                    </h4>
                    <p className="text-slate-700">{locationAdvice.analysis.location_context.nearest_emergency_services}</p>
                  </div>
                  
                  {locationAdvice.analysis.location_context.traffic_conditions && (
                    <div className="p-4 bg-white rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                        <Car className="w-4 h-4" />
                        Current Conditions
                      </h4>
                      <div className="space-y-2">
                        <p className="text-slate-700">Traffic: {locationAdvice.analysis.location_context.traffic_conditions}</p>
                        {locationAdvice.analysis.location_context.weather_impact && (
                          <p className="text-slate-700">Weather Impact: {locationAdvice.analysis.location_context.weather_impact}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === "resources" && locationAdvice.local_resources && (
          <div className="space-y-4">
            {/* Nearby Hospitals */}
            {locationAdvice.local_resources.nearby_hospitals && (
              <Card className="border-green-200 bg-green-50/30">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-green-800">
                      <Hospital className="w-5 h-5" />
                      Nearby Medical Facilities
                    </div>
                    <Button size="sm" variant="outline" className="text-green-600 border-green-300">
                      <Navigation className="w-4 h-4 mr-1" />
                      View All
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {locationAdvice.local_resources.nearby_hospitals.map((hospital, index) => (
                      <div key={index} className="p-4 bg-white rounded-lg border border-green-200 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-800 mb-1">{hospital.name}</h4>
                            <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
                              <div className="flex items-center gap-1">
                                <Route className="w-3 h-3" />
                                {hospital.distance}
                              </div>
                              {hospital.contact && (
                                <div className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {hospital.contact}
                                </div>
                              )}
                            </div>
                            {hospital.specialties && hospital.specialties.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {hospital.specialties.slice(0, 3).map((specialty, idx) => (
                                  <span key={idx} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                    {specialty}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 ml-3">
                            <Button size="sm" variant="outline" className="text-green-600 border-green-300">
                              <Navigation className="w-3 h-3 mr-1" />
                              Directions
                            </Button>
                            {hospital.contact && (
                              <Button size="sm" variant="outline" className="text-blue-600 border-blue-300">
                                <Phone className="w-3 h-3 mr-1" />
                                Call
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Emergency Contacts */}
            {locationAdvice.local_resources.emergency_contacts && (
              <Card className="border-red-200 bg-red-50/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-800">
                    <Phone className="w-5 h-5" />
                    Emergency Contacts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-3">
                    {locationAdvice.local_resources.emergency_contacts.map((contact, index) => (
                      <div key={index} className="p-3 bg-white rounded-lg border border-red-200">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-700 font-medium">{contact}</span>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => window.open(`tel:${contact}`, '_self')}
                          >
                            <Phone className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Action Plan Tab */}
        {activeTab === "actions" && (
          <div className="space-y-4">
            {/* Immediate Actions */}
            {locationAdvice.analysis.immediate_actions && (
              <Card className="border-purple-200 bg-purple-50/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-800">
                    <Zap className="w-5 h-5" />
                    Immediate Action Steps
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {locationAdvice.analysis.immediate_actions.map((action, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-purple-200">
                        <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-purple-600">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-slate-700">{action}</p>
                        </div>
                        <CheckCircle className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Evacuation Plan */}
            {locationAdvice.analysis.evacuation_plan && (
              <Card className="border-indigo-200 bg-indigo-50/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-indigo-800">
                    <Route className="w-5 h-5" />
                    Evacuation & Transport Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-indigo-800 mb-3 flex items-center gap-2">
                        <Car className="w-4 h-4" />
                        Transport Options
                      </h4>
                      <div className="grid md:grid-cols-2 gap-3">
                        {locationAdvice.analysis.evacuation_plan.transport_options.map((option, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-indigo-200">
                            <Navigation className="w-4 h-4 text-indigo-600" />
                            <span className="text-slate-700">{option}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-indigo-800 mb-3 flex items-center gap-2">
                        <Compass className="w-4 h-4" />
                        Route Recommendations
                      </h4>
                      <div className="space-y-2">
                        {locationAdvice.analysis.evacuation_plan.route_recommendations.map((route, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-indigo-200">
                            <ChevronRight className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-1" />
                            <span className="text-slate-700">{route}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {locationAdvice.analysis.evacuation_plan.estimated_time && (
                      <div className="p-3 bg-indigo-100 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-indigo-700" />
                          <span className="font-medium text-indigo-800">
                            Estimated Travel Time: {locationAdvice.analysis.evacuation_plan.estimated_time}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Emergency Notice - Always Visible */}
      <Card className="border-red-300 bg-red-50 border-2">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="w-5 h-5" />
            🚨 Emergency Advisory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-red-100 rounded-lg">
            <p className="text-red-800 font-medium">{locationAdvice.emergency_note}</p>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-3">
            <Button 
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => window.open('tel:108', '_self')}
            >
              <Phone className="w-4 h-4 mr-2" />
              Call 108
            </Button>
            <Button 
              variant="outline" 
              className="border-red-300 text-red-600 hover:bg-red-50"
              onClick={() => window.open('tel:112', '_self')}
            >
              <Phone className="w-4 h-4 mr-2" />
              Call 112
            </Button>
            <Button 
              variant="outline" 
              className="border-red-300 text-red-600 hover:bg-red-50"
              onClick={() => {
                if (locationAdvice.request_info) {
                  const { latitude, longitude } = locationAdvice.request_info;
                  window.open(`https://www.google.com/maps/search/hospitals+near+me/@${latitude},${longitude},15z`, '_blank');
                }
              }}
            >
              <Navigation className="w-4 h-4 mr-2" />
              Find Hospitals
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};