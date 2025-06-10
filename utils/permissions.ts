export interface PermissionStatus {
  location: 'granted' | 'denied' | 'prompt' | 'unknown';
  microphone: 'granted' | 'denied' | 'prompt' | 'unknown';
  camera: 'granted' | 'denied' | 'prompt' | 'unknown';
  notifications: 'granted' | 'denied' | 'default' | 'unknown';
  storage: 'granted' | 'denied' | 'prompt' | 'unknown';
}

export const checkPermissionStatus = async (): Promise<PermissionStatus> => {
  const status: PermissionStatus = {
    location: 'unknown',
    microphone: 'unknown',
    camera: 'unknown',
    notifications: 'unknown',
    storage: 'unknown'
  };

  try {
    if ('permissions' in navigator) {
      // Check location
      try {
        const locationResult = await navigator.permissions.query({ name: 'geolocation' });
        status.location = locationResult.state as any;
      } catch (e) {}

      // Check microphone
      try {
        const micResult = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        status.microphone = micResult.state as any;
      } catch (e) {}

      // Check camera
      try {
        const cameraResult = await navigator.permissions.query({ name: 'camera' as PermissionName });
        status.camera = cameraResult.state as any;
      } catch (e) {}

      // Check storage
      try {
        if ('storage' in navigator.permissions) {
          const storageResult = await navigator.permissions.query({ name: 'persistent-storage' as PermissionName });
          status.storage = storageResult.state as any;
        }
      } catch (e) {}
    }

    // Check notifications
    if ('Notification' in window) {
      status.notifications = Notification.permission as any;
    }
  } catch (error) {
    console.error('Error checking permissions:', error);
  }

  return status;
};

export const requestLocationPermission = async (): Promise<boolean> => {
  try {
    await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      });
    });
    return true;
  } catch (error) {
    console.error('Location permission denied:', error);
    return false;
  }
};

export const requestMicrophonePermission = async (): Promise<boolean> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch (error) {
    console.error('Microphone permission denied:', error);
    return false;
  }
};

export const requestCameraPermission = async (): Promise<boolean> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch (error) {
    console.error('Camera permission denied:', error);
    return false;
  }
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Notification permission denied:', error);
    return false;
  }
};

export const getMissingCriticalPermissions = async (): Promise<string[]> => {
  const status = await checkPermissionStatus();
  const missing: string[] = [];

  if (status.location !== 'granted') {
    missing.push('location');
  }
  if (status.microphone !== 'granted') {
    missing.push('microphone');
  }
  if (status.notifications !== 'granted') {
    missing.push('notifications');
  }

  return missing;
};