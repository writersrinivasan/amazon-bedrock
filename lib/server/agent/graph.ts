import "server-only";
import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import type { LangGraphRunnableConfig } from "@langchain/langgraph";
import { ChatGroq } from "@langchain/groq";
import { AIMessage, HumanMessage, SystemMessage, type BaseMessage } from "@langchain/core/messages";
import { retrieve, type Chunk } from "./retrieval";

// ── Event protocol streamed to the browser ───────────────────────────────────
export type AgentEvent =
  | { type: "node"; node: string; status: "start" | "end"; ms?: number; summary?: string; data?: unknown }
  | { type: "token"; text: string }
  | { type: "final"; answer: string; intent: string; suggestions: Suggestion[]; engine: string }
  | { type: "error"; message: string };

export type Suggestion = { label: string; href: string; kind: string };
export type Intent = "concept" | "model_advice" | "code" | "quiz" | "navigate";

type Runtime = { emit: (e: AgentEvent) => void; groqKey?: string; groqModel: string };

// ── Graph state ──────────────────────────────────────────────────────────────
const State = Annotation.Root({
  question: Annotation<string>,
  history: Annotation<{ role: "user" | "assistant"; content: string }[]>,
  sanitized: Annotation<string>,
  safety: Annotation<{ ok: boolean; reason?: string; redactions: string[] }>,
  intent: Annotation<Intent>,
  confidence: Annotation<number>,
  routerReason: Annotation<string>,
  context: Annotation<Chunk[]>,
  answer: Annotation<string>,
  suggestions: Annotation<Suggestion[]>,
});
type S = typeof State.State;

const rt = (config: LangGraphRunnableConfig) => config.configurable as unknown as Runtime;

/** Wraps a node so every layer reports start/end + timing to the UI. */
function layer(name: string, fn: (s: S, r: Runtime) => Promise<Partial<S> & { _summary?: string; _data?: unknown }>) {
  return async (s: S, config: LangGraphRunnableConfig): Promise<Partial<S>> => {
    const r = rt(config);
    const t0 = Date.now();
    r.emit({ type: "node", node: name, status: "start" });
    const { _summary, _data, ...update } = await fn(s, r);
    r.emit({ type: "node", node: name, status: "end", ms: Date.now() - t0, summary: _summary, data: _data });
    return update;
  };
}

const llm = (r: Runtime, model: string, temperature = 0.4) =>
  new ChatGroq({ apiKey: r.groqKey, model, temperature, maxTokens: 1200 });

// ── Layer 1 · Guardrail (≈ Bedrock Guardrails) ────────────────────────────────
const PII: [string, RegExp][] = [
  ["EMAIL", /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g],
  ["AWS_ACCESS_KEY", /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/g],
  ["AWS_SECRET", /\b[A-Za-z0-9/+=]{40}\b/g],
  ["CARD", /\b(?:\d[ -]?){13,16}\b/g],
  ["PHONE", /\+?\d[\d\s().-]{8,}\d/g],
];
const ATTACKS = [/ignore (all |any )?(previous|prior|above) instructions/i, /reveal (your|the) system prompt/i, /you are now (dan|unrestricted)/i, /jailbreak/i];

const guardrail = layer("guardrail", async (s) => {
  const attack = ATTACKS.find((p) => p.test(s.question));
  if (attack) {
    return {
      safety: { ok: false, reason: "Prompt attack pattern detected", redactions: [] },
      sanitized: s.question,
      _summary: "🚫 Blocked: prompt-attack pattern",
      _data: { policy: "PROMPT_ATTACK", action: "BLOCKED" },
    };
  }
  let text = s.question;
  const redactions: string[] = [];
  for (const [type, re] of PII) {
    text = text.replace(re, () => {
      redactions.push(type);
      return `{${type}}`;
    });
  }
  return {
    safety: { ok: true, redactions },
    sanitized: text,
    _summary: redactions.length ? `🕵️ Masked ${redactions.length} sensitive item(s): ${[...new Set(redactions)].join(", ")}` : "✅ Clean input — passed all filters",
    _data: { action: redactions.length ? "ANONYMIZED" : "NONE", redactions },
  };
});

const blocked = layer("blocked", async () => ({
  answer:
    "🛡️ My guardrail stepped in — that message looked like an attempt to override my instructions. I'm happy to help with anything about **Amazon Bedrock**: models, Knowledge Bases, Agents, Guardrails, pricing, or the labs in this academy!",
  suggestions: [{ label: "Learn how Guardrails work", href: "/learn/guardrails", kind: "lesson" }],
  _summary: "Returned the blocked-message template",
}));

