"use client";

import React from "react";
import {
  AlertTriangle,
  CheckCircle,
  Info,
  Heart,
  Stethoscope,
} from "lucide-react";
import { FAQ } from "./FAQ";

interface EnhancedMessageDisplayProps {
  text?: string;
  structuredData?: {
    header?: string;
    emergency?: string;
    steps?: string[];
    doctorAdvice?: string[];
    faqs?: { question: string; answer: string }[];
  };
  className?: string;
}

export const EnhancedMessageDisplay: React.FC<EnhancedMessageDisplayProps> = ({
  text,
  structuredData,
  className = "",
}) => {
  console.log("EnhancedMessageDisplay props:", {
    hasText: !!text,
    hasStructuredData: !!structuredData,
    structuredData,
  });

  // Define formatContent at the top level so it's available for both branches
  const formatContent = (content: string, type: string) => {
    // Remove emojis for cleaner display
    let formatted = content
      .replace(
        /🚨|😕|🤔|🚑|🚿|🤲|💡|📍|🕒|⌄|❤️|🏥|💊|🩺|🔥|❄️|⚠️|✅|❌|🆘|📞|🎯|😊|🤢|💉/g,
        ""
      )
      .trim();

    // Handle bold text
    formatted = formatted.replace(
      /\*\*(.*?)\*\*/g,
      '<strong class="font-bold">$1</strong>'
    );

    // Handle steps/list items
    if (type === "steps" || type === "advice") {
      const items = content.split("|||");
      return (
        <div className="space-y-2">
          {items.map((item, index) => {
            const cleanItem = item
              .replace(
                /🚨|😕|🤔|🚑|🚿|🤲|💡|📍|🕒|⌄|❤️|🏥|💊|🩺|🔥|❄️|⚠️|✅|❌|🆘|📞|🎯|😊|🤢|💉/g,
                ""
              )
              .trim();

            const formattedItem = cleanItem.replace(
              /\*\*(.*?)\*\*/g,
              '<strong class="font-bold">$1</strong>'
            );

            const isMainAction = cleanItem.match(/^[A-Z\s]+:/);

            return (
              <div key={index} className="flex items-start gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    isMainAction
                      ? type === "advice"
                        ? "bg-purple-100"
                        : "bg-green-100"
                      : type === "advice"
                      ? "bg-purple-50 border border-purple-200"
                      : "bg-green-50 border border-green-200"
                  }`}
                >
                  <span
                    className={`text-xs font-bold ${
                      type === "advice" ? "text-purple-700" : "text-green-700"
                    }`}
                  >
                    {isMainAction ? "!" : index + 1}
                  </span>
                </div>
                <div
                  className="text-sm leading-relaxed flex-1"
                  dangerouslySetInnerHTML={{ __html: formattedItem }}
                />
              </div>
            );
          })}
        </div>
      );
    }

    return (
      <span
        className="text-sm leading-relaxed"
        dangerouslySetInnerHTML={{ __html: formatted }}
      />
    );
  };

  // Convert string FAQ content to FAQ array
  const parseFAQContent = (content: string) => {
    const lines = content.split("\n").filter((line) => line.trim());
    const faqs: { question: string; answer: string; isProcessed: boolean }[] =
      [];

    for (let i = 0; i < lines.length; i += 2) {
      const questionLine = lines[i];
      const answerLine = lines[i + 1];

      if (questionLine && answerLine) {
        const question = questionLine.replace(/^Q:\s*/i, "").trim();
        const answer = answerLine.replace(/^A:\s*/i, "").trim();

        if (question && answer) {
          faqs.push({
            question,
            answer,
            isProcessed: true,
          });
        }
      }
    }

    return faqs;
  };

  // If we have structured data, use that instead of parsing the text
  if (structuredData) {
    console.log("Using structured data:", structuredData);

    const sections: Array<{
      type: "header" | "emergency" | "steps" | "advice";
      content: string;
      icon?: React.ReactNode;
      color: string;
      bgColor: string;
      borderColor: string;
    }> = [];

    // Add header if exists
    if (structuredData.header) {
      sections.push({
        type: "header",
        content: structuredData.header,
        icon: <Heart className="w-4 h-4" />,
        color: "text-blue-700",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
      });
    }

    // Add emergency if exists
    if (structuredData.emergency) {
      sections.push({
        type: "emergency",
        content: structuredData.emergency,
        icon: <AlertTriangle className="w-4 h-4" />,
        color: "text-red-700",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
      });
    }

    // Add steps if exists
    if (structuredData.steps && structuredData.steps.length > 0) {
      sections.push({
        type: "steps",
        content: structuredData.steps.join("|||"),
        icon: <CheckCircle className="w-4 h-4" />,
        color: "text-green-700",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
      });
    }

    // Add doctor advice if exists
    if (structuredData.doctorAdvice && structuredData.doctorAdvice.length > 0) {
      sections.push({
        type: "advice",
        content: structuredData.doctorAdvice.join("|||"),
        icon: <Stethoscope className="w-4 h-4" />,
        color: "text-purple-700",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200",
      });
    }

    return (
      <div className={`space-y-8 ${className}`}>
        {/* First Aid Steps */}
        {sections.length > 0 && (
          <div>
            <div className="text-lg font-bold mb-4 text-blue-900">
              First Aid Steps
            </div>
            <div className="space-y-4">
              {sections.map((section, index) => {
                switch (section.type) {
                  case "header":
                    return (
                      <div
                        key={index}
                        className={`rounded-lg border-l-4 p-4 ${section.bgColor} ${section.borderColor} shadow-sm`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`${section.color} flex-shrink-0 mt-0.5`}
                          >
                            {section.icon}
                          </div>
                          <div className="flex-1">
                            <div
                              className={`font-semibold mb-2 ${section.color}`}
                            >
                              DOCai Medical Assistant
                            </div>
                            <div className={section.color}>
                              {formatContent(section.content, section.type)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  case "emergency":
                    return (
                      <div
                        key={index}
                        className={`rounded-lg border-l-4 p-4 ${section.bgColor} ${section.borderColor} shadow-sm`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`${section.color} flex-shrink-0 mt-0.5`}
                          >
                            {section.icon}
                          </div>
                          <div className="flex-1">
                            <div
                              className={`font-semibold mb-2 ${section.color}`}
                            >
                              Immediate Action Required
                            </div>
                            <div className={section.color}>
                              {formatContent(section.content, section.type)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  case "steps":
                    return (
                      <div
                        key={index}
                        className={`rounded-lg border-l-4 p-4 ${section.bgColor} ${section.borderColor} shadow-sm`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`${section.color} flex-shrink-0 mt-0.5`}
                          >
                            {section.icon}
                          </div>
                          <div className="flex-1">
                            <div
                              className={`font-semibold mb-3 ${section.color}`}
                            >
                              First Aid Steps
                            </div>
                            <div className={section.color}>
                              {formatContent(section.content, section.type)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  case "advice":
                    return (
                      <div
                        key={index}
                        className={`rounded-lg border-l-4 p-4 ${section.bgColor} ${section.borderColor} shadow-sm`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`${section.color} flex-shrink-0 mt-0.5`}
                          >
                            {section.icon}
                          </div>
                          <div className="flex-1">
                            <div
                              className={`font-semibold mb-3 ${section.color}`}
                            >
                              When to See a Doctor
                            </div>
                            <div className={section.color}>
                              {formatContent(section.content, section.type)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  default:
                    return null;
                }
              })}
            </div>
          </div>
        )}

        {/* FAQs - Handle structured FAQs properly */}
        {structuredData.faqs && structuredData.faqs.length > 0 && (
          <div>
            <div className="text-lg font-bold mb-4 text-blue-900">
              Frequently Asked Questions
            </div>
            <div className="space-y-4">
              <FAQ
                faqs={structuredData.faqs.map((faq) => ({
                  question: faq.question,
                  answer: faq.answer,
                  isProcessed: true,
                }))}
                defaultOpen={false}
                className="mt-4"
              />
            </div>
          </div>
        )}
      </div>
    );
  } else {
    // Fallback parsing logic for when no structured data is available
    const parseAndFormatMessage = (message: string | undefined) => {
      const sections: Array<{
        type:
          | "header"
          | "emergency"
          | "steps"
          | "warning"
          | "info"
          | "symptoms"
          | "advice"
          | "faqs";
        content: string;
        icon?: React.ReactNode;
        color: string;
        bgColor: string;
        borderColor: string;
      }> = [];

      if (!message) {
        return sections;
      }

      const lines = message.split("\n").filter((line) => line.trim());
      let currentSteps: string[] = [];
      let currentAdviceItems: string[] = [];
      let isInSeeADoctorSection = false;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Check for greeting/header
        if (line.match(/^😊.*laceration/i) || line.match(/^It seems like/i)) {
          sections.push({
            type: "header",
            content: line.replace(/^😊\s*/, ""),
            icon: <Heart className="w-4 h-4" />,
            color: "text-blue-700",
            bgColor: "bg-blue-50",
            borderColor: "border-blue-200",
          });
          continue;
        }

        // Check for main action items
        if (line.match(/^[A-Z\s]+:/)) {
          if (currentSteps.length > 0) {
            sections.push({
              type: "steps",
              content: currentSteps.join("|||"),
              icon: <CheckCircle className="w-4 h-4" />,
              color: "text-green-700",
              bgColor: "bg-green-50",
              borderColor: "border-green-200",
            });
            currentSteps = [];
          }

          if (currentAdviceItems.length > 0) {
            sections.push({
              type: "advice",
              content: currentAdviceItems.join("|||"),
              icon: <Stethoscope className="w-4 h-4" />,
              color: "text-purple-700",
              bgColor: "bg-purple-50",
              borderColor: "border-purple-200",
            });
            currentAdviceItems = [];
            isInSeeADoctorSection = false;
          }

          if (line.match(/^STOP THE BLEEDING:/i)) {
            sections.push({
              type: "emergency",
              content: line,
              icon: <AlertTriangle className="w-4 h-4" />,
              color: "text-red-700",
              bgColor: "bg-red-50",
              borderColor: "border-red-200",
            });
          } else {
            currentSteps.push(line);
          }
          continue;
        }

        // Check for "SEE A DOCTOR if:" section
        if (line.match(/^SEE A DOCTOR if:/i)) {
          if (currentSteps.length > 0) {
            sections.push({
              type: "steps",
              content: currentSteps.join("|||"),
              icon: <CheckCircle className="w-4 h-4" />,
              color: "text-green-700",
              bgColor: "bg-green-50",
              borderColor: "border-green-200",
            });
            currentSteps = [];
          }
          isInSeeADoctorSection = true;
          continue;
        }

        // Check for FAQ section
        if (line.match(/^Some FAQs relevant/i)) {
          if (currentSteps.length > 0) {
            sections.push({
              type: "steps",
              content: currentSteps.join("|||"),
              icon: <CheckCircle className="w-4 h-4" />,
              color: "text-green-700",
              bgColor: "bg-green-50",
              borderColor: "border-green-200",
            });
            currentSteps = [];
          }
          if (currentAdviceItems.length > 0) {
            sections.push({
              type: "advice",
              content: currentAdviceItems.join("|||"),
              icon: <Stethoscope className="w-4 h-4" />,
              color: "text-purple-700",
              bgColor: "bg-purple-50",
              borderColor: "border-purple-200",
            });
            currentAdviceItems = [];
          }

          const faqLines: string[] = [];
          for (let j = i + 1; j < lines.length; j++) {
            const faqLine = lines[j].trim();
            if (faqLine.match(/^\d+/) || faqLine.match(/^What|^How|^When/)) {
              faqLines.push(faqLine);
            }
          }

          if (faqLines.length > 0) {
            sections.push({
              type: "faqs",
              content: faqLines.join("\n"),
              icon: <Info className="w-4 h-4" />,
              color: "text-slate-700",
              bgColor: "bg-slate-50",
              borderColor: "border-slate-200",
            });
          }
          break;
        }

        // Handle numbered lines or bullet points
        if (line.match(/^\d+/) || line.match(/^[•\-\*]/)) {
          const cleanLine = line
            .replace(/^\d+\s*/, "")
            .replace(/^[•\-\*]\s*/, "");
          if (isInSeeADoctorSection) {
            currentAdviceItems.push(cleanLine);
          } else {
            currentSteps.push(cleanLine);
          }
          continue;
        }

        // Handle regular content
        if (isInSeeADoctorSection) {
          currentAdviceItems.push(line);
        } else if (line.length > 10) {
          currentSteps.push(line);
        }
      }

      // Flush remaining items
      if (currentSteps.length > 0) {
        sections.push({
          type: "steps",
          content: currentSteps.join("|||"),
          icon: <CheckCircle className="w-4 h-4" />,
          color: "text-green-700",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
        });
      }

      if (currentAdviceItems.length > 0) {
        sections.push({
          type: "advice",
          content: currentAdviceItems.join("|||"),
          icon: <Stethoscope className="w-4 h-4" />,
          color: "text-purple-700",
          bgColor: "bg-purple-50",
          borderColor: "border-purple-200",
        });
      }

      return sections;
    };

    const sections = parseAndFormatMessage(text);
    const nonFaqSections = sections.filter(
      (section) => section.type !== "faqs"
    );
    const faqSections = sections.filter((section) => section.type === "faqs");

    return (
      <div className={`space-y-8 ${className}`}>
        {/* First Aid Steps */}
        {nonFaqSections.length > 0 && (
          <div>
            <div className="text-lg font-bold mb-4 text-blue-900">
              First Aid Steps
            </div>
            <div className="space-y-4">
              {nonFaqSections.map((section, index) => {
                switch (section.type) {
                  case "header":
                    return (
                      <div
                        key={index}
                        className={`rounded-lg border-l-4 p-4 ${section.bgColor} ${section.borderColor} shadow-sm`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`${section.color} flex-shrink-0 mt-0.5`}
                          >
                            {section.icon}
                          </div>
                          <div className="flex-1">
                            <div
                              className={`font-semibold mb-2 ${section.color}`}
                            >
                              DOCai Medical Assistant
                            </div>
                            <div className={section.color}>
                              {formatContent(section.content, section.type)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  case "emergency":
                    return (
                      <div
                        key={index}
                        className={`rounded-lg border-l-4 p-4 ${section.bgColor} ${section.borderColor} shadow-sm`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`${section.color} flex-shrink-0 mt-0.5`}
                          >
                            {section.icon}
                          </div>
                          <div className="flex-1">
                            <div
                              className={`font-semibold mb-2 ${section.color}`}
                            >
                              Immediate Action Required
                            </div>
                            <div className={section.color}>
                              {formatContent(section.content, section.type)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  case "steps":
                    return (
                      <div
                        key={index}
                        className={`rounded-lg border-l-4 p-4 ${section.bgColor} ${section.borderColor} shadow-sm`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`${section.color} flex-shrink-0 mt-0.5`}
                          >
                            {section.icon}
                          </div>
                          <div className="flex-1">
                            <div
                              className={`font-semibold mb-3 ${section.color}`}
                            >
                              First Aid Steps
                            </div>
                            <div className={section.color}>
                              {formatContent(section.content, section.type)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  case "advice":
                    return (
                      <div
                        key={index}
                        className={`rounded-lg border-l-4 p-4 ${section.bgColor} ${section.borderColor} shadow-sm`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`${section.color} flex-shrink-0 mt-0.5`}
                          >
                            {section.icon}
                          </div>
                          <div className="flex-1">
                            <div
                              className={`font-semibold mb-3 ${section.color}`}
                            >
                              When to See a Doctor
                            </div>
                            <div className={section.color}>
                              {formatContent(section.content, section.type)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  default:
                    return null;
                }
              })}
            </div>
          </div>
        )}

        {/* FAQs - Handle parsed FAQ content properly */}
        {faqSections.length > 0 && (
          <div>
            <div className="text-lg font-bold mb-4 text-blue-900">
              Frequently Asked Questions
            </div>
            <div className="space-y-4">
              {faqSections.map((section, index) => (
                <FAQ
                  key={index}
                  faqs={parseFAQContent(section.content)}
                  defaultOpen={false}
                  className="mt-4"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
};
