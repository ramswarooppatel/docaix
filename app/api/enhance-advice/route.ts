import { NextRequest, NextResponse } from "next/server";

interface EnhanceAdviceRequest {
  ai_advice: string;
  latitude: number;
  longitude: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: EnhanceAdviceRequest = await request.json();

    if (!body.ai_advice) {
      return NextResponse.json(
        { error: "AI advice is required" },
        { status: 400 }
      );
    }

    // Use the new HOSPITAL_API_URL environment variable
    const response = await fetch(`${process.env.HOSPITAL_API_URL}/enhance-advice`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ai_advice: body.ai_advice,
        latitude: body.latitude || 0,
        longitude: body.longitude || 0,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Enhance advice API error:", error);
    return NextResponse.json(
      { error: "Failed to enhance advice" },
      { status: 500 }
    );
  }
}