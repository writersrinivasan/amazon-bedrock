import { credsFrom } from "@/lib/server/converse";
import { runTutor, type AgentEvent } from "@/lib/server/agent/graph";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const creds = credsFrom(req);
  let body: { question?: unknown; history?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const question = typeof body?.question === "string" ? body.question : "";
  const history = (Array.isArray(body?.history) ? body.history : []).filter(
    (h): h is { role: "user" | "assistant"; content: string } =>
      !!h && (h.role === "user" || h.role === "assistant") && typeof h.content === "string",
  );

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const emit = (e: AgentEvent) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(e)}\n\n`));
      try {
        const final = await runTutor(
          { question: String(question ?? "").slice(0, 4000), history: history.slice(-10) },
          { emit, groqKey: creds.groqKey, groqModel: creds.groqModel },
        );
        emit({
          type: "final",
          answer: final.answer,
          intent: final.intent ?? "blocked",
          suggestions: final.suggestions ?? [],
          engine: creds.groqKey ? `LangGraph + Groq (${creds.groqModel})` : "LangGraph (offline retrieval mode)",
        });
      } catch (e) {
        const message = (e as Error).message ?? String(e);
        emit({
          type: "error",
          message: /401|invalid_api_key/i.test(message) ? "Your Groq API key was rejected. Check it in Settings (or clear it to use offline mode)." : message,
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "content-type": "text/event-stream", "cache-control": "no-cache, no-transform", connection: "keep-alive" },
  });
}
