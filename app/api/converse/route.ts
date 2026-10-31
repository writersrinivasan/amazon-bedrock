import { NextResponse } from "next/server";
import { converse, credsFrom, type ConverseRequest } from "@/lib/server/converse";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const creds = credsFrom(req);
  let body: ConverseRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body?.modelId || !Array.isArray(body.messages)) {
    return NextResponse.json({ error: "modelId and messages are required (Converse API shape)" }, { status: 400 });
  }
  try {
    const { response, engine } = await converse(body, creds);
    return NextResponse.json({ response, engine });
  } catch (e) {
    const err = e as Error & { name?: string };
    return NextResponse.json(
      { error: err.message ?? String(e), errorType: err.name ?? "Error", engine: { kind: creds.mode === "live" ? "bedrock" : "groq" } },
      { status: 502 },
    );
  }
}
