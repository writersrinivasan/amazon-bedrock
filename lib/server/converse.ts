import "server-only";
import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";

// ── Bedrock Converse shapes (subset used by the labs) ─────────────────────────
export type BContent =
  | { text: string }
  | { toolUse: { toolUseId: string; name: string; input: unknown } }
  | { toolResult: { toolUseId: string; content: ({ text: string } | { json: unknown })[]; status?: "success" | "error" } };

export type BMessage = { role: "user" | "assistant"; content: BContent[] };

export type ConverseRequest = {
  modelId: string;
  system?: { text: string }[];
  messages: BMessage[];
  inferenceConfig?: { maxTokens?: number; temperature?: number; topP?: number; stopSequences?: string[] };
  toolConfig?: { tools: { toolSpec: { name: string; description: string; inputSchema: { json: unknown } } }[] };
};

export type ConverseResponse = {
  output: { message: BMessage };
  stopReason: string;
  usage: { inputTokens: number; outputTokens: number; totalTokens: number };
  metrics: { latencyMs: number };
};

export type Engine = { kind: "bedrock" | "groq" | "offline"; detail: string };

export type Creds = {
  mode: "simulate" | "live";
  groqKey?: string;
  groqModel: string;
  region: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  sessionToken?: string;
};

export function credsFrom(req: Request): Creds {
  const h = req.headers;
  return {
    mode: h.get("x-bedrock-mode") === "live" ? "live" : "simulate",
    groqKey: h.get("x-groq-key") || process.env.GROQ_API_KEY || undefined,
    groqModel: h.get("x-groq-model") || process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
    region: h.get("x-aws-region") || process.env.AWS_REGION || "us-east-1",
    accessKeyId: h.get("x-aws-access-key-id") || undefined,
    secretAccessKey: h.get("x-aws-secret-access-key") || undefined,
    sessionToken: h.get("x-aws-session-token") || undefined,
  };
}

export async function converse(req: ConverseRequest, creds: Creds): Promise<{ response: ConverseResponse; engine: Engine }> {
  if (creds.mode === "live") return converseBedrock(req, creds);
  if (creds.groqKey) return converseGroq(req, creds);
  return converseOffline(req);
}

// ── Live: real Amazon Bedrock ─────────────────────────────────────────────────
async function converseBedrock(req: ConverseRequest, creds: Creds) {
  const client = new BedrockRuntimeClient({
    region: creds.region,
    ...(creds.accessKeyId && creds.secretAccessKey
      ? { credentials: { accessKeyId: creds.accessKeyId, secretAccessKey: creds.secretAccessKey, sessionToken: creds.sessionToken } }
      : {}),
  });
  const t0 = Date.now();
  // The SDK's types are stricter than our JSON-shaped request; the wire format is identical.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const out: any = await client.send(new ConverseCommand(req as any));
  return {
    response: {
      output: out.output,
      stopReason: out.stopReason,
      usage: out.usage,
      metrics: out.metrics ?? { latencyMs: Date.now() - t0 },
    } as ConverseResponse,
    engine: { kind: "bedrock" as const, detail: `Amazon Bedrock · ${creds.region}` },
  };
}

// ── Simulated: Groq answers, shaped exactly like a Bedrock Converse response ──
type OAIMessage =
  | { role: "system" | "user"; content: string }
  | { role: "assistant"; content: string | null; tool_calls?: { id: string; type: "function"; function: { name: string; arguments: string } }[] }
  | { role: "tool"; tool_call_id: string; content: string };

function toOpenAI(req: ConverseRequest): OAIMessage[] {
  const msgs: OAIMessage[] = [];
  const sim = `You are running inside a training sandbox that simulates the Amazon Bedrock model "${req.modelId}". Answer the user's request directly.`;
  const system = [sim, ...(req.system ?? []).map((s) => s.text)].join("\n\n");
  msgs.push({ role: "system", content: system });
  for (const m of req.messages) {
    if (m.role === "assistant") {
      const text = m.content.filter((c): c is { text: string } => "text" in c).map((c) => c.text).join("\n");
      const calls = m.content
        .filter((c): c is Extract<BContent, { toolUse: unknown }> => "toolUse" in c)
        .map((c) => ({ id: c.toolUse.toolUseId, type: "function" as const, function: { name: c.toolUse.name, arguments: JSON.stringify(c.toolUse.input ?? {}) } }));
      msgs.push({ role: "assistant", content: text || null, ...(calls.length ? { tool_calls: calls } : {}) });
    } else {
      for (const c of m.content) {
        if ("toolResult" in c) {
          const body = c.toolResult.content.map((x) => ("text" in x ? x.text : JSON.stringify(x.json))).join("\n");
          msgs.push({ role: "tool", tool_call_id: c.toolResult.toolUseId, content: body });
        }
      }
      const text = m.content.filter((c): c is { text: string } => "text" in c).map((c) => c.text).join("\n");
      if (text) msgs.push({ role: "user", content: text });
    }
  }
  return msgs;
}

