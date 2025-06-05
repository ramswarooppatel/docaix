"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageCircle, SendHorizonal } from "lucide-react";

const chat_page = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Main content area */}
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-semibold text-3xl text-center text-gray-800 mb-8">
            First Aid Assistant
          </h1>
          {/* Chat messages would go here */}
          <div className="space-y-4">
            {/* Placeholder for chat messages */}
            <div className="text-center text-gray-500 mt-20">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <MessageCircle />
              </div>
              <p className="text-lg font-medium">Start a conversation</p>
              <p className="text-sm text-gray-400 mt-1">
                Ask me about first aid or emergency situations
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed input at bottom */}
      <div className="sticky bottom-0 bg-white/80 backdrop-blur-sm border-t border-gray-200 p-6">
        <div className="flex w-full max-w-4xl mx-auto items-center gap-3">
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder="Describe your emergency or ask for first aid help..."
              className="flex-1 h-12 pl-4 pr-12 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-sm"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2"></div>
          </div>
          <Button
            type="submit"
            className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 font-medium"
          >
            Send <SendHorizonal />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default chat_page;
