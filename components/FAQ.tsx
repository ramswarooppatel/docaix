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
  faqs: FAQItem[];
  className?: string;
  isProcessingFAQs?: boolean;
  onFAQProcess?: (index: number) => Promise<void>;
  defaultOpen?: boolean;
}

export const FAQ: React.FC<FAQProps> = ({
  faqs,
  className = "",
  isProcessingFAQs = false,
  onFAQProcess,
  defaultOpen = false,
}) => {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());
  const [processingItems, setProcessingItems] = useState<Set<number>>(
    new Set()
  );

  // Auto-open first FAQ if defaultOpen is true
  useEffect(() => {
    if (defaultOpen && faqs.length > 0) {
      setOpenItems(new Set([0]));
    }
  }, [faqs, defaultOpen]);

  const toggleItem = async (index: number) => {
    const newOpenItems = new Set(openItems);

    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);

      // If FAQ item needs processing and has onFAQProcess callback
      const faqItem = faqs[index];
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
    if (openItems.size === faqs.length) {
      setOpenItems(new Set());
    } else {
      setOpenItems(new Set(faqs.map((_, index) => index)));
    }
  };

  if (!faqs || faqs.length === 0) return null;

  return (
    <div
      className={`border-l-4 border-purple-500 bg-purple-50 p-4 rounded-lg shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-purple-800 flex items-center gap-2">
          <HelpCircle className="w-4 h-4" />
          Frequently Asked Questions
          <span className="text-xs bg-purple-200 text-purple-700 px-2 py-0.5 rounded-full">
            {faqs.length}
          </span>
        </h3>
        <button
          onClick={toggleAll}
          className="text-xs text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1 bg-purple-100 hover:bg-purple-200 px-2 py-1 rounded transition-colors"
        >
          {openItems.size === faqs.length ? (
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
        {faqs.map((faq, index) => {
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
            : `${faqs.length} questions available - click to expand answers`}
        </span>
        {isProcessingFAQs && <Loader2 className="w-3 h-3 animate-spin" />}
      </div>
    </div>
  );
};

// Simplified answer formatting (keep only essential formatting)
function formatFAQAnswer(answer: string): string {
  return answer
    .replace(
      /\*\*(.*?)\*\*/g,
      '<strong class="font-semibold text-slate-800">$1</strong>'
    )
    .replace(/\*(.*?)\*/g, '<em class="italic text-slate-600">$1</em>')
    .replace(/\n\n/g, '</p><p class="mt-2">')
    .replace(/\n/g, "<br/>")
    .replace(/^/, "<p>")
    .replace(/$/, "</p>");
}
