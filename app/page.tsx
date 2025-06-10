"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { SignalIndicators } from "@/components/signal-indicators";
import {
  MessageCircle,
  Settings,
  Heart,
  Stethoscope,
  Brain,
  Shield,
  Phone,
  MapPin,
  Clock,
  Users,
  ArrowRight,
  Sparkles,
  Activity,
  Building2,
  Package,
  Calculator,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-lg border-b border-slate-200/60 px-3 sm:px-6 py-3 sm:py-4 z-10 shadow-sm">
        <div className="w-full max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg sm:text-2xl text-slate-800">
                DocAI
              </h1>
              <p className="text-xs sm:text-sm text-slate-600">
                AI First-Aid Assistant
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/settings">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </Link>
            <SignalIndicators className="scale-75 sm:scale-100" />
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="flex-1 px-3 sm:px-6 py-6 sm:py-12">
        <div className="w-full max-w-6xl mx-auto">
          {/* Main Hero */}
          <div className="text-center mb-12 sm:mb-16">
            <div className="w-20 h-20 sm:w-32 sm:h-32 mx-auto mb-6 sm:mb-8 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center shadow-xl">
              <Sparkles className="text-blue-600 w-10 h-10 sm:w-16 sm:h-16" />
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-slate-800 mb-4 sm:mb-6">
              Your AI-Powered
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 block">
                First Aid Assistant
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto mb-8 sm:mb-12 leading-relaxed">
              Get instant first aid guidance and emergency assistance support
              24/7. DocAI is here to help you stay safe and handle medical
              emergencies with confidence.
            </p>

            {/* 3x3 Grid Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 max-w-5xl mx-auto">
              {/* Row 1 */}
              {/* R1,C1 - Settings */}
              <Link href="/settings">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full text-lg px-6 py-8 rounded-xl border-2 border-slate-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 h-auto flex flex-col gap-3"
                >
                  <Settings className="w-8 h-8" />
                  <div className="text-center">
                    <div className="font-bold">Emergency Settings</div>
                    <div className="text-sm opacity-75">
                      Setup contacts & preferences
                    </div>
                  </div>
                </Button>
              </Link>

              {/* R1,C2 - Chat */}
              <Link href="/chat">
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-lg px-6 py-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 h-auto flex flex-col gap-3"
                >
                  <MessageCircle className="w-8 h-8" />
                  <div className="text-center">
                    <div className="font-bold">Emergency Chat</div>
                    <div className="text-sm opacity-90">
                      Get instant AI assistance
                    </div>
                  </div>
                </Button>
              </Link>

              {/* R1,C3 - First Aid Box */}
              <Link href="/firstaidbox">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full text-lg px-6 py-8 rounded-xl border-2 border-purple-300 hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 h-auto flex flex-col gap-3"
                >
                  <Package className="w-8 h-8" />
                  <div className="text-center">
                    <div className="font-bold">First Aid Box</div>
                    <div className="text-sm opacity-75">Complete setup guide</div>
                  </div>
                </Button>
              </Link>

              {/* Row 2 */}
              {/* R2,C1 - Nearby Hospitals */}
              <Link href="/hospitals">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full text-lg px-6 py-8 rounded-xl border-2 border-red-300 hover:border-red-500 hover:bg-red-50 transition-all duration-200 h-auto flex flex-col gap-3"
                >
                  <Building2 className="w-8 h-8" />
                  <div className="text-center">
                    <div className="font-bold">Nearby Hospitals</div>
                    <div className="text-sm opacity-75">Find emergency centers</div>
                  </div>
                </Button>
              </Link>

              {/* R2,C2 - CPR Guide */}
              <Link href="/cpr-guide">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full text-lg px-6 py-8 rounded-xl border-2 border-pink-300 hover:border-pink-500 hover:bg-pink-50 transition-all duration-200 h-auto flex flex-col gap-3"
                >
                  <Heart className="w-8 h-8" />
                  <div className="text-center">
                    <div className="font-bold">CPR Guide</div>
                    <div className="text-sm opacity-75">Life support training</div>
                  </div>
                </Button>
              </Link>

              {/* R2,C3 - Vitals */}
              <Link href="/vitals">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full text-lg px-6 py-8 rounded-xl border-2 border-red-300 hover:border-red-500 hover:bg-red-50 transition-all duration-200 h-auto flex flex-col gap-3"
                >
                  <Stethoscope className="w-8 h-8" />
                  <div className="text-center">
                    <div className="font-bold">Vital Signs</div>
                    <div className="text-sm opacity-75">Monitor health metrics</div>
                  </div>
                </Button>
              </Link>

              {/* Row 3 */}
              {/* R3,C1 - Emergency SOS */}
              <Link href="/emergency-sos">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full text-lg px-6 py-8 rounded-xl border-2 border-orange-300 hover:border-orange-500 hover:bg-orange-50 transition-all duration-200 h-auto flex flex-col gap-3"
                >
                  <AlertTriangle className="w-8 h-8" />
                  <div className="text-center">
                    <div className="font-bold">Emergency SOS</div>
                    <div className="text-sm opacity-75">Quick emergency alert</div>
                  </div>
                </Button>
              </Link>

              {/* R3,C2 - Health Profile */}
              <Link href="/healthprofile">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full text-lg px-6 py-8 rounded-xl border-2 border-green-300 hover:border-green-500 hover:bg-green-50 transition-all duration-200 h-auto flex flex-col gap-3"
                >
                  <Activity className="w-8 h-8" />
                  <div className="text-center">
                    <div className="font-bold">Health Profile</div>
                    <div className="text-sm opacity-75">Personal health analysis</div>
                  </div>
                </Button>
              </Link>

              {/* R3,C3 - Calculators */}
              <Link href="/calculators">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full text-lg px-6 py-8 rounded-xl border-2 border-indigo-300 hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-200 h-auto flex flex-col gap-3"
                >
                  <Calculator className="w-8 h-8" />
                  <div className="text-center">
                    <div className="font-bold">Health Calculators</div>
                    <div className="text-sm opacity-75">BMI, BMR & more tools</div>
                  </div>
                </Button>
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
            {/* Emergency Response */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 hover:shadow-lg transition-shadow duration-200">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                <Phone className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">
                Emergency Response
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Instant access to emergency services (108) and automatic alerts
                to your emergency contacts with your location.
              </p>
            </div>

            {/* Nearby Hospitals */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 hover:shadow-lg transition-shadow duration-200">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">
                Nearby Hospitals
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Find hospitals, clinics, and emergency centers near your
                location with directions and contact information.
              </p>
            </div>

            {/* Health Profile Analysis */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 hover:shadow-lg transition-shadow duration-200">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">
                Health Profile Analysis
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Get personalized health recommendations based on your medical
                profile, lifestyle, and conditions.
              </p>
            </div>

            {/* First Aid Guidance */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 hover:shadow-lg transition-shadow duration-200">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">
                First Aid Guidance
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Step-by-step first aid instructions for burns, cuts, choking,
                CPR, and other medical emergencies.
              </p>
            </div>

            {/* 24/7 Availability */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 hover:shadow-lg transition-shadow duration-200">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">
                24/7 Availability
              </h3>
              <p className="text-slate-600 leading-relaxed">
                AI-powered assistance available round the clock, providing
                immediate help when you need it most.
              </p>
            </div>

            {/* Location Services */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 hover:shadow-lg transition-shadow duration-200">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">
                Location Sharing
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Automatic location sharing with emergency contacts and services
                for faster response times.
              </p>
            </div>

            {/* Medical Knowledge */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 hover:shadow-lg transition-shadow duration-200">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                <Stethoscope className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">
                Medical Knowledge
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Comprehensive medical database covering symptoms, treatments,
                and emergency procedures.
              </p>
            </div>

            {/* Emergency Contacts */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 hover:shadow-lg transition-shadow duration-200">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">
                Emergency Contacts
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Manage and alert your emergency contacts instantly during
                critical situations.
              </p>
            </div>

            {/* First Aid Box Setup */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 hover:shadow-lg transition-shadow duration-200">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">
                First Aid Box Setup
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Complete guide to building and maintaining first aid kits for
                home, car, office, and travel.
              </p>
            </div>
          </div>

          {/* Emergency Notice */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-6 sm:p-8 text-center">
            <Shield className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-xl sm:text-2xl font-bold text-red-800 mb-3">
              🚨 Important Emergency Notice
            </h3>
            <p className="text-red-700 text-lg leading-relaxed max-w-3xl mx-auto">
              DocAI provides first aid guidance and emergency assistance, but is
              not a replacement for professional medical care. For
              life-threatening emergencies, always call 108 immediately.
            </p>
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-12 sm:mt-16">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/chat">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <MessageCircle className="w-5 h-5 mr-3" />
                  Start Using DocAI Now
                </Button>
              </Link>

              <Link href="/hospitals">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto text-lg px-8 py-6 rounded-xl border-2 border-red-300 hover:border-red-500 hover:bg-red-50 transition-all duration-200"
                >
                  <Building2 className="w-5 h-5 mr-3" />
                  Find Hospitals
                </Button>
              </Link>

              <Link href="/healthprofile">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto text-lg px-8 py-6 rounded-xl border-2 border-green-300 hover:border-green-500 hover:bg-green-50 transition-all duration-200"
                >
                  <Activity className="w-5 h-5 mr-3" />
                  Analyze Health Profile
                </Button>
              </Link>

              <Link href="/firstaidbox">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto text-lg px-8 py-6 rounded-xl border-2 border-purple-300 hover:border-purple-500 hover:bg-purple-50 transition-all duration-200"
                >
                  <Package className="w-5 h-5 mr-3" />
                  First Aid Box Guide
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white/50 border-t border-slate-200 px-3 sm:px-6 py-6">
        <div className="w-full max-w-6xl mx-auto text-center">
          <p className="text-sm text-slate-600">
            © 2024 DocAI - AI-Powered Medical Assistant. Always consult
            healthcare professionals for serious medical conditions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
