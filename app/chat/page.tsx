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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    inputRef.current?.focus();
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
      const res = await fetch(
        "https://firstaid-chat-bot-api.onrender.com/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: currentInput,
            session_id: sessionId || undefined,
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
      const res = await fetch(
        "https://firstaid-chat-bot-api.onrender.com/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: command,
            session_id: sessionId || undefined,
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
      {/* Header */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-lg border-b border-slate-200/60 px-3 sm:px-6 py-3 sm:py-4 z-10 shadow-sm">
        <div className="w-full max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link href="/">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Brain className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-sm sm:text-xl text-slate-800 truncate">
                DOCai Assistant
              </h1>
              <p className="text-xs text-slate-600 hidden sm:block">Emergency Medical Support</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/settings">
              <Button variant="ghost" size="sm" className="p-2">
                <Settings className="w-4 h-4" />
              </Button>
            </Link>
            <SignalIndicators className="scale-75 sm:scale-100" />
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4">
        <div className="w-full max-w-4xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8 sm:py-16">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Sparkles className="text-white w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">
                Welcome to DOCai
              </h2>
              <p className="text-base sm:text-lg font-medium mb-2">
                Your AI Medical Assistant
              </p>
              <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                I'm here to provide first aid guidance and emergency assistance.
                For immediate emergencies, use the emergency buttons below to call 108 or
                alert your contacts.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 max-w-lg mx-auto text-xs">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700">
                  <Heart className="w-4 h-4 mx-auto mb-1" />
                  <div className="font-semibold">Emergency Care</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-blue-700">
                  <Stethoscope className="w-4 h-4 mx-auto mb-1" />
                  <div className="font-semibold">First Aid Guide</div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2 sm:gap-4 w-full ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {/* Avatar */}
                  {msg.sender === "bot" && (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-md bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                      <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
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
                    {msg.sender === "user" ? (
                      <div className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                        {msg.text}
                      </div>
                    ) : (
                      <EnhancedMessageDisplay text={msg.text} />
                    )}

                    {/* FAQs Section */}
                    {msg.sender === "bot" && msg.faqs && msg.faqs.length > 0 && (
                      <FAQ faqs={msg.faqs} className="mt-4" />
                    )}

                    {/* Timestamp */}
                    <div
                      className={`text-xs mt-3 ${
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
                      <div className="mt-3 flex items-center gap-2">
                        <SpeakButton 
                          text={msg.text} 
                          className="text-xs text-slate-500 hover:text-pink-600"
                        />
                        <span className="text-xs text-slate-400">Listen to DOCai</span>
                      </div>
                    )}
                  </div>

                  {msg.sender === "user" && (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-md bg-gradient-to-br from-slate-600 to-slate-700 text-white">
                      <User className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  )}
                </div>
              ))}

              {/* Loading State */}
              {isLoading && (
                <div className="flex items-start gap-2 sm:gap-4 w-full justify-start">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-md bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                    <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="bg-white text-slate-800 border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <span className="text-sm text-slate-600 ml-2">DOCai is analyzing...</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-slate-200 px-3 sm:px-6 py-3 sm:py-4">
        <div className="w-full max-w-4xl mx-auto space-y-3">
          {/* Voice Animation */}
          {isVoiceListening && (
            <div className="flex justify-center">
              <VoiceWaveAnimation />
            </div>
          )}

          {/* Input Row */}
          <div className="flex gap-2 sm:gap-3">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Describe your symptoms or emergency..."
                disabled={isLoading}
                className="h-10 sm:h-12 pr-12 sm:pr-16 rounded-lg sm:rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
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
              className="h-10 sm:h-12 px-3 sm:px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span className="hidden sm:inline text-sm">Send</span>
                  <SendHorizonal className="w-4 h-4 sm:ml-1" />
                </>
              )}
            </Button>
          </div>

          {/* Emergency Actions - Moved here */}
          <div className="border-t border-slate-200 pt-3">
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
