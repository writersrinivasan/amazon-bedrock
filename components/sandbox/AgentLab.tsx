"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Play } from "lucide-react";
import clsx from "clsx";
import { LabFrame, FlowPulse, ModelSelect, ErrorBox } from "./LabFrame";
import { CodeTabs, JsonView, Markdown } from "@/components/ui";
import { textOf, useConverse, type ConverseRequest, type ConverseResponse } from "@/lib/sandbox";
import type { BContent, BMessage } from "@/lib/server/converse";
import { useStore } from "@/lib/store";

type ToolDef = {
  name: string;
  emoji: string;
  description: string;
  schema: Record<string, unknown>;
  run: (input: Record<string, unknown>) => unknown;
};

const ORDERS: Record<string, { status: string; total_usd: number; eta: string; items: string[] }> = {
  "A-1932": { status: "shipped", total_usd: 86.4, eta: "2 days", items: ["CloudCrunch Sea Salt x6", "TrailFlask 2.0"] },
  "B-2201": { status: "processing", total_usd: 24.99, eta: "5 days", items: ["Wasabi Lime x3"] },
};
const BOOKINGS: Record<string, { name: string; flight: string; route: string; date: string; status: string }> = {
  SKL7Q2: { name: "A. Rivera", flight: "SL204", route: "LHR-AMS", date: "2026-11-03", status: "CANCELLED" },
};
const RATES: Record<string, number> = { USD: 1, EUR: 0.92, GBP: 0.79, INR: 83.2, JPY: 151.4 };

