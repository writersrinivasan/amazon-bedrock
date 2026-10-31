"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, FlaskConical, Search, Wand2 } from "lucide-react";
import clsx from "clsx";
import { MODELS, PROVIDERS, USE_CASE_LABELS, type BedrockModel, type Modality, type UseCase } from "@/lib/content/models";
import { DOCS } from "@/lib/content/modules";
import { CopyButton, GuideBanner, PageHeader } from "@/components/ui";
import { useStore } from "@/lib/store";
import { XP } from "@/lib/content/gamification";

export default function ModelsPage() {
  return (
    <Suspense>
      <ModelsInner />
    </Suspense>
  );
}

const MODALITIES: Modality[] = ["text", "image", "video", "audio", "document", "embedding"];

function ModelsInner() {
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [provider, setProvider] = useState("All");
  const [useCase, setUseCase] = useState<UseCase | "all">("all");
  const [modality, setModality] = useState<Modality | "all">("all");

  const list = useMemo(() => {
    const t = q.toLowerCase();
    return MODELS.filter(
      (m) =>
        (provider === "All" || m.provider === provider) &&
        (useCase === "all" || m.useCases.includes(useCase)) &&
        (modality === "all" || m.input.includes(modality) || m.output.includes(modality)) &&
        (!t || `${m.name} ${m.provider} ${m.modelId} ${m.tagline} ${m.useCases.join(" ")}`.toLowerCase().includes(t)),
    );
  }, [q, provider, useCase, modality]);

  return (
    <div>
      <PageHeader emoji="🦁" title="The Model Zoo" subtitle={`${MODELS.length} foundation models on Amazon Bedrock — what they do, when to use them, their IDs and where to find them.`} gradient="from-lime-300 via-emerald-500 to-cyan-600">
        <a href={DOCS.catalog} target="_blank" rel="noreferrer" className="btn-ghost shrink-0">
          <ExternalLink className="h-4 w-4" /> Open console catalog
        </a>
      </PageHeader>
      <GuideBanner what="the model catalog." how="Use the Model Finder if you're unsure, or filter the cards below. Copy a model ID and paste it into any sandbox lab." next={{ label: "Compass", href: "/compass" }} />

      <WhereToGet />
      <Finder />

      {/* Filters */}
      <div className="glass mb-6 mt-10 grid gap-3 p-4 md:grid-cols-[1fr_auto_auto_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input className="input pl-9" placeholder="Search models, IDs, use cases…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="input" value={provider} onChange={(e) => setProvider(e.target.value)} aria-label="Provider">
          <option>All</option>
          {Object.keys(PROVIDERS).map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
        <select className="input" value={useCase} onChange={(e) => setUseCase(e.target.value as UseCase | "all")} aria-label="Use case">
          <option value="all">All use cases</option>
          {Object.entries(USE_CASE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <select className="input" value={modality} onChange={(e) => setModality(e.target.value as Modality | "all")} aria-label="Modality">
          <option value="all">Any modality</option>
          {MODALITIES.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4 text-sm text-slate-400">
        Showing {list.length} model{list.length === 1 ? "" : "s"}
      </div>
      <motion.div layout className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence>
          {list.map((m) => (
            <ModelCard key={m.id} m={m} />
          ))}
        </AnimatePresence>
      </motion.div>

      <p className="mt-10 rounded-2xl border border-amber-300/20 bg-amber-400/[0.06] p-4 text-sm text-amber-100">
        ⚠️ AWS adds and retires models often, and availability differs per Region. IDs here reflect the course materials — always confirm the exact model ID and inference profile in the{" "}
        <a className="underline" href={DOCS.catalog} target="_blank" rel="noreferrer">
          Bedrock console model catalog
        </a>{" "}
        or the{" "}
        <a className="underline" href={DOCS.models} target="_blank" rel="noreferrer">
          supported models docs
        </a>
        .
      </p>
    </div>
  );
}

function WhereToGet() {
  const steps = [
    { e: "🔑", t: "Sign in", d: "AWS console → search “Bedrock”." },
    { e: "🗂️", t: "Model catalog", d: "Left menu → Model catalog. Filter by provider or modality." },
    { e: "📇", t: "Open a model card", d: "See model ID, Regions, pricing, and inference profiles." },
    { e: "✅", t: "Enable if asked", d: "Some providers need a one-time form or Marketplace subscribe." },
    { e: "🎮", t: "Try in Playground", d: "Open in playground to test with zero code." },
    { e: "💻", t: "Call via API", d: "Use the model ID in Converse / InvokeModel." },
  ];
  return (
    <div className="glass p-5">
      <div className="font-display text-lg font-bold">📍 Where do I actually get a model?</div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {steps.map((s, i) => (
          <div key={s.t} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">{s.e}</span>
              <span className="font-mono text-xs text-slate-500">0{i + 1}</span>
            </div>
            <div className="mt-1 text-sm font-semibold">{s.t}</div>
            <div className="text-xs text-slate-400">{s.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const Meter = ({ n, max, char, color }: { n: number; max: number; char: string; color: string }) => (
  <span className="font-mono text-xs tracking-tight">
    <span className={color}>{char.repeat(n)}</span>
    <span className="text-white/15">{char.repeat(max - n)}</span>
  </span>
);

function ModelCard({ m }: { m: BedrockModel }) {
  const p = PROVIDERS[m.provider];
  const sandboxable = m.api === "Converse";
  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="glass flex flex-col overflow-hidden">
      <div className={clsx("h-1.5 bg-gradient-to-r", p.color)} />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-xs font-semibold text-slate-400">
              {p.emoji} {m.provider}
            </div>
            <div className="font-display text-lg font-bold">{m.name}</div>
          </div>
          <span className="chip shrink-0">{m.api}</span>
        </div>
        <p className="mt-1 text-sm text-slate-300">{m.tagline}</p>

        <div className="mt-3 flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-1.5">
          <code className="flex-1 truncate font-mono text-xs text-amber-200">{m.modelId}</code>
          <CopyButton text={m.modelId} />
        </div>
        {m.profileHint && <div className="mt-1 truncate font-mono text-[11px] text-slate-500">profile: {m.profileHint}</div>}

        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[11px] text-slate-400">
          <div className="rounded-lg bg-white/[0.03] p-1.5">
            Cost
            <br />
            <Meter n={m.cost} max={4} char="$" color="text-emerald-300" />
          </div>
          <div className="rounded-lg bg-white/[0.03] p-1.5">
            Speed
            <br />
            <Meter n={m.speed} max={3} char="⚡" color="" />
          </div>
          <div className="rounded-lg bg-white/[0.03] p-1.5">
            Power
            <br />
            <Meter n={m.quality} max={4} char="★" color="text-amber-300" />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
          <span className="chip">
            in: {m.input.join(", ")} → out: {m.output.join(", ")}
          </span>
          {m.context && <span className="chip">ctx {m.context}</span>}
        </div>

        <div className="mt-3 space-y-2 text-sm">
          <div className="rounded-xl bg-emerald-400/[0.07] p-2.5 text-emerald-50">
            <span className="font-semibold text-emerald-300">✅ Use when: </span>
            {m.whenToUse}
          </div>
          <div className="rounded-xl bg-rose-400/[0.07] p-2.5 text-rose-50">
            <span className="font-semibold text-rose-300">🚫 Skip when: </span>
            {m.whenNot}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 pt-1 text-xs">
          {sandboxable && (
            <Link href={`/sandbox/first-call?model=${encodeURIComponent(m.profileHint ?? m.modelId)}`} className="btn-primary px-3 py-1.5 text-xs">
              <FlaskConical className="h-3.5 w-3.5" /> Try in sandbox
            </Link>
          )}
          <a href={p.url} target="_blank" rel="noreferrer" className="btn-ghost px-3 py-1.5 text-xs">
            Provider page <ExternalLink className="h-3 w-3" />
          </a>
          <a href={DOCS.params} target="_blank" rel="noreferrer" className="btn-ghost px-3 py-1.5 text-xs">
            Parameters <ExternalLink className="h-3 w-3" />
          </a>
          <a href={DOCS.pricing} target="_blank" rel="noreferrer" className="btn-ghost px-3 py-1.5 text-xs">
            Pricing <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}

// ── Model Finder wizard ──────────────────────────────────────────────────────
const TASKS: { id: UseCase; label: string }[] = [
  { id: "chat", label: "💬 Chatbot / assistant" },
  { id: "rag", label: "📚 Q&A over my documents" },
  { id: "extraction", label: "🧾 Extract / classify data" },
  { id: "summarization", label: "📝 Summarize long content" },
  { id: "coding", label: "👩‍💻 Write or review code" },
  { id: "agents", label: "🤖 Agent that uses tools" },
  { id: "reasoning", label: "🧠 Hard reasoning / analysis" },
  { id: "vision", label: "👁️ Understand images or video" },
  { id: "image-gen", label: "🎨 Generate images" },
  { id: "video-gen", label: "🎬 Generate video" },
  { id: "speech", label: "🎙️ Voice conversations" },
  { id: "embeddings", label: "🔢 Semantic search / embeddings" },
];

function Finder() {
  const { award } = useStore();
  const [task, setTask] = useState<UseCase | null>(null);
  const [priority, setPriority] = useState<"cost" | "speed" | "quality" | null>(null);
  const [lang, setLang] = useState(false);

  const results = useMemo(() => {
    if (!task || !priority) return [];
    return MODELS.filter((m) => m.useCases.includes(task))
      .map((m) => {
        let s = m.quality * 1.2;
        if (priority === "cost") s += (5 - m.cost) * 2;
        if (priority === "speed") s += m.speed * 2.5;
        if (priority === "quality") s += m.quality * 2;
        if (lang && m.useCases.includes("multilingual")) s += 2;
        return { m, s };
      })
      .sort((a, b) => b.s - a.s)
      .slice(0, 3);
  }, [task, priority, lang]);

  const reason = (m: BedrockModel) => {
    const bits = [];
    if (priority === "cost" && m.cost <= 2) bits.push("budget-friendly");
    if (priority === "speed" && m.speed === 3) bits.push("very low latency");
    if (priority === "quality" && m.quality >= 3) bits.push("top-tier quality");
    if (m.context) bits.push(`${m.context} context`);
    if (m.input.includes("image")) bits.push("accepts images");
    return bits.join(" · ");
  };

  return (
    <div id="finder" className="relative mt-6 scroll-mt-24 overflow-hidden rounded-3xl border border-fuchsia-300/20 bg-gradient-to-br from-fuchsia-600/15 via-violet-600/10 to-cyan-500/10 p-5 sm:p-7">
      <div className="flex items-center gap-2 font-display text-xl font-bold">
        <Wand2 className="h-5 w-5 text-fuchsia-300" /> Model Finder
      </div>
      <p className="mt-1 text-sm text-slate-300">Answer two quick questions and get a shortlist to evaluate.</p>

      <div className="mt-5">
        <div className="label">1 · What are you building?</div>
        <div className="flex flex-wrap gap-2">
          {TASKS.map((t) => (
            <button key={t.id} onClick={() => setTask(t.id)} className={clsx("rounded-full border px-3 py-1.5 text-sm transition", task === t.id ? "border-fuchsia-300 bg-fuchsia-400/25 text-white" : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10")}>
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-5 flex flex-wrap items-end gap-6">
        <div>
          <div className="label">2 · What matters most?</div>
          <div className="flex gap-2">
            {(
              [
                ["cost", "💰 Lowest cost"],
                ["speed", "⚡ Fastest"],
                ["quality", "🏆 Best quality"],
              ] as const
            ).map(([k, l]) => (
              <button key={k} onClick={() => setPriority(k)} className={clsx("rounded-full border px-3 py-1.5 text-sm transition", priority === k ? "border-amber-300 bg-amber-400/25 text-white" : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10")}>
                {l}
              </button>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" checked={lang} onChange={(e) => setLang(e.target.checked)} /> Needs many languages
        </label>
      </div>

      {results.length > 0 && (
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {results.map(({ m }, i) => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="rounded-2xl border border-white/10 bg-ink-900/80 p-4" onAnimationComplete={() => i === 0 && award("model-finder", XP.modelFinder, "Used the Model Finder", "💘")}>
              <div className="text-xs font-bold text-amber-300">{["🥇 Top pick", "🥈 Runner-up", "🥉 Also consider"][i]}</div>
              <div className="mt-1 font-display font-bold">{m.name}</div>
              <div className="text-xs text-slate-400">{m.provider}</div>
              <code className="mt-2 block truncate font-mono text-[11px] text-amber-200">{m.profileHint ?? m.modelId}</code>
              <div className="mt-2 text-xs text-slate-300">{reason(m)}</div>
              {m.api === "Converse" && (
                <Link href={`/sandbox/first-call?model=${encodeURIComponent(m.profileHint ?? m.modelId)}`} className="mt-3 inline-block text-xs font-semibold text-cyan-300 hover:underline">
                  Test it in the sandbox →
                </Link>
              )}
            </motion.div>
          ))}
        </div>
      )}
      {task && priority && results.length === 0 && <div className="mt-6 text-sm text-slate-400">No direct match — try another task.</div>}
      {results.length > 0 && <p className="mt-4 text-xs text-slate-400">💡 Next: run your top 2 picks on 20 real prompts (Playground compare mode or Bedrock Model Evaluation) and keep the cheapest that passes.</p>}
    </div>
  );
}