async function converseGroq(req: ConverseRequest, creds: Creds) {
  const ic = req.inferenceConfig ?? {};
  const body: Record<string, unknown> = {
    model: creds.groqModel,
    messages: toOpenAI(req),
    max_tokens: ic.maxTokens ?? 512,
    temperature: ic.temperature ?? 0.7,
    ...(ic.topP !== undefined ? { top_p: ic.topP } : {}),
    ...(ic.stopSequences?.length ? { stop: ic.stopSequences.slice(0, 4) } : {}),
  };
  if (req.toolConfig?.tools.length) {
    body.tools = req.toolConfig.tools.map((t) => ({
      type: "function",
      function: { name: t.toolSpec.name, description: t.toolSpec.description, parameters: t.toolSpec.inputSchema.json },
    }));
    body.tool_choice = "auto";
  }

  const t0 = Date.now();
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { authorization: `Bearer ${creds.groqKey}`, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const latencyMs = Date.now() - t0;
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq simulation error (${res.status}): ${err.slice(0, 400)}`);
  }
  const data = await res.json();
  const choice = data.choices?.[0] ?? {};
  const content: BContent[] = [];
  if (choice.message?.content) content.push({ text: choice.message.content });
  for (const tc of choice.message?.tool_calls ?? []) {
    let input: unknown = {};
    try {
      input = JSON.parse(tc.function.arguments || "{}");
    } catch {
      input = { _raw: tc.function.arguments };
    }
    content.push({ toolUse: { toolUseId: tc.id, name: tc.function.name, input } });
  }
  if (!content.length) content.push({ text: "" });

  const finish: string = choice.finish_reason ?? "stop";
  const stopReason = finish === "length" ? "max_tokens" : finish === "tool_calls" ? "tool_use" : "end_turn";
  const inputTokens = data.usage?.prompt_tokens ?? 0;
  const outputTokens = data.usage?.completion_tokens ?? 0;

  return {
    response: {
      output: { message: { role: "assistant" as const, content } },
      stopReason,
      usage: { inputTokens, outputTokens, totalTokens: inputTokens + outputTokens },
      metrics: { latencyMs },
    },
    engine: { kind: "groq" as const, detail: `Simulated with Groq · ${creds.groqModel}` },
  };
}

// ── Offline: no keys at all — still teaches the request/response shape ────────
async function converseOffline(req: ConverseRequest) {
  const last = [...req.messages].reverse().find((m) => m.role === "user");
  const q = last?.content.find((c): c is { text: string } => "text" in c)?.text ?? "";
  const text =
    `🔌 Offline demo response from "${req.modelId}".\n\n` +
    `Your request reached the sandbox and was shaped exactly like a real Bedrock Converse call — inspect the JSON panels! ` +
    `To get real AI answers, open Settings and either paste a Groq API key (Simulated mode) or add AWS credentials (Live Bedrock mode).\n\n` +
    `You asked: "${q.slice(0, 160)}"`;
  const outputTokens = Math.ceil(text.length / 4);
  const inputTokens = Math.ceil(JSON.stringify(req.messages).length / 4);
  await new Promise((r) => setTimeout(r, 350));
  return {
    response: {
      output: { message: { role: "assistant" as const, content: [{ text }] } },
      stopReason: "end_turn",
      usage: { inputTokens, outputTokens, totalTokens: inputTokens + outputTokens },
      metrics: { latencyMs: 350 },
    },
    engine: { kind: "offline" as const, detail: "Offline demo (no API key configured)" },
  };
}
