"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import clsx from "clsx";
import { LabFrame, FlowPulse, ModelSelect, ErrorBox } from "./LabFrame";
import { CodeTabs, JsonView, Markdown } from "@/components/ui";
import { codeFor, textOf, useConverse, type CallResult, type ConverseRequest } from "@/lib/sandbox";
import { useStore } from "@/lib/store";

const COLORS = ["from-cyan-400 to-blue-600", "from-violet-400 to-fuchsia-600", "from-orange-400 to-rose-600"];
const MOODS = (t: number) => (t <= 0.2 ? "🧊 Focused" : t < 0.8 ? "🙂 Balanced" : "🔥 Creative");

export default function ParamLab() {
  const { completeObjective } = useStore();
  const { call, stage, busy, region } = useConverse();
  const [modelId, setModelId] = useState("us.amazon.nova-lite-v1:0");
  const [prompt, setPrompt] = useState("Invent a name and one-line slogan for a coffee shop run by robots.");
  const [temps, setTemps] = useState([0, 0.6, 1]);
  const [maxTokens, setMaxTokens] = useState(200);
  const [topP, setTopP] = useState(0.9);
  const [stop, setStop] = useState("");
  const [results, setResults] = useState<(CallResult | null)[]>([null, null, null]);

  const reqFor = (t: number): ConverseRequest => ({
    modelId,
    messages: [{ role: "user", content: [{ text: prompt }] }],
    inferenceConfig: { maxTokens, temperature: t, topP, ...(stop.trim() ? { stopSequences: stop.split(",").map((s) => s.trim()).filter(Boolean) } : {}) },
  });

  const run = async () => {
    setResults([null, null, null]);
    const rs = await Promise.all(temps.map((t) => call(reqFor(t))));
    setResults(rs);
    if (rs.some((r) => r.response)) {
      if (Math.min(...temps) <= 0.2 && Math.max(...temps) >= 0.9) completeObjective("param-playground", "sweep");
      if (maxTokens <= 40 && rs.some((r) => r.response?.stopReason === "max_tokens")) completeObjective("param-playground", "short");
      if (stop.trim()) completeObjective("param-playground", "stop");
    }
  };

  return (
    <LabFrame
      slug="param-playground"
      side={
        <>
          <FlowPulse stage={stage} modelId={modelId} latency={results[0]?.clientMs} />
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">
            <div className="font-semibold text-white">What's changing?</div>
            Only <code className="text-amber-200">inferenceConfig.temperature</code> differs between the three calls. Same model, same prompt — different sampling randomness.
          </div>
          <CodeTabs tabs={codeFor(reqFor(temps[2]), region)} />
          <JsonView title={`➡️ Request (column 3, temperature ${temps[2]})`} value={reqFor(temps[2])} />
        </>
      }
    >
      <div className="glass space-y-4 p-5">
        <ModelSelect value={modelId} onChange={setModelId} />
        <div>
          <label className="label">Prompt</label>
          <textarea className="input min-h-[70px]" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {temps.map((t, i) => (
            <div key={i}>
              <label className="label">
                Column {i + 1} temperature: <span className="text-amber-300">{t}</span>
              </label>
              <input type="range" min={0} max={1} step={0.05} value={t} onChange={(e) => setTemps((ts) => ts.map((x, j) => (j === i ? +e.target.value : x)))} className="w-full" />
            </div>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label">
              maxTokens: <span className="text-amber-300">{maxTokens}</span>
            </label>
            <input type="range" min={10} max={800} step={5} value={maxTokens} onChange={(e) => setMaxTokens(+e.target.value)} className="w-full" />
          </div>
          <div>
            <label className="label">
              topP: <span className="text-amber-300">{topP}</span>
            </label>
            <input type="range" min={0.1} max={1} step={0.05} value={topP} onChange={(e) => setTopP(+e.target.value)} className="w-full" />
          </div>
          <div>
            <label className="label">stopSequences (comma-separated)</label>
            <input className="input" value={stop} onChange={(e) => setStop(e.target.value)} placeholder='e.g. "." or "\n"' />
          </div>
        </div>
        <button className="btn-primary" disabled={busy} onClick={run}>
          <Play className="h-4 w-4" /> {busy ? "Running 3 calls…" : "Run temperature sweep"}
        </button>
        <p className="text-xs text-slate-400">💡 Tip: run it twice. Column 1 (temp 0) should barely change; column 3 should surprise you.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {temps.map((t, i) => {
          const r = results[i];
          return (
            <motion.div key={i} layout className={clsx("rounded-2xl bg-gradient-to-br p-[1px]", COLORS[i])}>
              <div className="h-full min-h-[180px] rounded-2xl bg-ink-900/95 p-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold">{MOODS(t)}</span>
                  <span className="font-mono text-slate-400">T={t}</span>
                </div>
                <div className="mt-3">
                  {busy && !r && <div className="h-20 animate-pulse rounded-xl bg-white/5" />}
                  {r?.error && <ErrorBox error={r.error} errorType={r.errorType} />}
                  {r?.response && (
                    <>
                      <Markdown text={textOf(r.response)} />
                      <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
                        <span className={clsx("chip", r.response.stopReason === "max_tokens" && "border-amber-300/50 text-amber-200")}>{r.response.stopReason}</span>
                        <span className="chip">{r.response.usage.outputTokens} out tok</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </LabFrame>
  );
}