// ── Layer 2 · Router (≈ Intelligent Prompt Routing / intent classification) ──
function heuristicIntent(q: string): { intent: Intent; confidence: number; reason: string } {
  const t = q.toLowerCase();
  if (/\b(quiz|test me|question me|flashcard)\b/.test(t)) return { intent: "quiz", confidence: 0.85, reason: "asked to be quizzed" };
  if (/\b(code|python|boto3|javascript|typescript|sdk|cli|snippet|implement|example|api call|lambda)\b/.test(t)) return { intent: "code", confidence: 0.75, reason: "mentions code / implementation" };
  if (/\b(which model|best model|what model|recommend|cheapest|fastest|compare models?|model for)\b/.test(t)) return { intent: "model_advice", confidence: 0.8, reason: "asks for a model recommendation" };
  if (/\b(where (do|can) i|this app|academy|sandbox|lab|xp|badge|certificate|settings|how do i use|navigate|get started|start)\b/.test(t)) return { intent: "navigate", confidence: 0.7, reason: "about using the academy" };
  return { intent: "concept", confidence: 0.6, reason: "general concept question" };
}

const router = layer("router", async (s, r) => {
  let result = heuristicIntent(s.sanitized);
  let engine = "keyword heuristic";
  if (r.groqKey) {
    try {
      const res = await llm(r, "llama-3.1-8b-instant", 0).invoke([
        new SystemMessage(
          `Classify the learner's message for an Amazon Bedrock training assistant. Intents:
- concept: explain an idea or feature
- model_advice: choosing/comparing foundation models
- code: how to implement, code samples, APIs, CLI
- quiz: wants to be tested
- navigate: how to use this learning app (labs, XP, settings, where to find things)
Reply ONLY with JSON: {"intent": "...", "confidence": 0-1, "reason": "<8 words>"}`,
        ),
        new HumanMessage(s.sanitized),
      ]);
      const m = String(res.content).match(/\{[\s\S]*\}/);
      if (m) {
        const j = JSON.parse(m[0]);
        if (["concept", "model_advice", "code", "quiz", "navigate"].includes(j.intent)) {
          result = { intent: j.intent, confidence: Number(j.confidence) || 0.7, reason: String(j.reason ?? "") };
          engine = "llama-3.1-8b-instant";
        }
      }
    } catch {
      /* fall back to heuristic */
    }
  }
  return {
    intent: result.intent,
    confidence: result.confidence,
    routerReason: result.reason,
    _summary: `🧭 ${result.intent} (${Math.round(result.confidence * 100)}%) — ${result.reason}`,
    _data: { ...result, engine },
  };
});

// ── Layer 3 · Retriever (≈ Knowledge Bases Retrieve API) ──────────────────────
const retriever = layer("retriever", async (s) => {
  const lastUser = s.history.filter((h) => h.role === "user").slice(-1)[0]?.content ?? "";
  const query = `${s.sanitized} ${lastUser.slice(0, 80)}`;
  // Model questions should be answered from the model catalog first, with one lesson chunk for background.
  const context =
    s.intent === "model_advice"
      ? [...retrieve(`${query} chat use when`, 3, "model"), ...retrieve(query, 1, "lesson")]
      : retrieve(query, 4);
  return {
    context,
    _summary: context.length ? `📚 ${context.length} chunks · top: ${context[0].title}` : "📭 No matching course content",
    _data: context.map((c) => ({ title: c.title, score: c.score, kind: c.kind, preview: c.text.slice(0, 140) })),
  };
});

// ── Layer 4 · Specialists (≈ Bedrock Agents / multi-agent collaboration) ──────
const PERSONA = `You are "Rocky", the upbeat AI tutor of Bedrock Academy — a hands-on training on Amazon Bedrock.
Style: friendly, energetic, concise. Use short paragraphs, bullet points, **bold** key terms, and 1–2 fitting emojis.
Use markdown. Put code in fenced blocks with a language tag.
Ground your answer in the COURSE CONTEXT when relevant. If something may have changed since the course was written (model IDs, prices, Regions), say to verify in the AWS console/docs.
Never invent model IDs; if unsure, say so. Keep answers under ~250 words unless code is requested.`;

const SPECIALIST_PROMPTS: Record<Intent, string> = {
  concept: "ROLE: Concept Tutor. Explain the idea with a vivid everyday analogy, then the precise technical explanation, then 'When to use it' bullets. End with one reflective question.",
  model_advice:
    "ROLE: Model Advisor. Recommend 2–3 specific Bedrock models from the context, each with model ID, why, and trade-offs (cost/speed/quality). Suggest how to evaluate them (playground compare or Model Evaluation).",
  code: "ROLE: Code Coach. Give a minimal, correct, runnable example (prefer Python boto3 unless the user names a language), explain each key line briefly, and list common errors (AccessDenied, ValidationException, Throttling).",
  quiz: "ROLE: Quiz Master. Ask ONE multiple-choice question (A–D) about the topic, based on the context. Do not reveal the answer — tell them to reply with a letter. If they just answered a previous question, grade it first with an explanation, then ask a new one.",
  navigate:
    "ROLE: Academy Guide. Explain how to use Bedrock Academy: Learn (10 modules with quizzes), Models (catalog + Model Finder), Compass (when-to-use decision guide), Sandbox (6 hands-on labs, Simulated/Live mode), Use Cases (5 industry builds: retail Claude/Nova invocation with boto3, insurance PDF chatbot with Knowledge Bases, banking enterprise RAG on S3, airline autonomous agent with Bedrock Agents, manufacturing workflow with Lambda + AgentCore), Assistant (you), Journey (XP, levels, badges, certificate), Settings (Groq key, AWS creds). Give the exact next step.",
};

