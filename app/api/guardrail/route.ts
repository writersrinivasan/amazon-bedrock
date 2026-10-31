import { NextResponse } from "next/server";
import { credsFrom } from "@/lib/server/converse";

export const runtime = "nodejs";

type PiiAction = "MASK" | "BLOCK" | "OFF";
type Config = {
  deniedTopics: { name: string; definition: string; examples: string[] }[];
  words: string[];
  pii: Record<string, PiiAction>;
  promptAttack: boolean;
  blockedMessage: string;
};

const PII_PATTERNS: Record<string, RegExp> = {
  EMAIL: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g,
  PHONE: /(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}\b/g,
  CREDIT_DEBIT_CARD_NUMBER: /\b(?:\d[ -]?){13,16}\b/g,
  US_SOCIAL_SECURITY_NUMBER: /\b\d{3}-\d{2}-\d{4}\b/g,
  IP_ADDRESS: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
  AWS_ACCESS_KEY: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/g,
};

const ATTACK_PATTERNS = [
  /ignore (all |any )?(previous|prior|above) (instructions|rules)/i,
  /disregard (your|the) (system|previous) (prompt|instructions)/i,
  /you are now (dan|in developer mode|unrestricted)/i,
  /reveal (your|the) (system prompt|hidden instructions)/i,
  /pretend (you have|there are) no (rules|restrictions|guidelines)/i,
  /jailbreak/i,
];

const STOP = new Set("the a an and or of to in on for is are be with about how what my me i you your it this that do can".split(" "));
const words = (s: string) => s.toLowerCase().match(/[a-z0-9]+/g)?.filter((w) => !STOP.has(w) && w.length > 2) ?? [];

async function topicCheckLLM(text: string, topics: Config["deniedTopics"], key: string) {
  const prompt =
    `You are a content policy classifier. Decide if the USER TEXT is about any DENIED TOPIC.\n` +
    topics.map((t, i) => `${i + 1}. ${t.name}: ${t.definition}${t.examples.length ? ` (e.g. ${t.examples.join("; ")})` : ""}`).join("\n") +
    `\n\nUSER TEXT:\n<<<${text}>>>\n\nReply with JSON only: {"matched": ["<topic name>", ...]} (empty list if none).`;
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      temperature: 0,
      max_tokens: 100,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`classifier ${res.status}`);
  const data = await res.json();
  const parsed = JSON.parse(data.choices?.[0]?.message?.content ?? "{}");
  const matched: string[] = Array.isArray(parsed.matched) ? parsed.matched : [];
  return topics.filter((t) => matched.some((m) => m.toLowerCase().includes(t.name.toLowerCase()) || t.name.toLowerCase().includes(m.toLowerCase())));
}

function topicCheckKeywords(text: string, topics: Config["deniedTopics"]) {
  const tw = new Set(words(text));
  return topics.filter((t) => {
    const vocab = words([t.name, t.definition, ...t.examples].join(" "));
    const hits = vocab.filter((w) => tw.has(w));
    return new Set(hits).size >= 2 || words(t.name).every((w) => tw.has(w));
  });
}

export async function POST(req: Request) {
  const creds = credsFrom(req);
  let body: { text: string; source?: string; config: Config };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const { text, source = "INPUT", config } = body ?? {};
  if (typeof text !== "string" || !config || !Array.isArray(config.deniedTopics) || !Array.isArray(config.words) || typeof config.pii !== "object") {
    return NextResponse.json({ error: "text and config { deniedTopics[], words[], pii{}, promptAttack, blockedMessage } are required" }, { status: 400 });
  }
  const t0 = Date.now();
  const assessment: Record<string, unknown> = {};
  let blocked = false;
  let output = text;

  // 1. Content filter: prompt attack
  if (config.promptAttack && source === "INPUT") {
    const hit = ATTACK_PATTERNS.find((p) => p.test(text));
    if (hit) {
      blocked = true;
      assessment.contentPolicy = { filters: [{ type: "PROMPT_ATTACK", confidence: "HIGH", filterStrength: "HIGH", action: "BLOCKED" }] };
    }
  }

  // 2. Denied topics
  let topicEngine = "keyword-heuristic";
  if (config.deniedTopics.length) {
    let matched: Config["deniedTopics"] = [];
    if (creds.groqKey) {
      try {
        matched = await topicCheckLLM(text, config.deniedTopics, creds.groqKey);
        topicEngine = "llm-classifier (Groq llama-3.1-8b-instant)";
      } catch {
        matched = topicCheckKeywords(text, config.deniedTopics);
      }
    } else {
      matched = topicCheckKeywords(text, config.deniedTopics);
    }
    if (matched.length) {
      blocked = true;
      assessment.topicPolicy = { topics: matched.map((t) => ({ name: t.name, type: "DENY", action: "BLOCKED" })) };
    }
  }

  // 3. Word filters
  const wordHits = config.words.filter((w) => w.trim() && new RegExp(`\\b${w.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(text));
  if (wordHits.length) {
    blocked = true;
    assessment.wordPolicy = { customWords: wordHits.map((m) => ({ match: m, action: "BLOCKED" })) };
  }

  // 4. Sensitive information (PII)
  const piiEntities: { type: string; match: string; action: string }[] = [];
  for (const [type, re] of Object.entries(PII_PATTERNS)) {
    const action = config.pii[type] ?? "OFF";
    if (action === "OFF") continue;
    const matches = text.match(re) ?? [];
    for (const m of matches) {
      if (type === "CREDIT_DEBIT_CARD_NUMBER" && m.replace(/\D/g, "").length < 13) continue;
      piiEntities.push({ type, match: m, action: action === "MASK" ? "ANONYMIZED" : "BLOCKED" });
      if (action === "BLOCK") blocked = true;
      else output = output.split(m).join(`{${type}}`);
    }
  }
  if (piiEntities.length) assessment.sensitiveInformationPolicy = { piiEntities };

  const intervened = blocked || piiEntities.length > 0;
  return NextResponse.json({
    action: intervened ? "GUARDRAIL_INTERVENED" : "NONE",
    outputs: [{ text: blocked ? config.blockedMessage : output }],
    assessments: Object.keys(assessment).length ? [assessment] : [],
    blocked,
    usage: { topicPolicyUnits: config.deniedTopics.length ? 1 : 0, sensitiveInformationPolicyUnits: 1, wordPolicyUnits: 1, contentPolicyUnits: 1 },
    _sandbox: { engine: "Local guardrail simulator (mirrors ApplyGuardrail response shape)", topicEngine, latencyMs: Date.now() - t0 },
  });
}
