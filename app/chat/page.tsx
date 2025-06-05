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
}

const chat_page = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageIdRef = useRef(0);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);

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
            lng: position.coords.longitude
          });
          console.log('Chat page has access to user location for enhanced responses');
        },
        (error) => {
          console.log('Location access not available for chat');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isTyping = e.key.length === 1 || e.key === "Backspace";
      const isInputFocused = document.activeElement === inputRef.current;

      if (
        !isInputFocused &&
        isTyping &&
        !e.ctrlKey &&
        !e.altKey &&
        !e.metaKey
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const processLocationAwareMessage = (message: string) => {
    // Check if the message is about finding hospitals or medical help
    const hospitalKeywords = [
      'hospital', 'emergency room', 'medical center', 'clinic',
      'find hospitals', 'hospitals near me', 'nearest hospital',
      'medical help', 'emergency medical', 'urgent care'
    ];
    
    const isHospitalQuery = hospitalKeywords.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (isHospitalQuery && userLocation) {
      // Enhance the message with location context
      const enhancedMessage = `${message}\n\n[Note: User is located at coordinates ${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)} - please provide location-specific hospital recommendations if possible]`;
      return enhancedMessage;
    }
    
    return message;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: ++messageIdRef.current,
      sender: "user",
      text: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput("");
    setIsLoading(true);

    try {
      // Process the message for location awareness
      const processedMessage = processLocationAwareMessage(currentInput);
      
      const res = await fetch(
        "https://firstaid-chat-bot-api.onrender.com/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: processedMessage,
            session_id: sessionId || undefined,
            user_location: userLocation ? {
              lat: userLocation.lat,
              lng: userLocation.lng
            } : null
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to get response from AI");

      const data = await res.json();

      // Update session ID if provided
      if (data.session_id && !sessionId) {
        setSessionId(data.session_id);
      }

      // Parse the response to extract FAQs
      const parsedResponse = parseResponseWithFAQ(data.reply || "Sorry, I couldn't understand that.");

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
      console.error("Error:", error);
      const errorMessage: ChatMessage = {
        id: ++messageIdRef.current,
        sender: "bot",
        text: "Sorry, I'm having trouble connecting. Please try again or use the emergency buttons if this is urgent.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceCommand = async (command: string) => {
    if (isLoading) return;

    const userMessage: ChatMessage = {
      id: ++messageIdRef.current,
      sender: "user",
      text: command.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Process the voice command for location awareness
      const processedCommand = processLocationAwareMessage(command);
      
      const res = await fetch(
        "https://firstaid-chat-bot-api.onrender.com/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: processedCommand,
            session_id: sessionId || undefined,
            user_location: userLocation ? {
              lat: userLocation.lat,
              lng: userLocation.lng
            } : null,
            is_voice_input: true
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to get response from AI");

      const data = await res.json();

      // Update session ID if provided
      if (data.session_id && !sessionId) {
        setSessionId(data.session_id);
      }

      // Parse the response to extract FAQs
      const parsedResponse = parseResponseWithFAQ(data.reply || "Sorry, I couldn't understand that.");

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
      console.error("Error:", error);
      const errorMessage: ChatMessage = {
        id: ++messageIdRef.current,
        sender: "bot",
        text: "Sorry, I'm having trouble connecting. Please try again or use the emergency buttons if this is urgent.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header - Mobile optimized */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-lg border-b border-slate-200/60 px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 z-10 shadow-sm">
        <div className="w-full max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 min-w-0 flex-1">
            <Link href="/">
              <Button variant="ghost" size="sm" className="p-1.5 sm:p-2 h-8 w-8 sm:h-9 sm:w-9">
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </Link>
            <div className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Brain className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="font-bold text-xs sm:text-sm lg:text-xl text-slate-800 truncate">
                DOCai Assistant
                {userLocation && (
                  <span className="hidden sm:inline text-xs text-green-600 ml-2">📍 Location Active</span>
                )}
              </h1>
              {userLocation && (
                <p className="text-xs text-green-600 sm:hidden">📍 Location Active</p>
              )}
              <p className="text-xs text-slate-600 hidden lg:block">Emergency Medical Support</p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Link href="/settings">
              <Button variant="ghost" size="sm" className="p-1.5 sm:p-2 h-8 w-8 sm:h-9 sm:w-9">
                <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </Link>
            <SignalIndicators className="scale-75 sm:scale-90 lg:scale-100" />
          </div>
        </div>
      </div>

      {/* Chat Messages - Mobile optimized */}
      <div className="flex-1 overflow-y-auto px-2 sm:px-4 lg:px-6 py-2 sm:py-4">
        <div className="w-full max-w-4xl mx-auto space-y-3 sm:space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-6 sm:py-12 lg:py-16 px-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
                <Sparkles className="text-white w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
              </div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 mb-2">
                Welcome to DOCai
              </h2>
              <p className="text-sm sm:text-base lg:text-lg font-medium mb-2">
                Your AI Medical Assistant
                {userLocation && <span className="block text-xs sm:text-sm text-green-600 mt-1">📍 Location-aware assistance enabled</span>}
              </p>
              <p className="text-xs sm:text-sm text-slate-500 max-w-xs sm:max-w-md mx-auto leading-relaxed">
                I'm here to provide first aid guidance and emergency assistance.
                For immediate emergencies, use the emergency buttons below to call 108 or
                alert your contacts.
              </p>
              <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-4 sm:mt-6 max-w-xs sm:max-w-lg mx-auto text-xs">
                <div className="bg-red-50 border border-red-200 rounded-lg p-2 sm:p-3 text-red-700">
                  <Heart className="w-3 h-3 sm:w-4 sm:h-4 mx-auto mb-1" />
                  <div className="font-semibold text-xs">Emergency Care</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3 text-blue-700">
                  <Stethoscope className="w-3 h-3 sm:w-4 sm:h-4 mx-auto mb-1" />
                  <div className="font-semibold text-xs">First Aid Guide</div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-1.5 sm:gap-2 lg:gap-4 w-full ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {/* Avatar */}
                  {msg.sender === "bot" && (
                    <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-md bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                      <Bot className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                    </div>
                  )}

                  {/* Message Content */}
                  <div
                    className={`max-w-[85%] sm:max-w-[80%] lg:max-w-[75%] rounded-xl sm:rounded-2xl shadow-sm ${
                      msg.sender === "user"
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white ml-auto px-3 py-2 sm:px-4 sm:py-3"
                        : "bg-white text-slate-800 border border-slate-200 p-3 sm:p-4"
                    }`}
                  >
                    {msg.sender === "user" ? (
                      <div className="text-xs sm:text-sm lg:text-base leading-relaxed whitespace-pre-wrap">
                        {msg.text}
                      </div>
                    ) : (
                      <EnhancedMessageDisplay text={msg.text} />
                    )}

                    {/* FAQs Section */}
                    {msg.sender === "bot" && msg.faqs && msg.faqs.length > 0 && (
                      <FAQ faqs={msg.faqs} className="mt-3 sm:mt-4" />
                    )}

                    {/* Timestamp */}
                    <div
                      className={`text-xs mt-2 sm:mt-3 ${
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
                      <div className="mt-2 sm:mt-3 flex items-center gap-1 sm:gap-2">
                        <SpeakButton 
                          text={msg.text} 
                          className="text-xs text-slate-500 hover:text-pink-600"
                          size="sm"
                        />
                        <span className="text-xs text-slate-400 hidden sm:inline">Listen to DOCai</span>
                      </div>
                    )}
                  </div>

                  {msg.sender === "user" && (
                    <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-md bg-gradient-to-br from-slate-600 to-slate-700 text-white">
                      <User className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                    </div>
                  )}
                </div>
              ))}

              {/* Loading State */}
              {isLoading && (
                <div className="flex items-start gap-1.5 sm:gap-2 lg:gap-4 w-full justify-start">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-md bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                    <Bot className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                  </div>
                  <div className="bg-white text-slate-800 border border-slate-200 rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-600 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <span className="text-xs sm:text-sm text-slate-600 ml-1 sm:ml-2">DOCai is analyzing...</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Mobile optimized */}
      <div className="bg-white border-t border-slate-200 px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 safe-area-pb">
        <div className="w-full max-w-4xl mx-auto space-y-2 sm:space-y-3">
          {/* Voice Animation */}
          {isVoiceListening && (
            <div className="flex justify-center">
              <VoiceWaveAnimation isActive={true} />
            </div>
          )}

          {/* Input Row */}
          <div className="flex gap-1.5 sm:gap-2 lg:gap-3">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Describe your symptoms or emergency..."
                disabled={isLoading}
                className="h-9 sm:h-10 lg:h-12 pr-10 sm:pr-12 lg:pr-16 rounded-lg sm:rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 text-sm sm:text-base"
              />
              <div className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2">
                <VoiceInput
                  onVoiceCommand={handleVoiceCommand}
                  onListeningChange={setIsVoiceListening}
                  disabled={isLoading}
                />
              </div>
            </div>
            <Button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              size="lg"
              className="h-9 sm:h-10 lg:h-12 px-2 sm:px-3 lg:px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              {isLoading ? (
                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span className="hidden lg:inline text-sm">Send</span>
                  <SendHorizonal className="w-3 h-3 sm:w-4 sm:h-4 lg:ml-1" />
                </>
              )}
            </Button>
          </div>

          {/* Emergency Actions - Enhanced with location */}
          <div className="border-t border-slate-200 pt-2 sm:pt-3">
            <div className="w-full">
              <EmergencyActions />
            </div>
          </div>

          {/* Emergency Warning */}
          <div className="text-center">
            <p className="text-xs text-slate-500 px-1">
              🚨 For life-threatening emergencies, use the red emergency buttons above
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default chat_page;