function hash(s: string) {
  let h = 0;
  for (const c of s.toLowerCase()) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

const TOOLS: ToolDef[] = [
  {
    name: "get_booking",
    emoji: "🎫",
    description: "Look up an airline booking by its 6-character PNR code.",
    schema: { type: "object", properties: { pnr: { type: "string" } }, required: ["pnr"] },
    run: ({ pnr }) => BOOKINGS[String(pnr).toUpperCase()] ?? { error: `Booking ${pnr} not found` },
  },
  {
    name: "search_flights",
    emoji: "✈️",
    description: "Search alternative flights for a route like LHR-AMS on a date (YYYY-MM-DD).",
    schema: { type: "object", properties: { route: { type: "string" }, date: { type: "string" } }, required: ["route"] },
    run: ({ route, date }) => ({ route, date, options: [{ flight: "SL208", dep: "18:40", seats: 12 }, { flight: "SL212", dep: "21:15", seats: 3 }] }),
  },
  {
    name: "get_weather",
    emoji: "🌦️",
    description: "Get the current weather and rain probability for a city.",
    schema: { type: "object", properties: { city: { type: "string", description: "City name" } }, required: ["city"] },
    run: ({ city }) => {
      const h = hash(String(city));
      const conds = ["sunny", "cloudy", "light rain", "showers", "windy"];
      return { city, temp_c: 8 + (h % 20), condition: conds[h % conds.length], rain_chance_pct: (h >> 3) % 100 };
    },
  },
  {
    name: "calculator",
    emoji: "🧮",
    description: "Evaluate an arithmetic expression, e.g. '86.4 * 0.15'.",
    schema: { type: "object", properties: { expression: { type: "string" } }, required: ["expression"] },
    run: ({ expression }) => {
      const e = String(expression);
      if (!/^[\d\s+\-*/().%]+$/.test(e)) return { error: "Only numbers and + - * / ( ) % are allowed" };
      try {
        // Safe: input is restricted to arithmetic characters by the regex above.
        const value = Function(`"use strict"; return (${e.replace(/%/g, "/100")})`)();
        return { expression: e, result: Math.round(value * 10000) / 10000 };
      } catch {
        return { error: "Invalid expression" };
      }
    },
  },
  {
    name: "lookup_order",
    emoji: "📦",
    description: "Look up an order by ID (format like A-1932). Returns status, total in USD, ETA and items.",
    schema: { type: "object", properties: { order_id: { type: "string" } }, required: ["order_id"] },
    run: ({ order_id }) => ORDERS[String(order_id).toUpperCase()] ?? { error: `Order ${order_id} not found` },
  },
  {
    name: "convert_currency",
    emoji: "💱",
    description: "Convert an amount between currencies (USD, EUR, GBP, INR, JPY).",
    schema: {
      type: "object",
      properties: { amount: { type: "number" }, from: { type: "string" }, to: { type: "string" } },
      required: ["amount", "from", "to"],
    },
    run: ({ amount, from, to }) => {
      const f = RATES[String(from).toUpperCase()];
      const t = RATES[String(to).toUpperCase()];
      if (!f || !t) return { error: "Unsupported currency" };
      return { amount, from, to, converted: Math.round((Number(amount) / f) * t * 100) / 100 };
    },
  },
];

const PRESET_TASKS: Record<string, string> = {
  airline: "My flight SL204 got cancelled, booking SKL7Q2. Find me alternatives tonight and tell me which has more seats.",
  invoice: "Supplier invoice for order A-1932 says 92.00 EUR. Look up the order, convert its USD total to EUR, and tell me the difference in EUR.",
};

const TASKS = [
  PRESET_TASKS.airline,
  PRESET_TASKS.invoice,
  "Should I take an umbrella in Seattle today? Also, what's a 15% tip on $86.40?",
  "Where is my order A-1932 and what is its total in EUR?",
  "Compare the weather in Chennai and London and tell me where it's warmer.",
];

type Step =
  | { kind: "model"; iter: number; stopReason: string; text: string; toolUses: { name: string; input: unknown }[]; ms: number; engine: string }
  | { kind: "tool"; iter: number; name: string; emoji: string; input: unknown; output: unknown };

/** Used only in offline mode (no keys): a scripted planner so the loop is still visible. */
function offlinePlan(task: string, enabled: ToolDef[], results: { name: string; output: unknown }[]): ConverseResponse {
  const on = (n: string) => enabled.some((t) => t.name === n);
  const content: BContent[] = [];
  if (!results.length) {
    const cities = task.match(/\b(Seattle|London|Chennai|Paris|Tokyo|Mumbai|New York|Sydney)\b/gi) ?? [];
    if (on("get_weather")) cities.forEach((c, i) => content.push({ toolUse: { toolUseId: `tooluse_off_w${i}`, name: "get_weather", input: { city: c } } }));
    const pnr = task.match(/booking\s+([A-Z0-9]{6})\b/i);
    if (pnr && on("get_booking")) content.push({ toolUse: { toolUseId: "tooluse_off_b", name: "get_booking", input: { pnr: pnr[1] } } });
    const order = task.match(/\b[A-Z]-\d{4}\b/);
    if (order && on("lookup_order")) content.push({ toolUse: { toolUseId: "tooluse_off_o", name: "lookup_order", input: { order_id: order[0] } } });
    const tip = task.match(/(\d+)%\s*tip on \$?([\d.]+)/i);
    if (tip && on("calculator")) content.push({ toolUse: { toolUseId: "tooluse_off_c", name: "calculator", input: { expression: `${tip[2]} * ${tip[1]} / 100` } } });
    if (content.length) {
      content.unshift({ text: "(offline scripted planner) I'll gather the data with tools first." });
      return { output: { message: { role: "assistant", content } }, stopReason: "tool_use", usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 }, metrics: { latencyMs: 0 } };
    }
  }
  const booking = results.find((r) => r.name === "get_booking")?.output as { route?: string; date?: string } | undefined;
  if (booking?.route && on("search_flights") && !results.some((r) => r.name === "search_flights")) {
    return { output: { message: { role: "assistant", content: [{ toolUse: { toolUseId: "tooluse_off_f", name: "search_flights", input: { route: booking.route, date: booking.date } } }] } }, stopReason: "tool_use", usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 }, metrics: { latencyMs: 0 } };
  }
  const order = results.find((r) => r.name === "lookup_order")?.output as { total_usd?: number } | undefined;
  if (order?.total_usd && /EUR/i.test(task) && on("convert_currency") && !results.some((r) => r.name === "convert_currency")) {
    return { output: { message: { role: "assistant", content: [{ toolUse: { toolUseId: "tooluse_off_x", name: "convert_currency", input: { amount: order.total_usd, from: "USD", to: "EUR" } } }] } }, stopReason: "tool_use", usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 }, metrics: { latencyMs: 0 } };
  }
  const summary = results.map((r) => `- **${r.name}** → \`${JSON.stringify(r.output)}\``).join("\n");
  return {
    output: { message: { role: "assistant", content: [{ text: `🔌 Offline scripted answer based on tool results:\n\n${summary || "- (no tools were applicable)"}\n\nAdd a Groq key or AWS credentials in Settings to let a real model plan and write this answer.` }] } },
    stopReason: "end_turn",
    usage: { inputTokens: 0, outputTokens: 0, totalTokens: 0 },
    metrics: { latencyMs: 0 },
  };
}

