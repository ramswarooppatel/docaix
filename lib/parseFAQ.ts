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
    
    // Force extract all FAQs from the entire response
    const forcedFAQs = forceExtractAllFAQs(response);
    if (forcedFAQs.length > 0) {
      return {
        mainContent: extractMainContent(response),
        faqs: forcedFAQs
      };
    }
  }

  // CHECKPOINT 3: Force FAQ extraction even without explicit markers
  if (!faqSectionFound) {
    console.log("🔧 Force extracting potential FAQ content...");
    const forcedFAQs = forceExtractAllFAQs(response);
    if (forcedFAQs.length > 0) {
      return {
        mainContent: extractMainContent(response),
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

function extractMainContent(response: string): string {
  // Extract content before the first FAQ
  const faqStart = response.search(/\*\s*(?:What|How|Why)/i);
  if (faqStart !== -1) {
    return response.substring(0, faqStart).trim();
  }
  
  // Fallback: extract content before "Here are some"
  const hereAreStart = response.search(/Here are some/i);
  if (hereAreStart !== -1) {
    return response.substring(0, hereAreStart).trim();
  }
  
  return response.split('\n')[0].trim(); // First line as fallback
}

function forceExtractAllFAQs(text: string): FAQItem[] {
  console.log("🚀 Force extracting ALL FAQs from entire text...");
  
  const faqs: FAQItem[] = [];
  
  // GUARANTEED FAQ EXTRACTION PATTERNS - specific to your format
  const guaranteedPatterns = [
    // Pattern 1: EXACT format from your example - * Question? emoji \n \t+ answer
    /\*\s*(.+?\?)\s*[🚒💉🏥🤔❓🩹🚑🆘🔥💊🩺]\s*\n((?:\s*[\t\+]\s*.+\n?)+)/g,
    
    // Pattern 2: Handle bold topics within questions
    /\*\s*(.+?\*\*.*?\*\*.*?\?)\s*[🚒💉🏥🤔❓🩹🚑🆘🔥💊🩺]\s*\n((?:\s*[\t\+]\s*.+\n?)+)/g,
    
    // Pattern 3: Questions with any medical-related keywords
    /\*\s*((?:What|How|Why).+?(?:BURNS?|BLEEDING|FIRST.?AID|KIT).*?\?)\s*[🚒💉🏥🤔❓🩹🚑🆘🔥💊🩺]\s*\n((?:\s*[\t\+]\s*.+\n?)+)/g,
    
    // Pattern 4: Catch any asterisk followed by question mark with following indented content
    /\*\s*([^*\n]+?\?)[^*\n]*?\n((?:\s*[\t\+\-]\s*.+\n?)+)/g,
    
    // Pattern 5: Split by asterisks and try to extract everything
    /\*\s*([^*]+?\?)[^*]*?\n((?:(?!\*)[^\n]*\n?)*)/g
  ];

  console.log("📝 Original text for FAQ extraction:", text);

  for (let patternIndex = 0; patternIndex < guaranteedPatterns.length; patternIndex++) {
    const pattern = guaranteedPatterns[patternIndex];
    let match;
    
    console.log(`🔍 Trying guaranteed pattern ${patternIndex + 1}:`, pattern.source);
    
    // Reset regex lastIndex
    pattern.lastIndex = 0;
    
    while ((match = pattern.exec(text)) !== null) {
      console.log(`📋 Raw match found:`, {
        fullMatch: match[0],
        question: match[1],
        answer: match[2]
      });
      
      let question = match[1] ? cleanAdvancedText(match[1]) : '';
      let answer = match[2] ? cleanAdvancedText(match[2]) : '';
      
      // Clean up question from bold markers but preserve the text
      question = question.replace(/\*\*(.*?)\*\*/g, '$1');
      
      // Ensure question ends with ?
      if (question && !question.endsWith('?')) {
        question += '?';
      }
      
      // Process the answer to clean up bullet points and formatting
      answer = processAnswerBullets(answer);
      
      console.log(`🔧 Processed FAQ candidate:`, {
        question: question,
        answer: answer,
        questionLength: question.length,
        answerLength: answer.length
      });
      
      if (question && answer && question.length > 3 && answer.length > 3) {
        // Check for duplicates
        const isDuplicate = faqs.some(faq => 
          normalizeText(faq.question) === normalizeText(question)
        );
        
        if (!isDuplicate) {
          faqs.push({ question, answer });
          console.log(`✅ FAQ ${faqs.length} extracted (Pattern ${patternIndex + 1}): Q: "${question}" A: "${answer.substring(0, 100)}..."`);
        } else {
          console.log(`⚠️ Duplicate FAQ skipped: "${question}"`);
        }
      } else {
        console.log(`❌ FAQ rejected - insufficient content:`, {
          hasQuestion: !!question,
          hasAnswer: !!answer,
          questionLength: question?.length || 0,
          answerLength: answer?.length || 0
        });
      }
    }
    
    // Reset regex for next pattern
    pattern.lastIndex = 0;
  }

  // CHECKPOINT: Manual splitting if patterns fail
  if (faqs.length === 0) {
    console.log("🔄 Manual splitting by asterisks...");
    const manualFAQs = extractByManualSplitting(text);
    faqs.push(...manualFAQs);
  }

  console.log(`🎯 TOTAL FAQs extracted: ${faqs.length}`);
  faqs.forEach((faq, index) => {
    console.log(`📌 FAQ ${index + 1}: "${faq.question}" -> "${faq.answer.substring(0, 50)}..."`);
  });

  return faqs;
}

function extractByManualSplitting(text: string): FAQItem[] {
  console.log("🔧 Manual extraction starting...");
  
  const faqs: FAQItem[] = [];
  
  // Split by asterisks and process each section
  const sections = text.split(/\*\s+/).filter(section => section.trim());
  
  console.log(`📋 Found ${sections.length} sections after splitting by asterisks`);
  
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i].trim();
    console.log(`🔍 Processing section ${i + 1}:`, section.substring(0, 100) + '...');
    
    // Skip if section is too short or doesn't contain a question
    if (section.length < 10 || !section.includes('?')) {
      console.log(`⏭️ Skipping section ${i + 1} - no question found`);
      continue;
    }
    
    const lines = section.split('\n').map(line => line.trim()).filter(line => line);
    if (lines.length === 0) continue;
    
    const firstLine = lines[0];
    
    // Extract question from first line
    let question = '';
    if (firstLine.includes('?')) {
      // Find the question part
      const questionEnd = firstLine.indexOf('?') + 1;
      question = cleanAdvancedText(firstLine.substring(0, questionEnd));
    }
    
    if (!question) {
      console.log(`❌ No question found in section ${i + 1}`);
      continue;
    }
    
    // Extract answer from remaining lines (look for tab-indented or + prefixed lines)
    const answerLines = lines.slice(1)
      .filter(line => 
        line.startsWith('\t') || 
        line.startsWith('+') || 
        line.startsWith('-') || 
        line.trim().startsWith('+') ||
        line.trim().startsWith('-')
      )
      .map(line => line.replace(/^\s*[\t\+\-]\s*/, '').trim())
      .filter(line => line.length > 0);
    
    if (answerLines.length > 0) {
      const answer = answerLines.join('\n• ');
      faqs.push({ question, answer: '• ' + answer });
      console.log(`✅ Manual FAQ extracted: Q: "${question}" A: "${answer.substring(0, 50)}..."`);
    } else {
      console.log(`❌ No answer found for question: "${question}"`);
    }
  }
  
  return faqs;
}

function parseAdvancedFAQs(faqText: string): FAQItem[] {
  console.log("🔧 Advanced FAQ parsing input:", faqText);
  
  // First try the guaranteed extraction
  const forcedFAQs = forceExtractAllFAQs(faqText);
  if (forcedFAQs.length >= 3) {
    console.log("✅ Found all 3 FAQs using forced extraction");
    return forcedFAQs;
  }
  
  const faqs: FAQItem[] = [...forcedFAQs];
  
  // CHECKPOINT 5: Enhanced patterns for the new format
  const advancedPatterns = [
    // Pattern 1: * Question? emoji \n \t+ answer \n \t+ answer
    /\*\s*(.+?\?)\s*[🚒💉🏥🤔❓🩹🚑🆘🔥💊🩺]\s*\n((?:\s*[\+\-\*\t]\s*.+(?:\n|$))+)/g,
    
    // Pattern 2: * What/How/Why... with nested bullet points
    /\*\s*((?:What|How|Why|When|Where).+?\?)\s*[🚒💉🏥🤔❓🩹🚑🆘🔥💊🩺]\s*\n((?:\s*[\t\+\-\*]\s*.+(?:\n|$))+)/g,
    
    // Pattern 3: * TOPIC in bold with sub-items
    /\*\s*.*?\*\*(.*?)\*\*.*?\?\s*[🚒💉🏥🤔❓🩹🚑🆘🔥💊🩺]\s*\n((?:\s*[\t\+\-\*]\s*.+(?:\n|$))+)/g,
    
    // Pattern 4: Standard Q: A: format
    /\*\s*Q:\s*(.+?\?)\s*(?:\s*🤔)?\s*A:\s*([^*]+?)(?=\*\s*Q:|$)/gm,
    
    // Pattern 5: Just bullet points with questions
    /^\s*\*\s*(.+?\?)\s*[🚒💉🏥🤔❓🩹🚑🆘🔥💊🩺]\s*$((?:\n\s*[\t\+\-\*]\s*.+)*)/gm,
    
    // Pattern 6: Questions with ** bold topics **
    /\*\s*(.+?)\s*\*\*(.*?)\*\*.*?\?\s*[🚒💉🏥🤔❓🩹🚑🆘🔥💊🩺]\s*\n((?:\s*[\t\+\-\*]\s*.+(?:\n|$))+)/g
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

  // Sort FAQs by question length (shorter, more direct questions first)
  faqs.sort((a, b) => a.question.length - b.question.length);

  console.log(`🎯 Total FAQs parsed: ${faqs.length}`);
  return faqs;
}

function processAnswerBullets(answer: string): string {
  if (!answer) return '';
  
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
  if (!text) return '';
  
  return text
    .replace(/[🚒💉🏥🤔❓🩹🚑🆘🔥💊🩺]/g, '') // Remove emojis
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