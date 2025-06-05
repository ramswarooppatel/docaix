"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
  isLoading?: boolean;
  isProcessed?: boolean;
  processingError?: string;
}

interface FAQProps {
  faqs?: FAQItem[];
  rawText?: string; // For dynamic parsing
  className?: string;
  isProcessingFAQs?: boolean;
  onFAQProcess?: (index: number) => Promise<void>;
  defaultOpen?: boolean;
}

// Enhanced FAQ parsing function
function parseFAQs(text: string): FAQItem[] {
  const faqs: FAQItem[] = [];

  // Multiple patterns to detect FAQs
  const patterns = [
    // Pattern: * Question? emoji \n answer
    /\*\s*(.+?\?)\s*[🚒💉🏥🤔❓🩹🚑🆘🔥💊🩺⚠️ℹ️]?\s*\n((?:(?!\*\s*.+?\?).+(?:\n|$))*)/g,
    // Pattern: Q: Question? A: Answer
    /Q\d*[:.]?\s*(.+?\?)\s*A\d*[:.]?\s*([^Q]+?)(?=Q\d*[:.]|$)/gi,
    // Pattern: **Question?** Answer
    /\*\*(.+?\?)\*\*\s*\n([^*]+?)(?=\*\*|$)/g,
    // Pattern: Question on one line, answer on next lines
    /^(.+\?)\s*$\n((?:(?!^.+\?$).+(?:\n|$))*)/gm,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const question = cleanFAQText(match[1]);
      const answer = cleanFAQText(match[2]);

      if (question && answer && question.length > 5 && answer.length > 5) {
        // Check for duplicates
        const isDuplicate = faqs.some(
          (faq) =>
            faq.question.toLowerCase().includes(question.toLowerCase()) ||
            question.toLowerCase().includes(faq.question.toLowerCase())
        );

        if (!isDuplicate) {
          faqs.push({
            question,
            answer,
            isProcessed: true,
          });
        }
      }
    }
  }

  return faqs;
}

function cleanFAQText(text: string): string {
  return text
    .replace(/[🚒💉🏥🤔❓🩹🚑🆘🔥💊🩺⚠️ℹ️]/g, "") // Remove emojis
    .replace(/^\s*[\*\-\+\t]\s*/, "") // Remove bullet points
    .replace(/^Q\d*[:.]?\s*/i, "") // Remove Q: prefix
    .replace(/^A\d*[:.]?\s*/i, "") // Remove A: prefix
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();
}

