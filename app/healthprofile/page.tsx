"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 

  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Heart, 
  Activity, 
  Pill, 
  AlertTriangle, 
  TrendingUp,
  Calendar,
  Weight,
  Ruler,
  Brain,
  Apple,
  Dumbbell,
  Shield,
  Eye,
  Clock,
  CheckCircle,
  Loader2,
  Plus,
  X
} from "lucide-react";

interface HealthProfileForm {
  age: number | "";
  gender: string;
  weight: number | "";
  height: number | "";
  medical_conditions: string[];
  medications: string[];
  allergies: string[];
  lifestyle: {
    activity_level: string;
    smoking: string;
    alcohol: string;
    sleep_hours: string;
  };
}

interface ApiResponse {
  profile: {
    age: number;
    gender: string;
    weight: number;
    height: number;
    bmi: number;
    bmi_category: string;
    medical_conditions: string[];
    medications: string[];
    allergies: string[];
    lifestyle: {
      activity_level: string;
      smoking: string;
      alcohol: string;
      sleep_hours: string;
    };
  };
  recommendations: {
    general_health_tips: string[];
    diet_plan: {
      breakfast: string[];
      lunch: string[];
      dinner: string[];
      snacks: string[];
      foods_to_avoid: string[];
    };
    exercise_recommendations: string[];
    lifestyle_changes: string[];
    medical_precautions: string[];
    health_monitoring: string[];
  };
  disclaimer: string;
  generated_at: string;
}

