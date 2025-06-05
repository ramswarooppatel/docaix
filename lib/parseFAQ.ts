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
  console.log("🔍 Advanced parsing response for FAQs:", response);
  
  // CHECKPOINT 1: Multiple patterns to catch FAQ sections with different formats
  const faqPatterns = [
    /Here are some (?:general )?FAQs?.*?:\s*$/mi,
    /(?:Some )?FAQs?\s*to get (?:us|you) started:\s*$/mi,
    /Frequently Asked Questions?:\s*$/mi,
    /Common Questions?:\s*$/mi,
    /Questions?\s*and\s*Answers?:\s*$/mi,
    /Here are some (?:common|helpful) (?:questions|topics).*?:\s*$/mi,
    /Let me share some (?:relevant|important) (?:questions|information).*?:\s*$/mi,
    /Below are some (?:key|essential) (?:questions|points).*?:\s*$/mi,
    /I'll provide some (?:useful|relevant) (?:information|guidance).*?:\s*$/mi
  ];
  
  let parts: string[] = [];
  let faqSectionFound = false;
  let usedPattern = '';
  
  // Try each pattern
  for (const pattern of faqPatterns) {
    parts = response.split(pattern);
    if (parts.length >= 2) {
      faqSectionFound = true;
      usedPattern = pattern.source;
      console.log("✅ FAQ section found using pattern:", usedPattern);
      break;
    }
  }
  
  // CHECKPOINT 2: If no explicit FAQ section, look for FAQ-like content anywhere
  if (!faqSectionFound) {
    console.log("🔄 No explicit FAQ section, searching for FAQ-like content...");
    
    const faqMarkers = [
      /\*\s*(?:What|How|Why|When|Where).*?\?\s*[🚒💉🏥🤔❓🩹🚑🆘]?/gi,
      /\*\s*.*?(?:BURNS?|BLEEDING|FIRST.?AID|EMERGENCY|CPR|CHOKING|WOUND|INJURY).*?\?/gi,
      /^\s*\*\s*.*?\?.*$/gm,
      /\*\s*.*?\?\s*[🚒💉🏥🤔❓🩹🚑🆘]/gi
    ];
    
    for (const marker of faqMarkers) {
      const matches = response.match(marker);
      if (matches && matches.length > 0) {
        console.log("🔄 Found FAQ-like content using marker pattern");
        const faqContent = extractFAQContent(response);
        if (faqContent) {
          return {
            mainContent: response.replace(faqContent, '').trim(),
            faqs: parseAdvancedFAQs(faqContent)
          };
        }
      }
    }
  }

  // CHECKPOINT 3: Force FAQ extraction even without explicit markers
  if (!faqSectionFound) {
    console.log("🔧 Force extracting potential FAQ content...");
    const forcedFAQs = forceExtractFAQs(response);
    if (forcedFAQs.length > 0) {
      return {
        mainContent: response.split(/\*\s*(?:What|How|Why)/i)[0].trim(),
        faqs: forcedFAQs
      };
    }
    
    console.log("❌ No FAQ content found after all attempts");
    return {
      mainContent: response.trim(),
      faqs: []
    };
  }

  const mainContent = parts[0].trim();
  const faqSection = parts[1].trim();
  
  console.log("📋 Main content:", mainContent);
  console.log("📋 FAQ section:", faqSection);

  const faqs = parseAdvancedFAQs(faqSection);
  
  console.log("📝 Parsed FAQs:", faqs);

  return {
    mainContent: mainContent,
    faqs: faqs
  };
}

function extractFAQContent(text: string): string | null {
  // Extract content that looks like FAQs
  const lines = text.split('\n');
  let faqContent = '';
  let inFAQSection = false;
  
  for (const line of lines) {
    if (line.match(/\*\s*(?:What|How|Why|When|Where)/i)) {
      inFAQSection = true;
    }
    
    if (inFAQSection) {
      faqContent += line + '\n';
    }
  }
  
  return faqContent.trim() || null;
}

