import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Validate base64 image format
    if (typeof image !== "string" || !image.startsWith("data:image/")) {
      return NextResponse.json(
        { error: "Invalid image format. Expected base64 data URL." },
        { status: 422 }
      );
    }

    // Convert base64 to blob for FormData
    try {
      const base64Data = image.split(",")[1];
      const mimeType = image.split(";")[0].split(":")[1];

      const buffer = Buffer.from(base64Data, "base64");
      const blob = new Blob([buffer], { type: mimeType });

      // Create FormData for external API
      const externalFormData = new FormData();
      externalFormData.append("image", blob, "image.jpg");

      const response = await fetch(
        `${process.env.ANALYZE_IMG_API_URL}/analyze`,
        {
          method: "POST",
          body: externalFormData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        return NextResponse.json(
          { error: `External API error: ${response.status} - ${errorText}` },
          { status: response.status }
        );
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch (conversionError) {
      return NextResponse.json(
        { error: "Failed to process image data" },
        { status: 422 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
