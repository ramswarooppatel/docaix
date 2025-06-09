"use client";

import React, { useState, useEffect } from "react";
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
  Heart,
  Thermometer,
  Activity,
  Gauge,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Eye,
  Calendar,
  Download,
  Share,
  RefreshCw,
  Plus,
  Minus,
  Target,
  Brain,
  Timer,
  BarChart3,
  LineChart,
  PieChart,
  Zap,
  Shield,
  Bell,
  Star,
  Save,
  History,
  User,
  Baby,
  Users,
  Stethoscope,
} from "lucide-react";
import Link from "next/link";

interface VitalReading {
  id: string;
  timestamp: Date;
  heartRate: number;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  temperature: number;
  respiratoryRate: number;
  oxygenSaturation: number;
  notes?: string;
}

interface VitalRanges {
  heartRate: { min: number; max: number; };
  bloodPressure: { systolic: { min: number; max: number; }; diastolic: { min: number; max: number; }; };
  temperature: { min: number; max: number; };
  respiratoryRate: { min: number; max: number; };
  oxygenSaturation: { min: number; max: number; };
}

const VitalsPage = () => {
  const [currentReading, setCurrentReading] = useState({
    heartRate: "",
    bloodPressureSystolic: "",
    bloodPressureDiastolic: "",
    temperature: "",
    respiratoryRate: "",
    oxygenSaturation: "",
    notes: "",
  });

  const [readings, setReadings] = useState<VitalReading[]>([
    {
      id: "1",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      heartRate: 72,
      bloodPressureSystolic: 120,
      bloodPressureDiastolic: 80,
      temperature: 98.6,
      respiratoryRate: 16,
      oxygenSaturation: 98,
      notes: "Feeling good, post-exercise",
    },
    {
      id: "2",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      heartRate: 68,
      bloodPressureSystolic: 118,
      bloodPressureDiastolic: 78,
      temperature: 98.4,
      respiratoryRate: 14,
      oxygenSaturation: 99,
      notes: "Morning reading",
    },
  ]);

  const [selectedAgeGroup, setSelectedAgeGroup] = useState("adult");
  const [isRecording, setIsRecording] = useState(false);
  const [activeTab, setActiveTab] = useState("current");
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Age-specific normal ranges
  const vitalRanges: Record<string, VitalRanges> = {
    infant: {
      heartRate: { min: 120, max: 160 },
      bloodPressure: { systolic: { min: 70, max: 100 }, diastolic: { min: 40, max: 60 } },
      temperature: { min: 97.0, max: 100.4 },
      respiratoryRate: { min: 30, max: 60 },
      oxygenSaturation: { min: 95, max: 100 },
    },
    child: {
      heartRate: { min: 80, max: 120 },
      bloodPressure: { systolic: { min: 80, max: 110 }, diastolic: { min: 50, max: 70 } },
      temperature: { min: 97.0, max: 100.4 },
      respiratoryRate: { min: 20, max: 30 },
      oxygenSaturation: { min: 95, max: 100 },
    },
    adult: {
      heartRate: { min: 60, max: 100 },
      bloodPressure: { systolic: { min: 90, max: 140 }, diastolic: { min: 60, max: 90 } },
      temperature: { min: 97.0, max: 99.5 },
      respiratoryRate: { min: 12, max: 20 },
      oxygenSaturation: { min: 95, max: 100 },
    },
    elderly: {
      heartRate: { min: 60, max: 100 },
      bloodPressure: { systolic: { min: 90, max: 150 }, diastolic: { min: 60, max: 90 } },
      temperature: { min: 96.0, max: 99.5 },
      respiratoryRate: { min: 12, max: 20 },
      oxygenSaturation: { min: 95, max: 100 },
    },
  };

  // Timer effect for pulse counting
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const startPulseTimer = () => {
    setTimer(0);
    setIsTimerRunning(true);
  };

  const stopPulseTimer = () => {
    setIsTimerRunning(false);
    // Calculate heart rate (beats in 15 seconds * 4)
    if (timer >= 15) {
      const beatsIn15Seconds = parseInt(currentReading.heartRate) || 0;
      const heartRate = Math.round((beatsIn15Seconds / timer) * 60);
      setCurrentReading(prev => ({ ...prev, heartRate: heartRate.toString() }));
    }
  };

  const resetTimer = () => {
    setTimer(0);
    setIsTimerRunning(false);
  };

  const getVitalStatus = (vital: string, value: number) => {
    const ranges = vitalRanges[selectedAgeGroup];
    
    switch (vital) {
      case "heartRate":
        if (value < ranges.heartRate.min) return { status: "low", color: "text-blue-600 bg-blue-50 border-blue-200" };
        if (value > ranges.heartRate.max) return { status: "high", color: "text-red-600 bg-red-50 border-red-200" };
        return { status: "normal", color: "text-green-600 bg-green-50 border-green-200" };
      
      case "bloodPressure":
        const systolic = parseInt(currentReading.bloodPressureSystolic);
        const diastolic = parseInt(currentReading.bloodPressureDiastolic);
        if (systolic < ranges.bloodPressure.systolic.min || diastolic < ranges.bloodPressure.diastolic.min) {
          return { status: "low", color: "text-blue-600 bg-blue-50 border-blue-200" };
        }
        if (systolic > ranges.bloodPressure.systolic.max || diastolic > ranges.bloodPressure.diastolic.max) {
          return { status: "high", color: "text-red-600 bg-red-50 border-red-200" };
        }
        return { status: "normal", color: "text-green-600 bg-green-50 border-green-200" };
      
      case "temperature":
        if (value < ranges.temperature.min) return { status: "low", color: "text-blue-600 bg-blue-50 border-blue-200" };
        if (value > ranges.temperature.max) return { status: "high", color: "text-red-600 bg-red-50 border-red-200" };
        return { status: "normal", color: "text-green-600 bg-green-50 border-green-200" };
      
      case "respiratoryRate":
        if (value < ranges.respiratoryRate.min) return { status: "low", color: "text-blue-600 bg-blue-50 border-blue-200" };
        if (value > ranges.respiratoryRate.max) return { status: "high", color: "text-red-600 bg-red-50 border-red-200" };
        return { status: "normal", color: "text-green-600 bg-green-50 border-green-200" };
      
      case "oxygenSaturation":
        if (value < ranges.oxygenSaturation.min) return { status: "low", color: "text-red-600 bg-red-50 border-red-200" };
        return { status: "normal", color: "text-green-600 bg-green-50 border-green-200" };
      
      default:
        return { status: "normal", color: "text-slate-600 bg-slate-50 border-slate-200" };
    }
  };

  const saveReading = () => {
    if (!currentReading.heartRate && !currentReading.bloodPressureSystolic && !currentReading.temperature) {
      alert("Please enter at least one vital sign measurement");
      return;
    }

    const newReading: VitalReading = {
      id: Date.now().toString(),
      timestamp: new Date(),
      heartRate: parseInt(currentReading.heartRate) || 0,
      bloodPressureSystolic: parseInt(currentReading.bloodPressureSystolic) || 0,
      bloodPressureDiastolic: parseInt(currentReading.bloodPressureDiastolic) || 0,
      temperature: parseFloat(currentReading.temperature) || 0,
      respiratoryRate: parseInt(currentReading.respiratoryRate) || 0,
      oxygenSaturation: parseInt(currentReading.oxygenSaturation) || 0,
      notes: currentReading.notes,
    };

    setReadings(prev => [newReading, ...prev]);
    
    // Clear form
    setCurrentReading({
      heartRate: "",
      bloodPressureSystolic: "",
      bloodPressureDiastolic: "",
      temperature: "",
      respiratoryRate: "",
      oxygenSaturation: "",
      notes: "",
    });

    // Show success message
    alert("Vital signs recorded successfully!");
  };

  const exportData = () => {
    const dataToExport = {
      readings,
      ageGroup: selectedAgeGroup,
      exportDate: new Date().toISOString(),
      summary: {
        totalReadings: readings.length,
        latestReading: readings[0],
        averages: {
          heartRate: Math.round(readings.reduce((sum, r) => sum + r.heartRate, 0) / readings.length),
          bloodPressure: `${Math.round(readings.reduce((sum, r) => sum + r.bloodPressureSystolic, 0) / readings.length)}/${Math.round(readings.reduce((sum, r) => sum + r.bloodPressureDiastolic, 0) / readings.length)}`,
          temperature: (readings.reduce((sum, r) => sum + r.temperature, 0) / readings.length).toFixed(1),
        }
      }
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vitals-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: "current", label: "Record Vitals", icon: Plus },
    { id: "history", label: "History", icon: History },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "reference", label: "Reference", icon: Target },
  ];

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
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-xs sm:text-sm lg:text-xl text-slate-800 truncate">
                Vital Signs Monitor
              </h1>
              <p className="text-xs text-slate-600 hidden sm:block">
                Track and monitor vital health indicators
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={exportData}
              variant="outline"
              size="sm"
              className="hidden sm:flex"
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
            <Button
              onClick={() => window.print()}
              variant="outline"
              size="sm"
            >
              <Share className="w-4 h-4 mr-1" />
              Share
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
              <div className="p-3 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl">
                <Stethoscope className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-slate-800">
                Vital Signs Monitoring
              </h1>
            </div>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Comprehensive vital signs tracking with age-specific normal ranges, trends analysis, and emergency alerts.
            </p>
          </div>

          {/* Age Group Selection */}
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Patient Age Group
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { id: "infant", label: "Infant (0-1yr)", icon: Baby, color: "from-pink-500 to-rose-500" },
                  { id: "child", label: "Child (1-12yr)", icon: User, color: "from-blue-500 to-cyan-500" },
                  { id: "adult", label: "Adult (13-64yr)", icon: Users, color: "from-green-500 to-emerald-500" },
                  { id: "elderly", label: "Elderly (65+yr)", icon: Heart, color: "from-purple-500 to-violet-500" },
                ].map((group) => (
                  <Button
                    key={group.id}
                    onClick={() => setSelectedAgeGroup(group.id)}
                    variant={selectedAgeGroup === group.id ? "default" : "outline"}
                    className={`p-4 h-auto flex-col gap-2 ${
                      selectedAgeGroup === group.id 
                        ? `bg-gradient-to-r ${group.color} hover:opacity-90` 
                        : ""
                    }`}
                  >
                    <group.icon className={`w-6 h-6 ${
                      selectedAgeGroup === group.id ? "text-white" : "text-slate-600"
                    }`} />
                    <span className={`text-sm font-medium ${
                      selectedAgeGroup === group.id ? "text-white" : "text-slate-700"
                    }`}>
                      {group.label}
                    </span>
                  </Button>
                ))}
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
                    ? "bg-white shadow-sm text-red-600"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {/* Current Reading Tab */}
            {activeTab === "current" && (
              <div className="space-y-6">
                {/* Pulse Counter */}
                <Card className="border-red-200 bg-red-50/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-800">
                      <Timer className="w-5 h-5" />
                      Pulse Counter Tool
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center gap-6 p-6 bg-white rounded-lg border border-red-200">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-red-600 mb-2">
                          {timer}s
                        </div>
                        <p className="text-sm text-slate-600">Timer</p>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          onClick={startPulseTimer}
                          disabled={isTimerRunning}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Activity className="w-4 h-4 mr-2" />
                          Start
                        </Button>
                        <Button
                          onClick={stopPulseTimer}
                          disabled={!isTimerRunning}
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <Gauge className="w-4 h-4 mr-2" />
                          Stop
                        </Button>
                        <Button
                          onClick={resetTimer}
                          variant="outline"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Reset
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mt-3 text-center">
                      Count pulse beats for 15-60 seconds, then stop to calculate heart rate
                    </p>
                  </CardContent>
                </Card>

                {/* Vital Signs Input */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Heart Rate */}
                  <Card className="border-red-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-red-800">
                        <Heart className="w-5 h-5" />
                        Heart Rate
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={currentReading.heartRate}
                            onChange={(e) => setCurrentReading(prev => ({ ...prev, heartRate: e.target.value }))}
                            placeholder="72"
                            className="text-center text-lg font-semibold"
                          />
                          <span className="text-slate-600 font-medium">bpm</span>
                        </div>
                        {currentReading.heartRate && (
                          <Badge className={getVitalStatus("heartRate", parseInt(currentReading.heartRate)).color}>
                            {getVitalStatus("heartRate", parseInt(currentReading.heartRate)).status.toUpperCase()}
                          </Badge>
                        )}
                        <p className="text-xs text-slate-500">
                          Normal: {vitalRanges[selectedAgeGroup].heartRate.min}-{vitalRanges[selectedAgeGroup].heartRate.max} bpm
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Blood Pressure */}
                  <Card className="border-blue-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-blue-800">
                        <Gauge className="w-5 h-5" />
                        Blood Pressure
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={currentReading.bloodPressureSystolic}
                            onChange={(e) => setCurrentReading(prev => ({ ...prev, bloodPressureSystolic: e.target.value }))}
                            placeholder="120"
                            className="text-center text-lg font-semibold"
                          />
                          <span className="text-slate-600">/</span>
                          <Input
                            type="number"
                            value={currentReading.bloodPressureDiastolic}
                            onChange={(e) => setCurrentReading(prev => ({ ...prev, bloodPressureDiastolic: e.target.value }))}
                            placeholder="80"
                            className="text-center text-lg font-semibold"
                          />
                          <span className="text-slate-600 font-medium">mmHg</span>
                        </div>
                        {currentReading.bloodPressureSystolic && currentReading.bloodPressureDiastolic && (
                          <Badge className={getVitalStatus("bloodPressure", 0).color}>
                            {getVitalStatus("bloodPressure", 0).status.toUpperCase()}
                          </Badge>
                        )}
                        <p className="text-xs text-slate-500">
                          Normal: {vitalRanges[selectedAgeGroup].bloodPressure.systolic.min}-{vitalRanges[selectedAgeGroup].bloodPressure.systolic.max}/{vitalRanges[selectedAgeGroup].bloodPressure.diastolic.min}-{vitalRanges[selectedAgeGroup].bloodPressure.diastolic.max} mmHg
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Temperature */}
                  <Card className="border-orange-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-orange-800">
                        <Thermometer className="w-5 h-5" />
                        Temperature
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            step="0.1"
                            value={currentReading.temperature}
                            onChange={(e) => setCurrentReading(prev => ({ ...prev, temperature: e.target.value }))}
                            placeholder="98.6"
                            className="text-center text-lg font-semibold"
                          />
                          <span className="text-slate-600 font-medium">°F</span>
                        </div>
                        {currentReading.temperature && (
                          <Badge className={getVitalStatus("temperature", parseFloat(currentReading.temperature)).color}>
                            {getVitalStatus("temperature", parseFloat(currentReading.temperature)).status.toUpperCase()}
                          </Badge>
                        )}
                        <p className="text-xs text-slate-500">
                          Normal: {vitalRanges[selectedAgeGroup].temperature.min}-{vitalRanges[selectedAgeGroup].temperature.max}°F
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Respiratory Rate */}
                  <Card className="border-green-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-green-800">
                        <Heart className="w-5 h-5" />
                        Respiratory Rate
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={currentReading.respiratoryRate}
                            onChange={(e) => setCurrentReading(prev => ({ ...prev, respiratoryRate: e.target.value }))}
                            placeholder="16"
                            className="text-center text-lg font-semibold"
                          />
                          <span className="text-slate-600 font-medium">breaths/min</span>
                        </div>
                        {currentReading.respiratoryRate && (
                          <Badge className={getVitalStatus("respiratoryRate", parseInt(currentReading.respiratoryRate)).color}>
                            {getVitalStatus("respiratoryRate", parseInt(currentReading.respiratoryRate)).status.toUpperCase()}
                          </Badge>
                        )}
                        <p className="text-xs text-slate-500">
                          Normal: {vitalRanges[selectedAgeGroup].respiratoryRate.min}-{vitalRanges[selectedAgeGroup].respiratoryRate.max} breaths/min
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Oxygen Saturation */}
                  <Card className="border-purple-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-purple-800">
                        <Brain className="w-5 h-5" />
                        Oxygen Saturation
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={currentReading.oxygenSaturation}
                            onChange={(e) => setCurrentReading(prev => ({ ...prev, oxygenSaturation: e.target.value }))}
                            placeholder="98"
                            className="text-center text-lg font-semibold"
                          />
                          <span className="text-slate-600 font-medium">%</span>
                        </div>
                        {currentReading.oxygenSaturation && (
                          <Badge className={getVitalStatus("oxygenSaturation", parseInt(currentReading.oxygenSaturation)).color}>
                            {getVitalStatus("oxygenSaturation", parseInt(currentReading.oxygenSaturation)).status.toUpperCase()}
                          </Badge>
                        )}
                        <p className="text-xs text-slate-500">
                          Normal: {vitalRanges[selectedAgeGroup].oxygenSaturation.min}-{vitalRanges[selectedAgeGroup].oxygenSaturation.max}%
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Notes */}
                  <Card className="border-slate-200 md:col-span-2 lg:col-span-1">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-slate-800">
                        <Eye className="w-5 h-5" />
                        Notes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <textarea
                        value={currentReading.notes}
                        onChange={(e) => setCurrentReading(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Add any relevant notes or observations..."
                        className="w-full h-24 p-3 border border-slate-300 rounded-lg resize-none text-sm"
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Save Button */}
                <div className="flex justify-center">
                  <Button
                    onClick={saveReading}
                    size="lg"
                    className="px-8 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Save className="w-5 h-5 mr-2" />
                    Save Vital Signs Reading
                  </Button>
                </div>
              </div>
            )}

            {/* History Tab */}
            {activeTab === "history" && (
              <Card className="shadow-xl border-0">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
                  <CardTitle className="flex items-center gap-2">
                    <History className="w-5 h-5 text-indigo-600" />
                    Vital Signs History ({readings.length} readings)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {readings.map((reading) => (
                      <div key={reading.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex justify-between items-start mb-3">
                          <div className="text-sm font-medium text-slate-800">
                            {reading.timestamp.toLocaleString()}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            #{reading.id}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
                          <div className="text-center p-2 bg-red-50 rounded">
                            <Heart className="w-4 h-4 text-red-600 mx-auto mb-1" />
                            <div className="font-semibold text-red-800">{reading.heartRate}</div>
                            <div className="text-xs text-red-600">bpm</div>
                          </div>
                          
                          <div className="text-center p-2 bg-blue-50 rounded">
                            <Gauge className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                            <div className="font-semibold text-blue-800">
                              {reading.bloodPressureSystolic}/{reading.bloodPressureDiastolic}
                            </div>
                            <div className="text-xs text-blue-600">mmHg</div>
                          </div>
                          
                          <div className="text-center p-2 bg-orange-50 rounded">
                            <Thermometer className="w-4 h-4 text-orange-600 mx-auto mb-1" />
                            <div className="font-semibold text-orange-800">{reading.temperature}</div>
                            <div className="text-xs text-orange-600">°F</div>
                          </div>
                          
                          <div className="text-center p-2 bg-green-50 rounded">
                            <Heart className="w-4 h-4 text-green-600 mx-auto mb-1" />
                            <div className="font-semibold text-green-800">{reading.respiratoryRate}</div>
                            <div className="text-xs text-green-600">br/min</div>
                          </div>
                          
                          <div className="text-center p-2 bg-purple-50 rounded">
                            <Brain className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                            <div className="font-semibold text-purple-800">{reading.oxygenSaturation}</div>
                            <div className="text-xs text-purple-600">%</div>
                          </div>
                          
                          <div className="text-center p-2 bg-slate-100 rounded">
                            <Eye className="w-4 h-4 text-slate-600 mx-auto mb-1" />
                            <div className="text-xs text-slate-600">
                              {reading.notes ? "Has notes" : "No notes"}
                            </div>
                          </div>
                        </div>
                        
                        {reading.notes && (
                          <div className="mt-3 p-2 bg-white rounded border border-slate-200">
                            <div className="text-xs text-slate-600">Notes:</div>
                            <div className="text-sm text-slate-800">{reading.notes}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Analytics Tab */}
            {activeTab === "analytics" && readings.length > 0 && (
              <div className="space-y-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="border-red-200 bg-red-50/30">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Heart className="w-8 h-8 text-red-600" />
                        <div>
                          <div className="text-2xl font-bold text-red-800">
                            {Math.round(readings.reduce((sum, r) => sum + r.heartRate, 0) / readings.length)}
                          </div>
                          <div className="text-sm text-red-600">Avg Heart Rate</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-blue-200 bg-blue-50/30">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Gauge className="w-8 h-8 text-blue-600" />
                        <div>
                          <div className="text-lg font-bold text-blue-800">
                            {Math.round(readings.reduce((sum, r) => sum + r.bloodPressureSystolic, 0) / readings.length)}/
                            {Math.round(readings.reduce((sum, r) => sum + r.bloodPressureDiastolic, 0) / readings.length)}
                          </div>
                          <div className="text-sm text-blue-600">Avg Blood Pressure</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-orange-200 bg-orange-50/30">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Thermometer className="w-8 h-8 text-orange-600" />
                        <div>
                          <div className="text-2xl font-bold text-orange-800">
                            {(readings.reduce((sum, r) => sum + r.temperature, 0) / readings.length).toFixed(1)}°
                          </div>
                          <div className="text-sm text-orange-600">Avg Temperature</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-green-200 bg-green-50/30">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-8 h-8 text-green-600" />
                        <div>
                          <div className="text-2xl font-bold text-green-800">{readings.length}</div>
                          <div className="text-sm text-green-600">Total Readings</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Trends */}
                <Card className="shadow-xl border-0">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      Vital Signs Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="text-center py-8">
                      <LineChart className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                      <h3 className="text-lg font-semibold text-slate-700 mb-2">
                        Trends Visualization Coming Soon
                      </h3>
                      <p className="text-slate-600">
                        Interactive charts and trend analysis will be available in the next update.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Reference Tab */}
            {activeTab === "reference" && (
              <Card className="shadow-xl border-0">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-600" />
                    Normal Vital Signs Reference
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Object.entries(vitalRanges).map(([ageGroup, ranges]) => (
                      <div key={ageGroup} className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-800 capitalize flex items-center gap-2">
                          {ageGroup === "infant" && <Baby className="w-5 h-5" />}
                          {ageGroup === "child" && <User className="w-5 h-5" />}
                          {ageGroup === "adult" && <Users className="w-5 h-5" />}
                          {ageGroup === "elderly" && <Heart className="w-5 h-5" />}
                          {ageGroup}
                        </h3>
                        
                        <div className="space-y-3 text-sm">
                          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                            <div className="font-medium text-red-800 mb-1">Heart Rate</div>
                            <div className="text-red-600">{ranges.heartRate.min}-{ranges.heartRate.max} bpm</div>
                          </div>
                          
                          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="font-medium text-blue-800 mb-1">Blood Pressure</div>
                            <div className="text-blue-600">
                              {ranges.bloodPressure.systolic.min}-{ranges.bloodPressure.systolic.max}/
                              {ranges.bloodPressure.diastolic.min}-{ranges.bloodPressure.diastolic.max} mmHg
                            </div>
                          </div>
                          
                          <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                            <div className="font-medium text-orange-800 mb-1">Temperature</div>
                            <div className="text-orange-600">{ranges.temperature.min}-{ranges.temperature.max}°F</div>
                          </div>
                          
                          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="font-medium text-green-800 mb-1">Respiratory Rate</div>
                            <div className="text-green-600">{ranges.respiratoryRate.min}-{ranges.respiratoryRate.max} breaths/min</div>
                          </div>
                          
                          <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                            <div className="font-medium text-purple-800 mb-1">Oxygen Saturation</div>
                            <div className="text-purple-600">{ranges.oxygenSaturation.min}-{ranges.oxygenSaturation.max}%</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Emergency Notice */}
          <Card className="border-red-300 bg-red-50 border-2">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="w-5 h-5" />
                ⚠️ Important Medical Notice
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-red-700 space-y-2">
                <p className="font-medium">
                  This vital signs monitor is for educational and tracking purposes only.
                </p>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>Always consult healthcare professionals for medical decisions</li>
                  <li>Call emergency services immediately for abnormal vital signs</li>
                  <li>Use professional medical equipment for accurate measurements</li>
                  <li>Do not rely solely on this app for medical diagnosis</li>
                </ul>
              </div>
              
              <div className="mt-4 flex flex-wrap gap-3">
                <Button 
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => window.open('tel:108', '_self')}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Call 108 Emergency
                </Button>
                <Link href="/hospitals">
                  <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                    <Stethoscope className="w-4 h-4 mr-2" />
                    Find Hospitals
                  </Button>
                </Link>
                <Link href="/chat">
                  <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                    <Brain className="w-4 h-4 mr-2" />
                    Ask DOCai
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VitalsPage;