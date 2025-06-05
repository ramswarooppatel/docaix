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

export const FAQ: React.FC<FAQProps> = ({ 
  faqs, 
  className = ""
}) => {
  // Initialize with all items closed by default
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
          Frequently Asked Questions
        </h3>
        <button
          onClick={toggleAll}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
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
        {faqs.map((faq, index) => (
          <div
            key={index}
            className={`border rounded-lg overflow-hidden transition-all duration-200 ${
              openItems.has(index) 
                ? 'border-blue-300 bg-blue-50 shadow-sm' 
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
            }`}
          >
            <button
              onClick={() => toggleItem(index)}
              className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-slate-100 transition-colors duration-200 group"
            >
              <span className="text-sm font-medium text-slate-800 pr-2 group-hover:text-blue-700">
                <span className="text-blue-600 mr-1">Q{index + 1}:</span>
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
              <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                openItems.has(index) 
                  ? 'max-h-96 opacity-100' 
                  : 'max-h-0 opacity-0'
              }`}
            >
              <div className="px-4 pb-3 border-t border-blue-200 bg-white">
                <div className="text-sm text-slate-700 leading-relaxed pt-3">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-semibold flex-shrink-0">
                      A:
                    </span>
                    <div className="flex-1">
                      {faq.answer.split('\n').map((line, lineIndex) => (
                        <div 
                          key={lineIndex} 
                          className={`mb-1 transition-all duration-300 ease-in-out delay-${Math.min(lineIndex * 50, 300)} ${
                            openItems.has(index) 
                              ? 'translate-y-0 opacity-100' 
                              : 'translate-y-2 opacity-0'
                          }`}
                        >
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
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-2 text-xs text-blue-700">
          <HelpCircle className="w-3 h-3" />
          <span className="font-medium">Click any question to expand the answer</span>
        </div>
      </div>
    </div>
  );
};