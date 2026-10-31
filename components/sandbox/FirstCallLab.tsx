"use client";

import { useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Send, Trash2 } from "lucide-react";
import { LabFrame, FlowPulse, ModelSelect, ErrorBox } from "./LabFrame";
import { CodeTabs, JsonView, Markdown } from "@/components/ui";
import { codeFor, textOf, useConverse, type CallResult, type ConverseRequest } from "@/lib/sandbox";
import type { BMessage } from "@/lib/server/converse";
import { useStore } from "@/lib/store";

const PRESETS: Record<string, { system: string; prompt: string }> = {
  retail: {
    system:
      'You write product copy for ShopSphere: warm, upbeat, honest, no hype. Return ONLY JSON: {"title": str (max 60 chars), "bullets": [3 short strings], "description": str (max 80 words), "seo_keywords": [5 strings]}',
    prompt: "<spec>\nTrailFlask 2.0 | insulated steel bottle | 750 ml | keeps drinks cold 36 h | recycled steel | lifetime warranty | audience: weekend hikers\n</spec>",
  },
};

export default function FirstCallLab() {
  const params = useSearchParams();
  const preset = PRESETS[params.get("preset") ?? ""];
  const { completeObjective } = useStore();
  const { call, stage, busy, region } = useConverse();
  const [modelId, setModelId] = useState(params.get("model") ?? "us.amazon.nova-lite-v1:0");
  const [system, setSystem] = useState(preset?.system ?? "");
  const [prompt, setPrompt] = useState(preset?.prompt ?? "Explain Amazon Bedrock to a new teammate in 3 fun bullet points.");
  const [maxTokens, setMaxTokens] = useState(400);
  const [temperature, setTemperature] = useState(0.5);
  const [multiTurn, setMultiTurn] = useState(false);
  const [history, setHistory] = useState<BMessage[]>([]);
  const [result, setResult] = useState<CallResult | null>(null);
  const modelsUsed = useRef(new Set<string>());

  const req: ConverseRequest = useMemo(
    () => ({
      modelId,
      ...(system.trim() ? { system: [{ text: system.trim() }] } : {}),
      messages: [...(multiTurn ? history : []), { role: "user", content: [{ text: prompt }] }],
      inferenceConfig: { maxTokens, temperature },
    }),
    [modelId, system, prompt, maxTokens, temperature, multiTurn, history],
  );

  const run = async () => {
    const r = await call(req);
    setResult(r);
    if (r.response) {
      completeObjective("first-call", "run");
      if (system.trim()) completeObjective("first-call", "system");
      modelsUsed.current.add(modelId);
      if (modelsUsed.current.size >= 2) completeObjective("first-call", "switch");
      if (multiTurn) setHistory([...req.messages, r.response.output.message]);
    }
  };

  return (
    <LabFrame
      slug="first-call"
      side={
        <>
          <FlowPulse stage={stage} modelId={modelId} latency={result?.clientMs} />
          <CodeTabs tabs={codeFor(req, region)} />
          <JsonView title="➡️ Request (Converse)" value={req} />
          {result?.response && <JsonView title="⬅️ Response" value={result.response} />}
        </>
      }
    >
      <div className="glass space-y-4 p-5">
        <ModelSelect value={modelId} onChange={setModelId} />
        <div>
          <label className="label">System prompt (optional) — the model's job description</label>
          <textarea className="input min-h-[64px]" value={system} onChange={(e) => setSystem(e.target.value)} placeholder="e.g. You are a pirate who explains cloud computing. Arr!" />
        </div>
        <div>
          <label className="label">User message</label>
          <textarea className="input min-h-[90px]" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">
              maxTokens: <span className="text-amber-300">{maxTokens}</span>
            </label>
            <input type="range" min={20} max={2000} step={10} value={maxTokens} onChange={(e) => setMaxTokens(+e.target.value)} className="w-full" />
          </div>
          <div>
            <label className="label">
              temperature: <span className="text-amber-300">{temperature}</span>
            </label>
            <input type="range" min={0} max={1} step={0.05} value={temperature} onChange={(e) => setTemperature(+e.target.value)} className="w-full" />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button className="btn-primary" disabled={busy || !prompt.trim()} onClick={run}>
            <Send className="h-4 w-4" /> {busy ? "Calling Bedrock…" : "Send Converse request"}
          </button>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input type="checkbox" checked={multiTurn} onChange={(e) => setMultiTurn(e.target.checked)} /> Multi-turn (send history)
          </label>
          {multiTurn && history.length > 0 && (
            <button className="btn-ghost px-3 py-1.5 text-xs" onClick={() => setHistory([])}>
              <Trash2 className="h-3.5 w-3.5" /> Clear {history.length} msgs
            </button>
          )}
        </div>
        {multiTurn && <p className="text-xs text-slate-400">👀 Watch the request JSON: Converse is stateless, so your app re-sends the whole conversation every turn.</p>}
      </div>

      {result?.error && <ErrorBox error={result.error} errorType={result.errorType} />}
      {result?.response && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass p-5">
          <div className="mb-3 flex flex-wrap gap-2 text-xs">
            <span className="chip">stopReason: {result.response.stopReason}</span>
            <span className="chip">in {result.response.usage.inputTokens} tok</span>
            <span className="chip">out {result.response.usage.outputTokens} tok</span>
            <span className="chip">model latency {result.response.metrics.latencyMs} ms</span>
            <span className="chip border-fuchsia-300/30 text-fuchsia-200">{result.engine?.detail}</span>
          </div>
          <Markdown text={textOf(result.response)} />
          {result.response.stopReason === "max_tokens" && <p className="mt-3 text-xs text-amber-300">✂️ Truncated — raise maxTokens.</p>}
        </motion.div>
      )}
    </LabFrame>
  );
}
