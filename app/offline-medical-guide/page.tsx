"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Search,
  Heart,
  AlertTriangle,
  Phone,
  Clock,
  Thermometer,
  Bandage,
  Brain,
  Eye,
  Stethoscope,
  Scissors,
  Shield,
  Info,
  ChevronRight,
  ChevronDown,
  WifiOff,
  BookOpen,
  Star,
  MapPin,
} from "lucide-react";
import Link from "next/link";

interface MedicalCondition {
  id: string;
  title: string;
  category: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  icon: any;
  shortDescription: string;
  symptoms: string[];
  immediateSteps: string[];
  whenToCall108: string[];
  additionalTips?: string[];
  doNots?: string[];
}

const OfflineMedicalGuidePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedCondition, setExpandedCondition] = useState<string | null>(null);
  const [emergencyContacts, setEmergencyContacts] = useState<any[]>([]);

  // Load emergency contacts from localStorage
  useEffect(() => {
    const savedContacts = localStorage.getItem('emergency-contacts');
    if (savedContacts) {
      setEmergencyContacts(JSON.parse(savedContacts));
    }
  }, []);

  const medicalConditions: MedicalCondition[] = [
    // CRITICAL EMERGENCIES
    {
      id: "cardiac-arrest",
      title: "Cardiac Arrest / Heart Attack",
      category: "emergency",
      priority: "critical",
      icon: Heart,
      shortDescription: "Person is unconscious, not breathing, or has severe chest pain",
      symptoms: [
        "Severe chest pain or pressure",
        "No pulse or breathing",
        "Unconsciousness",
        "Blue lips or face",
        "Shortness of breath",
        "Nausea, sweating"
      ],
      immediateSteps: [
        "Call 108 IMMEDIATELY",
        "Check for responsiveness - tap shoulders and shout",
        "Check for breathing - look for chest movement for 10 seconds",
        "If no breathing, begin CPR immediately",
        "Place heel of hand on center of chest between nipples",
        "Push hard and fast at least 2 inches deep",
        "Give 30 chest compressions at 100-120 per minute",
        "Tilt head back, lift chin, give 2 rescue breaths",
        "Continue 30:2 ratio until help arrives"
      ],
      whenToCall108: [
        "No pulse or breathing",
        "Severe chest pain",
        "Unconsciousness",
        "Signs of heart attack"
      ],
      doNots: [
        "Don't give food or water",
        "Don't leave person alone",
        "Don't be afraid to break ribs during CPR"
      ]
    },
    {
      id: "choking",
      title: "Choking Emergency",
      category: "emergency",
      priority: "critical",
      icon: AlertTriangle,
      shortDescription: "Person cannot breathe, speak, or cough effectively",
      symptoms: [
        "Cannot speak or make sounds",
        "Weak, ineffective coughing",
        "High-pitched sounds when breathing",
        "Skin turning blue",
        "Hands clutching throat"
      ],
      immediateSteps: [
        "Ask 'Are you choking?' If they can speak/cough, encourage continued coughing",
        "If they cannot speak/breathe, perform Heimlich maneuver",
        "Stand behind person, wrap arms around waist",
        "Make fist with one hand, place thumb side below ribcage",
        "Grasp fist with other hand, thrust upward sharply",
        "Repeat until object is expelled or person becomes unconscious",
        "If unconscious, lower to ground and begin CPR",
        "Call 108 immediately"
      ],
      whenToCall108: [
        "Object won't come out after several attempts",
        "Person becomes unconscious",
        "Difficulty breathing continues"
      ]
    },
    {
      id: "severe-bleeding",
      title: "Severe Bleeding",
      category: "emergency",
      priority: "critical",
      icon: Bandage,
      shortDescription: "Heavy bleeding that won't stop with pressure",
      symptoms: [
        "Blood spurting from wound",
        "Bleeding that won't stop after 10 minutes",
        "Signs of shock (pale, clammy skin)",
        "Weakness or dizziness"
      ],
      immediateSteps: [
        "Call 108 for severe bleeding",
        "Put on gloves if available",
        "Remove any visible debris but not embedded objects",
        "Apply direct pressure with clean cloth or bandage",
        "Maintain firm, steady pressure",
        "If blood soaks through, add more layers without removing first",
        "Elevate wounded area above heart if possible",
        "Treat for shock - lay person down, elevate legs"
      ],
      whenToCall108: [
        "Bleeding won't stop after 10 minutes of direct pressure",
        "Signs of shock",
        "Deep wounds",
        "Embedded objects"
      ]
    },
    
    // RESPIRATORY EMERGENCIES
    {
      id: "asthma-attack",
      title: "Severe Asthma Attack",
      category: "respiratory",
      priority: "high",
      icon: Stethoscope,
      shortDescription: "Difficulty breathing, wheezing, cannot speak in full sentences",
      symptoms: [
        "Severe shortness of breath",
        "Cannot speak in full sentences",
        "Wheezing or gasping",
        "Blue lips or fingernails",
        "Anxiety or panic"
      ],
      immediateSteps: [
        "Help person sit upright, leaning slightly forward",
        "Help them use their rescue inhaler if available",
        "Encourage slow, deep breaths",
        "Stay calm and reassuring",
        "Loosen tight clothing",
        "If no improvement in 15 minutes, call 108"
      ],
      whenToCall108: [
        "No rescue inhaler available",
        "No improvement after using inhaler",
        "Person cannot speak",
        "Blue lips or face"
      ]
    },

    // INJURIES
    {
      id: "burns",
      title: "Burns (1st, 2nd, 3rd Degree)",
      category: "injury",
      priority: "medium",
      icon: Thermometer,
      shortDescription: "Thermal, chemical, or electrical burns requiring immediate care",
      symptoms: [
        "Redness and pain (1st degree)",
        "Blisters and severe pain (2nd degree)",
        "White/charred skin, no pain (3rd degree)"
      ],
      immediateSteps: [
        "Remove from heat source immediately",
        "Cool burn with cool (not cold) running water for 10-20 minutes",
        "Remove jewelry/clothing from burned area before swelling",
        "For 1st degree: Apply aloe vera, cover with sterile gauze",
        "For 2nd degree: Don't break blisters, apply antibiotic ointment",
        "For 3rd degree: Don't apply water, cover with clean dry cloth"
      ],
      whenToCall108: [
        "3rd degree burns",
        "Burns larger than 3 inches",
        "Burns on face, hands, feet, or genitals",
        "Chemical or electrical burns"
      ],
      doNots: [
        "Don't use ice",
        "Don't break blisters",
        "Don't apply butter or oils"
      ]
    },
    {
      id: "fractures",
      title: "Broken Bones / Fractures",
      category: "injury",
      priority: "medium",
      icon: Brain,
      shortDescription: "Suspected broken bone with pain, swelling, or deformity",
      symptoms: [
        "Severe pain",
        "Swelling and bruising",
        "Visible deformity",
        "Cannot move affected area",
        "Bone visible through skin"
      ],
      immediateSteps: [
        "Do NOT move the person unless in immediate danger",
        "Call 108 for obvious fractures or severe pain",
        "Immobilize the injured area",
        "Apply ice wrapped in cloth for 15-20 minutes",
        "Treat for shock if necessary",
        "Monitor breathing and pulse"
      ],
      whenToCall108: [
        "Bone visible through skin",
        "Numbness or inability to move",
        "Severe deformity",
        "Heavy bleeding"
      ],
      doNots: [
        "Don't try to realign broken bones",
        "Don't give food or water",
        "Don't move unless absolutely necessary"
      ]
    },

    // COMMON CONDITIONS
    {
      id: "fever",
      title: "High Fever",
      category: "common",
      priority: "medium",
      icon: Thermometer,
      shortDescription: "Body temperature above 101°F (38.3°C)",
      symptoms: [
        "Temperature above 101°F",
        "Chills and sweating",
        "Headache",
        "Muscle aches",
        "Fatigue"
      ],
      immediateSteps: [
        "Check temperature with thermometer",
        "Remove excess clothing",
        "Apply cool, damp cloths to forehead and wrists",
        "Encourage fluid intake",
        "Give fever reducer (acetaminophen/ibuprofen) as directed",
        "Monitor for worsening symptoms"
      ],
      whenToCall108: [
        "Temperature above 104°F (40°C)",
        "Difficulty breathing",
        "Severe headache",
        "Stiff neck",
        "Confusion or altered mental state"
      ],
      additionalTips: [
        "Drink plenty of fluids",
        "Rest in cool environment",
        "Take lukewarm baths"
      ]
    },
    {
      id: "allergic-reaction",
      title: "Allergic Reactions",
      category: "allergy",
      priority: "high",
      icon: Eye,
      shortDescription: "Mild to severe allergic reactions including anaphylaxis",
      symptoms: [
        "Skin rash or hives",
        "Itching and swelling",
        "Difficulty breathing (severe)",
        "Swelling of face/throat (severe)",
        "Rapid pulse (severe)"
      ],
      immediateSteps: [
        "Remove or avoid allergen if known",
        "For mild reactions: Take antihistamine (Benadryl)",
        "Apply cool compresses to itchy areas",
        "For severe reactions: Use epinephrine auto-injector if available",
        "Call 108 immediately for severe reactions",
        "Help person lie down with legs elevated"
      ],
      whenToCall108: [
        "Difficulty breathing",
        "Swelling of face, lips, or throat",
        "Rapid pulse or dizziness",
        "Widespread rash",
        "Loss of consciousness"
      ]
    },
    {
      id: "seizures",
      title: "Seizures / Convulsions",
      category: "neurological",
      priority: "high",
      icon: Brain,
      shortDescription: "Uncontrolled electrical activity in the brain",
      symptoms: [
        "Uncontrolled shaking",
        "Loss of consciousness",
        "Stiffening of body",
        "Confusion after episode",
        "Difficulty breathing during seizure"
      ],
      immediateSteps: [
        "Stay calm and time the seizure",
        "Clear area of dangerous objects",
        "Do NOT restrain the person",
        "Do NOT put anything in their mouth",
        "Turn person on side if possible",
        "Place something soft under their head",
        "Stay with person until fully conscious"
      ],
      whenToCall108: [
        "First-time seizure",
        "Seizure lasts longer than 5 minutes",
        "Person is injured during seizure",
        "Difficulty breathing after seizure",
        "Multiple seizures"
      ],
      doNots: [
        "Don't restrain the person",
        "Don't put anything in their mouth",
        "Don't give water or medication during seizure"
      ]
    }
  ];

  const categories = [
    { id: "all", label: "All Conditions", icon: BookOpen },
    { id: "emergency", label: "Critical Emergency", icon: AlertTriangle },
    { id: "respiratory", label: "Breathing Issues", icon: Stethoscope },
    { id: "injury", label: "Injuries", icon: Bandage },
    { id: "common", label: "Common Conditions", icon: Heart },
    { id: "allergy", label: "Allergies", icon: Eye },
    { id: "neurological", label: "Neurological", icon: Brain },
  ];

  // Filter conditions based on search and category
  const filteredConditions = medicalConditions.filter(condition => {
    const matchesSearch = condition.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         condition.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         condition.symptoms.some(symptom => symptom.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || condition.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Sort by priority
  const sortedConditions = filteredConditions.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const callEmergency = () => {
    window.open('tel:108', '_self');
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-lg border-b border-slate-200/60 px-3 sm:px-6 py-3 sm:py-4 z-20 shadow-sm">
        <div className="w-full max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="p-1.5 h-8 w-8 hover:bg-slate-100 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-slate-600" />
              </Button>
            </Link>
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-sm sm:text-xl text-slate-800 truncate">
                Offline Medical Guide
              </h1>
              <p className="text-xs text-slate-600 hidden sm:block">
                Complete first aid reference - Works without internet
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 text-xs text-red-600 bg-red-50 px-3 py-1 rounded-full">
              <WifiOff className="w-3 h-3" />
              <span>Offline Mode</span>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Banner */}
      <div className="bg-red-600 text-white px-3 sm:px-6 py-2">
        <div className="w-full max-w-6xl mx-auto text-center">
          <p className="text-sm font-medium">
            🚨 For Life-Threatening Emergencies: Call 108 Immediately
          </p>
        </div>
      </div>

      {/* Quick Emergency Action */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 sm:px-6 py-4">
        <div className="w-full max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={callEmergency}
              className="bg-white text-red-600 hover:bg-red-50 font-bold text-lg px-8 py-4 rounded-xl shadow-lg w-full sm:w-auto"
            >
              <Phone className="w-6 h-6 mr-3" />
              Call 108 Emergency
            </Button>
            <div className="text-center sm:text-left">
              <p className="text-sm opacity-90">
                Use this button for immediate emergency assistance
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 px-3 sm:px-6 py-4">
        <div className="w-full max-w-6xl mx-auto space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search conditions, symptoms, or treatments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            />
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  className={`flex-shrink-0 h-9 px-4 text-xs ${
                    selectedCategory === category.id
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 hover:text-slate-800"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 mr-2" />
                  {category.label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-3 sm:px-6 py-4 sm:py-6 overflow-y-auto">
        <div className="w-full max-w-6xl mx-auto space-y-4">
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 text-center border border-slate-200">
              <div className="text-2xl font-bold text-red-600">{medicalConditions.filter(c => c.priority === 'critical').length}</div>
              <div className="text-xs text-slate-600">Critical</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center border border-slate-200">
              <div className="text-2xl font-bold text-orange-600">{medicalConditions.filter(c => c.priority === 'high').length}</div>
              <div className="text-xs text-slate-600">High Priority</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center border border-slate-200">
              <div className="text-2xl font-bold text-blue-600">{medicalConditions.length}</div>
              <div className="text-xs text-slate-600">Total Conditions</div>
            </div>
            <div className="bg-white rounded-lg p-4 text-center border border-slate-200">
              <div className="text-2xl font-bold text-green-600">24/7</div>
              <div className="text-xs text-slate-600">Available</div>
            </div>
          </div>

          {/* Conditions List */}
          <div className="space-y-4">
            {sortedConditions.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Search className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-600 mb-2">No conditions found</h3>
                  <p className="text-slate-500">Try adjusting your search terms or category filter.</p>
                </CardContent>
              </Card>
            ) : (
              sortedConditions.map((condition) => {
                const Icon = condition.icon;
                const isExpanded = expandedCondition === condition.id;

                return (
                  <Card key={condition.id} className="border-2 hover:shadow-lg transition-all duration-200">
                    <CardHeader 
                      className="cursor-pointer"
                      onClick={() => setExpandedCondition(isExpanded ? null : condition.id)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-slate-100">
                          <Icon className="w-6 h-6 text-slate-700" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-lg font-bold">{condition.title}</CardTitle>
                            <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(condition.priority)}`}>
                              {condition.priority.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 mb-2">{condition.shortDescription}</p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <Clock className="w-3 h-3" />
                              <span>Immediate action required</span>
                            </div>
                            {isExpanded ? (
                              <ChevronDown className="w-5 h-5 text-slate-400" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    {isExpanded && (
                      <CardContent className="pt-0">
                        <div className="space-y-6">
                          
                          {/* Emergency Call Button for Critical Conditions */}
                          {condition.priority === 'critical' && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-semibold text-red-800 mb-1">⚠️ Critical Emergency</h4>
                                  <p className="text-sm text-red-700">Call 108 immediately for this condition</p>
                                </div>
                                <Button onClick={callEmergency} className="bg-red-600 hover:bg-red-700">
                                  <Phone className="w-4 h-4 mr-2" />
                                  Call 108
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Symptoms */}
                          <div>
                            <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                              <Eye className="w-4 h-4" />
                              Symptoms to Look For
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {condition.symptoms.map((symptom, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                                  <span>{symptom}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Immediate Steps */}
                          <div>
                            <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                              <Shield className="w-4 h-4" />
                              Immediate Action Steps
                            </h4>
                            <div className="space-y-3">
                              {condition.immediateSteps.map((step, index) => (
                                <div key={index} className="flex gap-3">
                                  <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                                    {index + 1}
                                  </div>
                                  <p className="text-sm text-slate-700 leading-relaxed">{step}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* When to Call 108 */}
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <h4 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4" />
                              Call 108 Immediately If:
                            </h4>
                            <div className="space-y-2">
                              {condition.whenToCall108.map((reason, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm">
                                  <div className="w-2 h-2 bg-yellow-600 rounded-full flex-shrink-0"></div>
                                  <span className="text-yellow-800">{reason}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Do NOTs */}
                          {condition.doNots && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                              <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                Important: DO NOT
                              </h4>
                              <div className="space-y-2">
                                {condition.doNots.map((dont, index) => (
                                  <div key={index} className="flex items-center gap-2 text-sm">
                                    <div className="w-2 h-2 bg-red-600 rounded-full flex-shrink-0"></div>
                                    <span className="text-red-800">{dont}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Additional Tips */}
                          {condition.additionalTips && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                                <Info className="w-4 h-4" />
                                Additional Tips
                              </h4>
                              <div className="space-y-2">
                                {condition.additionalTips.map((tip, index) => (
                                  <div key={index} className="flex items-center gap-2 text-sm">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                                    <span className="text-blue-800">{tip}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })
            )}
          </div>

          {/* Emergency Contacts Section */}
          {emergencyContacts.length > 0 && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Your Emergency Contacts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {emergencyContacts.slice(0, 3).map((contact, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium">{contact.name}</p>
                        <p className="text-sm text-slate-600">{contact.relationship}</p>
                      </div>
                      <Button
                        onClick={() => window.open(`tel:${contact.phone}`, '_self')}
                        size="sm"
                        variant="outline"
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Call
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Important Disclaimer */}
          <div className="bg-gradient-to-r from-slate-100 to-slate-200 border border-slate-300 rounded-xl p-6 text-center mt-8">
            <Shield className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800 mb-2">Important Medical Disclaimer</h3>
            <p className="text-slate-700 text-sm leading-relaxed">
              This guide provides basic first aid information for emergency situations when professional help may not be immediately available. 
              It is not a substitute for professional medical care. Always seek immediate medical attention for serious injuries or conditions.
              In life-threatening emergencies, call 108 immediately.
            </p>
            <div className="mt-4 text-xs text-slate-600">
              This guide works offline and has been designed for emergency use when internet connection is not available.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfflineMedicalGuidePage;