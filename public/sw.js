const CACHE_NAME = 'docai-v1.2.0';
const STATIC_CACHE = 'docai-static-v1.2.0';
const RUNTIME_CACHE = 'docai-runtime-v1.2.0';

// Essential files to cache for offline functionality
const STATIC_ASSETS = [
  '/',
  '/chat',
  '/hospitals',
  '/emergency-sos',
  '/cpr-guide',
  '/firstaidbox',
  '/vitals',
  '/healthprofile',
  '/settings',
  '/calculators',
  '/offline-medical-guide',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Add critical CSS and JS files
  '/_next/static/css/app/layout.css',
  '/_next/static/css/app/globals.css',
];

// API endpoints that should be cached
const API_CACHE_PATTERNS = [
  /^https:\/\/api\.docai\.*/,
  /^\/api\/.*/
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('Service Worker: Caching static assets');
      return cache.addAll(STATIC_ASSETS).catch((error) => {
        console.error('Failed to cache some assets:', error);
        // Cache essential assets individually
        return Promise.allSettled(
          STATIC_ASSETS.map(asset => cache.add(asset))
        );
      });
    }).then(() => {
      console.log('Service Worker: Installation complete');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && 
              cacheName !== STATIC_CACHE && 
              cacheName !== RUNTIME_CACHE) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activation complete');
      return self.clients.claim();
    })
  );
});

// Fetch event - handle requests with offline support
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Handle navigation requests (page loads)
  if (event.request.destination === 'document') {
    event.respondWith(handleNavigationRequest(event.request));
    return;
  }

  // Handle static assets
  if (event.request.destination === 'script' || 
      event.request.destination === 'style' ||
      event.request.destination === 'image') {
    event.respondWith(cacheFirstStrategy(event.request));
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstWithOfflineFallback(event.request));
    return;
  }

  // Default: try cache first, then network
  event.respondWith(cacheFirstStrategy(event.request));
});

