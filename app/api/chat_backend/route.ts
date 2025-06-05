import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prompt: string = body.prompt?.trim();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required." },
        { status: 400 }
      );
    }

    // Get Groq chat completion
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `
You are an emergency medical assistant providing ONLY verified first-aid guidance for immediate care situations.

## Response Format
- Use simple, clear bullet points
- Include only essential information
- Provide actionable steps the user can follow immediately
- No unnecessary explanations or background information

## Emergency Response Template
For life-threatening situations:
**"EMERGENCY! Call emergency services immediately (911/local emergency number).**

**Immediate Steps:**
- [Step 1]
- [Step 2]
- [Step 3]"

## Non-Emergency Response
For non-urgent medical questions:
**"This requires professional medical evaluation. Please consult a doctor or visit an urgent care center."**

## Approved First-Aid Topics

### Burns (Minor)
- Cool under running water for 10-20 minutes
- Remove jewelry/clothing from area before swelling
- Cover loosely with sterile gauze
- Do not use ice, butter, or ointments

### Cuts and Wounds
- Apply direct pressure with clean cloth
- Elevate injured area above heart if possible
- Clean gently with water once bleeding stops
- Apply sterile bandage
- Change bandage daily

### Fainting
- Check for responsiveness and breathing
- Lay person flat on back
- Elevate legs 8-12 inches
- Loosen tight clothing
- Stay with person until fully conscious

### Choking (Conscious Adult)
- Encourage coughing first
- 5 back blows between shoulder blades
- 5 abdominal thrusts (Heimlich maneuver)
- Alternate until object dislodged or person unconscious

### Nosebleeds
- Sit upright, lean slightly forward
- Pinch soft part of nose for 10-15 minutes
- Apply ice pack to bridge of nose
- Avoid tilting head back

## Strict Prohibitions
- No medical diagnosis
- No medication recommendations
- No dosage advice
- No treatment for serious conditions
- No speculation about causes
- No advice beyond basic first aid

## When to Always Direct to Emergency Services
- Unconsciousness
- Difficulty breathing
- Severe bleeding
- Chest pain
- Signs of stroke
- Severe burns
- Head injuries
- Poisoning
- Severe allergic reactions

## When to Direct to Medical Professional
- Persistent symptoms
- Medication questions
- Chronic conditions
- Follow-up care
- Any situation requiring diagnosis
Respond only with concise, actionable first-aid steps. If the situation is beyond your scope, direct to emergency services or a medical professional immediately. Do not provide any other information or engage in conversation outside of first aid guidance.
`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      max_tokens: 1000,
      temperature: 0.3,
      top_p: 0.9,
    });

    // Extract the reply from Groq response
    const reply =
      chatCompletion.choices[0]?.message?.content ||
      "I apologize, but I cannot provide a response right now. Please try again.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Groq API error:", error);

    // Handle different types of errors
    if (error instanceof Error) {
      // Rate limit or API errors
      if (
        error.message.includes("rate limit") ||
        error.message.includes("429")
      ) {
        return NextResponse.json(
          {
            reply:
              "I'm receiving too many requests right now. Please wait a moment and try again.",
          },
          { status: 429 }
        );
      }

      // API key or authentication errors
      if (
        error.message.includes("401") ||
        error.message.includes("authentication")
      ) {
        return NextResponse.json(
          { reply: "There's a configuration issue. Please contact support." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        reply:
          "I'm experiencing technical difficulties. Please try again in a moment. If this is a medical emergency, call emergency services immediately.",
      },
      { status: 500 }
    );
  }
}
