"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Calculator,
  Heart,
  Activity,
  Users,
  Baby,
  Scale,
  Thermometer,
  Droplet,
  Brain,
  Eye,
  Zap,
  Target,
  Clock,
  AlertTriangle,
  CheckCircle,
  Info,
  TrendingUp,
  BarChart3,
  Gauge,
  Stethoscope,
  Calendar,
} from "lucide-react";
import Link from "next/link";

const CalculatorsPage = () => {
  const [activeCalculator, setActiveCalculator] = useState("bmi");
  const [results, setResults] = useState<{ [key: string]: any }>({});

  // BMI Calculator State
  const [bmiData, setBmiData] = useState({
    weight: "",
    height: "",
    unit: "metric"
  });

  // Body Fat Calculator State
  const [bodyFatData, setBodyFatData] = useState({
    gender: "",
    age: "",
    weight: "",
    height: "",
    neck: "",
    waist: "",
    hip: ""
  });

  // Heart Rate Zones Calculator State
  const [heartRateData, setHeartRateData] = useState({
    age: "",
    restingHR: ""
  });

  // Blood Pressure Risk Calculator State
  const [bpData, setBpData] = useState({
    systolic: "",
    diastolic: "",
    age: "",
    gender: ""
  });

  // Calorie Calculator State
  const [calorieData, setCalorieData] = useState({
    age: "",
    gender: "",
    weight: "",
    height: "",
    activity: ""
  });

  // Water Intake Calculator State
  const [waterData, setWaterData] = useState({
    weight: "",
    activity: "",
    climate: ""
  });

  // Pregnancy Calculator State
  const [pregnancyData, setPregnancyData] = useState({
    lastPeriod: "",
    cycleLength: "28"
  });

  // Calculate BMI
  const calculateBMI = () => {
    const weight = parseFloat(bmiData.weight);
    const height = parseFloat(bmiData.height);
    
    if (!weight || !height) return;

    let heightInMeters = height;
    let weightInKg = weight;

    if (bmiData.unit === "imperial") {
      heightInMeters = height * 0.0254; // inches to meters
      weightInKg = weight * 0.453592; // pounds to kg
    } else {
      heightInMeters = height / 100; // cm to meters
    }

    const bmi = weightInKg / (heightInMeters * heightInMeters);
    
    let category = "";
    let color = "";
    let advice = "";

    if (bmi < 18.5) {
      category = "Underweight";
      color = "text-blue-600";
      advice = "Consider consulting a healthcare provider for healthy weight gain strategies.";
    } else if (bmi < 25) {
      category = "Normal Weight";
      color = "text-green-600";
      advice = "Maintain your current weight with regular exercise and balanced nutrition.";
    } else if (bmi < 30) {
      category = "Overweight";
      color = "text-yellow-600";
      advice = "Consider lifestyle changes including diet and exercise modifications.";
    } else {
      category = "Obese";
      color = "text-red-600";
      advice = "Consult healthcare providers for comprehensive weight management plan.";
    }

    setResults({
      ...results,
      bmi: {
        value: bmi.toFixed(1),
        category,
        color,
        advice
      }
    });
  };

  // Calculate Body Fat Percentage (Navy Method)
  const calculateBodyFat = () => {
    const { gender, weight, height, neck, waist, hip } = bodyFatData;
    
    if (!weight || !height || !neck || !waist || (gender === "female" && !hip)) return;

    let bodyFat = 0;

    if (gender === "male") {
      bodyFat = 495 / (1.0324 - 0.19077 * Math.log10(parseFloat(waist) - parseFloat(neck)) + 0.15456 * Math.log10(parseFloat(height))) - 450;
    } else {
      bodyFat = 495 / (1.29579 - 0.35004 * Math.log10(parseFloat(waist) + parseFloat(hip) - parseFloat(neck)) + 0.22100 * Math.log10(parseFloat(height))) - 450;
    }

    let category = "";
    let color = "";

    if (gender === "male") {
      if (bodyFat < 6) { category = "Essential Fat"; color = "text-red-600"; }
      else if (bodyFat < 14) { category = "Athletes"; color = "text-green-600"; }
      else if (bodyFat < 18) { category = "Fitness"; color = "text-green-500"; }
      else if (bodyFat < 25) { category = "Average"; color = "text-yellow-600"; }
      else { category = "Obese"; color = "text-red-600"; }
    } else {
      if (bodyFat < 14) { category = "Essential Fat"; color = "text-red-600"; }
      else if (bodyFat < 21) { category = "Athletes"; color = "text-green-600"; }
      else if (bodyFat < 25) { category = "Fitness"; color = "text-green-500"; }
      else if (bodyFat < 32) { category = "Average"; color = "text-yellow-600"; }
      else { category = "Obese"; color = "text-red-600"; }
    }

    setResults({
      ...results,
      bodyFat: {
        value: bodyFat.toFixed(1),
        category,
        color
      }
    });
  };

  // Calculate Heart Rate Zones
  const calculateHeartRateZones = () => {
    const age = parseInt(heartRateData.age);
    const restingHR = parseInt(heartRateData.restingHR) || 70;
    
    if (!age) return;

    const maxHR = 220 - age;
    const hrReserve = maxHR - restingHR;

    const zones = [
      { name: "Recovery", min: Math.round(restingHR + hrReserve * 0.5), max: Math.round(restingHR + hrReserve * 0.6), color: "bg-blue-100 text-blue-800" },
      { name: "Aerobic Base", min: Math.round(restingHR + hrReserve * 0.6), max: Math.round(restingHR + hrReserve * 0.7), color: "bg-green-100 text-green-800" },
      { name: "Aerobic", min: Math.round(restingHR + hrReserve * 0.7), max: Math.round(restingHR + hrReserve * 0.8), color: "bg-yellow-100 text-yellow-800" },
      { name: "Threshold", min: Math.round(restingHR + hrReserve * 0.8), max: Math.round(restingHR + hrReserve * 0.9), color: "bg-orange-100 text-orange-800" },
      { name: "VO2 Max", min: Math.round(restingHR + hrReserve * 0.9), max: maxHR, color: "bg-red-100 text-red-800" }
    ];

    setResults({
      ...results,
      heartRate: {
        maxHR,
        restingHR,
        zones
      }
    });
  };

  // Calculate Blood Pressure Risk
  const calculateBPRisk = () => {
    const systolic = parseInt(bpData.systolic);
    const diastolic = parseInt(bpData.diastolic);
    
    if (!systolic || !diastolic) return;

    let category = "";
    let color = "";
    let risk = "";

    if (systolic < 120 && diastolic < 80) {
      category = "Normal";
      color = "text-green-600";
      risk = "Low cardiovascular risk";
    } else if (systolic < 130 && diastolic < 80) {
      category = "Elevated";
      color = "text-yellow-600";
      risk = "Lifestyle changes recommended";
    } else if (systolic < 140 || diastolic < 90) {
      category = "Stage 1 Hypertension";
      color = "text-orange-600";
      risk = "Moderate risk - consult healthcare provider";
    } else if (systolic < 180 || diastolic < 120) {
      category = "Stage 2 Hypertension";
      color = "text-red-600";
      risk = "High risk - medical attention needed";
    } else {
      category = "Hypertensive Crisis";
      color = "text-red-800";
      risk = "Emergency medical attention required";
    }

    setResults({
      ...results,
      bloodPressure: {
        systolic,
        diastolic,
        category,
        color,
        risk
      }
    });
  };

  // Calculate Daily Calorie Needs
  const calculateCalories = () => {
    const { age, gender, weight, height, activity } = calorieData;
    
    if (!age || !gender || !weight || !height || !activity) return;

    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr = 0;
    if (gender === "male") {
      bmr = 10 * parseFloat(weight) + 6.25 * parseFloat(height) - 5 * parseInt(age) + 5;
    } else {
      bmr = 10 * parseFloat(weight) + 6.25 * parseFloat(height) - 5 * parseInt(age) - 161;
    }

    const activityMultipliers: { [key: string]: number } = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      extra: 1.9
    };

    const tdee = Math.round(bmr * activityMultipliers[activity]);
    const weightLoss = Math.round(tdee - 500);
    const weightGain = Math.round(tdee + 500);

    setResults({
      ...results,
      calories: {
        bmr: Math.round(bmr),
        maintenance: tdee,
        weightLoss,
        weightGain
      }
    });
  };

  // Calculate Water Intake
  const calculateWaterIntake = () => {
    const weight = parseFloat(waterData.weight);
    
    if (!weight) return;

    let baseWater = weight * 35; // ml per kg of body weight
    
    // Adjust for activity
    if (waterData.activity === "moderate") baseWater *= 1.2;
    if (waterData.activity === "intense") baseWater *= 1.5;
    
    // Adjust for climate
    if (waterData.climate === "hot") baseWater *= 1.15;
    if (waterData.climate === "humid") baseWater *= 1.1;

    const glasses = Math.round(baseWater / 250); // 250ml per glass

    setResults({
      ...results,
      water: {
        totalMl: Math.round(baseWater),
        glasses,
        liters: (baseWater / 1000).toFixed(1)
      }
    });
  };

  // Calculate Pregnancy Information
  const calculatePregnancy = () => {
    const { lastPeriod, cycleLength } = pregnancyData;
    
    if (!lastPeriod) return;

    const lmpDate = new Date(lastPeriod);
    const cycle = parseInt(cycleLength) || 28;
    const today = new Date();
    
    // Calculate estimated due date (Naegele's rule)
    // Add 280 days (40 weeks) from LMP
    const dueDate = new Date(lmpDate);
    dueDate.setDate(dueDate.getDate() + 280);
    
    // Calculate conception date (LMP + 14 days for average ovulation)
    const conceptionDate = new Date(lmpDate);
    conceptionDate.setDate(conceptionDate.getDate() + 14);
    
    // Calculate current gestational age
    const timeDiff = today.getTime() - lmpDate.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
    const weeks = Math.floor(daysDiff / 7);
    const days = daysDiff % 7;
    
    // Calculate how many days until due date
    const daysUntilDue = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    // Determine trimester
    let trimester = "";
    let trimesterInfo = "";
    if (weeks < 13) {
      trimester = "First Trimester";
      trimesterInfo = "Critical organ development period. Take prenatal vitamins and avoid alcohol/smoking.";
    } else if (weeks < 27) {
      trimester = "Second Trimester";
      trimesterInfo = "Often the most comfortable period. Continue prenatal care and healthy lifestyle.";
    } else {
      trimester = "Third Trimester";
      trimesterInfo = "Prepare for birth. Monitor fetal movements and attend regular checkups.";
    }
    
    // Calculate important milestones
    const milestones = [
      { week: 8, description: "First prenatal visit recommended" },
      { week: 12, description: "End of first trimester, reduced miscarriage risk" },
      { week: 16, description: "Gender may be detectable via ultrasound" },
      { week: 20, description: "Anatomy scan, halfway point" },
      { week: 24, description: "Viability milestone" },
      { week: 28, description: "Third trimester begins" },
      { week: 32, description: "Baby's bones hardening" },
      { week: 36, description: "Baby considered full-term soon" },
      { week: 40, description: "Due date" }
    ];

    const nextMilestone = milestones.find(m => m.week > weeks);
    
    setResults({
      ...results,
      pregnancy: {
        gestationalAge: { weeks, days },
        dueDate: dueDate.toLocaleDateString(),
        conceptionDate: conceptionDate.toLocaleDateString(),
        daysUntilDue,
        trimester,
        trimesterInfo,
        nextMilestone,
        isOverdue: daysUntilDue < 0,
        totalDays: daysDiff
      }
    });
  };

  const calculators = [
    { id: "bmi", name: "BMI Calculator", icon: Scale, category: "Body Composition" },
    { id: "bodyFat", name: "Body Fat %", icon: Target, category: "Body Composition" },
    { id: "heartRate", name: "Heart Rate Zones", icon: Heart, category: "Cardiovascular" },
    { id: "bloodPressure", name: "Blood Pressure Risk", icon: Activity, category: "Cardiovascular" },
    { id: "calories", name: "Calorie Calculator", icon: Zap, category: "Nutrition" },
    { id: "water", name: "Water Intake", icon: Droplet, category: "Nutrition" },
    { id: "pregnancy", name: "Pregnancy Calculator", icon: Baby, category: "Specialized" },
  ];

  const categories = ["All", "Body Composition", "Cardiovascular", "Nutrition", "Specialized"];

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
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
              <Calculator className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-xs sm:text-sm lg:text-xl text-slate-800 truncate">
                Medical Calculator Suite
              </h1>
              <p className="text-xs text-slate-600 hidden sm:block">
                Comprehensive health and medical calculations
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => window.print()}
              variant="outline"
              size="sm"
            >
              <BarChart3 className="w-4 h-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-3 sm:px-6 py-4 sm:py-6">
        <div className="w-full max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl">
                <Calculator className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-slate-800">
                Medical Calculator Suite
              </h1>
            </div>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Access professional-grade medical calculators for health assessment, 
              fitness planning, and medical reference. All calculations are based on 
              established medical formulas and guidelines.
            </p>
          </div>

          {/* Calculator Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {calculators.map((calc) => (
              <Button
                key={calc.id}
                onClick={() => setActiveCalculator(calc.id)}
                variant={activeCalculator === calc.id ? "default" : "outline"}
                className={`p-4 h-auto flex flex-col gap-2 ${
                  activeCalculator === calc.id 
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" 
                    : ""
                }`}
              >
                <calc.icon className={`w-6 h-6 ${
                  activeCalculator === calc.id ? "text-white" : "text-blue-600"
                }`} />
                <div className="text-center">
                  <div className={`font-semibold text-sm ${
                    activeCalculator === calc.id ? "text-white" : ""
                  }`}>
                    {calc.name}
                  </div>
                  <div className={`text-xs ${
                    activeCalculator === calc.id ? "text-blue-100" : "text-slate-500"
                  }`}>
                    {calc.category}
                  </div>
                </div>
              </Button>
            ))}
          </div>

          {/* Calculator Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Form */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {calculators.find(c => c.id === activeCalculator)?.icon && 
                    React.createElement(calculators.find(c => c.id === activeCalculator)!.icon, { className: "w-5 h-5 text-blue-600" })
                  }
                  {calculators.find(c => c.id === activeCalculator)?.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* BMI Calculator */}
                {activeCalculator === "bmi" && (
                  <>
                    <div className="space-y-2">
                      <Label>Unit System</Label>
                      <Select value={bmiData.unit} onValueChange={(value) => setBmiData({...bmiData, unit: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="metric">Metric (kg/cm)</SelectItem>
                          <SelectItem value="imperial">Imperial (lb/in)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Weight ({bmiData.unit === "metric" ? "kg" : "lbs"})</Label>
                      <Input
                        type="number"
                        value={bmiData.weight}
                        onChange={(e) => setBmiData({...bmiData, weight: e.target.value})}
                        placeholder={bmiData.unit === "metric" ? "70" : "154"}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Height ({bmiData.unit === "metric" ? "cm" : "inches"})</Label>
                      <Input
                        type="number"
                        value={bmiData.height}
                        onChange={(e) => setBmiData({...bmiData, height: e.target.value})}
                        placeholder={bmiData.unit === "metric" ? "170" : "67"}
                      />
                    </div>
                    <Button onClick={calculateBMI} className="w-full">
                      Calculate BMI
                    </Button>
                  </>
                )}

                {/* Body Fat Calculator */}
                {activeCalculator === "bodyFat" && (
                  <>
                    <div className="space-y-2">
                      <Label>Gender</Label>
                      <Select value={bodyFatData.gender} onValueChange={(value) => setBodyFatData({...bodyFatData, gender: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Weight (kg)</Label>
                        <Input
                          type="number"
                          value={bodyFatData.weight}
                          onChange={(e) => setBodyFatData({...bodyFatData, weight: e.target.value})}
                          placeholder="70"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Height (cm)</Label>
                        <Input
                          type="number"
                          value={bodyFatData.height}
                          onChange={(e) => setBodyFatData({...bodyFatData, height: e.target.value})}
                          placeholder="170"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Neck (cm)</Label>
                        <Input
                          type="number"
                          value={bodyFatData.neck}
                          onChange={(e) => setBodyFatData({...bodyFatData, neck: e.target.value})}
                          placeholder="37"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Waist (cm)</Label>
                        <Input
                          type="number"
                          value={bodyFatData.waist}
                          onChange={(e) => setBodyFatData({...bodyFatData, waist: e.target.value})}
                          placeholder="85"
                        />
                      </div>
                    </div>
                    {bodyFatData.gender === "female" && (
                      <div className="space-y-2">
                        <Label>Hip (cm)</Label>
                        <Input
                          type="number"
                          value={bodyFatData.hip}
                          onChange={(e) => setBodyFatData({...bodyFatData, hip: e.target.value})}
                          placeholder="95"
                        />
                      </div>
                    )}
                    <Button onClick={calculateBodyFat} className="w-full">
                      Calculate Body Fat %
                    </Button>
                  </>
                )}

                {/* Heart Rate Zones Calculator */}
                {activeCalculator === "heartRate" && (
                  <>
                    <div className="space-y-2">
                      <Label>Age (years)</Label>
                      <Input
                        type="number"
                        value={heartRateData.age}
                        onChange={(e) => setHeartRateData({...heartRateData, age: e.target.value})}
                        placeholder="30"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Resting Heart Rate (optional)</Label>
                      <Input
                        type="number"
                        value={heartRateData.restingHR}
                        onChange={(e) => setHeartRateData({...heartRateData, restingHR: e.target.value})}
                        placeholder="70"
                      />
                    </div>
                    <Button onClick={calculateHeartRateZones} className="w-full">
                      Calculate Heart Rate Zones
                    </Button>
                  </>
                )}

                {/* Blood Pressure Risk Calculator */}
                {activeCalculator === "bloodPressure" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Systolic (mmHg)</Label>
                        <Input
                          type="number"
                          value={bpData.systolic}
                          onChange={(e) => setBpData({...bpData, systolic: e.target.value})}
                          placeholder="120"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Diastolic (mmHg)</Label>
                        <Input
                          type="number"
                          value={bpData.diastolic}
                          onChange={(e) => setBpData({...bpData, diastolic: e.target.value})}
                          placeholder="80"
                        />
                      </div>
                    </div>
                    <Button onClick={calculateBPRisk} className="w-full">
                      Assess Blood Pressure Risk
                    </Button>
                  </>
                )}

                {/* Calorie Calculator */}
                {activeCalculator === "calories" && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Age (years)</Label>
                        <Input
                          type="number"
                          value={calorieData.age}
                          onChange={(e) => setCalorieData({...calorieData, age: e.target.value})}
                          placeholder="30"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Gender</Label>
                        <Select value={calorieData.gender} onValueChange={(value) => setCalorieData({...calorieData, gender: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Weight (kg)</Label>
                        <Input
                          type="number"
                          value={calorieData.weight}
                          onChange={(e) => setCalorieData({...calorieData, weight: e.target.value})}
                          placeholder="70"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Height (cm)</Label>
                        <Input
                          type="number"
                          value={calorieData.height}
                          onChange={(e) => setCalorieData({...calorieData, height: e.target.value})}
                          placeholder="170"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Activity Level</Label>
                      <Select value={calorieData.activity} onValueChange={(value) => setCalorieData({...calorieData, activity: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select activity level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sedentary">Sedentary (desk job, no exercise)</SelectItem>
                          <SelectItem value="light">Light activity (light exercise 1-3 days/week)</SelectItem>
                          <SelectItem value="moderate">Moderate activity (moderate exercise 3-5 days/week)</SelectItem>
                          <SelectItem value="active">Very active (hard exercise 6-7 days/week)</SelectItem>
                          <SelectItem value="extra">Extra active (very hard exercise, physical job)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={calculateCalories} className="w-full">
                      Calculate Calorie Needs
                    </Button>
                  </>
                )}

                {/* Water Intake Calculator */}
                {activeCalculator === "water" && (
                  <>
                    <div className="space-y-2">
                      <Label>Weight (kg)</Label>
                      <Input
                        type="number"
                        value={waterData.weight}
                        onChange={(e) => setWaterData({...waterData, weight: e.target.value})}
                        placeholder="70"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Activity Level</Label>
                      <Select value={waterData.activity} onValueChange={(value) => setWaterData({...waterData, activity: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select activity level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light activity</SelectItem>
                          <SelectItem value="moderate">Moderate exercise</SelectItem>
                          <SelectItem value="intense">Intense exercise</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Climate</Label>
                      <Select value={waterData.climate} onValueChange={(value) => setWaterData({...waterData, climate: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select climate" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="hot">Hot weather</SelectItem>
                          <SelectItem value="humid">Humid conditions</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={calculateWaterIntake} className="w-full">
                      Calculate Water Intake
                    </Button>
                  </>
                )}

                {/* Pregnancy Calculator */}
                {activeCalculator === "pregnancy" && (
                  <>
                    <div className="space-y-2">
                      <Label>Last Menstrual Period (LMP)</Label>
                      <Input
                        type="date"
                        value={pregnancyData.lastPeriod}
                        onChange={(e) => setPregnancyData({...pregnancyData, lastPeriod: e.target.value})}
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Average Cycle Length (days)</Label>
                      <Select value={pregnancyData.cycleLength} onValueChange={(value) => setPregnancyData({...pregnancyData, cycleLength: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="21">21 days</SelectItem>
                          <SelectItem value="22">22 days</SelectItem>
                          <SelectItem value="23">23 days</SelectItem>
                          <SelectItem value="24">24 days</SelectItem>
                          <SelectItem value="25">25 days</SelectItem>
                          <SelectItem value="26">26 days</SelectItem>
                          <SelectItem value="27">27 days</SelectItem>
                          <SelectItem value="28">28 days (average)</SelectItem>
                          <SelectItem value="29">29 days</SelectItem>
                          <SelectItem value="30">30 days</SelectItem>
                          <SelectItem value="31">31 days</SelectItem>
                          <SelectItem value="32">32 days</SelectItem>
                          <SelectItem value="33">33 days</SelectItem>
                          <SelectItem value="34">34 days</SelectItem>
                          <SelectItem value="35">35 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={calculatePregnancy} className="w-full">
                      Calculate Pregnancy Details
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Results */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  Results & Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* BMI Results */}
                {results.bmi && activeCalculator === "bmi" && (
                  <div className="space-y-4">
                    <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {results.bmi.value}
                      </div>
                      <div className="text-sm text-slate-600 mb-1">Body Mass Index</div>
                      <Badge className={`${results.bmi.color.replace('text-', 'bg-').replace('-600', '-100')} ${results.bmi.color}`}>
                        {results.bmi.category}
                      </Badge>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h4 className="font-semibold mb-2">Recommendation</h4>
                      <p className="text-sm text-slate-600">{results.bmi.advice}</p>
                    </div>
                  </div>
                )}

                {/* Body Fat Results */}
                {results.bodyFat && activeCalculator === "bodyFat" && (
                  <div className="space-y-4">
                    <div className="text-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {results.bodyFat.value}%
                      </div>
                      <div className="text-sm text-slate-600 mb-1">Body Fat Percentage</div>
                      <Badge className={`${results.bodyFat.color.replace('text-', 'bg-').replace('-600', '-100')} ${results.bodyFat.color}`}>
                        {results.bodyFat.category}
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Heart Rate Zones Results */}
                {results.heartRate && activeCalculator === "heartRate" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <div className="text-xl font-bold text-red-600">{results.heartRate.maxHR}</div>
                        <div className="text-xs text-slate-600">Max HR</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-xl font-bold text-blue-600">{results.heartRate.restingHR}</div>
                        <div className="text-xs text-slate-600">Resting HR</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {results.heartRate.zones.map((zone: any, index: number) => (
                        <div key={index} className={`p-3 rounded-lg ${zone.color}`}>
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">{zone.name}</span>
                            <span>{zone.min} - {zone.max} bpm</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Blood Pressure Results */}
                {results.bloodPressure && activeCalculator === "bloodPressure" && (
                  <div className="space-y-4">
                    <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 mb-2">
                        {results.bloodPressure.systolic}/{results.bloodPressure.diastolic}
                      </div>
                      <div className="text-sm text-slate-600 mb-1">mmHg</div>
                      <Badge className={`${results.bloodPressure.color.replace('text-', 'bg-').replace('-600', '-100')} ${results.bloodPressure.color}`}>
                        {results.bloodPressure.category}
                      </Badge>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h4 className="font-semibold mb-2">Risk Assessment</h4>
                      <p className="text-sm text-slate-600">{results.bloodPressure.risk}</p>
                    </div>
                  </div>
                )}

                {/* Calorie Results */}
                {results.calories && activeCalculator === "calories" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-lg font-bold text-blue-600">{results.calories.bmr}</div>
                        <div className="text-xs text-slate-600">BMR (kcal/day)</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-lg font-bold text-green-600">{results.calories.maintenance}</div>
                        <div className="text-xs text-slate-600">Maintenance</div>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <div className="text-lg font-bold text-yellow-600">{results.calories.weightLoss}</div>
                        <div className="text-xs text-slate-600">Weight Loss</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-lg font-bold text-purple-600">{results.calories.weightGain}</div>
                        <div className="text-xs text-slate-600">Weight Gain</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Water Intake Results */}
                {results.water && activeCalculator === "water" && (
                  <div className="space-y-4">
                    <div className="text-center p-6 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg">
                      <div className="text-3xl font-bold text-cyan-600 mb-2">
                        {results.water.liters}L
                      </div>
                      <div className="text-sm text-slate-600 mb-1">Daily Water Intake</div>
                      <div className="text-sm text-slate-500">
                        {results.water.glasses} glasses ({results.water.totalMl}ml)
                      </div>
                    </div>
                  </div>
                )}

                {/* Pregnancy Results */}
                {results.pregnancy && activeCalculator === "pregnancy" && (
                  <div className="space-y-4">
                    <div className="text-center p-6 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg">
                      <div className="text-3xl font-bold text-pink-600 mb-2">
                        {results.pregnancy.gestationalAge.weeks}w {results.pregnancy.gestationalAge.days}d
                      </div>
                      <div className="text-sm text-slate-600 mb-1">Gestational Age</div>
                      <Badge className="bg-pink-100 text-pink-800">
                        {results.pregnancy.trimester}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span className="font-semibold text-blue-800">Due Date</span>
                        </div>
                        <div className="text-blue-600">{results.pregnancy.dueDate}</div>
                        <div className="text-xs text-blue-500">
                          {results.pregnancy.isOverdue 
                            ? `${Math.abs(results.pregnancy.daysUntilDue)} days overdue`
                            : `${results.pregnancy.daysUntilDue} days remaining`
                          }
                        </div>
                      </div>
                      
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Heart className="w-4 h-4 text-green-600" />
                          <span className="font-semibold text-green-800">Conception Date</span>
                        </div>
                        <div className="text-green-600">{results.pregnancy.conceptionDate}</div>
                      </div>
                      
                      {results.pregnancy.nextMilestone && (
                        <div className="p-3 bg-yellow-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Target className="w-4 h-4 text-yellow-600" />
                            <span className="font-semibold text-yellow-800">Next Milestone</span>
                          </div>
                          <div className="text-yellow-600">Week {results.pregnancy.nextMilestone.week}</div>
                          <div className="text-xs text-yellow-500">{results.pregnancy.nextMilestone.description}</div>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h4 className="font-semibold mb-2 text-slate-800">Trimester Information</h4>
                      <p className="text-sm text-slate-600">{results.pregnancy.trimesterInfo}</p>
                    </div>
                  </div>
                )}

                {/* No results placeholder */}
                {!results[activeCalculator] && (
                  <div className="text-center py-12 text-slate-500">
                    <Calculator className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p>Enter your information and click calculate to see results</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Medical Disclaimer */}
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-800 mb-1">Medical Disclaimer</h4>
                  <p className="text-sm text-amber-700">
                    These calculators are for informational purposes only and should not replace 
                    professional medical advice. Always consult with healthcare providers for 
                    medical decisions and personalized recommendations. Pregnancy calculations 
                    are estimates based on standard formulas and individual results may vary.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CalculatorsPage;