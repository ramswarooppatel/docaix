export function extractSpeakableContent(text: string): string {
  // Split content at FAQ sections and return only the first part
  const faqPatterns = [
    /Some FAQs relevant/i,
    /Frequently Asked Questions/i,
    /FAQ/i,
    /Q\d*:/i
  ];
  
  for (const pattern of faqPatterns) {
    const match = text.search(pattern);
    if (match !== -1) {
      return text.substring(0, match).trim();
    }
  }
  
  return text;
}