// Navigation handler with proper offline medical guide support
async function handleNavigationRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Try network first for navigation
    const networkResponse = await fetch(request, { timeout: 5000 });
    
    if (networkResponse.ok) {
      // Cache successful response
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    console.log('Network failed for navigation, checking cache:', request.url);
    
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('Serving from cache:', request.url);
      return cachedResponse;
    }

    // Special handling for offline medical guide
    if (url.pathname === '/offline-medical-guide' || 
        url.pathname.includes('offline-medical-guide')) {
      
      // Try to get cached offline guide
      const offlineGuideCache = await caches.match('/offline-medical-guide');
      if (offlineGuideCache) {
        return offlineGuideCache;
      }

      // Return a basic offline medical guide page if cache miss
      return new Response(generateOfflineMedicalGuidePage(), {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    // If requesting chat page while offline, redirect to offline guide
    if (url.pathname === '/chat') {
      return Response.redirect('/offline-medical-guide', 302);
    }
    
    // Return offline page for other navigation requests
    return new Response(generateOfflinePage(), {
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// Cache first strategy
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Failed to fetch from network:', request.url);
    
    // Return offline placeholder for images
    if (request.destination === 'image') {
      return new Response(
        `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="200" fill="#f3f4f6"/>
          <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#6b7280">Image Offline</text>
        </svg>`,
        { headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }
    
    throw error;
  }
}

// Network first with offline fallback
async function networkFirstWithOfflineFallback(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('API call failed, checking cache:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline API response
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'This feature requires an internet connection. Please try again when you\'re online.',
        offline: true,
        emergency_note: 'For medical emergencies, call 108 immediately.'
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Generate complete offline medical guide page
function generateOfflineMedicalGuidePage() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>DocAI - Offline Medical Guide</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #1f2937;
          background: linear-gradient(135deg, #f8fafc, #e2e8f0);
        }
        .header {
          background: white;
          border-bottom: 1px solid #e5e7eb;
          padding: 1rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .logo {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #f59e0b, #dc2626);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
        }
        .title {
          font-size: 1.5rem;
          font-weight: bold;
          color: #1f2937;
        }
        .subtitle {
          font-size: 0.875rem;
          color: #6b7280;
        }
        .emergency-banner {
          background: #dc2626;
          color: white;
          padding: 1rem;
          text-align: center;
        }
        .emergency-button {
          background: white;
          color: #dc2626;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: bold;
          font-size: 1.1rem;
          cursor: pointer;
          margin: 10px;
          text-decoration: none;
          display: inline-block;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }
        .conditions-grid {
          display: grid;
          gap: 1.5rem;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        }
        .condition-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          border: 1px solid #e5e7eb;
        }
        .condition-title {
          font-size: 1.25rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
          color: #1f2937;
        }
        .condition-description {
          color: #6b7280;
          margin-bottom: 1rem;
        }
        .priority-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: bold;
          margin-bottom: 1rem;
        }
        .critical { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
        .high { background: #fff7ed; color: #ea580c; border: 1px solid #fed7aa; }
        .medium { background: #fefce8; color: #ca8a04; border: 1px solid #fde68a; }
        .steps-list {
          list-style: none;
          padding: 0;
        }
        .steps-list li {
          margin: 0.5rem 0;
          padding-left: 1.5rem;
          position: relative;
        }
        .steps-list li::before {
          content: counter(step-counter);
          counter-increment: step-counter;
          position: absolute;
          left: 0;
          top: 0;
          background: #3b82f6;
          color: white;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: bold;
        }
        .steps-list { counter-reset: step-counter; }
        .disclaimer {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 2rem;
          margin: 2rem 0;
          text-align: center;
        }
        @media (max-width: 768px) {
          .conditions-grid {
            grid-template-columns: 1fr;
          }
          .container {
            padding: 1rem;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="header-content">
          <div class="logo">🏥</div>
          <div>
            <div class="title">Offline Medical Guide</div>
            <div class="subtitle">Emergency first aid reference - Works without internet</div>
          </div>
        </div>
      </div>

      <div class="emergency-banner">
        <h2>🚨 FOR LIFE-THREATENING EMERGENCIES</h2>
        <a href="tel:108" class="emergency-button">📞 Call 108 Immediately</a>
        <p>Use this guide for basic first aid when professional help is not immediately available</p>
      </div>

      <div class="container">
        <div class="conditions-grid">
          
          <!-- Cardiac Arrest -->
          <div class="condition-card">
            <div class="condition-title">❤️ Cardiac Arrest / Heart Attack</div>
            <div class="priority-badge critical">CRITICAL</div>
            <div class="condition-description">Person is unconscious, not breathing, or has severe chest pain</div>
            <h4>Immediate Steps:</h4>
            <ol class="steps-list">
              <li>Call 108 IMMEDIATELY</li>
              <li>Check for responsiveness - tap shoulders and shout</li>
              <li>Check for breathing - look for chest movement</li>
              <li>If no breathing, begin CPR immediately</li>
              <li>Place heel of hand on center of chest</li>
              <li>Push hard and fast at least 2 inches deep</li>
              <li>Give 30 compressions at 100-120 per minute</li>
              <li>Tilt head back, give 2 rescue breaths</li>
              <li>Continue 30:2 ratio until help arrives</li>
            </ol>
          </div>

          <!-- Choking -->
          <div class="condition-card">
            <div class="condition-title">⚠️ Choking Emergency</div>
            <div class="priority-badge critical">CRITICAL</div>
            <div class="condition-description">Person cannot breathe, speak, or cough effectively</div>
            <h4>Immediate Steps:</h4>
            <ol class="steps-list">
              <li>Ask 'Are you choking?' If they can cough, encourage it</li>
              <li>If they cannot speak/breathe, perform Heimlich maneuver</li>
              <li>Stand behind person, wrap arms around waist</li>
              <li>Make fist, place below ribcage</li>
              <li>Grasp fist with other hand, thrust upward sharply</li>
              <li>Repeat until object is expelled</li>
              <li>If unconscious, begin CPR</li>
              <li>Call 108 immediately</li>
            </ol>
          </div>

          <!-- Severe Bleeding -->
          <div class="condition-card">
            <div class="condition-title">🩸 Severe Bleeding</div>
            <div class="priority-badge critical">CRITICAL</div>
            <div class="condition-description">Heavy bleeding that won't stop with pressure</div>
            <h4>Immediate Steps:</h4>
            <ol class="steps-list">
              <li>Call 108 for severe bleeding</li>
              <li>Put on gloves if available</li>
              <li>Apply direct pressure with clean cloth</li>
              <li>Maintain firm, steady pressure</li>
              <li>If blood soaks through, add more layers</li>
              <li>Elevate wound above heart if possible</li>
              <li>Treat for shock - lay person down</li>
              <li>Monitor breathing and consciousness</li>
            </ol>
          </div>

          <!-- Burns -->
          <div class="condition-card">
            <div class="condition-title">🔥 Burns</div>
            <div class="priority-badge medium">MEDIUM</div>
            <div class="condition-description">Thermal, chemical, or electrical burns</div>
            <h4>Immediate Steps:</h4>
            <ol class="steps-list">
              <li>Remove from heat source immediately</li>
              <li>Cool with running water for 10-20 minutes</li>
              <li>Remove jewelry before swelling</li>
              <li>Cover with clean, dry cloth</li>
              <li>Take pain medication if needed</li>
              <li>Seek medical attention for severe burns</li>
              <li>Call 108 for large or deep burns</li>
            </ol>
          </div>

          <!-- Fractures -->
          <div class="condition-card">
            <div class="condition-title">🦴 Broken Bones / Fractures</div>
            <div class="priority-badge medium">MEDIUM</div>
            <div class="condition-description">Suspected broken bone with pain and deformity</div>
            <h4>Immediate Steps:</h4>
            <ol class="steps-list">
              <li>Do NOT move unless in immediate danger</li>
              <li>Call 108 for obvious fractures</li>
              <li>Immobilize the injured area</li>
              <li>Apply ice wrapped in cloth</li>
              <li>Monitor for shock</li>
              <li>Do NOT try to realign bones</li>
              <li>Keep person warm and comfortable</li>
            </ol>
          </div>

          <!-- High Fever -->
          <div class="condition-card">
            <div class="condition-title">🌡️ High Fever</div>
            <div class="priority-badge medium">MEDIUM</div>
            <div class="condition-description">Body temperature above 101°F (38.3°C)</div>
            <h4>Treatment Steps:</h4>
            <ol class="steps-list">
              <li>Remove excess clothing</li>
              <li>Apply cool, damp cloths to forehead</li>
              <li>Encourage fluid intake</li>
              <li>Give fever reducer as directed</li>
              <li>Monitor for worsening symptoms</li>
              <li>Call 108 if temperature above 104°F</li>
            </ol>
          </div>

          <!-- Allergic Reactions -->
          <div class="condition-card">
            <div class="condition-title">🤧 Allergic Reactions</div>
            <div class="priority-badge high">HIGH</div>
            <div class="condition-description">Mild to severe allergic reactions</div>
            <h4>Treatment Steps:</h4>
            <ol class="steps-list">
              <li>Remove or avoid allergen if known</li>
              <li>For mild: Take antihistamine</li>
              <li>Apply cool compresses</li>
              <li>For severe: Use epinephrine if available</li>
              <li>Call 108 for difficulty breathing</li>
              <li>Help person lie down with legs elevated</li>
            </ol>
          </div>

          <!-- Seizures -->
          <div class="condition-card">
            <div class="condition-title">🧠 Seizures / Convulsions</div>
            <div class="priority-badge high">HIGH</div>
            <div class="condition-description">Uncontrolled electrical activity in brain</div>
            <h4>Response Steps:</h4>
            <ol class="steps-list">
              <li>Stay calm and time the seizure</li>
              <li>Clear area of dangerous objects</li>
              <li>Do NOT restrain the person</li>
              <li>Do NOT put anything in their mouth</li>
              <li>Turn person on side if possible</li>
              <li>Place something soft under head</li>
              <li>Call 108 if seizure lasts over 5 minutes</li>
              <li>Stay until fully conscious</li>
            </ol>
          </div>

        </div>

        <div class="disclaimer">
          <h3>🛡️ Important Medical Disclaimer</h3>
          <p>This guide provides basic first aid information for emergency situations when professional help may not be immediately available. It is not a substitute for professional medical care. Always seek immediate medical attention for serious injuries or conditions. In life-threatening emergencies, call 108 immediately.</p>
          <br>
          <p><strong>This guide works offline and has been designed for emergency use when internet connection is not available.</strong></p>
        </div>
      </div>

      <script>
        // Basic functionality for offline mode
        console.log('Offline Medical Guide loaded successfully');
        
        // Handle emergency call button
        document.querySelectorAll('a[href^="tel:"]').forEach(link => {
          link.addEventListener('click', function(e) {
            console.log('Emergency call initiated');
          });
        });
      </script>
    </body>
    </html>
  `;
}

// Generate basic offline page for other routes
function generateOfflinePage() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>DocAI - Offline Mode</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          margin: 0;
          padding: 20px;
          background: linear-gradient(135deg, #dc2626, #ef4444);
          color: white;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        .container {
          max-width: 500px;
          padding: 40px 20px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          backdrop-filter: blur(10px);
        }
        .icon { font-size: 64px; margin-bottom: 20px; }
        h1 { margin: 0 0 16px 0; font-size: 28px; font-weight: bold; }
        p { margin: 0 0 20px 0; opacity: 0.9; line-height: 1.5; }
        .button {
          background: white;
          color: #dc2626;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          font-size: 16px;
          text-decoration: none;
          display: inline-block;
          margin: 10px;
        }
        .emergency-box {
          background: rgba(255, 255, 255, 0.2);
          padding: 20px;
          border-radius: 12px;
          margin: 20px 0;
        }
        .emergency-number {
          font-size: 36px;
          font-weight: bold;
          margin: 10px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">🏥</div>
        <h1>DocAI - Offline Mode</h1>
        <p>You're currently offline, but emergency medical guidance is still available!</p>
        
        <div class="emergency-box">
          <h2>🚨 FOR EMERGENCIES</h2>
          <div class="emergency-number">📞 108</div>
          <p>Call immediately for life-threatening situations</p>
          <a href="tel:108" class="button">Call 108 Now</a>
        </div>

        <a href="/offline-medical-guide" class="button">📖 Open Medical Guide</a>
        <button onclick="window.location.reload()" class="button">🔄 Retry Connection</button>
        
        <p style="margin-top: 20px; font-size: 14px; opacity: 0.8;">
          Complete first aid reference available offline for emergency situations.
        </p>
      </div>
    </body>
    </html>
  `;
}