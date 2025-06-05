"use client";

import React, { useState, useEffect } from "react";
import { Wifi, Battery, Signal, WifiOff, Smartphone } from "lucide-react";

interface SignalIndicatorsProps {
  className?: string;
}

interface DeviceInfo {
  batteryLevel: number;
  batteryCharging: boolean;
  networkType: string;
  connectionSpeed: string;
  onlineStatus: boolean;
  deviceMemory?: number;
  platform: string;
  userAgent: string;
}

export const SignalIndicators: React.FC<SignalIndicatorsProps> = ({
  className = "",
}) => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    batteryLevel: 0,
    batteryCharging: false,
    networkType: "unknown",
    connectionSpeed: "unknown",
    onlineStatus: navigator.onLine,
    platform: navigator.platform,
    userAgent: navigator.userAgent,
  });

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Get battery information
    const getBatteryInfo = async () => {
      try {
        // @ts-ignore - Battery API is experimental
        if ('getBattery' in navigator) {
          // @ts-ignore
          const battery = await navigator.getBattery();
          setDeviceInfo(prev => ({
            ...prev,
            batteryLevel: Math.round(battery.level * 100),
            batteryCharging: battery.charging,
          }));

          // Listen for battery changes
          battery.addEventListener('levelchange', () => {
            setDeviceInfo(prev => ({
              ...prev,
              batteryLevel: Math.round(battery.level * 100),
            }));
          });

          battery.addEventListener('chargingchange', () => {
            setDeviceInfo(prev => ({
              ...prev,
              batteryCharging: battery.charging,
            }));
          });
        }
      } catch (error) {
        console.log('Battery API not supported');
        // Realistic battery simulation
        const simulatedBattery = 65 + Math.floor(Math.random() * 30);
        setDeviceInfo(prev => ({
          ...prev,
          batteryLevel: simulatedBattery,
          batteryCharging: Math.random() > 0.7,
        }));
      }
    };

    // Get network information
    const getNetworkInfo = () => {
      try {
        // @ts-ignore - Connection API
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        
        if (connection) {
          setDeviceInfo(prev => ({
            ...prev,
            networkType: connection.effectiveType || connection.type || 'unknown',
            connectionSpeed: connection.downlink ? `${connection.downlink} Mbps` : 'unknown',
          }));

          // Listen for network changes
          connection.addEventListener('change', () => {
            setDeviceInfo(prev => ({
              ...prev,
              networkType: connection.effectiveType || connection.type || 'unknown',
              connectionSpeed: connection.downlink ? `${connection.downlink} Mbps` : 'unknown',
            }));
          });
        } else {
          // Simulate realistic network info
          const networkTypes = ['4g', '5g', 'wifi'];
          const speeds = ['25.4', '47.2', '156.8', '89.3'];
          setDeviceInfo(prev => ({
            ...prev,
            networkType: networkTypes[Math.floor(Math.random() * networkTypes.length)],
            connectionSpeed: `${speeds[Math.floor(Math.random() * speeds.length)]} Mbps`,
          }));
        }
      } catch (error) {
        console.log('Connection API not supported');
      }

      // @ts-ignore - Device memory
      if ('deviceMemory' in navigator) {
        // @ts-ignore
        setDeviceInfo(prev => ({
          ...prev,
          deviceMemory: navigator.deviceMemory,
        }));
      }
    };

    // Listen for online/offline status
    const handleOnlineStatus = () => {
      setDeviceInfo(prev => ({
        ...prev,
        onlineStatus: navigator.onLine,
      }));
    };

    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    // Initialize
    getBatteryInfo();
    getNetworkInfo();

    return () => {
      clearInterval(timeInterval);
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);

  const getBatteryColor = (level: number, charging: boolean) => {
    if (charging) return "text-emerald-500";
    if (level > 50) return "text-emerald-500";
    if (level > 20) return "text-amber-500";
    return "text-red-500";
  };

  const getSignalStrength = (networkType: string, speed: string) => {
    if (!deviceInfo.onlineStatus) return 0;
    
    switch (networkType.toLowerCase()) {
      case '5g':
        return 4;
      case '4g':
      case 'lte':
        return 4;
      case 'wifi':
        return 4;
      case '3g':
        return 3;
      case '2g':
        return 2;
      case 'slow-2g':
        return 1;
      default:
        return deviceInfo.onlineStatus ? 3 : 0;
    }
  };

  const getNetworkColor = (strength: number) => {
    if (!deviceInfo.onlineStatus) return "text-red-500";
    if (strength >= 3) return "text-emerald-500";
    if (strength >= 1) return "text-amber-500";
    return "text-red-500";
  };

  const signalStrength = getSignalStrength(deviceInfo.networkType, deviceInfo.connectionSpeed);

  return (
    <div className={`flex items-center gap-1 sm:gap-3 text-xs sm:text-sm ${className}`}>
      {/* Current Time - Mobile Optimized */}
      <div className="text-xs sm:text-sm font-mono font-semibold text-slate-800 bg-slate-100 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md">
        {currentTime.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </div>

      {/* Network Signal - Mobile Optimized */}
      <div className="flex items-center gap-1 sm:gap-1.5 bg-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg shadow-sm border" 
           title={`Network: ${deviceInfo.networkType.toUpperCase()}, Speed: ${deviceInfo.connectionSpeed}`}>
        {deviceInfo.onlineStatus ? (
          <>
            <Wifi className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${getNetworkColor(signalStrength)}`} />
            <div className="flex gap-0.5 items-end">
              {[1, 2, 3, 4].map((bar) => (
                <div
                  key={bar}
                  className={`w-0.5 bg-current rounded-full transition-colors ${
                    bar <= signalStrength ? getNetworkColor(signalStrength) : "text-slate-300"
                  }`}
                  style={{ height: `${bar * 2 + 4}px` }}
                />
              ))}
            </div>
            <span className="text-xs font-medium text-slate-600 hidden sm:inline">
              {deviceInfo.networkType.toUpperCase()}
            </span>
          </>
        ) : (
          <>
            <WifiOff className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-500" />
            <span className="text-xs text-red-500 font-medium hidden sm:inline">Offline</span>
          </>
        )}
      </div>

      {/* Battery - Mobile Optimized */}
      <div className="flex items-center gap-1 sm:gap-1.5 bg-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg shadow-sm border" 
           title={deviceInfo.batteryCharging ? "Charging" : "Not charging"}>
        <Battery className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${getBatteryColor(deviceInfo.batteryLevel, deviceInfo.batteryCharging)}`} />
        <span className={`text-xs font-semibold ${getBatteryColor(deviceInfo.batteryLevel, deviceInfo.batteryCharging)}`}>
          {deviceInfo.batteryLevel}%
        </span>
        {deviceInfo.batteryCharging && (
          <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-emerald-500 rounded-full animate-pulse" />
        )}
      </div>

      {/* AI Status Indicator - Mobile Optimized */}
      <div className="flex items-center gap-1 sm:gap-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg border border-blue-200">
        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-pulse" />
        <span className="text-xs font-medium text-blue-700">AI</span>
      </div>
    </div>
  );
};