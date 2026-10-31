"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Swords, ThumbsUp } from "lucide-react";
import clsx from "clsx";
import { LabFrame, FlowPulse, ModelSelect, ErrorBox } from "./LabFrame";
import { CodeTabs, JsonView, Markdown } from "@/components/ui";
import { codeFor, textOf, useConverse, type CallResult, type ConverseRequest } from "@/lib/sandbox";
import { useStore } from "@/lib/store";

type Preset = { id: string; label: string; task: string; input: string; examples: [string, string][]; schema: string };

const PRESETS: Preset[] = [
  {
    id: "ticket",
    label: "🎫 Triage a support ticket",
    task: "Classify this support ticket.",
    input: "Hi, I was charged twice for my subscription this month and nobody has answered my emails for 4 days. This is really frustrating. Order #A-1932.",
    examples: [
      ["The app crashes when I upload a photo.", '{"category": "bug", "sentiment": "neutral", "urgency": "medium"}'],
      ["Love the new dark mode, great job!", '{"category": "feedback", "sentiment": "positive", "urgency": "low"}'],
    ],
    schema: '{"category": "billing"|"bug"|"account"|"feedback"|"other", "sentiment": "positive"|"neutral"|"negative", "urgency": "low"|"medium"|"high", "summary": string}',
  },
  {
    id: "actions",
    label: "📋 Extract meeting action items",
    task: "Get the action items from these meeting notes.",
    input: "Priya will draft the Bedrock cost report by Friday. Tom said he might look into guardrails, not sure when. We agreed Lee owns the RAG demo for next Tuesday's town hall.",
    examples: [["Sam to send the deck tomorrow.", '[{"owner": "Sam", "task": "Send the deck", "due": "tomorrow"}]']],
    schema: '[{"owner": string, "task": string, "due": string|null, "confidence": "firm"|"tentative"}]',
  },
  {
    id: "product",
    label: "🛍️ Write a product blurb",
    task: "Write a product description.",
    input: "Product: TrailFlask 2.0 — insulated bottle, keeps drinks cold 36h, 750ml, recycled steel, lifetime warranty. Audience: weekend hikers.",
    examples: [["Product: SnugSocks — merino, anti-blister. Audience: runners.", "Blister-free miles start here. SnugSocks wrap your feet in breathable merino so you can focus on the finish line. 🏃"]],
    schema: '{"headline": string (max 8 words), "body": string (max 40 words), "emoji": string}',
  },
];

type Strategy = { id: string; name: string; emoji: string; color: string; build: (p: Preset, input: string) => Pick<ConverseRequest, "system" | "messages"> };

const STRATEGIES: Strategy[] = [
  {
    id: "zero",
    name: "Zero-shot",
    emoji: "🥚",
    color: "from-slate-300 to-slate-500",
    build: (p, input) => ({ messages: [{ role: "user", content: [{ text: `${p.task}\n\n${input}` }] }] }),
  },
  {
    id: "few",
    name: "Few-shot",
    emoji: "🧩",
    color: "from-cyan-400 to-violet-500",
    build: (p, input) => ({
      messages: [
        ...p.examples.flatMap(([q, a]) => [
          { role: "user" as const, content: [{ text: `${p.task}\n\n${q}` }] },
          { role: "assistant" as const, content: [{ text: a }] },
        ]),
        { role: "user", content: [{ text: `${p.task}\n\n${input}` }] },
      ],
    }),
  },
  {
    id: "structured",
    name: "Role + tags + schema",
    emoji: "🥋",
    color: "from-rose-400 to-amber-400",
    build: (p, input) => ({
      system: [{ text: "You are a meticulous operations analyst. You only output valid JSON. Never invent facts that are not in the input." }],
      messages: [
        {
          role: "user",
          content: [{ text: `${p.task}\n\n<input>\n${input}\n</input>\n\nReturn ONLY JSON matching this schema:\n${p.schema}\nIf something is unknown, use null.` }],
        },
      ],
    }),
  },
];

