"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Settings2 } from "lucide-react";
import clsx from "clsx";
import { getLab } from "@/lib/content/labs";
import { getModule } from "@/lib/content/modules";
import { useStore } from "@/lib/store";
import type { FlowStage } from "@/lib/sandbox";
import { SANDBOX_MODELS } from "@/lib/content/models";

export function LabFrame({ slug, children, side }: { slug: string; children: ReactNode; side: ReactNode }) {
  const lab = getLab(slug)!;
  const mod = getModule(lab.module);
  const { progress } = useStore();
  const done = progress.labs[slug] ?? [];

  return (
    <div>
      <Link href="/sandbox" className="mb-4 inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-white">
        <ArrowLeft className="h-3 w-3" /> All labs
      </Link>
      <div className={clsx("mb-6 rounded-3xl bg-gradient-to-br p-[1px]", lab.gradient)}>
        <div className="grid gap-6 rounded-3xl bg-ink-950/85 p-5 sm:p-7 lg:grid-cols-[1fr_auto]">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-4xl">{lab.emoji}</span>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Sandbox lab · {lab.minutes} min</div>
                <h1 className="font-display text-2xl font-bold sm:text-3xl">{lab.title}</h1>
              </div>
            </div>
            <p className="mt-3 max-w-2xl text-slate-300">{lab.summary}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="chip border-orange-300/30 bg-orange-400/10 text-orange-200">🟧 Real feature: {lab.realWorld}</span>
              {mod && (
                <Link href={`/learn/${mod.slug}`} className="chip hover:bg-white/10">
                  📖 Theory: Module {mod.num}
                </Link>
              )}
            </div>
          </div>
          <div className="min-w-[260px] rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Missions</div>
            <ul className="mt-2 space-y-2">
              {lab.objectives.map((o) => {
                const ok = done.includes(o.id);
                return (
                  <li key={o.id} className="flex items-start gap-2 text-sm">
                    <motion.span animate={ok ? { scale: [1, 1.3, 1] } : {}} className={clsx("mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px]", ok ? "bg-emerald-400 text-ink-950" : "border border-white/20")}>
                      {ok && <Check className="h-3 w-3" />}
                    </motion.span>
                    <span className={clsx(ok ? "text-slate-400 line-through" : "text-slate-200")}>{o.text}</span>
                    <span className="ml-auto shrink-0 font-mono text-xs text-amber-300">+{o.xp}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      <ModeBar />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-5">{children}</div>
        <div className="min-w-0 space-y-4 xl:sticky xl:top-20 xl:self-start">
          <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400">🔬 Under the hood — live</div>
          {side}
        </div>
      </div>
    </div>
  );
}

export function ModeBar() {
  const { settings, updateSettings } = useStore();
  const [server, setServer] = useState<{ serverGroq: boolean; serverAws: boolean } | null>(null);
  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then(setServer)
      .catch(() => setServer(null));
  }, []);
  const hasGroq = !!settings.groqKey || !!server?.serverGroq;
  const sim = settings.mode === "simulate";
  return (
    <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 sm:flex-row sm:items-center">
      <div className="flex rounded-xl bg-black/30 p-1 text-xs font-semibold">
        <button onClick={() => updateSettings({ mode: "simulate" })} className={clsx("rounded-lg px-3 py-1.5 transition", sim ? "bg-fuchsia-500/80 text-white" : "text-slate-400 hover:text-white")}>
          🧪 Simulated
        </button>
        <button onClick={() => updateSettings({ mode: "live" })} className={clsx("rounded-lg px-3 py-1.5 transition", !sim ? "bg-emerald-500/80 text-white" : "text-slate-400 hover:text-white")}>
          🟢 Live Bedrock
        </button>
      </div>
      <div className="flex-1 text-xs text-slate-400">
        {sim ? (
          hasGroq ? (
            <>Requests use the real Bedrock Converse format; answers come from Groq ({settings.groqModel}) and are shaped exactly like Bedrock responses.</>
          ) : (
            <>No Groq key yet → <b className="text-slate-200">offline demo</b> responses. The request/response JSON and code are still 100% real.</>
          )
        ) : (
          <>Calls the real Amazon Bedrock Runtime in <b className="text-slate-200">{settings.awsRegion}</b> using {settings.awsAccessKeyId ? "the credentials in Settings" : "the server's AWS credential chain"}. Usage is billed to that AWS account.</>
        )}
      </div>
      <Link href="/settings" className="btn-ghost shrink-0 px-3 py-1.5 text-xs">
        <Settings2 className="h-3.5 w-3.5" /> Keys & mode
      </Link>
    </div>
  );
}

const STAGES: { id: FlowStage; emoji: string; label: string; sub: string }[] = [
  { id: "auth", emoji: "🔐", label: "SigV4 + IAM", sub: "bedrock:InvokeModel" },
  { id: "runtime", emoji: "🪨", label: "Bedrock Runtime", sub: "POST /model/{id}/converse" },
  { id: "model", emoji: "🧠", label: "Foundation model", sub: "tokens in → tokens out" },
  { id: "done", emoji: "📦", label: "Response", sub: "output · usage · metrics" },
];

export function FlowPulse({ stage, modelId, latency }: { stage: FlowStage; modelId?: string; latency?: number }) {
  const order: FlowStage[] = ["auth", "runtime", "model", "done"];
  const idx = order.indexOf(stage);
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b0b18] p-4">
      <div className="mb-3 flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-300">Request journey</span>
        {stage === "done" && latency !== undefined && <span className="font-mono text-emerald-300">{latency} ms round-trip</span>}
        {stage === "error" && <span className="font-mono text-rose-300">error ✖</span>}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {STAGES.map((s, i) => {
          const active = stage !== "error" && idx === i && stage !== "done";
          const passed = stage === "done" || (idx > i && stage !== "error");
          return (
            <div key={s.id} className="relative">
              <motion.div
                animate={active ? { scale: [1, 1.06, 1] } : { scale: 1 }}
                transition={{ repeat: active ? Infinity : 0, duration: 0.8 }}
                className={clsx(
                  "rounded-xl border p-2 text-center transition",
                  passed ? "border-emerald-300/40 bg-emerald-400/10" : active ? "border-fuchsia-300/60 bg-fuchsia-400/15 shadow-lg shadow-fuchsia-500/20" : "border-white/10 bg-white/[0.02]",
                  stage === "error" && i === Math.max(0, idx) && "border-rose-300/60 bg-rose-400/10",
                )}
              >
                <div className="text-xl">{s.emoji}</div>
                <div className="mt-0.5 text-[11px] font-semibold leading-tight">{s.label}</div>
                <div className="hidden text-[9px] leading-tight text-slate-500 sm:block">{s.id === "model" && modelId ? modelId.split(".").slice(-1)[0].slice(0, 22) : s.sub}</div>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ModelSelect({ value, onChange, label = "Model" }: { value: string; onChange: (v: string) => void; label?: string }) {
  const known = SANDBOX_MODELS.some((m) => m.value === value);
  return (
    <div>
      <label className="label">{label}</label>
      <select className="input" value={known ? value : "__custom"} onChange={(e) => e.target.value !== "__custom" && onChange(e.target.value)}>
        {SANDBOX_MODELS.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
        {!known && <option value="__custom">{value}</option>}
      </select>
    </div>
  );
}

export function ErrorBox({ error, errorType }: { error: string; errorType?: string }) {
  const hint =
    /AccessDenied/i.test(errorType ?? error)
      ? "Your IAM identity can't invoke this model, or model access isn't enabled. Check the Model catalog and your IAM policy."
      : /on-demand throughput|inference profile/i.test(error)
        ? "This model needs a cross-Region inference profile ID (e.g. us.… or global.…). Pick a profile ID from the Models page."
        : /credential|token/i.test(error)
          ? "No valid AWS credentials. Add them in Settings, or run the app with an AWS profile/role."
          : /Throttl/i.test(errorType ?? error)
            ? "You hit a quota. Wait a moment, use an inference profile, or request a quota increase."
            : /Groq/i.test(error)
              ? "The Groq simulation key/model was rejected. Re-check the key and model in Settings."
              : "Check the model ID, Region and your keys in Settings.";
  return (
    <div className="rounded-2xl border border-rose-300/30 bg-rose-500/10 p-4 text-sm">
      <div className="font-semibold text-rose-200">❌ {errorType ?? "Error"}</div>
      <div className="mt-1 break-words font-mono text-xs text-rose-100/90">{error}</div>
      <div className="mt-2 text-rose-100">💡 {hint}</div>
    </div>
  );
}