function forceExtractFAQs(text: string): FAQItem[] {
  console.log("🚀 Force extracting FAQs from entire text...");
  
  const faqs: FAQItem[] = [];
  
  // CHECKPOINT 4: Extract any question-like patterns with following content
  const forcePatterns = [
    // Pattern for * Question? with tab-indented answers
    /\*\s*(.+?\?)\s*[🚒💉🏥🤔❓🩹🚑🆘]?\s*\n((?:\s*[\t\+\-]\s*.+\n?)+)/g,
    
    // Pattern for any bold topics with questions
    /\*\s*.*?\*\*(.*?)\*\*.*?\?\s*[🚒💉🏥🤔❓🩹🚑🆘]?\s*\n((?:\s*[\t\+\-]\s*.+\n?)+)/g,
    
    // Pattern for questions anywhere in the text
    /(?:^|\n)\s*\*?\s*((?:What|How|Why|When|Where).+?\?)\s*[🚒💉🏥🤔❓🩹🚑🆘]?\s*\n?((?:(?:\s*[\t\+\-•]\s*.+\n?)+)|(?:[^*\n][^*]*?)(?=\n\s*\*|$))/gi
  ];

  for (let i = 0; i < forcePatterns.length; i++) {
    const pattern = forcePatterns[i];
    let match;
    
    console.log(`🔍 Force trying pattern ${i + 1}`);
    
    while ((match = pattern.exec(text)) !== null) {
      let question = match[1] ? cleanAdvancedText(match[1]) : '';
      let answer = match[2] ? cleanAdvancedText(match[2]) : '';
      
      // Clean up question from bold markers
      question = question.replace(/\*\*(.*?)\*\*/g, '$1');
      
      // Process the answer to clean up bullet points and formatting
      answer = processAnswerBullets(answer);
      
      if (question && answer && question.length > 5 && answer.length > 10) {
        // Check for duplicates
        const isDuplicate = faqs.some(faq => 
          normalizeText(faq.question) === normalizeText(question)
        );
        
        if (!isDuplicate) {
          faqs.push({ question, answer });
          console.log(`✅ Force extracted FAQ (Pattern ${i + 1}): Q: "${question}" A: "${answer.substring(0, 50)}..."`);
        }
      }
    }
    
    pattern.lastIndex = 0;
  }

  return faqs;
}