const NODE_FOR: Record<Intent, string> = {
  concept: "tutor",
  model_advice: "model_advisor",
  code: "coder",
  quiz: "quiz_master",
  navigate: "navigator",
};

function formatContext(ctx: Chunk[]) {
  return ctx.map((c, i) => `[${i + 1}] ${c.title}\n${c.text.slice(0, 1200)}`).join("\n\n---\n\n");
}

function offlineAnswer(s: S): string {
  const top = s.context.slice(0, 2);
  const body = top.length
    ? top.map((c) => `### ${c.title}\n${c.text.slice(0, 420).trim()}…`).join("\n\n")
    : "I couldn't find that in the course yet. Try rephrasing, or browse **Learn** and the **Compass**.";
  return `🔌 *Offline mode — no Groq key yet, so here's the most relevant course material I retrieved:*\n\n${body}\n\n> Add your **Groq API key** in **Settings** to unlock full AI answers from Rocky.`;
}

function specialist(intent: Intent) {
  return layer(NODE_FOR[intent], async (s, r) => {
    if (!r.groqKey) {
      const answer = offlineAnswer(s);
      r.emit({ type: "token", text: answer });
      return { answer, _summary: "📄 Offline: answered from retrieved chunks" };
    }
    const msgs: BaseMessage[] = [
      new SystemMessage(`${PERSONA}\n\n${SPECIALIST_PROMPTS[intent]}\n\nCOURSE CONTEXT:\n${formatContext(s.context) || "(none)"}`),
      ...s.history.slice(-6).map((h) => (h.role === "user" ? new HumanMessage(h.content) : new AIMessage(h.content))),
      new HumanMessage(s.sanitized),
    ];
    let answer = "";
    const stream = await llm(r, r.groqModel, intent === "quiz" ? 0.7 : 0.4).stream(msgs);
    for await (const chunk of stream) {
      const t = typeof chunk.content === "string" ? chunk.content : "";
      if (t) {
        answer += t;
        r.emit({ type: "token", text: t });
      }
    }
    return { answer, _summary: `✍️ ${answer.split(/\s+/).length} words via ${r.groqModel}` };
  });
}

// ── Layer 5 · Enricher (≈ post-processing: citations & next steps) ─────────────
const enricher = layer("enricher", async (s) => {
  const seen = new Set<string>();
  const suggestions: Suggestion[] = [];
  for (const c of s.context) {
    if (seen.has(c.href) || (c.score ?? 0) < 0.35) continue;
    seen.add(c.href);
    suggestions.push({ label: c.title, href: c.href, kind: c.kind });
  }
  const extra: Record<Intent, Suggestion> = {
    concept: { label: "Explore the Compass", href: "/compass", kind: "guide" },
    model_advice: { label: "Try the Model Finder", href: "/models#finder", kind: "guide" },
    code: { label: "Run it in the Sandbox", href: "/sandbox", kind: "lab" },
    quiz: { label: "Take a module quiz", href: "/learn", kind: "lesson" },
    navigate: { label: "See your Journey", href: "/journey", kind: "guide" },
  };
  if (!seen.has(extra[s.intent].href)) suggestions.push(extra[s.intent]);
  return {
    suggestions: suggestions.slice(0, 4),
    _summary: `🔗 Attached ${Math.min(4, suggestions.length)} next-step links`,
    _data: suggestions.slice(0, 4),
  };
});

// ── Wire the graph ────────────────────────────────────────────────────────────
const INTENTS: Intent[] = ["concept", "model_advice", "code", "quiz", "navigate"];

const builder = new StateGraph(State)
  .addNode("guardrail", guardrail)
  .addNode("blocked", blocked)
  .addNode("router", router)
  .addNode("retriever", retriever)
  .addNode("tutor", specialist("concept"))
  .addNode("model_advisor", specialist("model_advice"))
  .addNode("coder", specialist("code"))
  .addNode("quiz_master", specialist("quiz"))
  .addNode("navigator", specialist("navigate"))
  .addNode("enricher", enricher)
  .addEdge(START, "guardrail")
  .addConditionalEdges("guardrail", (s: S) => (s.safety.ok ? "router" : "blocked"), ["router", "blocked"])
  .addEdge("router", "retriever")
  .addConditionalEdges("retriever", (s: S) => NODE_FOR[s.intent], ["tutor", "model_advisor", "coder", "quiz_master", "navigator"])
  .addEdge("tutor", "enricher")
  .addEdge("model_advisor", "enricher")
  .addEdge("coder", "enricher")
  .addEdge("quiz_master", "enricher")
  .addEdge("navigator", "enricher")
  .addEdge("enricher", END)
  .addEdge("blocked", END);

export const tutorGraph = builder.compile();
export { INTENTS, NODE_FOR };

export async function runTutor(input: { question: string; history: S["history"] }, runtime: Runtime) {
  const final = await tutorGraph.invoke(
    { question: input.question, history: input.history, context: [], suggestions: [], answer: "" },
    { configurable: runtime as unknown as Record<string, unknown> },
  );
  return final as S;
}
