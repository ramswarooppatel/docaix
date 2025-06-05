// filepath: d:\Codes\projects\ln_intern\lib\parseFAQ.ts
interface FAQItem {
  question: string;
  answer: string;
}

interface ParsedResponse {
  mainContent: string;
  faqs: FAQItem[];
}

export function parseResponseWithFAQ(response: string): ParsedResponse {
  // Split the response to find FAQ section
  const faqSectionRegex = /FAQs?:\s*$/m;
  const parts = response.split(faqSectionRegex);
  
  if (parts.length < 2) {
    // No FAQ section found
    return {
      mainContent: response.trim(),
      faqs: []
    };
  }

  const mainContent = parts[0].trim();
  const faqSection = parts[1].trim();

  // Parse individual FAQ items
  const faqs: FAQItem[] = [];
  
  // Split by lines and process each Q&A pair
  const lines = faqSection.split('\n');
  let currentQuestion = '';
  let currentAnswer = '';
  let isInAnswer = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) continue;
    
    // Check if it's a question line (starts with * Q:)
    const questionMatch = line.match(/^\*\s*Q:\s*(.+?)(?:\s*🤔)?$/);
    if (questionMatch) {
      // Save previous FAQ if exists
      if (currentQuestion && currentAnswer) {
        faqs.push({
          question: cleanText(currentQuestion),
          answer: cleanText(currentAnswer)
        });
      }
      
      // Start new question
      currentQuestion = questionMatch[1];
      currentAnswer = '';
      isInAnswer = false;
      continue;
    }
    
    // Check if it's an answer line (starts with A:)
    const answerMatch = line.match(/^A:\s*(.+)/);
    if (answerMatch) {
      currentAnswer = answerMatch[1];
      isInAnswer = true;
      continue;
    }
    
    // If we're in an answer and this line doesn't start a new Q, it's continuation
    if (isInAnswer && currentAnswer) {
      // Remove leading bullet or asterisk if present
      const cleanLine = line.replace(/^\*\s*/, '');
      if (cleanLine) {
        currentAnswer += ' ' + cleanLine;
      }
    }
  }

  // Add the last FAQ
  if (currentQuestion && currentAnswer) {
    faqs.push({
      question: cleanText(currentQuestion),
      answer: cleanText(currentAnswer)
    });
  }

  // Fallback: Try a different approach if no FAQs found
  if (faqs.length === 0) {
    // Try to match Q: and A: patterns across multiple lines
    const qaPairs = faqSection.match(/\*\s*Q:\s*([^*]+?)(?=\*\s*Q:|$)/g);
    
    if (qaPairs) {
      qaPairs.forEach(pair => {
        const qMatch = pair.match(/\*\s*Q:\s*([\s\S]+?)(?:\s*🤔)?\s*(?:\n|A:)/);
        const aMatch = pair.match(/A:\s*([\s\S]+?)(?=\*\s*Q:|$)/);
        
        if (qMatch && aMatch) {
          faqs.push({
            question: cleanText(qMatch[1]),
            answer: cleanText(aMatch[1])
          });
        }
      });
    }
  }

  return {
    mainContent: mainContent,
    faqs: faqs
  };
}

function cleanText(text: string): string {
  return text
    .replace(/🤔|🚑|🚿|🤲/g, '') // Remove emojis
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/^\*\s*/, '') // Remove leading asterisk
    .trim();
}