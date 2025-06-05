"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SignalIndicators } from "@/components/signal-indicators";
import { EmergencyActions } from "@/components/emergency-actions";
import { FAQ } from "@/components/FAQ";
import { EnhancedMessageDisplay } from "@/components/EnhancedMessageDisplay";
import { parseResponseWithFAQ } from "@/lib/parseFAQ";
import {
  MessageCircle,
  SendHorizonal,
  Stethoscope,
  Bot,
  User,
  Sparkles,
  Brain,
  Heart,
  Settings,
  ArrowLeft,
  Mic,
  MicOff,
  Zap,
  Shield,
  Activity,
  Camera,
  Image as ImageIcon,
  X,
  Upload,
} from "lucide-react";
import Link from "next/link";
import VoiceInput from "@/components/VoiceInput";
import VoiceWaveAnimation from "@/components/VoiceWaveAnimation";
import SpeakButton from "@/components/SpeakButton";

interface FAQItem {
  question: string;
  answer: string;
}

interface ChatMessage {
  id: number;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
  sessionId?: string;
  faqs?: FAQItem[];
  image?: string;
}

const ChatPage = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageIdRef = useRef(0);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [micPermission, setMicPermission] = useState<
    "granted" | "denied" | "unknown"
  >("unknown");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Get user location on page load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          console.log(
            "Chat page has access to user location for enhanced responses"
          );
        },
        (error) => {
          console.log("Location access not available for chat");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    }
  }, []);

  // Check microphone permission on component mount
  useEffect(() => {
    const checkMicPermission = async () => {
      try {
        if (navigator.permissions) {
          const result = await navigator.permissions.query({
            name: "microphone" as PermissionName,
          });
          setMicPermission(
            result.state === "granted"
              ? "granted"
              : result.state === "denied"
              ? "denied"
              : "unknown"
          );

          result.addEventListener("change", () => {
            setMicPermission(
              result.state === "granted"
                ? "granted"
                : result.state === "denied"
                ? "denied"
                : "unknown"
            );
          });
        }
      } catch (error) {
        console.log("Permission API not supported");
      }
    };

    checkMicPermission();
  }, []);

  const handleVoiceCommand = async (command: string) => {
    if (isLoading) return;

    console.log("🎤 Voice command received:", command);

    if (!command || command.trim() === "") {
      console.log("⚠️ Empty voice command received");
      return;
    }

    const userMessage: ChatMessage = {
      id: ++messageIdRef.current,
      sender: "user",
      text: command.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    await sendMessage(command.trim());
  };

  const sendMessage = async (message: string) => {
    console.log("📤 Sending message to chat API:", message);
    setIsLoading(true);

    try {
      const response = await fetch(
        "https://firstaid-chat-bot-api.onrender.com/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: message,
            session_id: sessionId || undefined,
            user_location: userLocation
              ? {
                  lat: userLocation.lat,
                  lng: userLocation.lng,
                }
              : null,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Chat API failed: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Chat response data:", data);

      if (data.session_id && !sessionId) {
        setSessionId(data.session_id);
        console.log("🆔 Session ID updated:", data.session_id);
      }

      const parsedResponse = parseResponseWithFAQ(
        data.reply || "Sorry, I couldn't understand that."
      );

      const botMessage: ChatMessage = {
        id: ++messageIdRef.current,
        sender: "bot",
        text: parsedResponse.mainContent,
        timestamp: new Date(),
        sessionId: data.session_id,
        faqs: parsedResponse.faqs,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("❌ Chat API error:", error);
      const errorMessage: ChatMessage = {
        id: ++messageIdRef.current,
        sender: "bot",
        text: "Sorry, I'm having trouble connecting to the medical assistance service. Please try again or use the emergency buttons if this is urgent.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (selectedImage) {
      console.log("🖼️ Handling send with image...");
      return await handleSendWithImage();
    }

    if (!input.trim() || isLoading) {
      console.log("⚠️ No input or already loading");
      return;
    }

    const userMessage: ChatMessage = {
      id: ++messageIdRef.current,
      sender: "user",
      text: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageText = input.trim();
    setInput("");

    await sendMessage(messageText);
  };

  const handleSendWithImage = async () => {
    if (!selectedImage) return;

    setIsLoading(true);

    try {
      const userMessage: ChatMessage = {
        id: ++messageIdRef.current,
        sender: "user",
        text: input.trim() || "Here's an image of my injury",
        timestamp: new Date(),
        image: selectedImage,
      };

      setMessages((prev) => [...prev, userMessage]);

      const analysis = await analyzeImage(selectedImage);
      const combinedMessage = input.trim()
        ? `${input.trim()}\n\nImage Analysis: ${analysis}`
        : `Image Analysis: ${analysis}`;

      setInput("");
      setSelectedImage(null);

      await sendMessage(combinedMessage);
    } catch (error) {
      console.error("Error sending message with image:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeImage = async (imageBase64: string): Promise<string> => {
    console.log("🔍 Starting image analysis...");

    try {
      setIsAnalyzingImage(true);

      if (!imageBase64) {
        throw new Error("No image data provided");
      }

      const base64Data = imageBase64.split(",")[1];
      if (!base64Data || base64Data.trim() === "") {
        throw new Error("Invalid image data format - empty base64 string");
      }

      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "image/jpeg" });

      const formData = new FormData();
      formData.append("image", blob, "injury.jpg");

      console.log("📤 Sending image to analysis API...");

      const response = await fetch(
        "https://first-aid-injury-image-context.onrender.com/analyze",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ API Error:", {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText,
        });

        if (response.status === 422) {
          throw new Error(
            `Invalid image format or missing data. Please ensure you're uploading a valid JPG image.`
          );
        }

        throw new Error(
          `Image analysis failed: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      console.log("✅ Analysis result:", data);

      const result =
        data.analysis ||
        data.context ||
        data.description ||
        data.result ||
        data.message ||
        "Image analysis completed";

      console.log("📝 Final analysis text:", result);

      return result;
    } catch (error) {
      console.error("❌ Image analysis error:", error);

      if (error instanceof TypeError && error.message.includes("fetch")) {
        return "Network error: Unable to connect to image analysis service. Please check your internet connection and try again.";
      } else if (
        error instanceof Error &&
        error.message.includes("Failed to fetch")
      ) {
        return "Service unavailable: The image analysis service might be temporarily down. Please try again in a few moments.";
      } else if (error instanceof Error && error.message.includes("422")) {
        return "Invalid image format: Please ensure you're uploading a valid JPG/JPEG image file.";
      } else {
        return `Image analysis failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }. Please describe your injury manually.`;
      }
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log("📁 File selected:", {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified,
    });

    const allowedTypes = ["image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      console.error("❌ Invalid file type:", file.type);
      alert("Please select only JPG/JPEG image files");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      console.error("❌ File too large:", file.size);
      alert("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const base64 = e.target?.result as string;

      if (!base64 || typeof base64 !== "string") {
        console.error("❌ Invalid FileReader result");
        alert("Failed to read the image file. Please try again.");
        return;
      }

      console.log("✅ Image loaded successfully");
      setSelectedImage(base64);
    };

    reader.onerror = () => {
      console.error("❌ FileReader error");
      alert("Failed to read the image file. Please try again.");
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Enhanced Header with Voice Status */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-xl border-b border-slate-200/60 px-4 sm:px-6 py-4 sm:py-5 z-10 shadow-sm">
        <div className="w-full max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="p-1.5 sm:p-2 h-8 w-8 sm:h-9 sm:w-9 hover:bg-slate-100 transition-colors"
              >
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 text-slate-600" />
              </Button>
            </Link>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="font-bold text-xs sm:text-sm lg:text-xl text-slate-800 truncate">
                DOCai Assistant
                {userLocation && (
                  <span className="hidden sm:inline text-xs text-green-600 ml-2">
                    📍 Location Active
                  </span>
                )}
                {isVoiceListening && (
                  <span className="inline-flex items-center gap-1 ml-2 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs animate-pulse">
                    <Mic className="w-3 h-3" />
                    Listening
                  </span>
                )}
              </h1>
              <p className="text-xs text-slate-600 hidden sm:block">
                Emergency Medical Support
                {isVoiceListening && (
                  <span className="text-red-600 font-semibold ml-2">
                    • Voice Active
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            {isVoiceListening && (
              <div className="bg-red-100 border border-red-300 rounded-full p-2 animate-pulse">
                <MicOff className="w-4 h-4 text-red-600" />
              </div>
            )}

            <Link href="/settings">
              <Button
                variant="ghost"
                size="sm"
                className="p-1.5 sm:p-2 h-8 w-8 sm:h-9 sm:w-9 hover:bg-slate-100 transition-colors"
              >
                <Settings className="w-3 h-3 sm:w-4 sm:h-4 text-slate-600" />
              </Button>
            </Link>
            <SignalIndicators className="scale-75 sm:scale-90 lg:scale-100" />
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-2 sm:px-4 lg:px-6 py-2 sm:py-4">
        <div className="w-full max-w-4xl mx-auto space-y-3 sm:space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-6 sm:py-12 lg:py-16 px-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
                <Sparkles className="text-white w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
              </div>

              <h2 className="text-lg sm:text-xl lg:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-3">
                Welcome to DOCai
              </h2>
              <p className="text-sm sm:text-base lg:text-lg font-medium mb-2">
                Your AI Medical Assistant
                {userLocation && (
                  <span className="block text-xs sm:text-sm text-green-600 mt-1">
                    📍 Location-aware assistance enabled
                  </span>
                )}
              </p>
              <p className="text-xs sm:text-sm text-slate-600 max-w-xs sm:max-w-md mx-auto leading-relaxed mb-8">
                I'm here to provide first aid guidance and emergency assistance.
                Upload images of injuries for analysis or describe your
                symptoms.
              </p>

              {/* Quick Actions */}
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button
                  onClick={() => setInput("I need help with first aid")}
                  variant="outline"
                  className="rounded-full px-4 py-2 text-sm hover:bg-blue-50 hover:border-blue-300 transition-all"
                >
                  <Activity className="w-4 h-4 mr-2" />
                  First Aid Help
                </Button>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="rounded-full px-4 py-2 text-sm hover:bg-green-50 hover:border-green-300 transition-all"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Upload Injury Photo
                </Button>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2 sm:gap-4 w-full ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  } animate-in fade-in slide-in-from-bottom-4 duration-500`}
                >
                  {/* Bot Avatar */}
                  {msg.sender === "bot" && (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-white">
                      <Bot className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                    </div>
                  )}

                  {/* Message Content */}
                  <div
                    className={`max-w-[90%] sm:max-w-[80%] rounded-2xl shadow-sm ${
                      msg.sender === "user"
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white ml-auto px-4 py-3"
                        : "bg-white text-slate-800 border border-slate-200 p-4"
                    }`}
                  >
                    {/* Image Display */}
                    {msg.image && (
                      <div className="mb-3">
                        <img
                          src={msg.image}
                          alt="Uploaded injury photo"
                          className="max-w-full h-auto rounded-2xl border border-slate-200"
                          style={{ maxHeight: "300px" }}
                        />
                      </div>
                    )}

                    {msg.sender === "user" ? (
                      <div className="text-xs sm:text-sm lg:text-base leading-relaxed whitespace-pre-wrap">
                        {msg.text}
                      </div>
                    ) : (
                      <EnhancedMessageDisplay
                        mainContent={msg.text}
                        faqs={msg.faqs}
                      />
                    )}

                    {/* FAQs Section */}
                    {msg.sender === "bot" &&
                      msg.faqs &&
                      msg.faqs.length > 0 && (
                        <FAQ faqs={msg.faqs} className="mt-4" />
                      )}

                    {/* Message Footer */}
                    <div className="flex items-center justify-between mt-4">
                      <div
                        className={`text-xs ${
                          msg.sender === "user"
                            ? "text-blue-100"
                            : "text-slate-500"
                        }`}
                      >
                        {msg.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>

                      {/* Voice Button for bot messages */}
                      {msg.sender === "bot" && (
                        <div className="flex items-center gap-2">
                          <SpeakButton
                            text={msg.text}
                            className="text-xs text-slate-500 hover:text-indigo-600 transition-colors"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* User Avatar */}
                  {msg.sender === "user" && (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg bg-gradient-to-br from-slate-600 to-slate-700 text-white">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                    </div>
                  )}
                </div>
              ))}

              {/* Loading State */}
              {(isLoading || isAnalyzingImage) && (
                <div className="flex items-start gap-2 sm:gap-4 w-full justify-start animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-white">
                    <Bot className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                  </div>
                  <div className="bg-white text-slate-800 border border-slate-200/50 rounded-2xl px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                        <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      </div>
                      <span className="text-sm text-slate-600">
                        {isAnalyzingImage
                          ? "Analyzing your injury image..."
                          : "DOCai is analyzing your symptoms..."}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Enhanced Input Area with Voice Feedback */}
      <div className="bg-white/95 backdrop-blur-xl border-t border-slate-200/60 px-4 sm:px-6 py-4 sm:py-5">
        <div className="w-full max-w-4xl mx-auto space-y-4">
          {/* Voice Status Indicator */}
          {isVoiceListening && (
            <div className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-300 rounded-2xl shadow-lg animate-pulse">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse shadow-md" />
                <Mic className="h-6 w-6 text-red-600 animate-bounce" />
                <span className="text-base font-bold text-red-700">
                  🎤 LISTENING... SPEAK NOW
                </span>
              </div>
              <VoiceWaveAnimation
                isActive={isVoiceListening}
                className="ml-4"
              />

              <Button
                onClick={() => setIsVoiceListening(false)}
                variant="outline"
                size="sm"
                className="ml-4 h-8 px-3 text-red-600 border-red-300 hover:bg-red-50 font-semibold"
              >
                <MicOff className="w-4 h-4 mr-1" />
                STOP
              </Button>
            </div>
          )}

          {/* Microphone Permission Status */}
          {micPermission === "denied" && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border-2 border-red-200 rounded-lg text-red-700">
              <MicOff className="w-4 h-4" />
              <span className="text-sm font-medium">
                Microphone access denied. Please enable microphone permissions
                to use voice input.
              </span>
            </div>
          )}

          {micPermission === "granted" && !isVoiceListening && (
            <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg text-green-700">
              <Mic className="w-4 h-4" />
              <span className="text-xs">
                🎤 Voice input ready - Click the microphone button to start
              </span>
            </div>
          )}

          {/* Input Row */}
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && !e.shiftKey && handleSend()
                }
                placeholder={
                  selectedImage
                    ? "Describe your injury or symptoms (optional)..."
                    : "Describe your symptoms, emergency, or upload an injury photo..."
                }
                disabled={isLoading || isAnalyzingImage}
                className="h-12 sm:h-14 pr-28 sm:pr-32 rounded-2xl border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 disabled:opacity-50 text-base placeholder:text-slate-500 shadow-sm"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading || isAnalyzingImage}
                  className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Upload injury photo (JPG only)"
                >
                  <Camera className="w-4 h-4" />
                </button>

                {/* Voice Button with Status */}
                <div className="relative">
                  <VoiceInput
                    onVoiceCommand={handleVoiceCommand}
                    onListeningChange={setIsVoiceListening}
                  />

                  {/* Voice Status Overlay */}
                  {isVoiceListening && (
                    <div className="absolute -top-16 right-0 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold z-20 shadow-lg animate-bounce">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                        🎤 LISTENING
                      </div>
                      <div className="absolute bottom-0 right-4 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-red-600"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Button
              onClick={handleSend}
              disabled={
                isLoading ||
                isAnalyzingImage ||
                (!input.trim() && !selectedImage)
              }
              size="lg"
              className="h-12 sm:h-14 px-4 sm:px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              {isLoading || isAnalyzingImage ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span className="hidden sm:inline text-sm mr-2">Send</span>
                  <SendHorizonal className="w-5 h-5" />
                </>
              )}
            </Button>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,.jpg,.jpeg"
            onChange={handleImageUpload}
            className="hidden"
            capture="environment"
          />

          {/* Emergency Actions */}
          <div className="border-t border-slate-200/60 pt-4">
            <EmergencyActions />
          </div>

          {/* Emergency Warning */}
          <div className="text-center">
            <p className="text-xs text-slate-500 bg-red-50 border border-red-200 rounded-full px-4 py-2 inline-flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              For life-threatening emergencies, call emergency services
              immediately
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
