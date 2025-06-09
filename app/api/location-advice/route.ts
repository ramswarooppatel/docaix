import { NextRequest, NextResponse } from "next/server";

interface LocationAdviceRequest {
  latitude: number;
  longitude: number;
  condition_description?: string;
  symptoms?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body: LocationAdviceRequest = await request.json();

    if (!body.latitude || !body.longitude) {
      return NextResponse.json(
        { error: "Latitude and longitude are required" },
        { status: 400 }
      );
    }

    // Use the new HOSPITAL_API_URL environment variable
    const response = await fetch(`${process.env.HOSPITAL_API_URL}/location-advice`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        latitude: body.latitude,
        longitude: body.longitude,
        condition_description: body.condition_description || "",
        symptoms: body.symptoms || [],
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Location advice API error:", error);
    return NextResponse.json(
      { error: "Failed to get location-based advice" },
      { status: 500 }
    );
  }
}