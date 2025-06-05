"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageCircle, SendHorizonal, Stethoscope } from "lucide-react";

interface ChatMessage {
  id: number;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
}

const chat_page = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
    setInput("");

    // Simulate bot response(for demo purposes)
    setTimeout(() => {
      const botMessage: ChatMessage = {
        id: Date.now() + 1,
        sender: "bot",
        text: generateBotReply(input),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 800); // simulate typing delay

    console.log("User message sent:", userMessage.text);
    console.log("Bot reply generated");
  };
  // Function to generate a bot reply based on user input(for demo purposes)
  const generateBotReply = (input: string): string => {
    const commonReplies = [
      "Stay calm and call emergency services.",
      "Apply pressure to the wound with a clean cloth.",
      "Check for breathing and pulse.",
      "Elevate the injured area if possible.",
      "Rinse the burn with cool water for 10–15 minutes.",
    ];

    // For demo purposes: always return a random response
    return commonReplies[Math.floor(Math.random() * commonReplies.length)];
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Main content area */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-4">
          <h1 className="font-semibold text-3xl text-center text-gray-700 mb-6">
            First Aid Assistant
          </h1>
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-20">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <MessageCircle className="text-gray-500" />
              </div>
              <p className="text-lg font-medium">Start a conversation</p>
              <p className="text-sm text-gray-400 mt-1">
                Ask me about first aid or emergency situations
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 max-w-lg ${
                  msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.sender === "user"
                      ? "bg-gray-700 text-white"
                      : "bg-blue-500 text-white"
                  }`}
                >
                  {msg.sender === "user" ? (
                    <div className="w-6 h-6 bg-gray-500 rounded-full" />
                  ) : (
                    <Stethoscope className="w-4 h-4" />
                  )}
                </div>

                {/* Message bubble */}
                <div
                  className={`px-4 py-3 rounded-xl ${
                    msg.sender === "user"
                      ? "bg-gray-700 text-white"
                      : "bg-white text-gray-700 shadow-sm border border-gray-200"
                  }`}
                >
                  {msg.sender === "bot" && (
                    <div className="text-xs text-blue-600 font-medium mb-1">
                      DOCai
                    </div>
                  )}
                  <div>{msg.text}</div>
                  <div
                    className={`text-xs mt-2 ${
                      msg.sender === "user"
                        ? "text-gray-300"
                        : "text-gray-400"
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Fixed input at bottom */}
      <div className="sticky bottom-0 bg-white/80 backdrop-blur-sm border-t border-gray-200 p-6">
        <div className="flex w-full max-w-4xl mx-auto items-center gap-3">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your emergency or ask for first aid help..."
              className="flex-1 h-12 pl-4 pr-12 rounded-xl border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-500/20 shadow-sm"
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
          </div>
          <Button
            type="button"
            onClick={handleSend}
            className="h-12 px-6 bg-gray-700 hover:bg-gray-800 text-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 font-medium"
          >
            Send <SendHorizonal className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default chat_page;
