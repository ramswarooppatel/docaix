"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Heart,
  Play,
  Pause,
  RotateCcw,
  Timer,
  Users,
  Baby,
  User,
  Phone,
  AlertTriangle,
  CheckCircle,
  Volume2,
  VolumeX,
  Zap,
  Activity,
  Target,
  Info,
  Clock,
  MapPin,
  Shield,
  Stethoscope,
  BookOpen,
  Video,
  Download,
  Share2,
  Calendar,
  Award,
} from "lucide-react";
import Link from "next/link";

const CPRGuidePage = () => {
  const [activeSection, setActiveSection] = useState("overview");
  const [selectedAge, setSelectedAge] = useState("adult");
  const [cprTimer, setCprTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [compressionCount, setCompressionCount] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [metronomeActive, setMetronomeActive] = useState(false);
  const [compressionRate] = useState(100);
  
  // Quiz State
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const metronomeRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Quiz Questions
  const quizQuestions = [
    {
      id: 1,
      question: "What is the correct compression rate for CPR?",
      options: [
        "60-80 compressions per minute",
        "80-100 compressions per minute", 
        "100-120 compressions per minute",
        "120-140 compressions per minute"
      ],
      correct: 2,
      explanation: "The American Heart Association recommends 100-120 compressions per minute for effective CPR."
    },
    {
      id: 2,
      question: "What is the correct compression depth for adult CPR?",
      options: [
        "At least 1 inch (2.5 cm)",
        "At least 1.5 inches (4 cm)",
        "At least 2 inches (5 cm)",
        "At least 3 inches (7.5 cm)"
      ],
      correct: 2,
      explanation: "For adults, compress at least 2 inches (5 cm) but no more than 2.4 inches (6 cm)."
    },
    {
      id: 3,
      question: "What is the correct compression-to-ventilation ratio for adult CPR?",
      options: [
        "15:2",
        "30:2",
        "30:1",
        "15:1"
      ],
      correct: 1,
      explanation: "The standard ratio for adult CPR is 30 chest compressions followed by 2 rescue breaths."
    },
    {
      id: 4,
      question: "When should you call emergency services (108)?",
      options: [
        "After checking for pulse",
        "After starting CPR",
        "Immediately when you find an unresponsive person",
        "After 2 minutes of CPR"
      ],
      correct: 2,
      explanation: "Call 108 immediately when you find an unresponsive person who is not breathing normally."
    },
    {
      id: 5,
      question: "Where should you place your hands for adult chest compressions?",
      options: [
        "On the upper chest near the collar bone",
        "On the lower half of the breastbone (sternum)",
        "On the left side of the chest over the heart",
        "On the right side of the chest"
      ],
      correct: 1,
      explanation: "Place the heel of your hand on the lower half of the breastbone, in the center of the chest."
    },
    {
      id: 6,
      question: "How long should you check for a pulse?",
      options: [
        "No more than 5 seconds",
        "No more than 10 seconds",
        "30 seconds",
        "1 minute"
      ],
      correct: 1,
      explanation: "Check for a pulse for no more than 10 seconds. If no pulse is felt, begin CPR immediately."
    },
    {
      id: 7,
      question: "What should you do between chest compressions?",
      options: [
        "Keep hands on chest with constant pressure",
        "Allow complete chest recoil",
        "Press lightly to maintain contact",
        "Move hands to different positions"
      ],
      correct: 1,
      explanation: "Allow complete chest recoil between compressions to let the heart fill with blood."
    },
    {
      id: 8,
      question: "For infant CPR, how many fingers should you use for compressions?",
      options: [
        "One finger",
        "Two fingers",
        "Three fingers",
        "Whole hand"
      ],
      correct: 1,
      explanation: "Use two fingers (middle and ring finger) placed just below the nipple line for infant CPR."
    },
    {
      id: 9,
      question: "How often should you switch rescuers during CPR?",
      options: [
        "Every minute",
        "Every 2 minutes",
        "Every 5 minutes",
        "Never switch"
      ],
      correct: 1,
      explanation: "Switch rescuers every 2 minutes to prevent fatigue and maintain effective compressions."
    },
    {
      id: 10,
      question: "What is the most important aspect of CPR?",
      options: [
        "Perfect rescue breathing technique",
        "High-quality chest compressions",
        "Checking pulse frequently",
        "Positioning the patient perfectly"
      ],
      correct: 1,
      explanation: "High-quality, uninterrupted chest compressions are the most critical component of CPR."
    }
  ];

  // CPR Steps data
  const cprSteps = {
    adult: [
      {
        id: 1,
        title: "Check Responsiveness",
        description: "Tap shoulders and shout 'Are you okay?'",
        duration: 10,
        image: "https://media.post.rvohealth.io/wp-content/uploads/sites/3/2025/04/3793187-CPR-Artboard-1-1-1024x1007.png",
        details: [
          "Tap the person's shoulders firmly",
          "Shout loudly 'Are you okay?'",
          "Look for any response or movement",
          "If no response, continue to next step"
        ]
      },
      {
        id: 2,
        title: "Call for Help",
        description: "Call 108 and get an AED if available",
        duration: 30,
        image: "/cpr-step2.jpg",
        details: [
          "Call 108 immediately",
          "Ask someone to find an AED",
          "Give clear location details",
          "Don't leave the person alone"
        ]
      },
      {
        id: 3,
        title: "Check Pulse & Breathing",
        description: "Check for pulse at carotid artery for 10 seconds",
        duration: 10,
        image: "/cpr-step3.jpg",
        details: [
          "Place 2 fingers on carotid artery",
          "Check for 5-10 seconds maximum",
          "Look for chest rise and fall",
          "Listen for breathing sounds"
        ]
      },
      {
        id: 4,
        title: "Position Hands",
        description: "Place heel of hand on center of chest",
        duration: 15,
        image: "/cpr-step4.jpg",
        details: [
          "Place heel of one hand on breastbone center",
          "Place other hand on top, interlace fingers",
          "Keep arms straight",
          "Position shoulders directly over hands"
        ]
      },
      {
        id: 5,
        title: "Start Compressions",
        description: "Push hard and fast at least 2 inches deep",
        duration: 120,
        image: "/cpr-step5.jpg",
        details: [
          "Compress at least 2 inches (5cm) deep",
          "Allow complete chest recoil",
          "Minimize interruptions",
          "Count compressions out loud"
        ]
      },
      {
        id: 6,
        title: "Give Rescue Breaths",
        description: "Tilt head, lift chin, give 2 breaths",
        duration: 10,
        image: "/cpr-step6.jpg",
        details: [
          "Tilt head back, lift chin",
          "Pinch nose closed",
          "Make seal over mouth",
          "Give 2 breaths, 1 second each"
        ]
      }
    ],
    child: [
      {
        id: 1,
        title: "Check Responsiveness",
        description: "Tap shoulders gently and call child's name",
        duration: 10,
        image: "/cpr-child-step1.jpg",
        details: [
          "Tap shoulders gently",
          "Call child's name loudly",
          "Look for any response",
          "Be gentle but firm"
        ]
      },
      {
        id: 2,
        title: "Call for Help",
        description: "Provide 2 minutes of CPR before calling if alone",
        duration: 30,
        image: "/cpr-child-step2.jpg",
        details: [
          "If alone, do 2 minutes CPR first",
          "Then call 108",
          "If others present, have them call immediately",
          "Request AED if available"
        ]
      },
      {
        id: 3,
        title: "Check Pulse",
        description: "Check brachial or carotid pulse for 10 seconds",
        duration: 10,
        image: "/cpr-child-step3.jpg",
        details: [
          "Check brachial pulse (inside upper arm)",
          "Or carotid pulse at neck",
          "Check for 5-10 seconds",
          "Look for breathing simultaneously"
        ]
      },
      {
        id: 4,
        title: "Position Hands",
        description: "Use heel of one hand on lower half of breastbone",
        duration: 15,
        image: "/cpr-child-step4.jpg",
        details: [
          "Use heel of one hand only",
          "Place on lower half of breastbone",
          "Keep other hand on forehead",
          "Maintain head tilt"
        ]
      },
      {
        id: 5,
        title: "Compressions",
        description: "Compress 1/3 chest depth, 100-120 per minute",
        duration: 120,
        image: "/cpr-child-step5.jpg",
        details: [
          "Compress 1/3 of chest depth (about 2 inches)",
          "Allow complete recoil",
          "Use smooth, rhythmic compressions",
          "Count: 1 and 2 and 3..."
        ]
      },
      {
        id: 6,
        title: "Rescue Breaths",
        description: "Smaller breaths, watch for chest rise",
        duration: 10,
        image: "/cpr-child-step6.jpg",
        details: [
          "Maintain head tilt, chin lift",
          "Make seal over mouth and nose",
          "Give gentler breaths",
          "Watch for visible chest rise"
        ]
      }
    ],
    infant: [
      {
        id: 1,
        title: "Check Responsiveness",
        description: "Tap feet or rub chest, call baby's name",
        duration: 10,
        image: "/cpr-infant-step1.jpg",
        details: [
          "Tap bottom of feet",
          "Gently rub chest",
          "Call baby's name",
          "Look for any movement"
        ]
      },
      {
        id: 2,
        title: "Position Baby",
        description: "Place on firm surface, support head and neck",
        duration: 15,
        image: "/cpr-infant-step2.jpg",
        details: [
          "Place on firm, flat surface",
          "Support head and neck",
          "Avoid overextending neck",
          "Keep airway open"
        ]
      },
      {
        id: 3,
        title: "Check Pulse",
        description: "Check brachial pulse for 10 seconds",
        duration: 10,
        image: "/cpr-infant-step3.jpg",
        details: [
          "Check brachial pulse on inner upper arm",
          "Use 2-3 fingers",
          "Check for 5-10 seconds maximum",
          "Look for breathing simultaneously"
        ]
      },
      {
        id: 4,
        title: "Position Fingers",
        description: "Two fingers on breastbone, just below nipple line",
        duration: 15,
        image: "/cpr-infant-step4.jpg",
        details: [
          "Use 2 fingers (middle and ring)",
          "Place just below nipple line",
          "On lower half of breastbone",
          "Keep other hand supporting head"
        ]
      },
      {
        id: 5,
        title: "Compressions",
        description: "Compress 1/3 chest depth with 2 fingers",
        duration: 120,
        image: "/cpr-infant-step5.jpg",
        details: [
          "Compress 1/3 chest depth (1.5 inches)",
          "Use only 2 fingers",
          "Allow complete recoil",
          "Smooth, controlled compressions"
        ]
      },
      {
        id: 6,
        title: "Rescue Breaths",
        description: "Cover mouth and nose, gentle puffs",
        duration: 10,
        image: "/cpr-infant-step6.jpg",
        details: [
          "Cover mouth AND nose with your mouth",
          "Give very gentle puffs",
          "Watch for slight chest rise",
          "Don't overinflate"
        ]
      }
    ]
  };

  const compressionRatios = {
    adult: { compressions: 30, breaths: 2 },
    child: { compressions: 30, breaths: 2 },
    infant: { compressions: 30, breaths: 2 }
  };

  // Quiz Functions
  const startQuiz = () => {
    setQuizStarted(true);
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setQuizCompleted(false);
    setScore(0);
    setShowResults(false);
  };

  const selectAnswer = (questionIndex: number, answerIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      completeQuiz();
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const completeQuiz = () => {
    let correctAnswers = 0;
    quizQuestions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correct) {
        correctAnswers++;
      }
    });
    setScore(correctAnswers);
    setQuizCompleted(true);
    setShowResults(true);
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setQuizCompleted(false);
    setScore(0);
    setShowResults(false);
  };

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadge = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 90) return { text: "Excellent", color: "bg-green-100 text-green-800" };
    if (percentage >= 80) return { text: "Very Good", color: "bg-blue-100 text-blue-800" };
    if (percentage >= 70) return { text: "Good", color: "bg-yellow-100 text-yellow-800" };
    if (percentage >= 60) return { text: "Fair", color: "bg-orange-100 text-orange-800" };
    return { text: "Needs Improvement", color: "bg-red-100 text-red-800" };
  };

  const downloadCertificate = () => {
    // Create a simple certificate content
    const certificateContent = `
      CPR Knowledge Certificate
      
      This certifies that the holder has successfully completed
      the CPR Knowledge Check with a score of ${Math.round((score / quizQuestions.length) * 100)}%
      
      Date: ${new Date().toLocaleDateString()}
      Score: ${score}/${quizQuestions.length}
      
      Note: This is an educational certificate and does not replace
      official CPR certification from recognized organizations.
    `;
    
    const blob = new Blob([certificateContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CPR_Certificate_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Timer functions
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setCprTimer(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  // Metronome for compression timing
  useEffect(() => {
    if (metronomeActive) {
      const interval = 60000 / compressionRate;
      metronomeRef.current = setInterval(() => {
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(() => {});
        }
      }, interval);
    } else {
      if (metronomeRef.current) clearInterval(metronomeRef.current);
    }

    return () => {
      if (metronomeRef.current) clearInterval(metronomeRef.current);
    };
  }, [metronomeActive, compressionRate]);

  const startCPR = () => {
    setIsTimerRunning(true);
    setCompressionCount(0);
    setCurrentStep(0);
  };

  const pauseCPR = () => {
    setIsTimerRunning(false);
    setMetronomeActive(false);
  };

  const resetCPR = () => {
    setIsTimerRunning(false);
    setMetronomeActive(false);
    setCprTimer(0);
    setCompressionCount(0);
    setCurrentStep(0);
  };

  const incrementCompressions = () => {
    setCompressionCount(prev => prev + 1);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const sections = [
    { id: "overview", label: "Overview", icon: BookOpen },
    { id: "view_steps", label: "View Steps", icon: Shield },
    { id: "steps", label: "Step-by-Step", icon: Target },
    { id: "practice", label: "Practice Mode", icon: Activity },
    { id: "video", label: "Video Guide", icon: Video },
    { id: "quiz", label: "Knowledge Check", icon: Award },
    { id: "faq", label: "FAQs", icon: Info },
  ];

  const ageGroups = [
    { id: "adult", label: "Adult (8+ years)", icon: User, color: "text-blue-600" },
    { id: "child", label: "Child (1-8 years)", icon: Users, color: "text-green-600" },
    { id: "infant", label: "Infant (<1 year)", icon: Baby, color: "text-purple-600" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-rose-100">
      {/* Hidden audio for metronome */}
      <audio ref={audioRef} preload="auto">
        <source src="/metronome-tick.mp3" type="audio/mpeg" />
      </audio>

      {/* Header */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-lg border-b border-red-200/60 px-3 sm:px-6 py-3 sm:py-4 z-10 shadow-sm">
        <div className="w-full max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="p-1.5 sm:p-2 h-8 w-8 sm:h-9 sm:w-9 hover:bg-red-100 transition-colors"
              >
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
              </Button>
            </Link>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-xs sm:text-sm lg:text-xl text-slate-800 truncate">
                CPR & Life Support Guide
              </h1>
              <p className="text-xs text-slate-600 hidden sm:block">
                Emergency cardiopulmonary resuscitation training
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => window.print()}
              variant="outline"
              size="sm"
              className="border-red-300 text-red-600"
            >
              <Download className="w-4 h-4 mr-1" />
              Save
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-3 sm:px-6 py-4 sm:py-6">
        <div className="w-full max-w-6xl mx-auto space-y-6">
          {/* Emergency Notice */}
          <Card className="border-red-300 bg-red-50 border-2">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-red-800 mb-2">🚨 MEDICAL EMERGENCY</h4>
                  <p className="text-red-700 font-medium mb-2">
                    If someone is unconscious and not breathing normally, call 108 immediately and start CPR.
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => window.open('tel:108', '_self')}
                      className="bg-red-600 hover:bg-red-700 text-white"
                      size="sm"
                    >
                      <Phone className="w-4 h-4 mr-1" />
                      Call 108
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="p-3 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-slate-800">
                CPR & Life Support Guide
              </h1>
            </div>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Learn life-saving CPR techniques with interactive training, step-by-step guidance, 
              and practice tools. Every second counts in cardiac emergencies.
            </p>
          </div>

          {/* Age Group Selection */}
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-red-600" />
                Select Patient Age Group
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {ageGroups.map((group) => (
                  <Button
                    key={group.id}
                    onClick={() => setSelectedAge(group.id)}
                    variant={selectedAge === group.id ? "default" : "outline"}
                    className={`p-6 h-auto flex flex-col gap-3 ${
                      selectedAge === group.id 
                        ? "bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700" 
                        : "border-red-200 hover:border-red-400"
                    }`}
                  >
                    <group.icon className={`w-8 h-8 ${
                      selectedAge === group.id ? "text-white" : group.color
                    }`} />
                    <div className="text-center">
                      <div className={`font-semibold ${
                        selectedAge === group.id ? "text-white" : ""
                      }`}>
                        {group.label.split('(')[0]}
                      </div>
                      <div className={`text-sm ${
                        selectedAge === group.id ? "text-red-100" : "text-slate-500"
                      }`}>
                        {group.label.split('(')[1]?.replace(')', '') || ''}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Section Navigation */}
          <Card className="shadow-lg">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2">
                {sections.map((section) => (
                  <Button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    variant={activeSection === section.id ? "default" : "outline"}
                    className={`flex items-center gap-2 ${
                      activeSection === section.id 
                        ? "bg-red-600 hover:bg-red-700" 
                        : "border-red-200 hover:border-red-400"
                    }`}
                  >
                    <section.icon className="w-4 h-4" />
                    {section.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Content Sections */}
          {activeSection === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* CPR Basics */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="w-5 h-5 text-blue-600" />
                    CPR Basics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <Heart className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-800">What is CPR?</h4>
                        <p className="text-sm text-blue-700">
                          Cardiopulmonary resuscitation combines chest compressions and rescue breathing 
                          to maintain blood flow and oxygen to vital organs.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <Clock className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-green-800">When to Use CPR</h4>
                        <p className="text-sm text-green-700">
                          When someone is unconscious and not breathing normally or at all. 
                          Brain damage can occur within 4-6 minutes without oxygen.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                      <Activity className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-orange-800">Compression Rate</h4>
                        <p className="text-sm text-orange-700">
                          Compress the chest 100-120 times per minute, at least 2 inches deep 
                          for adults. Allow complete chest recoil between compressions.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Reference */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-red-600" />
                    Quick Reference - {ageGroups.find(g => g.id === selectedAge)?.label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-red-50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {compressionRatios[selectedAge as keyof typeof compressionRatios].compressions}
                      </div>
                      <div className="text-sm text-red-700">Compressions</div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {compressionRatios[selectedAge as keyof typeof compressionRatios].breaths}
                      </div>
                      <div className="text-sm text-blue-700">Rescue Breaths</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Compression Depth:</span>
                      <span className="font-semibold">
                        {selectedAge === 'adult' ? '2+ inches (5+ cm)' :
                         selectedAge === 'child' ? '2 inches (5 cm)' :
                         '1.5 inches (4 cm)'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Hand Position:</span>
                      <span className="font-semibold">
                        {selectedAge === 'adult' ? 'Both hands, heel down' :
                         selectedAge === 'child' ? 'One hand heel' :
                         'Two fingers'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Rate:</span>
                      <span className="font-semibold">100-120 per minute</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

            {/* View Steps */}
          {activeSection === "view_steps" && (
            <div className="flex justify-center">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-red-600" />
                    CPR Steps Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <img 
                    src="/cpr_steps.png" 
                    alt="Step by step guide showing how to perform CPR" 
                    className="w-full h-auto rounded-lg"
                  />
                  <div className="mt-4 p-4 bg-red-50 rounded-lg text-sm">
                    <ol className="list-decimal pl-4 space-y-2">
                      <li>Call 108 or ask someone else to</li>
                      <li>Lay the person on their back and open their airways</li>
                      <li>If they are not breathing, start CPR</li>
                      <li>Do 30 chest compressions</li>
                      <li>Give two rescue breaths</li>
                      <li>Repeat until an ambulance or AED arrives</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          {/* Step-by-Step Guide */}
          {activeSection === "steps" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {cprSteps[selectedAge as keyof typeof cprSteps].map((step, index) => (
                  <Card key={step.id} className="shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">{step.id}</span>
                        </div>
                        <div>
                          <CardTitle className="text-lg">{step.title}</CardTitle>
                          <p className="text-sm text-slate-600">{step.duration}s duration</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Placeholder for step image */}
                      <div className="w-full h-40 bg-gradient-to-r from-red-100 to-pink-100 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                            {/* <img 
                                src={step.image} 
                                alt={step.title} 
                                className="w-full h-full object-cover rounded-lg mb-2"
                          /> */}
                          <Heart className="w-12 h-12 text-red-600 mx-auto mb-2" />
                          <p className="text-sm text-red-700">{step.title}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">{step.description}</h4>
                        <ul className="space-y-1">
                          {step.details.map((detail, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Button 
                        onClick={() => setCurrentStep(index)}
                        variant={currentStep === index ? "default" : "outline"}
                        className="w-full"
                      >
                        {currentStep === index ? "Current Step" : "Practice This Step"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Practice Mode */}
          {activeSection === "practice" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* CPR Timer and Controls */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Timer className="w-5 h-5 text-blue-600" />
                    CPR Practice Timer
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Main Timer Display */}
                  <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                    <div className="text-6xl font-bold text-blue-600 mb-2">
                      {formatTime(cprTimer)}
                    </div>
                    <div className="text-lg text-blue-700">Total CPR Time</div>
                  </div>

                  {/* Compression Counter */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-3xl font-bold text-red-600">
                        {compressionCount}
                      </div>
                      <div className="text-sm text-red-700">Compressions</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-3xl font-bold text-green-600">
                        {Math.floor(compressionCount / 30)}
                      </div>
                      <div className="text-sm text-green-700">Cycles Complete</div>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Button 
                        onClick={startCPR}
                        disabled={isTimerRunning}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start CPR
                      </Button>
                      <Button 
                        onClick={pauseCPR}
                        disabled={!isTimerRunning}
                        variant="outline"
                        className="flex-1"
                      >
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </Button>
                    </div>

                    <Button 
                      onClick={resetCPR}
                      variant="outline"
                      className="w-full"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>

                    <Button 
                      onClick={incrementCompressions}
                      disabled={!isTimerRunning}
                      className="w-full bg-red-600 hover:bg-red-700 text-lg py-6"
                    >
                      <Activity className="w-5 h-5 mr-2" />
                      COUNT COMPRESSION
                    </Button>
                  </div>

                  {/* Metronome */}
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold">Compression Metronome</span>
                      <Button
                        onClick={() => setMetronomeActive(!metronomeActive)}
                        variant={metronomeActive ? "default" : "outline"}
                        size="sm"
                      >
                        {metronomeActive ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </Button>
                    </div>
                    <p className="text-sm text-slate-600">
                      {compressionRate} BPM - {metronomeActive ? "Active" : "Inactive"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Current Step Guide */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-600" />
                    Current Step: {cprSteps[selectedAge as keyof typeof cprSteps][currentStep]?.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cprSteps[selectedAge as keyof typeof cprSteps][currentStep] && (
                    <>
                      {/* Step Image Placeholder */}
                      <div className="w-full h-48 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                            <span className="text-white font-bold text-xl">
                              {cprSteps[selectedAge as keyof typeof cprSteps][currentStep].id}
                            </span>
                          </div>
                          <p className="text-green-700 font-medium">
                            {cprSteps[selectedAge as keyof typeof cprSteps][currentStep].title}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-3">
                          {cprSteps[selectedAge as keyof typeof cprSteps][currentStep].description}
                        </h4>
                        <ul className="space-y-2">
                          {cprSteps[selectedAge as keyof typeof cprSteps][currentStep].details.map((detail, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <span className="text-sm">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Step Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Step Progress</span>
                          <span>{currentStep + 1} of {cprSteps[selectedAge as keyof typeof cprSteps].length}</span>
                        </div>
                        <Progress 
                          value={((currentStep + 1) / cprSteps[selectedAge as keyof typeof cprSteps].length) * 100} 
                          className="h-2"
                        />
                      </div>

                      {/* Navigation */}
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                          disabled={currentStep === 0}
                          variant="outline"
                          className="flex-1"
                        >
                          Previous
                        </Button>
                        <Button 
                          onClick={() => setCurrentStep(Math.min(cprSteps[selectedAge as keyof typeof cprSteps].length - 1, currentStep + 1))}
                          disabled={currentStep === cprSteps[selectedAge as keyof typeof cprSteps].length - 1}
                          className="flex-1"
                        >
                          Next
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Video Guide */}
          {activeSection === "video" && (
            <div className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="w-5 h-5 text-purple-600" />
                    CPR Training Videos - {ageGroups.find(g => g.id === selectedAge)?.label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Main Video Player */}
                  <div className="aspect-video bg-slate-900 rounded-lg flex items-center justify-center">
                    <div className="text-center text-white">
                      <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-4">CPR Training Video</p>
                      <p className="text-sm opacity-75 mb-4">
                        Professional CPR demonstration for {selectedAge} patients
                      </p>
                      <Button 
                        onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {isVideoPlaying ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                        {isVideoPlaying ? "Pause" : "Play"} Video
                      </Button>
                    </div>
                  </div>

                  {/* Video Chapters */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cprSteps[selectedAge as keyof typeof cprSteps].map((step, index) => (
                      <Card key={step.id} className="border-slate-200 hover:border-purple-300 transition-colors cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-bold">{step.id}</span>
                            </div>
                            <div>
                              <h4 className="font-semibold text-sm">{step.title}</h4>
                              <p className="text-xs text-slate-500">{step.duration}s</p>
                            </div>
                          </div>
                          <p className="text-xs text-slate-600">{step.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Knowledge Check */}
          {activeSection === "quiz" && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-600" />
                  CPR Knowledge Check
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {!quizStarted ? (
                  // Quiz Introduction
                  <div className="text-center p-8 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                    <Award className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Test Your Knowledge</h3>
                    <p className="text-slate-600 mb-4">
                      Complete this interactive quiz to test your CPR knowledge and earn a completion certificate.
                    </p>
                    <div className="mb-6 p-4 bg-white rounded-lg border">
                      <h4 className="font-semibold mb-2">Quiz Details:</h4>
                      <ul className="text-sm text-slate-600 space-y-1">
                        <li>• {quizQuestions.length} multiple choice questions</li>
                        <li>• Based on current CPR guidelines</li>
                        <li>• Passing score: 80% (8/10 correct)</li>
                        <li>• Certificate available upon completion</li>
                      </ul>
                    </div>
                    <Button onClick={startQuiz} className="bg-yellow-600 hover:bg-yellow-700">
                      <Play className="w-4 h-4 mr-2" />
                      Start Knowledge Check
                    </Button>
                  </div>
                ) : !showResults ? (
                  // Quiz Questions
                  <div className="space-y-6">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Question {currentQuestion + 1} of {quizQuestions.length}</span>
                        <span>{Math.round(((currentQuestion + 1) / quizQuestions.length) * 100)}% Complete</span>
                      </div>
                      <Progress value={((currentQuestion + 1) / quizQuestions.length) * 100} className="h-2" />
                    </div>

                    {/* Question */}
                    <Card className="border-2 border-yellow-200">
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {quizQuestions[currentQuestion]?.question || "Loading question..."}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {quizQuestions[currentQuestion]?.options?.map((option, index) => (
                          <Button
                            key={index}
                            onClick={() => selectAnswer(currentQuestion, index)}
                            variant={selectedAnswers[currentQuestion] === index ? "default" : "outline"}
                            className={`w-full text-left p-4 h-auto justify-start ${
                              selectedAnswers[currentQuestion] === index 
                                ? "bg-yellow-600 hover:bg-yellow-700" 
                                : "hover:bg-yellow-50"
                            }`}
                          >
                            <span className="mr-3 font-bold">
                              {String.fromCharCode(65 + index)}.
                            </span>
                            {option}
                          </Button>
                        )) || <div>Loading options...</div>}
                      </CardContent>
                    </Card>

                    {/* Navigation */}
                    <div className="flex justify-between">
                      <Button
                        onClick={previousQuestion}
                        disabled={currentQuestion === 0}
                        variant="outline"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Previous
                      </Button>
                      
                      <Button
                        onClick={nextQuestion}
                        disabled={typeof selectedAnswers[currentQuestion] === 'undefined'}
                        className="bg-yellow-600 hover:bg-yellow-700"
                      >
                        {currentQuestion === quizQuestions.length - 1 ? "Complete Quiz" : "Next"}
                        {currentQuestion < quizQuestions.length - 1 && <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />}
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Quiz Results
                  <div className="space-y-6">
                    {/* Score Display */}
                    <div className="text-center p-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                      <div className={`text-6xl font-bold mb-4 ${getScoreColor(score, quizQuestions.length)}`}>
                        {score}/{quizQuestions.length}
                      </div>
                      <div className="text-2xl font-semibold text-slate-800 mb-2">
                        {Math.round((score / quizQuestions.length) * 100)}% Correct
                      </div>
                      <Badge className={getScoreBadge(score, quizQuestions.length).color}>
                        {getScoreBadge(score, quizQuestions.length).text}
                      </Badge>
                    </div>

                    {/* Certificate */}
                    {score >= 8 && (
                      <Card className="border-green-300 bg-green-50">
                        <CardContent className="p-6 text-center">
                          <Award className="w-16 h-16 text-green-600 mx-auto mb-4" />
                          <h3 className="text-xl font-bold text-green-800 mb-2">
                            🎉 Congratulations!
                          </h3>
                          <p className="text-green-700 mb-4">
                            You have successfully passed the CPR Knowledge Check with a score of {Math.round((score / quizQuestions.length) * 100)}%!
                          </p>
                          <Button onClick={downloadCertificate} className="bg-green-600 hover:bg-green-700">
                            <Download className="w-4 h-4 mr-2" />
                            Download Certificate
                          </Button>
                        </CardContent>
                      </Card>
                    )}

                    {/* Detailed Results */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Review Your Answers</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {quizQuestions.map((question, index) => {
                          const isCorrect = selectedAnswers[index] === question.correct;
                          const userAnswer = selectedAnswers[index];
                          
                          return (
                            <div key={question.id} className="p-4 border rounded-lg">
                              <div className="flex items-start gap-3 mb-3">
                                {isCorrect ? (
                                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                ) : (
                                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                )}
                                <div className="flex-1">
                                  <h4 className="font-semibold mb-2">
                                    {index + 1}. {question.question}
                                  </h4>
                                  
                                  <div className="space-y-2 text-sm">
                                    <div className={`p-2 rounded ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                      <strong>Your Answer:</strong> {typeof userAnswer !== 'undefined' ? question.options[userAnswer] : 'No answer selected'} {isCorrect ? '✓' : '✗'}
                                    </div>
                                    
                                    {!isCorrect && (
                                      <div className="p-2 bg-green-100 text-green-800 rounded">
                                        <strong>Correct Answer:</strong> {question.options[question.correct]} ✓
                                      </div>
                                    )}
                                    
                                    <div className="p-2 bg-blue-50 text-blue-800 rounded">
                                      <strong>Explanation:</strong> {question.explanation}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex gap-4 justify-center">
                      <Button onClick={resetQuiz} variant="outline">
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Retake Quiz
                      </Button>
                      {score >= 8 && (
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          <Share2 className="w-4 h-4 mr-2" />
                          Share Achievement
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Quick Reference Tips */}
                {!quizStarted && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-green-200 bg-green-50">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-green-800 mb-2">✅ Key Points to Remember</h4>
                        <ul className="text-sm text-green-700 space-y-1">
                          <li>• Call 108 immediately</li>
                          <li>• Push hard and fast (100-120 BPM)</li>
                          <li>• Compress at least 2 inches deep</li>
                          <li>• Allow complete chest recoil</li>
                          <li>• Minimize interruptions</li>
                          <li>• 30:2 compression-to-breath ratio</li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card className="border-blue-200 bg-blue-50">
                      <CardContent className="p-4">
                        <h4 className="font-semibold text-blue-800 mb-2">📚 Study Topics</h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>• Adult, child, and infant CPR differences</li>
                          <li>• Proper hand placement techniques</li>
                          <li>• Compression depth and rate</li>
                          <li>• When to call emergency services</li>
                          <li>• Rescue breathing procedures</li>
                          <li>• AED usage basics</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Emergency Resources */}
          <Card className="border-red-300 bg-red-50 border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <Shield className="w-5 h-5" />
                Emergency Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  onClick={() => window.open('tel:108', '_self')}
                  className="bg-red-600 hover:bg-red-700 text-white p-4 h-auto"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  <div>
                    <div className="font-bold">Emergency: 108</div>
                    <div className="text-xs">Call immediately</div>
                  </div>
                </Button>

                <Link href="/hospitals">
                  <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 p-4 h-auto w-full">
                    <MapPin className="w-5 h-5 mr-2" />
                    <div>
                      <div className="font-bold">Find Hospitals</div>
                      <div className="text-xs">Nearest emergency rooms</div>
                    </div>
                  </Button>
                </Link>

                <Link href="/chat">
                  <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 p-4 h-auto w-full">
                    <Stethoscope className="w-5 h-5 mr-2" />
                    <div>
                      <div className="font-bold">Ask DOCai</div>
                      <div className="text-xs">Medical assistance</div>
                    </div>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Medical Disclaimer */}
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-800 mb-1">Training Disclaimer</h4>
                  <p className="text-sm text-amber-700">
                    This guide is for educational purposes only and does not replace proper CPR certification 
                    training. Consider taking a certified CPR course from recognized organizations. 
                    In real emergencies, call 108 immediately and follow dispatcher instructions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CPRGuidePage;