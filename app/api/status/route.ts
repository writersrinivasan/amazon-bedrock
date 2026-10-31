import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** Tells the UI which server-side keys exist (never returns the keys themselves). */
export async function GET() {
  return NextResponse.json({
    serverGroq: !!process.env.GROQ_API_KEY,
    serverAws: !!(process.env.AWS_ACCESS_KEY_ID || process.env.AWS_PROFILE || process.env.AWS_BEARER_TOKEN_BEDROCK),
    region: process.env.AWS_REGION ?? "us-east-1",
  });
}