export default function PromptLab() {
  const { completeObjective } = useStore();
  const { call, stage, busy, region } = useConverse();
  const [modelId, setModelId] = useState("us.amazon.nova-lite-v1:0");
  const [presetId, setPresetId] = useState(PRESETS[0].id);
  const preset = PRESETS.find((p) => p.id === presetId)!;
  const [input, setInput] = useState(preset.input);
  const [results, setResults] = useState<(CallResult | null)[]>([null, null, null]);
  const [vote, setVote] = useState<string | null>(null);
  const [inspect, setInspect] = useState(2);

  const reqs = useMemo(() => STRATEGIES.map((s) => ({ modelId, ...s.build(preset, input), inferenceConfig: { maxTokens: 400, temperature: 0.2 } }) as ConverseRequest), [modelId, preset, input]);

  const battle = async () => {
    setVote(null);
    setResults([null, null, null]);
    const rs = await Promise.all(reqs.map((r) => call(r)));
    setResults(rs);
    if (rs.some((r) => r.response)) {
      completeObjective("prompt-dojo", "battle");
      if (input.trim() !== preset.input.trim()) completeObjective("prompt-dojo", "custom");
    }
  };

  return (
    <LabFrame
      slug="prompt-dojo"
      side={
        <>
          <FlowPulse stage={stage} modelId={modelId} latency={results[inspect]?.clientMs} />
          <div className="flex gap-1 rounded-xl bg-black/30 p-1 text-xs">
            {STRATEGIES.map((s, i) => (
              <button key={s.id} onClick={() => setInspect(i)} className={clsx("flex-1 rounded-lg px-2 py-1.5 font-semibold", inspect === i ? "bg-white/15 text-white" : "text-slate-400")}>
                {s.emoji} {s.name}
              </button>
            ))}
          </div>
          <JsonView title={`➡️ Request: ${STRATEGIES[inspect].name}`} value={reqs[inspect]} />
          <CodeTabs tabs={codeFor(reqs[inspect], region)} />
        </>
      }
    >
      <div className="glass space-y-4 p-5">
        <ModelSelect value={modelId} onChange={setModelId} />
        <div>
          <label className="label">Pick a task</label>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setPresetId(p.id);
                  setInput(p.input);
                  setResults([null, null, null]);
                }}
                className={clsx("rounded-full border px-3 py-1.5 text-sm", p.id === presetId ? "border-rose-300 bg-rose-400/20" : "border-white/10 bg-white/5 hover:bg-white/10")}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label">Input text — edit it to make it your own (mission 3)</label>
          <textarea className="input min-h-[90px]" value={input} onChange={(e) => setInput(e.target.value)} />
        </div>
        <button className="btn-primary" disabled={busy || !input.trim()} onClick={battle}>
          <Swords className="h-4 w-4" /> {busy ? "Fighting…" : "Start 3-way prompt battle"}
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {STRATEGIES.map((s, i) => {
          const r = results[i];
          return (
            <motion.div key={s.id} layout className={clsx("rounded-2xl bg-gradient-to-br p-[1px]", vote === s.id ? "from-amber-300 to-emerald-400" : s.color)}>
              <div className="flex h-full min-h-[200px] flex-col rounded-2xl bg-ink-900/95 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold">
                    {s.emoji} {s.name}
                  </span>
                  {vote === s.id && <span className="text-lg">🏆</span>}
                </div>
                <div className="mt-3 flex-1">
                  {busy && !r && <div className="h-24 animate-pulse rounded-xl bg-white/5" />}
                  {r?.error && <ErrorBox error={r.error} errorType={r.errorType} />}
                  {r?.response && <Markdown text={textOf(r.response)} />}
                </div>
                {r?.response && (
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      {r.response.usage.inputTokens} in · {r.response.usage.outputTokens} out
                    </span>
                    <button
                      className="btn-ghost px-3 py-1 text-xs"
                      onClick={() => {
                        setVote(s.id);
                        completeObjective("prompt-dojo", "vote");
                      }}
                    >
                      <ThumbsUp className="h-3.5 w-3.5" /> Winner
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
      {vote && (
        <div className="rounded-2xl border border-amber-300/30 bg-amber-400/10 p-4 text-sm text-amber-50">
          🥋 <b>Sensei says:</b> notice the token counts — few-shot and structured prompts cost more input tokens but usually return consistent, parseable output. In production that consistency is worth it (and prompt caching makes the repeated prefix cheap).
        </div>
      )}
    </LabFrame>
  );
}