export const FAQ: React.FC<FAQProps> = ({
  faqs: propFaqs,
  rawText,
  className = "",
  isProcessingFAQs = false,
  onFAQProcess,
  defaultOpen = false,
}) => {
  // Parse FAQs from raw text if provided, otherwise use prop FAQs
  const [parsedFaqs, setParsedFaqs] = useState<FAQItem[]>([]);
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());
  const [processingItems, setProcessingItems] = useState<Set<number>>(
    new Set()
  );

  // Parse FAQs from raw text when component mounts or text changes
  useEffect(() => {
    if (rawText) {
      const parsed = parseFAQs(rawText);
      setParsedFaqs(parsed);

      // Auto-open first FAQ if defaultOpen is true
      if (defaultOpen && parsed.length > 0) {
        setOpenItems(new Set([0]));
      }
    } else if (propFaqs) {
      setParsedFaqs(propFaqs);

      if (defaultOpen && propFaqs.length > 0) {
        setOpenItems(new Set([0]));
      }
    }
  }, [rawText, propFaqs, defaultOpen]);

  const finalFaqs = parsedFaqs.length > 0 ? parsedFaqs : propFaqs || [];

  const toggleItem = async (index: number) => {
    const newOpenItems = new Set(openItems);

    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);

      // If FAQ item needs processing and has onFAQProcess callback
      const faqItem = finalFaqs[index];
      if (
        onFAQProcess &&
        !faqItem.isProcessed &&
        !faqItem.isLoading &&
        !processingItems.has(index)
      ) {
        setProcessingItems((prev) => new Set(prev).add(index));
        try {
          await onFAQProcess(index);
        } catch (error) {
          console.error("FAQ processing error:", error);
        } finally {
          setProcessingItems((prev) => {
            const newSet = new Set(prev);
            newSet.delete(index);
            return newSet;
          });
        }
      }
    }

    setOpenItems(newOpenItems);
  };

  const toggleAll = () => {
    if (openItems.size === finalFaqs.length) {
      setOpenItems(new Set());
    } else {
      setOpenItems(new Set(finalFaqs.map((_, index) => index)));
    }
  };

  if (finalFaqs.length === 0) return null;

  return (
    <div
      className={`border-l-4 border-purple-500 bg-purple-50 p-4 rounded-lg shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-purple-800 flex items-center gap-2">
          <HelpCircle className="w-4 h-4" />❓ Frequently Asked Questions
          <span className="text-xs bg-purple-200 text-purple-700 px-2 py-0.5 rounded-full">
            {finalFaqs.length}
          </span>
        </h3>
        <button
          onClick={toggleAll}
          className="text-xs text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1 bg-purple-100 hover:bg-purple-200 px-2 py-1 rounded transition-colors"
        >
          {openItems.size === finalFaqs.length ? (
            <>
              <ChevronUp className="w-3 h-3" />
              Collapse All
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3" />
              Expand All
            </>
          )}
        </button>
      </div>

      <div className="space-y-2">
        {finalFaqs.map((faq, index) => {
          const isItemLoading = faq.isLoading || processingItems.has(index);
          const isItemProcessed = faq.isProcessed;
          const hasError = faq.processingError;

          return (
            <div
              key={index}
              className={`border rounded-lg overflow-hidden transition-all duration-200 bg-white shadow-sm ${
                openItems.has(index)
                  ? "border-purple-300 shadow-md"
                  : "border-purple-200 hover:border-purple-300"
              }`}
            >
              <button
                onClick={() => toggleItem(index)}
                disabled={isItemLoading}
                className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-purple-50 transition-colors duration-200 group disabled:opacity-50"
              >
                <span className="text-sm font-medium text-slate-800 pr-2 group-hover:text-purple-700 flex items-center gap-2">
                  <span className="text-purple-600 font-bold">
                    Q{index + 1}:
                  </span>
                  {faq.question}

                  {/* Loading indicator */}
                  {isItemLoading && (
                    <Loader2 className="w-3 h-3 animate-spin text-purple-500" />
                  )}

                  {/* Processed indicator */}
                  {isItemProcessed && !isItemLoading && (
                    <CheckCircle className="w-3 h-3 text-green-600" />
                  )}

                  {/* Error indicator */}
                  {hasError && !isItemLoading && (
                    <AlertCircle className="w-3 h-3 text-red-600" />
                  )}
                </span>
                <div className="flex-shrink-0">
                  {openItems.has(index) ? (
                    <ChevronUp className="w-4 h-4 text-slate-500 group-hover:text-purple-600" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-purple-600" />
                  )}
                </div>
              </button>

              {openItems.has(index) && (
                <div className="px-4 pb-3 border-t border-purple-200 bg-purple-25">
                  <div className="text-sm text-slate-700 leading-relaxed pt-3">
                    <div className="flex items-start gap-2">
                      <span className="text-purple-600 font-bold flex-shrink-0">
                        A:
                      </span>
                      <div className="flex-1">
                        {isItemLoading ? (
                          <div className="flex items-center gap-2 py-4">
                            <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                            <span className="text-slate-500 italic">
                              Processing detailed answer...
                            </span>
                          </div>
                        ) : hasError ? (
                          <div className="flex items-center gap-2 py-2">
                            <AlertCircle className="w-4 h-4 text-red-500" />
                            <span className="text-red-600">
                              Failed to load detailed answer. Please try again.
                            </span>
                          </div>
                        ) : (
                          <div
                            className="prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{
                              __html: formatFAQAnswer(faq.answer),
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3 text-xs text-purple-600 flex items-center gap-2">
        <HelpCircle className="w-3 h-3" />
        <span>
          {isProcessingFAQs
            ? "Processing FAQ responses..."
            : `${finalFaqs.length} questions available - click to expand answers`}
        </span>
        {isProcessingFAQs && <Loader2 className="w-3 h-3 animate-spin" />}
      </div>
    </div>
  );
};

// Enhanced answer formatting
function formatFAQAnswer(answer: string): string {
  return (
    answer
      .replace(
        /\*\*(.*?)\*\*/g,
        '<strong class="font-semibold text-slate-800">$1</strong>'
      )
      .replace(/\*(.*?)\*/g, '<em class="italic text-slate-600">$1</em>')
      .replace(/\n\n/g, '</p><p class="mt-2">')
      .replace(/\n/g, "<br/>")
      .replace(/^/, "<p>")
      .replace(/$/, "</p>")
      // Highlight important medical terms
      .replace(
        /\b(emergency|urgent|important|warning|caution|danger|critical|immediately)\b/gi,
        '<span class="font-bold text-red-600 bg-red-100 px-1 rounded">$1</span>'
      )
      .replace(
        /\b(call|phone|contact)\s*(108|911|999|\d{3})\b/gi,
        '<span class="font-bold text-red-600 bg-red-100 px-1 rounded">📞 $1 $2</span>'
      )
      // Highlight medical procedures
      .replace(
        /\b(apply pressure|elevate|bandage|compress|tourniquet)\b/gi,
        '<span class="font-medium text-blue-700 bg-blue-100 px-1 rounded">$1</span>'
      )
  );
}
