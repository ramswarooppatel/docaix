"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { WifiOff, Wifi, AlertTriangle } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      
      if (!online) {
        setShowOfflineMessage(true);
      } else if (showOfflineMessage) {
        // Hide message after 3 seconds when back online
        setTimeout(() => setShowOfflineMessage(false), 3000);
      }
    };

    // Set initial status
    updateOnlineStatus();

    // Listen for online/offline events
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, [showOfflineMessage]);

  if (!showOfflineMessage) {
    return null;
  }

  return (
    <Card className={`fixed top-4 left-4 right-4 z-50 shadow-xl transition-all duration-300 ${
      isOnline ? 'border-green-300 bg-green-50' : 'border-orange-300 bg-orange-50'
    }`}>
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            isOnline ? 'bg-green-600' : 'bg-orange-600'
          }`}>
            {isOnline ? (
              <Wifi className="w-4 h-4 text-white" />
            ) : (
              <WifiOff className="w-4 h-4 text-white" />
            )}
          </div>
          <div className="flex-1">
            <h3 className={`font-semibold text-sm ${
              isOnline ? 'text-green-900' : 'text-orange-900'
            }`}>
              {isOnline ? 'Back Online!' : 'You\'re Offline'}
            </h3>
            <p className={`text-xs ${
              isOnline ? 'text-green-700' : 'text-orange-700'
            }`}>
              {isOnline 
                ? 'All features are now available.' 
                : 'Some features may be limited. Emergency guidance still works!'
              }
            </p>
          </div>
          {!isOnline && (
            <AlertTriangle className="w-5 h-5 text-orange-600" />
          )}
        </div>
      </CardContent>
    </Card>
  );
};