const HealthProfilePage = () => {
  const [formData, setFormData] = useState<HealthProfileForm>({
    age: "",
    gender: "",
    weight: "",
    height: "",
    medical_conditions: [],
    medications: [],
    allergies: [],
    lifestyle: {
      activity_level: "",
      smoking: "",
      alcohol: "",
      sleep_hours: "",
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string>("");

  // Input states for adding items
  const [newCondition, setNewCondition] = useState("");
  const [newMedication, setNewMedication] = useState("");
  const [newAllergy, setNewAllergy] = useState("");

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLifestyleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      lifestyle: {
        ...prev.lifestyle,
        [field]: value,
      },
    }));
  };

  const addArrayItem = (array: keyof Pick<HealthProfileForm, 'medical_conditions' | 'medications' | 'allergies'>, item: string) => {
    if (item.trim()) {
      setFormData(prev => ({
        ...prev,
        [array]: [...prev[array], item.trim()],
      }));
    }
  };

  const removeArrayItem = (array: keyof Pick<HealthProfileForm, 'medical_conditions' | 'medications' | 'allergies'>, index: number) => {
    setFormData(prev => ({
      ...prev,
      [array]: prev[array].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const payload = {
        ...formData,
        age: formData.age ? Number(formData.age) : undefined,
        weight: formData.weight ? Number(formData.weight) : undefined,
        height: formData.height ? Number(formData.height) : undefined,
      };

      // Remove empty fields
      Object.keys(payload).forEach(key => {
        if (payload[key as keyof typeof payload] === "" || payload[key as keyof typeof payload] === undefined) {
          delete payload[key as keyof typeof payload];
        }
      });

      const response = await fetch("/api/health-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error("Error analyzing health profile:", err);
      setError("Failed to analyze health profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getBMIColor = (bmi: number) => {
    if (bmi < 18.5) return "text-blue-600";
    if (bmi < 25) return "text-green-600";
    if (bmi < 30) return "text-yellow-600";
    return "text-red-600";
  };

  // Add this useEffect to save to localStorage when results are available
  useEffect(() => {
    if (results) {
      // Save the complete health profile data to localStorage
      const healthProfileData = {
        formData,
        results,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem('healthProfile', JSON.stringify(healthProfileData));
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('healthProfileUpdated', {
        detail: healthProfileData
      }));
    }
  }, [results, formData]);

  // Add this useEffect to load saved data on component mount
  useEffect(() => {
    const loadSavedProfile = () => {
      try {
        const savedProfile = localStorage.getItem('healthProfile');
        if (savedProfile) {
          const parsedProfile = JSON.parse(savedProfile);
          if (parsedProfile.formData && parsedProfile.results) {
            // Check if data is not too old (optional - remove this check if you want persistent data)
            const savedDate = new Date(parsedProfile.timestamp);
            const daysDiff = (Date.now() - savedDate.getTime()) / (1000 * 60 * 60 * 24);
            
            if (daysDiff < 30) { // Keep data for 30 days
              setFormData(parsedProfile.formData);
              setResults(parsedProfile.results);
            }
          }
        }
      } catch (error) {
        console.error('Error loading saved health profile:', error);
      }
    };

    loadSavedProfile();
  }, []);

  // Add this function to clear saved profile
  const clearSavedProfile = () => {
    localStorage.removeItem('healthProfile');
    window.dispatchEvent(new CustomEvent('healthProfileUpdated', {
      detail: null
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800">Health Profile Analysis</h1>
          </div>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Get personalized health recommendations based on your medical profile. 
            Fill out the form below to receive AI-powered insights and guidance.
          </p>
        </div>

        {!results ? (
          /* Health Profile Form */
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Personal Health Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age" className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Age
                    </Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.age}
                      onChange={(e) => handleInputChange("age", e.target.value)}
                      placeholder="Enter your age"
                      min="1"
                      max="120"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Gender
                    </Label>
                    <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                        <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight" className="flex items-center gap-2">
                      <Weight className="w-4 h-4" />
                      Weight (kg)
                    </Label>
                    <Input
                      id="weight"
                      type="number"
                      value={formData.weight}
                      onChange={(e) => handleInputChange("weight", e.target.value)}
                      placeholder="Enter weight"
                      min="1"
                      step="0.1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="height" className="flex items-center gap-2">
                      <Ruler className="w-4 h-4" />
                      Height (cm)
                    </Label>
                    <Input
                      id="height"
                      type="number"
                      value={formData.height}
                      onChange={(e) => handleInputChange("height", e.target.value)}
                      placeholder="Enter height"
                      min="1"
                      step="0.1"
                    />
                  </div>
                </div>

                {/* Medical Conditions */}
                <div className="space-y-4">
                  <Label className="flex items-center gap-2 text-base font-semibold">
                    <Heart className="w-5 h-5 text-red-500" />
                    Medical Conditions
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={newCondition}
                      onChange={(e) => setNewCondition(e.target.value)}
                      placeholder="Add medical condition (e.g., Hypertension, Diabetes)"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addArrayItem("medical_conditions", newCondition);
                          setNewCondition("");
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        addArrayItem("medical_conditions", newCondition);
                        setNewCondition("");
                      }}
                      size="sm"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.medical_conditions.map((condition, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        {condition}
                        <button
                          type="button"
                          onClick={() => removeArrayItem("medical_conditions", index)}
                          className="ml-1 hover:bg-red-100 rounded-full p-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Medications */}
                <div className="space-y-4">
                  <Label className="flex items-center gap-2 text-base font-semibold">
                    <Pill className="w-5 h-5 text-blue-500" />
                    Current Medications
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={newMedication}
                      onChange={(e) => setNewMedication(e.target.value)}
                      placeholder="Add medication (e.g., Metformin, Lisinopril)"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addArrayItem("medications", newMedication);
                          setNewMedication("");
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        addArrayItem("medications", newMedication);
                        setNewMedication("");
                      }}
                      size="sm"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.medications.map((medication, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        {medication}
                        <button
                          type="button"
                          onClick={() => removeArrayItem("medications", index)}
                          className="ml-1 hover:bg-red-100 rounded-full p-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Allergies */}
                <div className="space-y-4">
                  <Label className="flex items-center gap-2 text-base font-semibold">
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    Allergies
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={newAllergy}
                      onChange={(e) => setNewAllergy(e.target.value)}
                      placeholder="Add allergy (e.g., Penicillin, Peanuts)"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addArrayItem("allergies", newAllergy);
                          setNewAllergy("");
                        }
                      }}
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        addArrayItem("allergies", newAllergy);
                        setNewAllergy("");
                      }}
                      size="sm"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.allergies.map((allergy, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        {allergy}
                        <button
                          type="button"
                          onClick={() => removeArrayItem("allergies", index)}
                          className="ml-1 hover:bg-red-100 rounded-full p-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Lifestyle Information */}
                <div className="space-y-6">
                  <Label className="flex items-center gap-2 text-base font-semibold">
                    <Activity className="w-5 h-5 text-green-500" />
                    Lifestyle Information
                  </Label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Activity Level</Label>
                      <Select value={formData.lifestyle.activity_level} onValueChange={(value) => handleLifestyleChange("activity_level", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select activity level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Sedentary">Sedentary</SelectItem>
                          <SelectItem value="Light">Light</SelectItem>
                          <SelectItem value="Moderate">Moderate</SelectItem>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Very Active">Very Active</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Smoking Status</Label>
                      <Select value={formData.lifestyle.smoking} onValueChange={(value) => handleLifestyleChange("smoking", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select smoking status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="No">No</SelectItem>
                          <SelectItem value="Occasionally">Occasionally</SelectItem>
                          <SelectItem value="Regularly">Regularly</SelectItem>
                          <SelectItem value="Former smoker">Former smoker</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Alcohol Consumption</Label>
                      <Select value={formData.lifestyle.alcohol} onValueChange={(value) => handleLifestyleChange("alcohol", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select alcohol consumption" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="No">No</SelectItem>
                          <SelectItem value="Occasional">Occasional</SelectItem>
                          <SelectItem value="Moderate">Moderate</SelectItem>
                          <SelectItem value="Regular">Regular</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Sleep Hours</Label>
                      <Select value={formData.lifestyle.sleep_hours} onValueChange={(value) => handleLifestyleChange("sleep_hours", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sleep hours" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Less than 5 hours">Less than 5 hours</SelectItem>
                          <SelectItem value="5-6 hours">5-6 hours</SelectItem>
                          <SelectItem value="6-7 hours">6-7 hours</SelectItem>
                          <SelectItem value="7-8 hours">7-8 hours</SelectItem>
                          <SelectItem value="8-9 hours">8-9 hours</SelectItem>
                          <SelectItem value="More than 9 hours">More than 9 hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-700">
                      <AlertTriangle className="w-5 h-5" />
                      <span>{error}</span>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-center">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Analyzing Profile...
                      </>
                    ) : (
                      <>
                        <Brain className="w-5 h-5 mr-2" />
                        Analyze Health Profile
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          /* Results Display */
          <div className="space-y-6">
            {/* Profile Summary */}
            <Card className="shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Your Health Profile Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-700">{results.profile.age}</div>
                    <div className="text-sm text-blue-600">Years Old</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Weight className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-700">{results.profile.weight}kg</div>
                    <div className="text-sm text-purple-600">Weight</div>
                  </div>
                  <div className="text-center p-4 bg-indigo-50 rounded-lg">
                    <Ruler className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-indigo-700">{results.profile.height}cm</div>
                    <div className="text-sm text-indigo-600">Height</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <TrendingUp className={`w-8 h-8 mx-auto mb-2 ${getBMIColor(results.profile.bmi)}`} />
                    <div className={`text-2xl font-bold ${getBMIColor(results.profile.bmi)}`}>{results.profile.bmi}</div>
                    <div className={`text-sm ${getBMIColor(results.profile.bmi)}`}>{results.profile.bmi_category}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* General Health Tips */}
              <Card className="shadow-lg">
                <CardHeader className="bg-blue-50">
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-blue-600" />
                    General Health Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <ul className="space-y-2">
                    {results.recommendations.general_health_tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Exercise Recommendations */}
              <Card className="shadow-lg">
                <CardHeader className="bg-green-50">
                  <CardTitle className="flex items-center gap-2">
                    <Dumbbell className="w-5 h-5 text-green-600" />
                    Exercise Plan
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <ul className="space-y-2">
                    {results.recommendations.exercise_recommendations.map((exercise, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Activity className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{exercise}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Diet Plan */}
              <Card className="shadow-lg lg:col-span-2">
                <CardHeader className="bg-orange-50">
                  <CardTitle className="flex items-center gap-2">
                    <Apple className="w-5 h-5 text-orange-600" />
                    Personalized Diet Plan
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-semibold text-orange-700 mb-2">🌅 Breakfast</h4>
                      <ul className="space-y-1">
                        {results.recommendations.diet_plan.breakfast.map((item, index) => (
                          <li key={index} className="text-sm text-slate-600">• {item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-orange-700 mb-2">🌤️ Lunch</h4>
                      <ul className="space-y-1">
                        {results.recommendations.diet_plan.lunch.map((item, index) => (
                          <li key={index} className="text-sm text-slate-600">• {item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-orange-700 mb-2">🌙 Dinner</h4>
                      <ul className="space-y-1">
                        {results.recommendations.diet_plan.dinner.map((item, index) => (
                          <li key={index} className="text-sm text-slate-600">• {item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-700 mb-2">🍎 Snacks</h4>
                      <ul className="space-y-1">
                        {results.recommendations.diet_plan.snacks.map((item, index) => (
                          <li key={index} className="text-sm text-slate-600">• {item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-red-700 mb-2">🚫 Avoid</h4>
                      <ul className="space-y-1">
                        {results.recommendations.diet_plan.foods_to_avoid.map((item, index) => (
                          <li key={index} className="text-sm text-slate-600">• {item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Medical Precautions */}
              <Card className="shadow-lg">
                <CardHeader className="bg-red-50">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-red-600" />
                    Medical Precautions
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <ul className="space-y-2">
                    {results.recommendations.medical_precautions.map((precaution, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{precaution}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Health Monitoring */}
              <Card className="shadow-lg">
                <CardHeader className="bg-purple-50">
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-purple-600" />
                    Health Monitoring
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <ul className="space-y-2">
                    {results.recommendations.health_monitoring.map((monitor, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Clock className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{monitor}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Disclaimer */}
            <Card className="shadow-lg border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-yellow-800 mb-2">Important Disclaimer</h3>
                    <p className="text-sm text-yellow-700">{results.disclaimer}</p>
                    <p className="text-xs text-yellow-600 mt-2">Generated on: {results.generated_at}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* New Analysis Button */}
            <div className="text-center">
              <Button
                onClick={() => {
                  setResults(null);
                  setFormData({
                    age: "",
                    gender: "",
                    weight: "",
                    height: "",
                    medical_conditions: [],
                    medications: [],
                    allergies: [],
                    lifestyle: {
                      activity_level: "",
                      smoking: "",
                      alcohol: "",
                      sleep_hours: "",
                    },
                  });
                  clearSavedProfile(); // Add this line
                }}
                className="px-6 py-2 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800"
              >
                Create New Analysis
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthProfilePage;