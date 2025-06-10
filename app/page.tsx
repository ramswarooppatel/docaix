"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SignalIndicators } from "@/components/signal-indicators";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { PermissionManager } from "@/components/PermissionManager";
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
  Download,
  Smartphone,
  Monitor,
  CheckCircle,
  WifiOff,
  BookOpen,
} from "lucide-react";
import Link from "next/link";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const Home = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showPermissionSetup, setShowPermissionSetup] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      const isStandaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone ||
        document.referrer.includes("android-app://");
      setIsInstalled(isStandaloneMode);
    };

    // Check if iOS
    const checkIOS = () => {
      const isIOSDevice =
        /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
      setIsIOS(isIOSDevice);
    };

    // Check online status with network test
    const checkOnlineStatus = async () => {
      if (!navigator.onLine) {
        setIsOnline(false);
        return;
      }

      try {
        // Test actual connectivity with a lightweight request
        const response = await fetch('/manifest.json', { 
          method: 'HEAD',
          cache: 'no-cache',
          signal: AbortSignal.timeout(3000)
        });
        setIsOnline(response.ok);
      } catch {
        setIsOnline(false);
      }
    };

    // Check permission setup
    const checkPermissionSetup = () => {
      const hasRequestedPermissions = localStorage.getItem('permissions-requested');
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (!hasRequestedPermissions && isMobile && (localStorage.getItem('pwa-install-dismissed') || isInstalled)) {
        setTimeout(() => setShowPermissionSetup(true), 2000);
      }
    };

    checkInstalled();
    checkIOS();
    checkOnlineStatus();
    checkPermissionSetup();

    // Listen for online/offline events
    const handleOnline = () => checkOnlineStatus();
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check connectivity periodically
    const connectivityInterval = setInterval(checkOnlineStatus, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(connectivityInterval);
    };
  }, [isInstalled]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("User accepted the install prompt");
    }

    setDeferredPrompt(null);
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* PWA Components */}
      <PWAInstallPrompt />
      <OfflineIndicator />

      {/* Permission Setup Modal - Only shows after PWA interaction */}
      {showPermissionSetup && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">
                🚨 Set Up Emergency Permissions
              </h2>
              <p className="text-sm text-slate-600">
                Grant essential permissions for emergency medical assistance
              </p>
            </div>

            <PermissionManager 
              onPermissionsComplete={() => setShowPermissionSetup(false)}
              showOnlyMissing={true}
            />

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setShowPermissionSetup(false)}
                variant="outline"
                className="flex-1"
              >
                Skip for Now
              </Button>
              <Link href="/settings" className="flex-1">
                <Button className="w-full bg-red-600 hover:bg-red-700">
                  <Settings className="w-4 h-4 mr-2" />
                  Go to Settings
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Offline Status Banner */}
      {!isOnline && (
        <div className="bg-orange-600 text-white px-3 sm:px-6 py-2">
          <div className="w-full max-w-6xl mx-auto flex items-center justify-center gap-2">
            <WifiOff className="w-4 h-4" />
            <span className="text-sm font-medium">
              You're offline - Emergency medical guide still available
            </span>
          </div>
        </div>
      )}

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

      {/* Main Content */}
      <div className="flex-1 px-3 sm:px-6 py-4 sm:py-6">
        <div className="w-full max-w-6xl mx-auto space-y-6 sm:space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4 py-6 sm:py-12">
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Heart className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Emergency Medical Assistant
            </h2>
            <p className="text-slate-600 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Get instant AI-powered first aid guidance, find nearby hospitals, and access emergency services. 
              Your pocket-sized medical companion for any situation.
            </p>
            {!isOnline && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-orange-800 text-sm">
                  <WifiOff className="w-4 h-4 inline mr-2" />
                  Working offline with comprehensive medical guide
                </p>
              </div>
            )}
          </div>

          {/* Quick Action Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            
             <Link href="/emergency-sos">
              <Button
                variant="outline"
                size="lg"
                className="w-full text-lg px-6 py-8 rounded-xl border-2 border-yellow-300 hover:border-yellow-500 hover:bg-yellow-50 transition-all duration-200 h-auto flex flex-col gap-3"
              >
                <Phone className="w-8 h-8" />
                <div className="text-center">
                  <div className="font-bold">Emergency SOS</div>
                  <div className="text-sm opacity-75">Quick emergency calls</div>
                </div>
              </Button>
            </Link>
            {/* Emergency Chat / Offline Guide - Conditional */}
            {isOnline ? (
              <Link href="/chat">
                <Button
                  variant="default"
                  size="lg"
                  className="w-full text-lg px-6 py-8 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 h-auto flex flex-col gap-3"
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
            ) : (
              <Link href="/offline-medical-guide">
                <Button
                  variant="default"
                  size="lg"
                  className="w-full text-lg px-6 py-8 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 h-auto flex flex-col gap-3"
                >
                  <BookOpen className="w-8 h-8" />
                  <div className="text-center">
                    <div className="font-bold">Offline Medical Guide</div>
                    <div className="text-sm opacity-90">
                      Complete first aid reference
                    </div>
                  </div>
                </Button>
              </Link>
            )}

            {/* R1,C2 - Hospital Finder */}
         

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
   <Link href="/hospitals">
              <Button
                variant="outline"
                size="lg"
                className="w-full text-lg px-6 py-8 rounded-xl border-2 border-blue-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 h-auto flex flex-col gap-3"
              >
                <Building2 className="w-8 h-8" />
                <div className="text-center">
                  <div className="font-bold">Find Hospitals</div>
                  <div className="text-sm opacity-75">Locate nearest medical care</div>
                </div>
              </Button>
            </Link>
            {/* Row 2 */}
            {/* R2,C1 - CPR Guide */}
            <Link href="/cpr-guide">
              <Button
                variant="outline"
                size="lg"
                className="w-full text-lg px-6 py-8 rounded-xl border-2 border-green-300 hover:border-green-500 hover:bg-green-50 transition-all duration-200 h-auto flex flex-col gap-3"
              >
                <Heart className="w-8 h-8" />
                <div className="text-center">
                  <div className="font-bold">CPR Guide</div>
                  <div className="text-sm opacity-75">Life support training</div>
                </div>
              </Button>
            </Link>
