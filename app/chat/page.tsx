"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SignalIndicators } from "@/components/ui/signal-indicators";
import { EmergencyActions } from "@/components/ui/emergency-actions";
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
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

interface ChatMessage {
  id: number;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
  typing?: boolean;
}

const chat_page = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    inputRef.current?.focus();
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isTyping = e.key === "1" || e.key.toLowerCase() === "backspace";
      const isInputFocused = document.activeElement === inputRef.current;

      if (!isInputFocused && isTyping) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now(),
      sender: "user",
      text: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userInput = input.trim();
    setInput("");
    setIsTyping(true);

    // Simulate more realistic AI response timing
    const typingDelay = Math.random() * 1000 + 1500; // 1.5-2.5 seconds
    
    setTimeout(() => {
      setIsTyping(false);
      const botMessage: ChatMessage = {
        id: Date.now() + 1,
        sender: "bot",
        text: generateIntelligentReply(userInput),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    }, typingDelay);

    console.log("User message sent:", userMessage.text);
  };

  // Enhanced AI response generation
  const generateIntelligentReply = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    // Emergency keywords
    if (lowerInput.includes('emergency') || lowerInput.includes('urgent') || lowerInput.includes('help')) {
      const emergencyResponses = [
        "🚨 I understand this is urgent. First, stay calm. If this is a life-threatening emergency, call 108 immediately using the red button below. Can you tell me more about the specific situation?",
        "⚡ Emergency detected. Please use the emergency buttons below - call 108 for immediate help or alert your emergency contacts. While help is on the way, I can guide you through first aid steps.",
        "🆘 For immediate emergencies, use the emergency buttons below to call 108 or alert your contacts. I'm here to provide first aid guidance while you wait for professional help. What's the nature of the emergency?"
      ];
      return emergencyResponses[Math.floor(Math.random() * emergencyResponses.length)];
    }

    // Specific medical conditions
    if (lowerInput.includes('bleeding') || lowerInput.includes('wound') || lowerInput.includes('cut')) {
      return "🩸 For bleeding wounds: 1) Apply direct pressure with a clean cloth or sterile gauze 2) Elevate the injured area above heart level if possible 3) Don't remove embedded objects 4) If bleeding doesn't stop after 10 minutes of pressure, use the emergency buttons below to get immediate medical attention.";
    }

    if (lowerInput.includes('burn')) {
      return "🔥 For burns: 1) Remove from heat source immediately 2) Cool the burn with running water for 10-20 minutes 3) Don't use ice or butter 4) Cover with sterile gauze 5) For severe burns (larger than palm size), use the emergency buttons below to get immediate medical care.";
    }

    if (lowerInput.includes('choking')) {
      return "🫁 For choking: If person can cough/speak - encourage coughing. If they can't breathe: 1) Stand behind them 2) Give 5 back blows between shoulder blades 3) If unsuccessful, perform 5 abdominal thrusts (Heimlich maneuver) 4) Alternate until object dislodges or person becomes unconscious. If unsuccessful, use emergency buttons below.";
    }

    if (lowerInput.includes('cpr') || lowerInput.includes('unconscious') || lowerInput.includes('not breathing')) {
      return "💓 CPR Steps: 1) Check responsiveness 2) Call 108 using the button below 3) Check pulse and breathing 4) If no pulse: Place hands center of chest, push hard and fast at least 2 inches deep, 100-120 compressions/minute 5) Give 30 compressions, then 2 rescue breaths 6) Continue until help arrives.";
    }

    if (lowerInput.includes('heart attack') || lowerInput.includes('chest pain')) {
      return "❤️ Heart Attack Signs: Use the emergency button below to call 108 immediately! While waiting: 1) Have person sit and rest 2) Loosen tight clothing 3) Give aspirin if not allergic (chew, don't swallow whole) 4) Monitor breathing and consciousness 5) Be ready to perform CPR if needed.";
    }

    if (lowerInput.includes('stroke')) {
      return "🧠 FAST stroke test: Face (smile - is it uneven?), Arms (raise both - does one drift?), Speech (repeat phrase - is it slurred?), Time (call 108 immediately using the button below). Don't give food, water, or medication. Note time symptoms started.";
    }

    if (lowerInput.includes('seizure')) {
      return "⚡ During seizure: 1) Stay calm 2) Keep person safe - move objects away 3) Don't hold them down or put anything in mouth 4) Time the seizure 5) Turn on side when jerking stops 6) Call 108 using the button below if seizure lasts >5 minutes or person doesn't wake up.";
    }

    if (lowerInput.includes('fracture') || lowerInput.includes('broken bone') || lowerInput.includes('sprain')) {
      return "🦴 For suspected fractures: 1) Don't move the injured area 2) Apply ice wrapped in cloth (not directly on skin) 3) Immobilize with splint if trained 4) Elevate if possible 5) Use emergency buttons below for proper medical evaluation and treatment.";
    }

    // Greetings and general
    if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey')) {
      const greetings = [
        "👋 Hello! I'm DOCai, your AI first aid assistant. I'm here to help with medical emergencies and first aid guidance. For immediate emergencies, use the emergency buttons below. What can I assist you with today?",
        "🩺 Hi there! I'm your medical assistant AI. Whether it's an emergency or you need first aid information, I'm here to help. Remember, for life-threatening situations, use the emergency buttons below. What's on your mind?",
        "💙 Hello! I'm DOCai, trained to provide first aid guidance and emergency assistance. The emergency buttons below can help you call 108 or alert your contacts immediately. How can I help you stay safe and healthy today?"
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }

    if (lowerInput.includes('thanks') || lowerInput.includes('thank you')) {
      return "🙏 You're welcome! Remember, I'm here 24/7 for any first aid questions or emergency guidance. The emergency buttons below are always available for immediate help. Stay safe, and don't hesitate to use them when needed.";
    }

    // Default intelligent responses
    const intelligentResponses = [
      "🤖 I'm analyzing your situation. Could you provide more specific details about the symptoms or emergency you're dealing with? For immediate emergencies, use the emergency buttons below. The more information you give me, the better I can assist you.",
      "🩺 I'm here to help with first aid and medical emergencies. Can you describe the situation in more detail? For life-threatening situations, use the emergency buttons below immediately. For example: What happened? Who is affected? What symptoms are present?",
      "💡 I understand you need medical assistance. For immediate emergencies, use the buttons below to call 108 or alert contacts. To provide the most accurate guidance, please tell me: 1) What's the nature of the problem? 2) Is anyone in immediate danger? 3) What symptoms do you observe?",
      "🆘 I'm your AI medical assistant. For urgent situations, the emergency buttons below can help immediately. For the best guidance, please describe: What type of injury or medical situation are you dealing with? Any visible symptoms? How urgent is the situation?",
      "🔍 Let me help you with that. For emergencies, use the buttons below for immediate help. Could you be more specific about the medical situation? The more details you provide (symptoms, circumstances, etc.), the more precise guidance I can offer."
    ];

    return intelligentResponses[Math.floor(Math.random() * intelligentResponses.length)];
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
              <p className="text-xs text-slate-600 hidden sm:block">AI-Powered Medical Support</p>
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
              <p className="text-base sm:text-lg font-medium mb-2">Your AI Medical Assistant</p>
              <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                I'm here to provide first aid guidance and emergency assistance. 
                For immediate emergencies, use the buttons below to call 108 or alert your contacts.
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
              {isTyping && (
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
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
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
                onKeyDown={(e) => e.key === "Enter" && !isTyping && handleSend()}
                disabled={isTyping}
              />
            </div>
            <Button
              type="button"
              onClick={handleSend}
              disabled={isTyping || !input.trim()}
              size="sm"
              className="h-10 sm:h-12 px-3 sm:px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              {isTyping ? (
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
              🚨 For life-threatening emergencies, use the red "Call 108" button above
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default chat_page;
