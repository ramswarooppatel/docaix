"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SignalIndicators } from "@/components/signal-indicators";
import { EmergencyActions } from "@/components/emergency-actions";
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

interface ChatMessage {
  id: number;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
  sessionId?: string;
}

const chat_page = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageIdRef = useRef(0);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
      const res = await fetch("/api/chat_backend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: currentInput }),
      });

      if (!res.ok) throw new Error("Failed to get response from AI");

      const data = await res.json();

      const botMessage: ChatMessage = {
        id: ++messageIdRef.current,
        sender: "bot",
        text: data.reply || "Sorry, I couldn't understand that.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error generating response:", error);
      const errorMessage: ChatMessage = {
        id: ++messageIdRef.current,
        sender: "bot",
        text: "I'm having trouble processing your request. Please try again later.",
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
      const res = await fetch("/api/chat_backend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: command }),
      });

      if (!res.ok) throw new Error("Failed to get response from AI");

      const data = await res.json();

      const botMessage: ChatMessage = {
        id: ++messageIdRef.current,
        sender: "bot",
        text: data.reply || "Sorry, I couldn't understand that.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Voice input error:", error);
      const errorMessage: ChatMessage = {
        id: ++messageIdRef.current,
        sender: "bot",
        text: "Sorry, there was a problem processing your voice command.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Enhanced Header - Mobile Optimized */}
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
              <p className="text-xs text-slate-600 hidden sm:block">
                AI-Powered Medical Support
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/settings">
              <Button variant="ghost" size="sm" className="p-2">
                <Settings className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex-shrink-0">
              <SignalIndicators className="scale-75 sm:scale-100" />
            </div>
          </div>
        </div>
      </div>

      {/* Main content area - Mobile Optimized */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-6 py-3 sm:py-6">
        <div className="w-full max-w-4xl mx-auto space-y-4 sm:space-y-6">
          {messages.length === 0 ? (
            <div className="text-center text-slate-600 mt-10 sm:mt-20 px-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center shadow-lg">
                <Sparkles className="text-blue-600 w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">
                Welcome to DOCai
              </h2>
              <p className="text-base sm:text-lg font-medium mb-2">
                Your AI Medical Assistant
              </p>
              <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                I'm here to provide first aid guidance and emergency assistance.
                For immediate emergencies, use the buttons below to call 108 or
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
                  {/* Avatar - Mobile Optimized */}
                  {msg.sender === "bot" && (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-md bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                      <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  )}

                  {/* Enhanced Message bubble - Mobile Optimized */}
                  <div
                    className={`px-3 sm:px-5 py-3 sm:py-4 rounded-2xl shadow-sm max-w-[85%] sm:max-w-2xl break-words ${
                      msg.sender === "user"
                        ? "bg-gradient-to-br from-slate-700 to-slate-800 text-white"
                        : "bg-white text-slate-700 border border-slate-200"
                    }`}
                  >
                    {msg.sender === "bot" && (
                      <div className="flex items-center gap-2 text-xs text-blue-600 font-semibold mb-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        DOCai
                      </div>
                    )}
                    <div className="leading-relaxed text-sm sm:text-base break-words whitespace-pre-wrap">
                      {msg.text}
                    </div>
                    <div
                      className={`text-xs mt-2 sm:mt-3 flex items-center gap-1 ${
                        msg.sender === "user"
                          ? "text-slate-300"
                          : "text-slate-400"
                      }`}
                    >
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>

                  {/* User Avatar - Mobile Optimized */}
                  {msg.sender === "user" && (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-md bg-gradient-to-br from-slate-600 to-slate-700 text-white">
                      <User className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator - Mobile Optimized */}
              {isLoading && (
                <div className="flex items-start gap-2 sm:gap-4 w-full justify-start">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-md bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                    <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="bg-white text-slate-700 border border-slate-200 px-3 sm:px-5 py-3 sm:py-4 rounded-2xl shadow-sm max-w-[85%] sm:max-w-2xl">
                    <div className="flex items-center gap-2 text-xs text-blue-600 font-semibold mb-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      DOCai is thinking...
                    </div>
                    <div className="flex gap-1">
                      <div
                        className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0s" }}
                      />
                      <div
                        className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Enhanced input area with Emergency Actions - Mobile Optimized */}
      <div className="sticky bottom-0 bg-white/90 backdrop-blur-lg border-t border-slate-200/60 p-2 sm:p-4 shadow-lg">
        <div className="w-full max-w-4xl mx-auto space-y-2">
          {/* Emergency Actions - Compact */}
          <EmergencyActions />

          {/* Chat Input */}
          <div className="flex w-full items-end gap-2">
            <div className="flex-1 min-w-0">
              <Input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe your emergency..."
                className="w-full h-10 sm:h-12 pl-3 sm:pl-4 pr-3 sm:pr-4 rounded-lg sm:rounded-xl border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-sm text-sm sm:text-base bg-white resize-none"
                onKeyDown={(e) =>
                  e.key === "Enter" && !isLoading && handleSend()
                }
                disabled={isLoading}
              />
            </div>

            <VoiceInput onVoiceCommand={handleVoiceCommand} />

            <Button
              type="button"
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              size="sm"
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

          {/* Emergency Warning - Smaller */}
          <div className="text-center">
            <p className="text-xs text-slate-500 px-1">
              🚨 For life-threatening emergencies, use the red "Call 108" button
              above
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default chat_page;