function parseAdvancedFAQs(faqText: string): FAQItem[] {
  const faqs: FAQItem[] = [];
  
  console.log("🔧 Advanced FAQ parsing input:", faqText);
  
  // CHECKPOINT 5: Enhanced patterns for the new format
  const advancedPatterns = [
    // Pattern 1: * Question? emoji \n \t+ answer \n \t+ answer
    /\*\s*(.+?\?)\s*[🚒💉🏥🤔❓🩹🚑🆘]?\s*\n((?:\s*[\+\-\*\t]\s*.+(?:\n|$))+)/g,
    
    // Pattern 2: * What/How/Why... with nested bullet points
    /\*\s*((?:What|How|Why|When|Where).+?\?)\s*[🚒💉🏥🤔❓🩹🚑🆘]?\s*\n((?:\s*[\t\+\-\*]\s*.+(?:\n|$))+)/g,
    
    // Pattern 3: * TOPIC in bold with sub-items
    /\*\s*.*?\*\*(.*?)\*\*.*?\?\s*[🚒💉🏥🤔❓🩹🚑🆘]?\s*\n((?:\s*[\t\+\-\*]\s*.+(?:\n|$))+)/g,
    
    // Pattern 4: Standard Q: A: format
    /\*\s*Q:\s*(.+?\?)\s*(?:\s*🤔)?\s*A:\s*([^*]+?)(?=\*\s*Q:|$)/g,
    
    // Pattern 5: Just bullet points with questions
    /^\s*\*\s*(.+?\?)\s*[🚒💉🏥🤔❓🩹🚑🆘]?\s*$((?:\n\s*[\t\+\-\*]\s*.+)*)/gm,
    
    // Pattern 6: Questions with ** bold topics **
    /\*\s*(.+?)\s*\*\*(.*?)\*\*.*?\?\s*[🚒💉🏥🤔❓🩹🚑🆘]?\s*\n((?:\s*[\t\+\-\*]\s*.+(?:\n|$))+)/g
  ];

  // Try each pattern
  for (let i = 0; i < advancedPatterns.length; i++) {
    const pattern = advancedPatterns[i];
    let match;
    
    console.log(`🔍 Trying pattern ${i + 1}:`, pattern.source);
    
    while ((match = pattern.exec(faqText)) !== null) {
      let question = '';
      let answer = '';
      
      // Handle different match groups based on pattern
      if (i === 2) { // Pattern 3 with bold topics
        question = `What to do in case of ${cleanAdvancedText(match[1])}?`;
        answer = match[2] ? cleanAdvancedText(match[2]) : '';
      } else if (i === 5) { // Pattern 6 with multiple groups
        question = `${cleanAdvancedText(match[1])} ${cleanAdvancedText(match[2])}?`;
        answer = match[3] ? cleanAdvancedText(match[3]) : '';
      } else {
        question = cleanAdvancedText(match[1]);
        answer = match[2] ? cleanAdvancedText(match[2]) : '';
      }
      
      // Process the answer to clean up bullet points and formatting
      answer = processAnswerBullets(answer);
      
      if (question && answer && question.length > 3 && answer.length > 5) {
        // Check for duplicates
        const isDuplicate = faqs.some(faq => 
          normalizeText(faq.question) === normalizeText(question)
        );
        
        if (!isDuplicate) {
          faqs.push({ question, answer });
          console.log(`✅ FAQ added (Pattern ${i + 1}): Q: "${question}" A: "${answer.substring(0, 50)}..."`);
        } else {
          console.log(`⚠️ Duplicate FAQ skipped: "${question}"`);
        }
      }
    }
    
    // Reset regex lastIndex for next iteration
    pattern.lastIndex = 0;
  }

  // CHECKPOINT 6: Fallback - Enhanced line-by-line parsing for complex formats
  if (faqs.length === 0) {
    console.log("🔄 Trying enhanced line-by-line parsing...");
    const lineParsedFAQs = parseLineByLineAdvanced(faqText);
    faqs.push(...lineParsedFAQs);
  }

  // CHECKPOINT 7: Final fallback - split by asterisks and try to make sense of it
  if (faqs.length === 0) {
    console.log("🔄 Final fallback - splitting by asterisks...");
    const finalFAQs = parseByAsterisks(faqText);
    faqs.push(...finalFAQs);
  }

  // Sort FAQs by question length (shorter, more direct questions first)
  faqs.sort((a, b) => a.question.length - b.question.length);

  console.log(`🎯 Total FAQs parsed: ${faqs.length}`);
  return faqs;
}

function parseByAsterisks(faqText: string): FAQItem[] {
  const faqs: FAQItem[] = [];
  const sections = faqText.split(/\*\s+/).filter(section => section.trim());
  
  for (const section of sections) {
    const lines = section.split('\n').filter(line => line.trim());
    if (lines.length === 0) continue;
    
    const firstLine = lines[0].trim();
    
    // Check if first line looks like a question
    if (firstLine.includes('?') || 
        firstLine.match(/(?:What|How|Why|When|Where|Which)/i) ||
        firstLine.match(/(?:BURNS?|BLEEDING|FIRST.?AID|EMERGENCY|CPR)/i)) {
      
      let question = cleanAdvancedText(firstLine);
      if (!question.endsWith('?')) {
        question += '?';
      }
      
      const answerLines = lines.slice(1)
        .filter(line => line.trim())
        .map(line => line.replace(/^\s*[\t\+\-]\s*/, '').trim())
        .filter(line => line.length > 0);
      
      if (answerLines.length > 0) {
        const answer = answerLines.join('\n');
        faqs.push({ question, answer });
        console.log(`✅ Asterisk parsed FAQ: Q: "${question}" A: "${answer.substring(0, 50)}..."`);
      }
    }
  }
  
  return faqs;
}

