"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, X, Smartphone, Monitor, Shield, Bell, MapPin } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode
    const checkStandalone = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
                              (window.navigator as any).standalone ||
                              document.referrer.includes('android-app://');
      setIsStandalone(isStandaloneMode);
    };

    // Check device types
    const checkDeviceTypes = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      
      // Check if iOS
      const isIOSDevice = /ipad|iphone|ipod/.test(userAgent) ||
                         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      setIsIOS(isIOSDevice);

      // Check if Android
      const isAndroidDevice = /android/.test(userAgent);
      setIsAndroid(isAndroidDevice);

      // Check if mobile (any mobile device)
      const isMobileDevice = isIOSDevice || isAndroidDevice || 
                            /mobile|tablet|webos|blackberry|iemobile|opera mini/i.test(userAgent) ||
                            window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
    };

    checkStandalone();
    checkDeviceTypes();

    // Show install prompt INSTANTLY for mobile devices (if not already installed)
    if (!isStandalone) {
      const isMobileDevice = /android|ipad|iphone|ipod|mobile|tablet|webos|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase()) ||
                            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ||
                            window.innerWidth <= 768;
      
      if (isMobileDevice) {
        // Show immediately without checking localStorage
        setShowInstallPrompt(true);
      }
    }

    // Listen for beforeinstallprompt event (Android/Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show install prompt immediately on mobile
      if (isMobile && !isStandalone) {
        setShowInstallPrompt(true);
      }
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isStandalone, isMobile]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setShowInstallPrompt(false);
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error during install:', error);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Don't save to localStorage - allow it to show again on next visit
  };

  // Don't show if already installed
  if (isStandalone) {
    return null;
  }

  // Don't show on desktop unless there's a deferred prompt
  if (!isMobile && !deferredPrompt) {
    return null;
  }

  return (
    <>
      {/* Android Install Prompt */}
      {isAndroid && deferredPrompt && showInstallPrompt && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <Card className="w-full max-w-sm bg-white shadow-2xl border-2 border-green-300 animate-in zoom-in-95 duration-300">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-xl text-slate-800 mb-2">
                  🚨 Install DocAI Emergency App
                </h3>
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                  Get instant access to life-saving medical assistance, even when offline! 
                  Perfect for emergencies.
                </p>

                {/* Benefits for Android */}
                <div className="space-y-2 mb-6 text-left">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                      <MapPin className="w-3 h-3 text-red-600" />
                    </div>
                    <span className="text-slate-700">Emergency location sharing</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <Smartphone className="w-3 h-3 text-blue-600" />
                    </div>
                    <span className="text-slate-700">Works offline during emergencies</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                      <Bell className="w-3 h-3 text-purple-600" />
                    </div>
                    <span className="text-slate-700">Emergency push notifications</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleDismiss}
                    variant="outline"
                    size="sm"
                    className="flex-1 border-slate-300"
                  >
                    Later
                  </Button>
                  <Button
                    onClick={handleInstallClick}
                    size="sm"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-lg"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Install Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* iOS Install Instructions */}
      {isIOS && showInstallPrompt && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <Card className="w-full max-w-sm bg-white shadow-2xl border-2 border-blue-300 animate-in zoom-in-95 duration-300">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Monitor className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-xl text-slate-800 mb-2">
                  📱 Add DocAI to Home Screen
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  Install DocAI for instant emergency medical assistance!
                </p>

                {/* iOS Installation Steps */}
                <div className="bg-blue-50 rounded-lg p-4 mb-4 text-left">
                  <p className="font-semibold text-blue-800 mb-2">Installation Steps:</p>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-blue-700">
                    <li className="flex items-center gap-2">
                      <span>Tap the Share button</span>
                      <span className="text-lg">📤</span>
                      <span>in Safari</span>
                    </li>
                    <li>Scroll down and tap "Add to Home Screen"</li>
                    <li>Tap "Add" to confirm installation</li>
                  </ol>
                </div>

                {/* Benefits for iOS */}
                <div className="space-y-2 mb-6 text-left">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                      <Shield className="w-3 h-3 text-red-600" />
                    </div>
                    <span className="text-slate-700">Emergency medical guidance</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <Smartphone className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-slate-700">Instant access from home screen</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                      <Bell className="w-3 h-3 text-purple-600" />
                    </div>
                    <span className="text-slate-700">Works like a native app</span>
                  </div>
                </div>

                <Button
                  onClick={handleDismiss}
                  variant="outline"
                  size="sm"
                  className="w-full border-blue-300"
                >
                  <X className="w-4 h-4 mr-2" />
                  I'll Install Later
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Non-mobile devices with deferred prompt */}
      {!isMobile && deferredPrompt && showInstallPrompt && (
        <Card className="fixed bottom-4 right-4 z-50 border-blue-300 bg-blue-50 shadow-xl w-80 animate-in slide-in-from-bottom-4 duration-300">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 mb-1">
                  Install DocAI Emergency App
                </h3>
                <p className="text-sm text-blue-700 mb-3">
                  Get instant access to emergency medical assistance!
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={handleInstallClick}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Install
                  </Button>
                  <Button
                    onClick={handleDismiss}
                    variant="outline"
                    size="sm"
                    className="border-blue-300"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};