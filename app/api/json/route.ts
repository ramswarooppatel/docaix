import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const SYSTEM_PROMPT = `
You are a medical text parser. Your task is to extract structured information from unstructured first aid text and return it in a strict JSON format.

For every input, convert the provided medical first aid text into the following JSON structure:

json
Copy
Edit
{
  "header": "string",                // Any greeting or introductory text
  "emergency": "string",             // Any urgent warnings or highlighted actions (e.g., "STOP THE BLEEDING")
  "steps": ["string", "..."],        // Ordered first aid steps as individual strings
  "doctorAdvice": ["string", "..."], // Conditions or symptoms when one should seek medical help
  "faqs": [                          
    { "question": "string", "answer": "string" }
  ]// List of question-answer pairs
}
Rules:

Output must be valid JSON only, with no extra text or commentary.

All sections must be included in the output, even if empty.

Accurately identify and extract each section based on its content or cues (e.g., section titles like "When to see a doctor", "FAQ", "Steps").

Preserve step-by-step order when applicable.

If a section is not present in the text, leave it as an empty string or array.

Only return the structured JSON.
`;

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    // Initialize Groq client
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    // Call Groq API
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: text,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      response_format: { type: "json_object" },
    });

    const structuredContent = completion.choices[0]?.message?.content;

    if (!structuredContent) {
      throw new Error("No content returned from Groq API");
    }

    // Parse the JSON response
    const parsedContent = JSON.parse(structuredContent);

    return NextResponse.json(parsedContent);
  } catch (error) {
    console.error("Error structuring content:", error);
    return NextResponse.json(
      {
        error: "Failed to structure content",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
