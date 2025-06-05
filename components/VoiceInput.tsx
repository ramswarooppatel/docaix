"use client";

import React, { useEffect, useRef } from "react";
import { useSpeechToText } from "../hooks/useSpeechToText";
import { Mic } from "lucide-react";
import { Button } from "./ui/button";

interface Props {
  onVoiceCommand: (command: string) => void;
}

const VoiceInput: React.FC<Props> = ({ onVoiceCommand }) => {
  const { transcript, isListening, startListening } = useSpeechToText();
  const lastProcessedTranscript = useRef(""); // Track processed transcripts

  useEffect(() => {
    if (
      transcript &&
      !isListening &&
      transcript !== lastProcessedTranscript.current &&
      transcript.trim().length > 0
    ) {
      lastProcessedTranscript.current = transcript; // Update the ref
      console.log("Auto-sending voice command:", transcript);
      onVoiceCommand(transcript); // Send the transcript directly (no need to lowercase)
    }
  }, [transcript, isListening, onVoiceCommand]);

  return (
    <Button
      onClick={startListening}
      disabled={isListening}
      variant="outline"
      className={`h-12 px-4 ${
        isListening
          ? "bg-red-50 text-red-600 border-red-200 animate-pulse"
          : "hover:bg-gray-100"
      }`}
    >
      <Mic
        className={`h-5 w-5 ${isListening ? "text-red-500" : "text-gray-500"}`}
      />
      <span className="sr-only">
        {isListening ? "Listening..." : "Start voice input"}
      </span>
    </Button>
  );
};

export default VoiceInput;
