"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  faqs: FAQItem[];
  className?: string;
}

export const FAQ: React.FC<FAQProps> = ({ faqs, className = "" }) => {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
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

  if (faqs.length === 0) return null;

  return (
    <div className={`mt-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <HelpCircle className="w-4 h-4" />
          Frequently Asked Questions ({faqs.length})
        </h3>
        <button
          onClick={toggleAll}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          {openItems.size === faqs.length ? 'Collapse All' : 'Expand All'}
        </button>
      </div>
      
      <div className="space-y-2">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            <button
              onClick={() => toggleItem(index)}
              className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-slate-100 transition-colors duration-200 group"
            >
              <span className="text-sm font-medium text-slate-800 pr-2 group-hover:text-blue-700">
                <span className="text-blue-600 mr-2">Q{index + 1}:</span>
                {faq.question}
              </span>
              <div className="flex-shrink-0">
                {openItems.has(index) ? (
                  <ChevronUp className="w-4 h-4 text-slate-500 group-hover:text-blue-600" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-blue-600" />
                )}
              </div>
            </button>
            
            {openItems.has(index) && (
              <div className="px-4 pb-3 border-t border-slate-200 bg-white">
                <div className="text-sm text-slate-700 leading-relaxed pt-3">
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 font-semibold flex-shrink-0">A:</span>
                    <div className="flex-1">
                      {faq.answer.split('\n').map((line, lineIndex) => (
                        <div key={lineIndex} className="mb-1">
                          {line.trim() && (
                            <span
                              dangerouslySetInnerHTML={{
                                __html: line
                                  .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-800">$1</strong>')
                                  .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
                                  .replace(/ONLY USE A TOURNIQUET IF/g, '<strong class="text-red-600 font-bold">ONLY USE A TOURNIQUET IF</strong>')
                                  .replace(/DO NOT USE WATER OR SOAP/g, '<strong class="text-red-600 font-bold">DO NOT USE WATER OR SOAP</strong>')
                              }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {faqs.length > 3 && (
        <div className="mt-2 text-center">
          <p className="text-xs text-slate-500">
            💡 Tip: Click "Expand All" to view all questions at once
          </p>
        </div>
      )}
    </div>
  );
};