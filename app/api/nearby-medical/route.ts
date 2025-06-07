import { NextRequest, NextResponse } from "next/server";

interface HospitalRequest {
  latitude: number;
  longitude: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: HospitalRequest = await request.json();

    // Validate required fields
    if (!body.latitude || !body.longitude) {
      return NextResponse.json(
        { error: "Missing required fields: latitude, longitude" },
        { status: 400 }
      );
    }

    console.log(
      `Searching for hospitals near: ${body.latitude}, ${body.longitude}`
    );

    // Call the external API
    const externalResponse = await fetch(
      `${process.env.HEALTH_PROFILE_API_URL}/nearby-medical`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          latitude: body.latitude,
          longitude: body.longitude,
        }),
      }
    );

    if (!externalResponse.ok) {
      const errorText = await externalResponse.text();
      console.error("External API error:", errorText);

      // Provide fallback response if external API fails
      const fallbackResponse = {
        location: {
          latitude: body.latitude,
          longitude: body.longitude,
        },
        nearby_hospitals: [
          {
            name: "Emergency Services",
            contact: "108",
            address: "Emergency hotline - available nationwide",
            type: "Emergency",
            google_maps_link: `https://www.google.com/maps/search/hospitals+near+me/@${body.latitude},${body.longitude},15z`,
          },
          {
            name: "General Hospital (Fallback)",
            contact: "Contact local directory",
            address: "Check local medical directory for accurate information",
            type: "Hospital",
            google_maps_link: `https://www.google.com/maps/search/hospitals/@${body.latitude},${body.longitude},13z`,
          },
        ],
        note: `Fallback data shown due to API connectivity issues. For accurate hospital information near ${body.latitude}, ${body.longitude}, please check Google Maps or contact local medical services.`,
      };

      return NextResponse.json(fallbackResponse);
    }

    const data = await externalResponse.json();
    console.log(
      `External API returned ${data.nearby_hospitals?.length || 0} hospitals`
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error("Hospital search API error:", error);

    // Return error response
    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}
