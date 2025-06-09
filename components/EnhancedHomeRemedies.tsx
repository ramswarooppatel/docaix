"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Home,
  Leaf,
  Clock,
  ShoppingCart,
  AlertTriangle,
  CheckCircle,
  Star,
  Heart,
  Droplet,
  Thermometer,
  Moon,
  Utensils,
  Package,
  Timer,
  Eye,
  Shield,
  Lightbulb,
  Plus,
  ChevronRight,
  ExternalLink,
  X,
} from "lucide-react";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

interface HomeRemediesProps {
  enhancedAdvice: {
    severity_assessment: {
      severity_level: string;
      can_treat_at_home: boolean;
      severity_score?: string;
    };
    home_remedies: {
      immediate_relief: string[];
      natural_treatments?: string[];
      dietary_remedies?: string[];
      lifestyle_adjustments?: string[];
    };
    needed_products: {
      pharmacy_items: string[];
      household_items?: string[];
      herbal_supplements?: string[];
      grocery_items?: string[];
    };
    step_by_step_treatment: string[];
    warning_signs: string[];
    recovery_timeline?: {
      expected_improvement: string;
      full_recovery: string;
      monitoring_frequency: string;
    };
    prevention_tips?: string[];
  };
}

export const EnhancedHomeRemedies: React.FC<HomeRemediesProps> = ({
  enhancedAdvice,
}) => {
  const [activeTab, setActiveTab] = useState("immediate");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Add safety checks for enhancedAdvice structure
  if (!enhancedAdvice) {
    console.error("EnhancedHomeRemedies: enhancedAdvice is undefined");
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">Enhanced advice data is not available.</p>
      </div>
    );
  }

  if (!enhancedAdvice.severity_assessment) {
    console.error("EnhancedHomeRemedies: severity_assessment is undefined", enhancedAdvice);
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">Enhanced advice data structure is incomplete.</p>
      </div>
    );
  }

  // Add TTS hook
  const { speak, isSpeaking, isPaused, pause, resume, stop } = useTextToSpeech();

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
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
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-blue-600 bg-blue-50 border-blue-200";
    }
  };

  const tabs = [
    { id: "immediate", label: "Quick Relief", icon: Clock },
    { id: "natural", label: "Natural Care", icon: Leaf },
    { id: "lifestyle", label: "Lifestyle", icon: Heart },
    { id: "products", label: "What You Need", icon: ShoppingCart },
    { id: "timeline", label: "Recovery", icon: Timer },
  ];

  const handleSpeakHomeRemedies = () => {
    const remediesText = `
      Enhanced home treatment plan for ${enhancedAdvice.severity_assessment.severity_level} severity condition.
      
      ${enhancedAdvice.severity_assessment.can_treat_at_home ? 
        "This condition can be treated at home with proper care." : 
        "Medical attention may be required for this condition."}
      
      Immediate relief options: ${enhancedAdvice.home_remedies?.immediate_relief?.slice(0, 3).join('. ') || 'Consult healthcare provider.'}
      
      ${enhancedAdvice.needed_products?.pharmacy_items ? 
        `Recommended pharmacy items: ${enhancedAdvice.needed_products.pharmacy_items.slice(0, 3).join(', ')}.` : ''}
      
      ${enhancedAdvice.step_by_step_treatment ? 
        `Treatment steps: ${enhancedAdvice.step_by_step_treatment.slice(0, 3).join('. ')}.` : ''}
      
      ${enhancedAdvice.warning_signs ? 
        `Warning signs to watch for: ${enhancedAdvice.warning_signs.slice(0, 2).join('. ')}.` : ''}
      
      Remember to seek professional medical help if symptoms worsen or persist.
    `;

    if (isSpeaking) {
      if (isPaused) {
        resume();
      } else {
        pause();
      }
    } else {
      speak(remediesText);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Severity Assessment */}
      <Card className={`border-l-4 ${getSeverityColor(enhancedAdvice.severity_assessment.severity_level)}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Home className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Enhanced Home Treatment Plan</h3>
                  <p className="text-sm text-slate-600 mt-1">Comprehensive care guidance with natural remedies</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Speech Control Button */}
                <Button
                  onClick={handleSpeakHomeRemedies}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {isSpeaking ? (
                    isPaused ? (
                      <>
                        <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
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

                <div className={`px-3 py-1 rounded-full border ${getSeverityColor(enhancedAdvice.severity_assessment.severity_level)}`}>
                  <span className="text-sm font-medium">
                    {enhancedAdvice.severity_assessment.severity_level} Severity
                  </span>
                </div>
              </div>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              {enhancedAdvice.severity_assessment.can_treat_at_home ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600" />
              )}
              <span className={enhancedAdvice.severity_assessment.can_treat_at_home ? "text-green-700" : "text-red-700"}>
                {enhancedAdvice.severity_assessment.can_treat_at_home ? "Safe for home treatment" : "Professional care recommended"}
              </span>
            </div>
            {enhancedAdvice.severity_assessment.severity_score && (
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-slate-600">Score: {enhancedAdvice.severity_assessment.severity_score}</span>
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
                ? "bg-white shadow-sm text-blue-600"
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
        {/* Immediate Relief Tab */}
        {activeTab === "immediate" && (
          <div className="space-y-4">
            <Card className="border-green-200 bg-green-50/30">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <Clock className="w-5 h-5" />
                  Immediate Relief Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {enhancedAdvice.home_remedies.immediate_relief.map((remedy, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-200">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-green-600">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-700 leading-relaxed">{remedy}</p>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Step by Step Treatment */}
            <Card className="border-blue-200 bg-blue-50/30">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <Shield className="w-5 h-5" />
                  Step-by-Step Treatment Protocol
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {enhancedAdvice.step_by_step_treatment.map((step, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 bg-white rounded-lg border border-blue-200">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="font-bold text-blue-600">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-700 font-medium">{step}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1.5" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Natural Treatments Tab */}
        {activeTab === "natural" && enhancedAdvice.home_remedies.natural_treatments && (
          <div className="space-y-4">
            <Card className="border-emerald-200 bg-emerald-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-800">
                  <Leaf className="w-5 h-5" />
                  Natural Healing Solutions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {enhancedAdvice.home_remedies.natural_treatments.map((treatment, index) => (
                    <div key={index} className="p-4 bg-white rounded-lg border border-emerald-200 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        <Leaf className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-1" />
                        <div>
                          <p className="text-slate-700 font-medium">{treatment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Dietary Remedies */}
            {enhancedAdvice.home_remedies.dietary_remedies && (
              <Card className="border-orange-200 bg-orange-50/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-800">
                    <Utensils className="w-5 h-5" />
                    Healing Foods & Nutrition
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-3">
                    {enhancedAdvice.home_remedies.dietary_remedies.map((remedy, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-orange-200">
                        <Droplet className="w-4 h-4 text-orange-600" />
                        <span className="text-slate-700">{remedy}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Lifestyle Tab */}
        {activeTab === "lifestyle" && enhancedAdvice.home_remedies.lifestyle_adjustments && (
          <Card className="border-purple-200 bg-purple-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <Heart className="w-5 h-5" />
                Lifestyle & Recovery Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {enhancedAdvice.home_remedies.lifestyle_adjustments.map((adjustment, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-white rounded-lg border border-purple-200">
                    <Moon className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <p className="text-slate-700">{adjustment}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Products Tab */}
        {activeTab === "products" && (
          <div className="space-y-4">
            {/* Pharmacy Items */}
            <Card className="border-red-200 bg-red-50/30">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-red-800">
                    <Package className="w-5 h-5" />
                    Pharmacy Essentials
                  </div>
                  <Button size="sm" variant="outline" className="text-red-600 border-red-300">
                    <ShoppingCart className="w-4 h-4 mr-1" />
                    Quick Order
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {enhancedAdvice.needed_products.pharmacy_items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                      <div className="flex items-center gap-3">
                        <Thermometer className="w-4 h-4 text-red-600" />
                        <span className="text-slate-700 font-medium">{item}</span>
                      </div>
                      <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50">
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Household Items */}
            {enhancedAdvice.needed_products.household_items && (
              <Card className="border-blue-200 bg-blue-50/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Home className="w-5 h-5" />
                    Household Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-3">
                    {enhancedAdvice.needed_products.household_items.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-200">
                        <Home className="w-4 h-4 text-blue-600" />
                        <span className="text-slate-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Grocery Items */}
            {enhancedAdvice.needed_products.grocery_items && (
              <Card className="border-green-200 bg-green-50/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <Utensils className="w-5 h-5" />
                    Grocery & Nutrition
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-3">
                    {enhancedAdvice.needed_products.grocery_items.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-200">
                        <Droplet className="w-4 h-4 text-green-600" />
                        <span className="text-slate-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Recovery Timeline Tab */}
        {activeTab === "timeline" && enhancedAdvice.recovery_timeline && (
          <Card className="border-indigo-200 bg-indigo-50/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-800">
                <Timer className="w-5 h-5" />
                Recovery Timeline & Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg border border-indigo-200">
                    <Clock className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                    <h4 className="font-semibold text-indigo-800 mb-1">Expected Improvement</h4>
                    <p className="text-sm text-slate-600">{enhancedAdvice.recovery_timeline.expected_improvement}</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border border-indigo-200">
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <h4 className="font-semibold text-indigo-800 mb-1">Full Recovery</h4>
                    <p className="text-sm text-slate-600">{enhancedAdvice.recovery_timeline.full_recovery}</p>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border border-indigo-200">
                    <Eye className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <h4 className="font-semibold text-indigo-800 mb-1">Check Frequency</h4>
                    <p className="text-sm text-slate-600">{enhancedAdvice.recovery_timeline.monitoring_frequency}</p>
                  </div>
                </div>

                {/* Prevention Tips */}
                {enhancedAdvice.prevention_tips && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-indigo-800 mb-3 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      Prevention Tips for Future
                    </h4>
                    <div className="grid md:grid-cols-2 gap-3">
                      {enhancedAdvice.prevention_tips.map((tip, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-indigo-200">
                          <Shield className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-1" />
                          <span className="text-slate-700">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Warning Signs - Always Visible */}
      <Card className="border-red-300 bg-red-50 border-2">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="w-5 h-5" />
            ⚠️ Warning Signs - Seek Immediate Help
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {enhancedAdvice.warning_signs.map((sign, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-red-100 rounded-lg border border-red-200">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-1" />
                <span className="text-red-800 font-medium">{sign}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-red-200 rounded-lg">
            <p className="text-red-800 text-sm font-medium text-center">
              🚨 If any of these symptoms appear, contact emergency services immediately or visit the nearest hospital
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};