function parseLineByLineAdvanced(faqText: string): FAQItem[] {
  const faqs: FAQItem[] = [];
  const lines = faqText.split('\n');
  
  let currentQuestion = '';
  let currentAnswer: string[] = [];
  let isInAnswer = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // CHECKPOINT 8: Enhanced question patterns (more comprehensive)
    const questionPatterns = [
      /^\s*\*\s*(.+?\?)\s*[🚒💉🏥🤔❓🩹🚑🆘]?\s*$/,
      /^\s*\*\s*((?:What|How|Why|When|Where|Which).+?\?)\s*[🚒💉🏥🤔❓🩹🚑🆘]?\s*$/,
      /^\s*\*\s*(.+?(?:BURNS?|BLEEDING|FIRST.?AID|EMERGENCY).+?\?)\s*[🚒💉🏥🤔❓🩹🚑🆘]?\s*$/,
      /^\s*\*\s*(.+?\*\*(.*?)\*\*.*?\?)\s*[🚒💉🏥🤔❓🩹🚑🆘]?\s*$/,
      /^\s*\*\s*Q:\s*(.+?\?)\s*$/,
      /^\s*\d+\.\s*(.+?\?)\s*$/
    ];
    
    let questionMatch = null;
    for (const pattern of questionPatterns) {
      questionMatch = line.match(pattern);
      if (questionMatch) break;
    }
    
    if (questionMatch) {
      // Save previous FAQ
      if (currentQuestion && currentAnswer.length > 0) {
        const answerText = currentAnswer.join(' ').trim();
        if (answerText.length > 5) {
          faqs.push({
            question: cleanAdvancedText(currentQuestion),
            answer: processAnswerBullets(answerText)
          });
        }
      }
      
      currentQuestion = questionMatch[1];
      currentAnswer = [];
      isInAnswer = false;
      continue;
    }
    
    // CHECKPOINT 9: Enhanced answer patterns (bullet points, tabs, etc.)
    const answerPatterns = [
      /^\s*[\t\+\-\*•→➤▪▫]\s*(.+)$/,
      /^\s*A:\s*(.+)$/,
      /^\s*Answer:\s*(.+)$/,
      /^\s*[•→➤▪▫]\s*(.+)$/,
      /^\s+(.+)$/ // Indented lines
    ];
    
    let answerMatch = null;
    for (const pattern of answerPatterns) {
      answerMatch = line.match(pattern);
      if (answerMatch) break;
    }
    
    if (answerMatch) {
      currentAnswer.push(answerMatch[1]);
      isInAnswer = true;
      continue;
    }
    
    // Continue multi-line answers
    if (isInAnswer && line.trim() && !line.match(/^\s*\*/)) {
      const cleanLine = line.replace(/^\s*[\t\+\-\*]\s*/, '').trim();
      if (cleanLine) {
        currentAnswer.push(cleanLine);
      }
    }
  }

  // Add the last FAQ
  if (currentQuestion && currentAnswer.length > 0) {
    const answerText = currentAnswer.join(' ').trim();
    if (answerText.length > 5) {
      faqs.push({
        question: cleanAdvancedText(currentQuestion),
        answer: processAnswerBullets(answerText)
      });
    }
  }

  return faqs;
}

function processAnswerBullets(answer: string): string {
  // Clean up bullet points and format nicely
  return answer
    .split(/[\n\r]/)
    .map(line => {
      const cleaned = line.replace(/^\s*[\t\+\-\*•→➤▪▫]\s*/, '').trim();
      return cleaned ? `• ${cleaned}` : '';
    })
    .filter(line => line.length > 0)
    .join('\n')
    .replace(/\n\s*\n/g, '\n') // Remove extra blank lines
    .trim();
}

function cleanAdvancedText(text: string): string {
  return text
    .replace(/[🚒💉🏥🤔❓🩹🚑🆘]/g, '') // Remove emojis
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown but keep text
    .replace(/\*(.*?)\*/g, '$1') // Remove italic markdown but keep text
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/^\*\s*/, '') // Remove leading asterisk
    .replace(/^[-•→➤▪▫]\s*/, '') // Remove leading bullet points
    .replace(/^\d+\.\s*/, '') // Remove leading numbers
    .replace(/^[\t\+\-\*]\s*/, '') // Remove leading tab/bullet characters
    .replace(/^Q:\s*/i, '') // Remove Q: prefix
    .replace(/^A:\s*/i, '') // Remove A: prefix
    .trim();
}

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^\w\s]/g, '').trim();
}