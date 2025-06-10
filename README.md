# LN22Lab - Emergency Medical Guide and First Aid Platform

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/yourusername/ln22lab)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-v18-blue.svg)](https://reactjs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-v14-black.svg)](https://nextjs.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-v3-38B2AC.svg)](https://tailwindcss.com/)

LN22Lab is a comprehensive emergency medical guide and first aid platform designed to provide immediate, accessible first aid information during emergencies, with both online and offline capabilities.

![LN22Lab Screenshot](https://via.placeholder.com/800x400?text=LN22Lab+Screenshot)

## 📋 Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Architecture](#architecture)
- [API Reference](#api-reference)
- [Progressive Web App](#progressive-web-app)
- [Offline Capabilities](#offline-capabilities)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

- **Emergency Guides**: Step-by-step instructions for common medical emergencies
- **CPR Guide**: Interactive CPR instructions with metronome and timer
- **First Aid Box**: Customizable first aid kit setup for different environments
- **Offline Access**: Complete medical reference available without internet
- **PWA Support**: Install as a native app on mobile and desktop devices
- **Responsive Design**: Optimized for all device sizes
- **Accessibility**: High-contrast mode and screen reader support
- **Smart Maintenance**: Track expiry dates and usage of first aid supplies

## 🚀 Installation

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/ln22lab.git
cd ln22lab
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

4. Start the development server:

```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 💻 Usage

### Online Mode

Access the full suite of features when connected to the internet:

- Medical condition database with search functionality
- Interactive guides with multimedia support
- User profile synchronization
- Emergency service location finder

### Offline Mode

Critical features remain available without internet:

- Complete first aid reference
- Emergency contact information
- Step-by-step CPR guide
- Preloaded medical condition database

## 🏗️ Architecture

LN22Lab is built with a modern tech stack:

- **Frontend**: React with Next.js
- **Styling**: TailwindCSS for responsive design
- **State Management**: React Context API
- **API**: Server-side Next.js API routes
- **Offline Support**: Service Worker with cache-first strategy
- **Database**: (Your database choice here)

## 📡 API Reference

### Health Profile API

```
POST /api/health-profile
```

Creates or updates a user's health profile.

**Request Body:**
```json
{
    "age": 30,
    "gender": "female",
    "weight": 65,
    "height": 170,
    "medical_conditions": ["asthma"],
    "medications": ["albuterol"],
    "allergies": ["peanuts"],
    "lifestyle": {
        "activity_level": "moderate",
        "smoking": "never",
        "alcohol": "occasional",
        "sleep_hours": "7-8"
    }
}
```

**Response:**
```json
{
    "profile": {
        "age": 30,
        "gender": "female",
        "weight": 65,
        "height": 170,
        "bmi": 22.5,
        "bmi_category": "normal",
        "medical_conditions": ["asthma"],
        "medications": ["albuterol"],
        "allergies": ["peanuts"],
        "lifestyle": {
            "activity_level": "moderate",
            "smoking": "never",
            "alcohol": "occasional",
            "sleep_hours": "7-8"
        }
    },
    "recommendations": {
        "general_health_tips": ["..."],
        "diet_plan": {"..."},
        "exercise_recommendations": ["..."],
        "lifestyle_changes": ["..."]
    }
}
```

### JSON Structured API

```
POST /api/json
```

Converts unstructured medical text into structured JSON format.

## 📱 Progressive Web App

LN22Lab is designed as a Progressive Web App (PWA) that can be installed on both mobile and desktop devices:

- **Installation**: Use the "Add to Home Screen" option on mobile or installation prompt on desktop
- **Updates**: Automatic updates when new versions are available
- **Performance**: Optimized loading times with asset caching

## 🔌 Offline Capabilities

The app uses a sophisticated Service Worker implementation:

- **Cache Strategy**: Cache-first for static assets, network-first for API calls
- **Offline Medical Guide**: Complete database of medical conditions
- **Emergency Mode**: Special UI for offline emergency situations
- **Background Sync**: Saves user actions to sync when back online

## 📂 Project Structure

```
ln22lab/
├── app/                   # Next.js App Router
│   ├── api/               # API routes
│   ├── cpr-guide/         # CPR guide page
│   ├── firstaidbox/       # First aid kit setup guide
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # Reusable components
├── public/                # Static assets
│   ├── sw.js              # Service Worker
│   └── offline-medical-data.json  # Offline data
├── styles/                # Additional styles
├── postcss.config.mjs     # PostCSS configuration
├── tailwind.config.js     # Tailwind configuration
└── package.json           # Dependencies and scripts
```

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Made with ❤️ by [Your Name](https://github.com/yourusername)