<Link href="/healthprofile">
              <Button
                variant="outline"
                size="lg"
                className="w-full text-lg px-6 py-8 rounded-xl border-2 border-indigo-300 hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-200 h-auto flex flex-col gap-3"
              >
                <Activity className="w-8 h-8" />
                <div className="text-center">
                  <div className="font-bold">Health Profile</div>
                  <div className="text-sm opacity-75">Manage your health data</div>
                </div>
              </Button>
            </Link>
            {/* R2,C2 - Vitals */}
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

            {/* R2,C3 - Emergency SOS */}
            
            
            <Link href="/calculators">
              <Button
                variant="outline"
                size="lg"
                className="w-full text-lg px-6 py-8 rounded-xl border-2 border-pink-300 hover:border-pink-500 hover:bg-pink-50 transition-all duration-200 h-auto flex flex-col gap-3"
              >
                <Calculator className="w-8 h-8" />
                <div className="text-center">
                  <div className="font-bold">Medical Calculators</div>
                  <div className="text-sm opacity-75">Essential health calculations</div>
                </div>
              </Button>
            </Link>
            <Link href="/settings">
              <Button
                variant="outline"
                size="lg"
                className="w-full text-lg px-6 py-8 rounded-xl border-2 border-gray-300 hover:border-gray-500 hover:bg-gray-50 transition-all duration-200 h-auto flex flex-col gap-3"
              >
                <Settings className="w-8 h-8" />
                <div className="text-center">
                  <div className="font-bold">Settings</div>
                  <div className="text-sm opacity-75">Configure your preferences</div>
                </div>
              </Button>
            </Link>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-12">
            {/* AI-Powered Diagnosis */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 hover:shadow-lg transition-shadow duration-200">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">AI Medical Analysis</h3>
              <p className="text-slate-600 leading-relaxed">
                Upload photos of injuries or describe symptoms for instant AI-powered medical guidance and first aid recommendations.
              </p>
            </div>

            {/* Hospital Network */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 hover:shadow-lg transition-shadow duration-200">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Hospital Network</h3>
              <p className="text-slate-600 leading-relaxed">
                Find the nearest hospitals, emergency rooms, and medical facilities with real-time directions and contact information.
              </p>
            </div>

            {/* Emergency Contacts */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 hover:shadow-lg transition-shadow duration-200">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Emergency Contacts</h3>
              <p className="text-slate-600 leading-relaxed">
                Manage and alert your emergency contacts instantly during critical situations.
              </p>
            </div>

            {/* First Aid Box Setup */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 hover:shadow-lg transition-shadow duration-200">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">First Aid Box Setup</h3>
              <p className="text-slate-600 leading-relaxed">
                Complete guide to building and maintaining first aid kits for home, car, office, and travel.
              </p>
            </div>

            {/* Vital Signs Monitor */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 hover:shadow-lg transition-shadow duration-200">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                <Activity className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Vital Signs Tracking</h3>
              <p className="text-slate-600 leading-relaxed">
                Monitor and track vital signs including heart rate, blood pressure, and temperature with trend analysis.
              </p>
            </div>

            {/* Medical Calculators */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 hover:shadow-lg transition-shadow duration-200">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                <Calculator className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Medical Calculators</h3>
              <p className="text-slate-600 leading-relaxed">
                BMI calculator, medication dosages, and other essential medical calculations for better health management.
              </p>
            </div>
          </div>

          {/* Emergency Preparedness Section */}
          <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-6 sm:p-8 border border-red-200">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Emergency Preparedness</h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Be ready for any medical emergency with our comprehensive preparation tools and resources.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-semibold text-slate-800 mb-1">24/7 Ready</h4>
                <p className="text-sm text-slate-600">Always available when you need help</p>
              </div>

              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <Smartphone className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold text-slate-800 mb-1">Offline Access</h4>
                <p className="text-sm text-slate-600">Works without internet connection</p>
              </div>

              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <MapPin className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <h4 className="font-semibold text-slate-800 mb-1">Location Aware</h4>
                <p className="text-sm text-slate-600">Finds help based on your location</p>
              </div>

              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <Heart className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <h4 className="font-semibold text-slate-800 mb-1">Health Monitoring</h4>
                <p className="text-sm text-slate-600">Tracks vital signs and health metrics</p>
              </div>
            </div>
          </div>

          {/* Emergency Notice */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-6 sm:p-8 text-center mb-12 sm:mb-16">
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

          {/* PWA Install Section */}
          {!isInstalled && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 sm:p-8 text-center mb-12 sm:mb-16">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-white" />
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-blue-800 mb-3">
                📱 Install DocAI App
              </h3>

              <p className="text-blue-700 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-6">
                Get instant access to emergency medical assistance, even when you're offline!
                Install DocAI on your device for faster access and better performance.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                {/* Android/Desktop Install Button */}
                {deferredPrompt && (
                  <Button
                    onClick={handleInstallClick}
                    size="lg"
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Download className="w-5 h-5 mr-3" />
                    Install App Now
                  </Button>
                )}

                {/* iOS Instructions */}
                {isIOS && !deferredPrompt && (
                  <div className="bg-white/80 backdrop-blur-sm border border-blue-200 rounded-xl p-4 max-w-md">
                    <div className="flex items-center gap-3 mb-3">
                      <Monitor className="w-6 h-6 text-blue-600" />
                      <h4 className="font-semibold text-blue-800">Add to Home Screen</h4>
                    </div>
                    <div className="text-sm text-blue-700 text-left">
                      <p className="mb-2">To install on iOS:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>
                          Tap the Share button{" "}
                          <span className="inline-block">📤</span> in Safari
                        </li>
                        <li>Scroll down and tap "Add to Home Screen"</li>
                        <li>Tap "Add" to confirm installation</li>
                      </ol>
                    </div>
                  </div>
                )}

                {/* Fallback for browsers without install prompt */}
                {!deferredPrompt && !isIOS && (
                  <div className="bg-white/80 backdrop-blur-sm border border-blue-200 rounded-xl p-4 max-w-md">
                    <div className="flex items-center gap-3 mb-3">
                      <Monitor className="w-6 h-6 text-blue-600" />
                      <h4 className="font-semibold text-blue-800">Browser Support</h4>
                    </div>
                    <p className="text-sm text-blue-700">
                      For the best experience, use Chrome, Edge, or Firefox to install DocAI as an app.
                    </p>
                  </div>
                )}
              </div>

              {/* Benefits List */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 max-w-3xl mx-auto">
                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4">
                  <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <h5 className="font-semibold text-blue-800 mb-1">Offline Access</h5>
                  <p className="text-xs text-blue-700">Works without internet for emergencies</p>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4">
                  <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <h5 className="font-semibold text-blue-800 mb-1">Faster Loading</h5>
                  <p className="text-xs text-blue-700">Instant startup from home screen</p>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4">
                  <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <h5 className="font-semibold text-blue-800 mb-1">Push Notifications</h5>
                  <p className="text-xs text-blue-700">Emergency alerts and reminders</p>
                </div>
              </div>
            </div>
          )}

          {/* App Already Installed Message */}
          {isInstalled && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 sm:p-8 text-center mb-12 sm:mb-16">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-green-800 mb-3">
                ✅ DocAI App Installed!
              </h3>

              <p className="text-green-700 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
                Great! You're all set with offline access and faster performance.
                DocAI is now available from your home screen for instant emergency assistance.
              </p>
            </div>
          )}

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
