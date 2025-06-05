"use client";

import React from "react";
import { Input } from "@/components/ui/input";

const chat_page = () => {
  return (
    <div>
      <div className="font-bold text-2xl">Chat Page</div>
      <div>
        <Input placeholder="Type your message here..." />
      </div>
    </div>
  );
};

export default chat_page;
