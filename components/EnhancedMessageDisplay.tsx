"use client";

import React from "react";
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Heart, 
  Clock, 
  MapPin, 
  Phone,
  Shield,
  Stethoscope,
  Eye,
  Hand,
  Thermometer,
  Activity
} from "lucide-react";

interface EnhancedMessageDisplayProps {
  text: string;
  className?: string;
}

export const EnhancedMessageDisplay: React.FC<EnhancedMessageDisplayProps> = ({
  text,
  className = ""
}) => {
  const parseAndFormatMessage = (message: string) => {
    const sections: Array<{
      type: 'header' | 'emergency' | 'steps' | 'warning' | 'info' | 'symptoms' | 'advice';
      content: string;
      icon?: React.ReactNode;
      color: string;
      bgColor: string;
      borderColor: string;
    }> = [];

    // Split message into lines
    const lines = message.split('\n').filter(line => line.trim());
    
    let currentSection: any = null;
    let currentSteps: string[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      // Check for different types of content
      if (trimmedLine.match(/^(DOCai|😕)/)) {
        // Header/greeting
        sections.push({
          type: 'header',
          content: trimmedLine.replace(/^(DOCai|😕)\s*/, ''),
          icon: <Heart className="w-4 h-4" />,
          color: 'text-blue-700',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        });
      } else if (trimmedLine.match(/^[\*\s]*(?:STOP|CALL|CHECK|EMERGENCY|URGENT|IMMEDIATELY)/i)) {
        // Emergency instructions
        sections.push({
          type: 'emergency',
          content: trimmedLine.replace(/^\*+\s*/, '').replace(/\*+$/, ''),
          icon: <AlertTriangle className="w-4 h-4" />,
          color: 'text-red-700',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        });
      } else if (trimmedLine.match(/^[\*\s]*(?:SEE A DOCTOR|SEEK MEDICAL|CONTACT|VISIT)/i)) {
        // Medical advice
        sections.push({
          type: 'advice',
          content: trimmedLine.replace(/^\*+\s*/, '').replace(/\*+$/, ''),
          icon: <Stethoscope className="w-4 h-4" />,
          color: 'text-purple-700',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200'
        });
      } else if (trimmedLine.match(/^[\*\s]*(?:SYMPTOMS|SIGNS|IF YOU HAVE|WHEN YOU)/i)) {
        // Symptoms or conditions
        sections.push({
          type: 'symptoms',
          content: trimmedLine.replace(/^\*+\s*/, '').replace(/\*+$/, ''),
          icon: <Activity className="w-4 h-4" />,
          color: 'text-orange-700',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200'
        });
      } else if (trimmedLine.match(/^[\*\s]*(?:WARNING|CAUTION|IMPORTANT|NOTE|REMEMBER)/i)) {
        // Warnings or important notes
        sections.push({
          type: 'warning',
          content: trimmedLine.replace(/^\*+\s*/, '').replace(/\*+$/, ''),
          icon: <Shield className="w-4 h-4" />,
          color: 'text-amber-700',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200'
        });
      } else if (trimmedLine.match(/^\*\s/)) {
        // Bullet points/steps
        const step = trimmedLine.replace(/^\*\s*/, '').replace(/\*+$/, '');
        currentSteps.push(step);
      } else {
        // Flush any accumulated steps
        if (currentSteps.length > 0) {
          sections.push({
            type: 'steps',
            content: currentSteps.join('|||'), // Use delimiter to separate steps
            icon: <CheckCircle className="w-4 h-4" />,
            color: 'text-green-700',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200'
          });
          currentSteps = [];
        }

        // Regular informational text
        sections.push({
          type: 'info',
          content: trimmedLine,
          icon: <Info className="w-4 h-4" />,
          color: 'text-slate-700',
          bgColor: 'bg-slate-50',
          borderColor: 'border-slate-200'
        });
      }
    }

    // Handle any remaining steps
    if (currentSteps.length > 0) {
      sections.push({
        type: 'steps',
        content: currentSteps.join('|||'),
        icon: <CheckCircle className="w-4 h-4" />,
        color: 'text-green-700',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      });
    }

    return sections;
  };

  const formatContent = (content: string, type: string) => {
    // Remove emojis for display
    let formatted = content.replace(/🚨|😕|🤔|🚑|🚿|🤲|💡|📍|🕒|⌄|❤️|🏥|💊|🩺|🔥|❄️|⚠️|✅|❌|🆘|📞|🎯/g, '');
    
    // Handle bold text (keep the formatting, remove asterisks)
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>');
    formatted = formatted.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
    
    // Add special formatting for medical terms
    formatted = formatted.replace(/\b(emergency|urgent|important|warning|caution|danger|critical|immediately)\b/gi, 
      '<span class="font-bold text-red-600 uppercase">$1</span>');
    
    // Handle steps if it's a steps section
    if (type === 'steps') {
      const steps = content.split('|||');
      return steps.map((step, index) => (
        <div key={index} className="flex items-start gap-2 mb-2 last:mb-0">
          <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-xs font-bold text-green-700">{index + 1}</span>
          </div>
          <span 
            className="text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ 
              __html: step.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
                          .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>') 
            }}
          />
        </div>
      ));
    }

    return (
      <span 
        className="text-sm leading-relaxed"
        dangerouslySetInnerHTML={{ __html: formatted }}
      />
    );
  };

  const sections = parseAndFormatMessage(text);

  return (
    <div className={`space-y-3 ${className}`}>
      {sections.map((section, index) => (
        <div
          key={index}
          className={`rounded-lg border-l-4 p-3 ${section.bgColor} ${section.borderColor} shadow-sm`}
        >
          <div className="flex items-start gap-2">
            <div className={`${section.color} flex-shrink-0 mt-0.5`}>
              {section.icon}
            </div>
            <div className="flex-1">
              {section.type === 'header' && (
                <div className={`font-semibold mb-1 ${section.color}`}>
                  DOCai Medical Assistant
                </div>
              )}
              <div className={section.color}>
                {formatContent(section.content, section.type)}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};