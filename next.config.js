/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable service worker in production
  swcMinify: true,
  
  // PWA optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Headers for PWA
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // Image optimization for PWA icons
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
  },
};

module.exports = nextConfig;