export default function AgentLab() {
  const presetTask = PRESET_TASKS[useSearchParams().get("task") ?? ""];
  const { completeObjective } = useStore();
  const { call, stage, busy, region } = useConverse();
  const [modelId, setModelId] = useState("us.amazon.nova-pro-v1:0");
  const [task, setTask] = useState(presetTask ?? TASKS[0]);
  const [enabled, setEnabled] = useState<Record<string, boolean>>(Object.fromEntries(TOOLS.map((t) => [t.name, true])));
  const [steps, setSteps] = useState<Step[]>([]);
  const [messages, setMessages] = useState<BMessage[]>([]);
  const [final, setFinal] = useState("");
  const [error, setError] = useState<{ error: string; errorType?: string } | null>(null);
  const [running, setRunning] = useState(false);

  const active = TOOLS.filter((t) => enabled[t.name]);
  const toolConfig = useMemo(() => ({ tools: active.map((t) => ({ toolSpec: { name: t.name, description: t.description, inputSchema: { json: t.schema } } })) }), [active]);

  const run = async () => {
    setRunning(true);
    setSteps([]);
    setFinal("");
    setError(null);
    const system = [{ text: "You are a helpful assistant. Use the provided tools whenever they help; call several tools if needed. Then answer concisely with friendly emojis." }];
    let msgs: BMessage[] = [{ role: "user", content: [{ text: task }] }];
    setMessages(msgs);
    const toolResults: { name: string; output: unknown }[] = [];
    let toolCalls = 0;
    try {
      for (let iter = 1; iter <= 6; iter++) {
        const req: ConverseRequest = { modelId, system, messages: msgs, inferenceConfig: { maxTokens: 600, temperature: 0.2 }, ...(active.length ? { toolConfig } : {}) };
        const r = await call(req);
        if (r.error || !r.response) {
          setError({ error: r.error ?? "Unknown error", errorType: r.errorType });
          break;
        }
        const resp = r.engine?.kind === "offline" ? offlinePlan(task, active, toolResults) : r.response;
        const msg = resp.output.message;
        const uses = msg.content.filter((c): c is Extract<BContent, { toolUse: unknown }> => "toolUse" in c).map((c) => c.toolUse);
        setSteps((s) => [...s, { kind: "model", iter, stopReason: resp.stopReason, text: textOf(resp), toolUses: uses.map((u) => ({ name: u.name, input: u.input })), ms: r.clientMs, engine: r.engine?.kind === "offline" ? "offline planner" : r.engine?.detail ?? "" }]);
        msgs = [...msgs, msg];
        setMessages(msgs);
        if (resp.stopReason !== "tool_use" || !uses.length) {
          setFinal(textOf(resp));
          break;
        }
        const results: BContent[] = [];
        for (const u of uses) {
          const def = TOOLS.find((t) => t.name === u.name);
          const output = def && enabled[u.name] ? def.run((u.input ?? {}) as Record<string, unknown>) : { error: `Tool ${u.name} is not available` };
          toolCalls++;
          toolResults.push({ name: u.name, output });
          await new Promise((res) => setTimeout(res, 250));
          setSteps((s) => [...s, { kind: "tool", iter, name: u.name, emoji: def?.emoji ?? "🔧", input: u.input, output }]);
          results.push({ toolResult: { toolUseId: u.toolUseId, content: [{ json: output }], status: (output as { error?: string }).error ? "error" : "success" } });
        }
        msgs = [...msgs, { role: "user", content: results }];
        setMessages(msgs);
      }
      if (toolCalls >= 1) completeObjective("agent-workshop", "tool");
      if (toolCalls >= 2) completeObjective("agent-workshop", "multi");
      if (active.length < TOOLS.length) completeObjective("agent-workshop", "toggle");
    } finally {
      setRunning(false);
    }
  };

  const loopCode = `import boto3, json

client = boto3.client("bedrock-runtime", region_name="${region}")
MODEL_ID = "${modelId}"

tool_config = ${JSON.stringify(toolConfig, null, 4).replace(/\n/g, "\n")}

def run_tool(name, args):
    # Your real implementations: APIs, DB queries, Lambda calls...
    return TOOLS[name](**args)

messages = [{"role": "user", "content": [{"text": ${JSON.stringify(task)}}]}]

for _ in range(6):  # always cap iterations
    resp = client.converse(modelId=MODEL_ID, messages=messages, toolConfig=tool_config)
    msg = resp["output"]["message"]
    messages.append(msg)
    if resp["stopReason"] != "tool_use":
        print(msg["content"][0]["text"])
        break
    results = []
    for block in msg["content"]:
        if "toolUse" in block:
            tu = block["toolUse"]
            out = run_tool(tu["name"], tu["input"])
            results.append({"toolResult": {"toolUseId": tu["toolUseId"], "content": [{"json": out}]}})
    messages.append({"role": "user", "content": results})`;

  return (
    <LabFrame
      slug="agent-workshop"
      side={
        <>
          <FlowPulse stage={stage} modelId={modelId} />
          <CodeTabs tabs={[{ label: "Tool-use loop (Python)", lang: "python", code: loopCode }, { label: "toolConfig", lang: "json", code: JSON.stringify(toolConfig, null, 2) }]} />
          {messages.length > 0 && <JsonView title={`🧵 messages[] — ${messages.length} entries (what the model sees)`} value={messages} />}
        </>
      }
    >
      <div className="glass space-y-4 p-5">
        <ModelSelect value={modelId} onChange={setModelId} />
        <div>
          <label className="label">🧰 Tools (toggle to see how the agent adapts)</label>
          <div className="grid gap-2 sm:grid-cols-2">
            {TOOLS.map((t) => (
              <button key={t.name} onClick={() => setEnabled((e) => ({ ...e, [t.name]: !e[t.name] }))} className={clsx("flex items-start gap-3 rounded-xl border p-3 text-left transition", enabled[t.name] ? "border-cyan-300/40 bg-cyan-400/10" : "border-white/10 bg-white/[0.02] opacity-50")}>
                <span className="text-2xl">{t.emoji}</span>
                <div>
                  <div className="font-mono text-xs font-bold">{t.name}</div>
                  <div className="text-xs text-slate-400">{t.description}</div>
                </div>
                <span className={clsx("ml-auto mt-1 h-2.5 w-2.5 shrink-0 rounded-full", enabled[t.name] ? "bg-emerald-400" : "bg-slate-600")} />
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label">🎯 Task</label>
          <textarea className="input min-h-[64px]" value={task} onChange={(e) => setTask(e.target.value)} />
          <div className="mt-2 flex flex-wrap gap-2">
            {TASKS.map((t) => (
              <button key={t} className="chip hover:bg-white/10" onClick={() => setTask(t)}>
                {t.slice(0, 48)}…
              </button>
            ))}
          </div>
        </div>
        <button className="btn-primary" disabled={running || busy || !task.trim()} onClick={run}>
          <Play className="h-4 w-4" /> {running ? "Agent is working…" : "Run agent loop"}
        </button>
      </div>

      {steps.length > 0 && (
        <div className="glass p-5">
          <div className="font-display font-bold">🎞️ Agent timeline</div>
          <div className="relative mt-4 space-y-3 pl-6">
            <div className="absolute bottom-2 left-2 top-2 w-0.5 bg-gradient-to-b from-fuchsia-400 via-violet-400 to-cyan-400" />
            <AnimatePresence>
              {steps.map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} className="relative">
                  <span className={clsx("absolute -left-[22px] top-3 h-3 w-3 rounded-full ring-4 ring-ink-950", s.kind === "model" ? "bg-fuchsia-400" : "bg-cyan-400")} />
                  {s.kind === "model" ? (
                    <div className="rounded-xl border border-fuchsia-300/20 bg-fuchsia-400/[0.06] p-3 text-sm">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <Bot className="h-3.5 w-3.5 text-fuchsia-300" /> <b>Model · turn {s.iter}</b>
                        <span className={clsx("chip", s.stopReason === "tool_use" ? "border-cyan-300/40 text-cyan-200" : "border-emerald-300/40 text-emerald-200")}>stopReason: {s.stopReason}</span>
                        <span className="text-slate-500">{s.ms} ms · {s.engine}</span>
                      </div>
                      {s.text && s.stopReason === "tool_use" && <div className="mt-1 text-slate-300">{s.text}</div>}
                      {s.toolUses.map((u, j) => (
                        <div key={j} className="mt-2 font-mono text-xs text-cyan-200">
                          → toolUse {u.name}({JSON.stringify(u.input)})
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-cyan-300/20 bg-cyan-400/[0.06] p-3 text-sm">
                      <div className="text-xs font-bold">
                        {s.emoji} Your code ran <span className="font-mono">{s.name}</span>
                      </div>
                      <div className="mt-1 font-mono text-xs text-slate-300">input: {JSON.stringify(s.input)}</div>
                      <div className="font-mono text-xs text-emerald-200">result: {JSON.stringify(s.output)}</div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {error && <ErrorBox error={error.error} errorType={error.errorType} />}
      {final && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-gradient-to-br from-fuchsia-400 to-cyan-500 p-[1px]">
          <div className="rounded-2xl bg-ink-900/95 p-5">
            <div className="mb-2 font-display font-bold">✅ Final answer (stopReason: end_turn)</div>
            <Markdown text={final} />
          </div>
        </motion.div>
      )}
    </LabFrame>
  );
}
