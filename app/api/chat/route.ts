import { NextRequest, NextResponse } from "next/server";

interface ChatRequest {
  message: string;
  session_id?: string;
  user_location?: {
    lat: number;
    lng: number;
  };
}

interface ChatResponse {
  reply: string;
  session_id: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();

    if (!body.message) {
      return NextResponse.json(
        { error: "No message provided" },
        { status: 400 }
      );
    }

    // Forward the request to the existing backend API
    const response = await fetch(
      "https://firstaid-chat-bot-api.onrender.com/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: body.message,
          session_id: body.session_id || undefined,
          user_location: body.user_location
            ? {
                lat: body.user_location.lat,
                lng: body.user_location.lng,
              }
            : null,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Backend API error: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Return the response in the expected format
    const chatResponse: ChatResponse = {
      reply: data.reply,
      session_id: data.session_id,
    };

    return NextResponse.json(chatResponse);
  } catch (error) {
    console.error("Chat API proxy error:", error);

    // Provide fallback response for critical situations
    const fallbackResponse: ChatResponse = {
      reply: `I'm experiencing technical difficulties, but here's some general guidance:

**For Medical Emergencies:**
1. **Call emergency services immediately** (911 in US, 108 in India, or your local emergency number)
2. **Stay calm** and follow the dispatcher's instructions
3. **Keep the person comfortable** and monitor their breathing
4. **Do not move** the person unless they're in immediate danger

**For Non-Emergency Situations:**
- Apply basic first aid principles
- Clean wounds with clean water
- Apply pressure to stop bleeding
- Seek medical attention if symptoms worsen

**Important:** This is a fallback response due to technical issues. Please consult with medical professionals or call emergency services for serious conditions.`,
      session_id: `fallback_${Date.now()}`,
    };

    return NextResponse.json(fallbackResponse);
  }
}
