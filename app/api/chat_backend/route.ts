import { NextResponse } from "next/server";

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

    // Simulated delay to mimic LLM processing
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Fake logic for simulation (customize this if needed)
    const lower = prompt.toLowerCase();

    let reply = "";

    if (lower.includes("bleeding")) {
      reply =
        "For bleeding, apply direct pressure and elevate the wound. Seek medical help if it doesn't stop.";
    } else if (lower.includes("burn")) {
      reply =
        "Cool the burn under running water for 10–15 minutes. Do not apply ice or butter.";
    } else if (lower.includes("choking")) {
      reply =
        "Perform back blows and abdominal thrusts. Call emergency services if needed.";
    } else {
      reply = `This is a simulated response to: "${prompt}" — actual AI integration coming soon!`;
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("LLM simulation error:", error);
    return NextResponse.json(
      { error: "Something went wrong processing your prompt." },
      { status: 500 }
    );
  }
}
