"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  MapPin, 
  Mic, 
  Bell, 
  Camera, 
  Smartphone, 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Settings,
  RefreshCw
} from 'lucide-react';

interface PermissionState {
  location: 'granted' | 'denied' | 'prompt' | 'unknown';
  microphone: 'granted' | 'denied' | 'prompt' | 'unknown';
  camera: 'granted' | 'denied' | 'prompt' | 'unknown';
  notifications: 'granted' | 'denied' | 'default' | 'unknown';
  storage: 'granted' | 'denied' | 'prompt' | 'unknown';
}

interface PermissionManagerProps {
  onPermissionsComplete?: (permissions: PermissionState) => void;
  showOnlyMissing?: boolean;
}

export const PermissionManager: React.FC<PermissionManagerProps> = ({ 
  onPermissionsComplete,
  showOnlyMissing = false 
}) => {
  const [permissions, setPermissions] = useState<PermissionState>({
    location: 'unknown',
    microphone: 'unknown',
    camera: 'unknown',
    notifications: 'unknown',
    storage: 'unknown'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const detectMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileKeywords = ['mobile', 'android', 'iphone', 'ipad', 'ipod'];
      const isMobileDevice = mobileKeywords.some(keyword => userAgent.includes(keyword)) ||
                            window.innerWidth <= 768 ||
                            'ontouchstart' in window;
      setIsMobile(isMobileDevice);
    };

    detectMobile();
    window.addEventListener('resize', detectMobile);
    return () => window.removeEventListener('resize', detectMobile);
  }, []);

  // Check current permissions on load
  useEffect(() => {
    checkAllPermissions();
  }, []);

  // Auto-show permission modal on mobile for first visit
  useEffect(() => {
    if (isMobile && permissions.location === 'unknown') {
      const hasShownPermissions = localStorage.getItem('permissions-requested');
      if (!hasShownPermissions) {
        setShowPermissionModal(true);
      }
    }
  }, [isMobile, permissions.location]);

  const checkAllPermissions = async () => {
    const newPermissions: PermissionState = { ...permissions };

    try {
      // Check location permission
      if ('permissions' in navigator) {
        try {
          const locationResult = await navigator.permissions.query({ name: 'geolocation' });
          newPermissions.location = locationResult.state as any;
        } catch (e) {
          newPermissions.location = 'unknown';
        }

        // Check microphone permission
        try {
          const micResult = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          newPermissions.microphone = micResult.state as any;
        } catch (e) {
          newPermissions.microphone = 'unknown';
        }

        // Check camera permission
        try {
          const cameraResult = await navigator.permissions.query({ name: 'camera' as PermissionName });
          newPermissions.camera = cameraResult.state as any;
        } catch (e) {
          newPermissions.camera = 'unknown';
        }

        // Check storage permission (for persistent storage)
        try {
          if ('storage' in navigator.permissions) {
            const storageResult = await navigator.permissions.query({ name: 'persistent-storage' as PermissionName });
            newPermissions.storage = storageResult.state as any;
          }
        } catch (e) {
          newPermissions.storage = 'unknown';
        }
      }

      // Check notification permission
      if ('Notification' in window) {
        newPermissions.notifications = Notification.permission as any;
      }

      setPermissions(newPermissions);
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  };

  const requestPermission = async (type: keyof PermissionState) => {
    setIsLoading(true);
    
    try {
      switch (type) {
        case 'location':
          try {
            await new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000
              });
            });
            setPermissions(prev => ({ ...prev, location: 'granted' }));
          } catch (error) {
            setPermissions(prev => ({ ...prev, location: 'denied' }));
          }
          break;

        case 'microphone':
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            setPermissions(prev => ({ ...prev, microphone: 'granted' }));
          } catch (error) {
            setPermissions(prev => ({ ...prev, microphone: 'denied' }));
          }
          break;

        case 'camera':
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(track => track.stop());
            setPermissions(prev => ({ ...prev, camera: 'granted' }));
          } catch (error) {
            setPermissions(prev => ({ ...prev, camera: 'denied' }));
          }
          break;

        case 'notifications':
          try {
            const permission = await Notification.requestPermission();
            setPermissions(prev => ({ ...prev, notifications: permission as any }));
          } catch (error) {
            setPermissions(prev => ({ ...prev, notifications: 'denied' }));
          }
          break;

        case 'storage':
          try {
            if ('storage' in navigator && 'persist' in navigator.storage) {
              const granted = await navigator.storage.persist();
              setPermissions(prev => ({ ...prev, storage: granted ? 'granted' : 'denied' }));
            }
          } catch (error) {
            setPermissions(prev => ({ ...prev, storage: 'denied' }));
          }
          break;
      }
    } catch (error) {
      console.error(`Error requesting ${type} permission:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const requestAllPermissions = async () => {
    setIsLoading(true);
    
    const permissionTypes: (keyof PermissionState)[] = [
      'location', 
      'microphone', 
      'camera', 
      'notifications', 
      'storage'
    ];

    for (const type of permissionTypes) {
      await requestPermission(type);
      // Small delay between requests to avoid overwhelming the user
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    localStorage.setItem('permissions-requested', 'true');
    setShowPermissionModal(false);
    
    if (onPermissionsComplete) {
      onPermissionsComplete(permissions);
    }
  };

  const getPermissionIcon = (status: string) => {
    switch (status) {
      case 'granted':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'denied':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getPermissionColor = (status: string) => {
    switch (status) {
      case 'granted':
        return 'border-green-200 bg-green-50 text-green-800';
      case 'denied':
        return 'border-red-200 bg-red-50 text-red-800';
      default:
        return 'border-yellow-200 bg-yellow-50 text-yellow-800';
    }
  };

  const permissionItems = [
    {
      key: 'location' as const,
      icon: MapPin,
      title: 'Location Access',
      description: 'Required for emergency services, hospital finding, and location-based medical guidance',
      critical: true
    },
    {
      key: 'microphone' as const,
      icon: Mic,
      title: 'Microphone Access',
      description: 'Enables voice commands and emergency voice calls',
      critical: true
    },
    {
      key: 'camera' as const,
      icon: Camera,
      title: 'Camera Access',
      description: 'Allows photo analysis of injuries and medical conditions',
      critical: false
    },
    {
      key: 'notifications' as const,
      icon: Bell,
      title: 'Push Notifications',
      description: 'Receive emergency alerts, medication reminders, and health tips',
      critical: true
    },
    {
      key: 'storage' as const,
      icon: Smartphone,
      title: 'Persistent Storage',
      description: 'Store app data for offline access during emergencies',
      critical: false
    }
  ];

  // Filter permissions if showing only missing ones
  const filteredItems = showOnlyMissing 
    ? permissionItems.filter(item => permissions[item.key] !== 'granted')
    : permissionItems;

  // Show compact version for settings page
  if (showOnlyMissing && filteredItems.length === 0) {
    return (
      <div className="text-center py-4">
        <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
        <p className="text-sm text-green-700 font-medium">All permissions granted!</p>
      </div>
    );
  }

  return (
    <>
      {/* Permission Cards */}
      <div className="space-y-4">
        {filteredItems.map((item) => {
          const IconComponent = item.icon;
          const status = permissions[item.key];
          
          return (
            <Card key={item.key} className={`border-2 ${getPermissionColor(status)} transition-all duration-200`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-white/50">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm">{item.title}</h3>
                      {item.critical && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                          Critical
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mb-3">{item.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getPermissionIcon(status)}
                        <span className="text-sm font-medium capitalize">
                          {status === 'default' ? 'Not Set' : status}
                        </span>
                      </div>
                      
                      {status !== 'granted' && (
                        <Button
                          onClick={() => requestPermission(item.key)}
                          disabled={isLoading}
                          size="sm"
                          className="h-7 text-xs"
                        >
                          {isLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Grant'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Mobile Permission Modal */}
      {showPermissionModal && isMobile && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-slate-800">
                🚨 Emergency Permissions Required
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-600 text-center mb-4">
                DocAI needs these permissions to provide life-saving emergency assistance.
                Your privacy is protected and data stays on your device.
              </p>

              <div className="space-y-3">
                {permissionItems.filter(item => item.critical).map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <div key={item.key} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <IconComponent className="w-5 h-5 text-red-600" />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.title}</h4>
                        <p className="text-xs text-slate-600">{item.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => {
                    setShowPermissionModal(false);
                    localStorage.setItem('permissions-requested', 'true');
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Skip for Now
                </Button>
                <Button
                  onClick={requestAllPermissions}
                  disabled={isLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Shield className="w-4 h-4 mr-2" />
                  )}
                  Grant Permissions
                </Button>
              </div>

              <p className="text-xs text-slate-500 text-center mt-4">
                You can change these permissions later in Settings
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      {!showOnlyMissing && (
        <div className="flex gap-3 mt-6">
          <Button
            onClick={requestAllPermissions}
            disabled={isLoading}
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Shield className="w-4 h-4 mr-2" />
            )}
            Grant All Permissions
          </Button>
          
          <Button
            onClick={checkAllPermissions}
            variant="outline"
            className="flex-1"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Status
          </Button>
        </div>
      )}
    </>
  );
};