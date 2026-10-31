"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, RotateCcw } from "lucide-react";
import clsx from "clsx";
import { DOCS } from "@/lib/content/modules";
import { GuideBanner, PageHeader } from "@/components/ui";
import { useStore } from "@/lib/store";
import { XP } from "@/lib/content/gamification";

type Goal = {
  id: string;
  emoji: string;
  goal: string;
  use: string;
  why: string;
  whenNot: string;
  api: string;
  console: string;
  module?: string;
  lab?: string;
  docs: string;
  color: string;
};

const GOALS: Goal[] = [
  { id: "chat", emoji: "💬", goal: "Add a chatbot / AI feature to my app", use: "Converse API (ConverseStream for chat UIs)", why: "One request format for every chat model; swap models by changing modelId; supports images, documents and tools.", whenNot: "Embeddings or image generation → use InvokeModel.", api: "bedrock-runtime: Converse, ConverseStream", console: "Playgrounds → Chat / Text", module: "talking-to-models", lab: "first-call", docs: DOCS.converse, color: "from-violet-500 to-indigo-500" },
  { id: "docs", emoji: "📚", goal: "Answer questions from our documents", use: "Knowledge Bases (managed RAG)", why: "Handles ingestion, chunking, embeddings, vector storage and citations. Re-sync when docs change — no retraining.", whenNot: "Teaching tone/format → fine-tuning. Tiny docs that fit in the prompt → just put them in context (with prompt caching).", api: "bedrock-agent-runtime: Retrieve, RetrieveAndGenerate", console: "Build → Knowledge Bases", module: "knowledge-bases", lab: "rag-studio", docs: DOCS.kb, color: "from-amber-400 to-rose-500" },
  { id: "safe", emoji: "🛡️", goal: "Keep answers safe, on-topic and PII-free", use: "Guardrails", why: "Content filters, denied topics, word filters, PII masking, grounding checks and automated reasoning — reusable across models.", whenNot: "It complements, not replaces, IAM and app-level authorization.", api: "Converse guardrailConfig, ApplyGuardrail", console: "Safeguards → Guardrails", module: "guardrails", lab: "guardrail-gym", docs: DOCS.guardrails, color: "from-emerald-400 to-cyan-500" },
  { id: "act", emoji: "🤖", goal: "Let AI take actions / call our APIs", use: "Tool use → Bedrock Agents → AgentCore", why: "Converse tool use for simple loops; Bedrock Agents for managed orchestration with Lambda action groups; AgentCore to run any framework (LangGraph, Strands…) in production.", whenNot: "Fixed, predictable steps → Flows (cheaper, deterministic).", api: "Converse toolConfig, bedrock-agent-runtime: InvokeAgent, AgentCore Runtime", console: "Build → Agents · AgentCore", module: "agents", lab: "agent-workshop", docs: DOCS.agents, color: "from-fuchsia-500 to-cyan-500" },
  { id: "flow", emoji: "🔀", goal: "Run the same multi-step AI pipeline every time", use: "Bedrock Flows + Prompt Management", why: "Visual builder chaining prompts, KBs, Lambda, conditions and iterators; versioned and deployable via alias.", whenNot: "When the AI needs to decide the steps → agents.", api: "bedrock-agent-runtime: InvokeFlow", console: "Build → Flows", docs: "https://docs.aws.amazon.com/bedrock/latest/userguide/flows.html", color: "from-sky-400 to-blue-600" },
  { id: "bulk", emoji: "📦", goal: "Process millions of records cheaply", use: "Batch inference", why: "JSONL in S3 → results in S3, discounted vs. on-demand for supported models, no throttling headaches.", whenNot: "Users waiting for answers in real time.", api: "bedrock: CreateModelInvocationJob", console: "Infer → Batch inference", module: "production", docs: DOCS.batch, color: "from-yellow-400 to-orange-500" },
  { id: "style", emoji: "🎯", goal: "Make a model follow our style or domain", use: "Fine-tuning / Distillation", why: "Fine-tuning teaches format & behavior from examples; distillation makes a small model mimic a big one for your task.", whenNot: "Facts that change → RAG. Try prompting + few-shot first.", api: "bedrock: CreateModelCustomizationJob", console: "Tune → Custom models", module: "customization", docs: DOCS.custom, color: "from-blue-400 to-violet-600" },
  { id: "pick", emoji: "🏆", goal: "Pick the best model for our use case", use: "Playground compare + Model Evaluation", why: "Compare side by side, then score with automatic metrics, LLM-as-a-judge or humans on your own dataset.", whenNot: "Don't pick by leaderboard alone — your data decides.", api: "bedrock: CreateEvaluationJob", console: "Assess → Evaluations", module: "model-zoo", docs: DOCS.evaluation, color: "from-lime-400 to-emerald-600" },
  { id: "media", emoji: "🎨", goal: "Generate images or videos", use: "Nova Canvas / Stability AI · Nova Reel / Luma Ray2", why: "Images via InvokeModel; videos are asynchronous via StartAsyncInvoke with output to S3.", whenNot: "Understanding images → a vision chat model with Converse.", api: "InvokeModel, StartAsyncInvoke", console: "Playgrounds → Image / Video", docs: DOCS.models, color: "from-pink-400 to-purple-600" },
  { id: "cache", emoji: "💸", goal: "Cut cost of long repeated prompts", use: "Prompt caching (+ Intelligent Prompt Routing)", why: "Add a cachePoint after the stable prefix; cached tokens are cheaper and faster. Routing sends easy prompts to cheaper models.", whenNot: "Prompts that change every call — nothing to cache.", api: "Converse cachePoint content block", console: "Infer → Prompt routers", module: "prompt-dojo", docs: DOCS.caching, color: "from-teal-400 to-cyan-600" },
  { id: "scale", emoji: "📈", goal: "Handle big, steady traffic reliably", use: "Cross-Region inference + quotas + Provisioned Throughput", why: "Inference profiles spread load; quota increases raise limits; Provisioned Throughput guarantees capacity (and serves custom models).", whenNot: "Spiky, small workloads — stay on-demand.", api: "us./eu./global. profile IDs, CreateProvisionedModelThroughput", console: "Infer → Cross-region inference / Provisioned throughput", module: "production", docs: DOCS.profiles, color: "from-orange-400 to-red-500" },
  { id: "idp", emoji: "🧾", goal: "Extract structured data from docs, images, audio, video", use: "Bedrock Data Automation (or a vision model)", why: "Blueprint-driven extraction from unstructured files into structured JSON; also usable as a KB parser.", whenNot: "A one-off extraction → just Converse with a document block.", api: "bedrock-data-automation-runtime: InvokeDataAutomationAsync", console: "Build → Data Automation", docs: "https://docs.aws.amazon.com/bedrock/latest/userguide/bda.html", color: "from-rose-400 to-amber-500" },
];

type Node = { q: string; yes: string | Node; no: string | Node };
const TREE: Node = {
  q: "Does the model need knowledge it wasn't trained on (your docs, data)?",
  yes: {
    q: "Does that knowledge change often or need citations?",
    yes: "docs",
    no: { q: "Is it mainly about style/format rather than facts?", yes: "style", no: "docs" },
  },
  no: {
    q: "Does the AI need to take actions or call APIs?",
    yes: { q: "Are the steps always the same?", yes: "flow", no: "act" },
    no: { q: "Is it bulk/offline work (no user waiting)?", yes: "bulk", no: "chat" },
  },
};

export default function CompassPage() {
  const { award } = useStore();
  const [active, setActive] = useState<Goal | null>(null);
  const open = (g: Goal) => {
    setActive(g);
    award("compass", XP.compass, "Explored the Compass", "🧭");
    setTimeout(() => document.getElementById("goal-detail")?.scrollIntoView({ behavior: "smooth", block: "center" }), 80);
  };

  return (
    <div>
      <PageHeader emoji="🧭" title="The Bedrock Compass" subtitle="Lost? Start here. Pick what you're trying to do and we'll tell you which Bedrock feature to use, why, when not to, which API to call and where it lives in the console." gradient="from-cyan-400 via-sky-500 to-violet-600" />
      <GuideBanner what="the decision guide." how="Tap a goal card, or answer the yes/no questions in the decision tree below." next={{ label: "Sandbox", href: "/sandbox" }} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {GOALS.map((g) => (
          <button key={g.id} onClick={() => open(g)} className={clsx("group rounded-2xl bg-gradient-to-br p-[1px] text-left transition hover:scale-[1.02]", active?.id === g.id ? g.color : "from-white/15 to-white/5")}>
            <div className="h-full rounded-2xl bg-ink-900/90 p-4">
              <div className="text-3xl">{g.emoji}</div>
              <div className="mt-2 font-semibold leading-snug">{g.goal}</div>
              <div className="mt-2 text-xs text-slate-400">→ {g.use}</div>
            </div>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {active && <GoalDetail key={active.id} g={active} />}
      </AnimatePresence>

      <Link href="/usecases" className="mt-8 flex items-center gap-4 rounded-2xl border border-rose-300/30 bg-gradient-to-r from-rose-500/15 to-violet-500/10 p-5 transition hover:bg-rose-500/20">
        <span className="text-4xl">🏭</span>
        <div className="flex-1">
          <div className="font-display font-bold">Want to see these choices in a real project?</div>
          <div className="text-sm text-slate-300">Five industry use cases, retail to manufacturing, show exactly when each feature was picked and why.</div>
        </div>
        <span className="text-sm font-semibold">Open →</span>
      </Link>

      <DecisionTree onResult={(id) => open(GOALS.find((g) => g.id === id)!)} />

      <div className="glass mt-10 p-5 sm:p-7">
        <div className="font-display text-xl font-bold">🗺️ Console map: where things live</div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Discover", "Model catalog, Playgrounds (Chat, Text, Image, Video)"],
            ["Build", "Agents, AgentCore, Flows, Knowledge Bases, Prompt management, Data Automation"],
            ["Tune & Assess", "Custom models, Imported models, Evaluations"],
            ["Infer & Safeguard", "Batch inference, Cross-region inference, Provisioned throughput, Guardrails, Settings (invocation logging)"],
          ].map(([t, d]) => (
            <div key={t} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <div className="text-sm font-bold text-cyan-200">{t}</div>
              <div className="mt-1 text-xs text-slate-300">{d}</div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-500">Menu names can shift as the console evolves — use the console search bar if something moved.</p>
      </div>
    </div>
  );
}

function GoalDetail({ g }: { g: Goal }) {
  return (
    <motion.div id="goal-detail" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={clsx("mt-6 rounded-3xl bg-gradient-to-br p-[1px]", g.color)}>
      <div className="rounded-3xl bg-ink-900/95 p-5 sm:p-7">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{g.emoji}</span>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400">{g.goal}</div>
            <div className="font-display text-2xl font-bold">Use: {g.use}</div>
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <Info title="✅ Why / when to use" text={g.why} cls="bg-emerald-400/[0.07]" />
          <Info title="🚫 When not to" text={g.whenNot} cls="bg-rose-400/[0.07]" />
          <Info title="🔌 API to call" text={g.api} cls="bg-violet-400/[0.07]" mono />
          <Info title="📍 Where in the console" text={g.console} cls="bg-cyan-400/[0.07]" />
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {g.module && (
            <Link href={`/learn/${g.module}`} className="btn-ghost text-xs">
              📖 Read the module
            </Link>
          )}
          {g.lab && (
            <Link href={`/sandbox/${g.lab}`} className="btn-primary text-xs">
              🧪 Try the lab
            </Link>
          )}
          <a href={g.docs} target="_blank" rel="noreferrer" className="btn-ghost text-xs">
            AWS docs <ExternalLink className="h-3 w-3" />
          </a>
          <Link href={`/assistant?q=${encodeURIComponent(`Explain when to use ${g.use} with an example`)}`} className="btn-ghost text-xs">
            🤖 Ask Rocky
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function Info({ title, text, cls, mono }: { title: string; text: string; cls: string; mono?: boolean }) {
  return (
    <div className={clsx("rounded-2xl p-4", cls)}>
      <div className="text-sm font-bold">{title}</div>
      <div className={clsx("mt-1 text-sm text-slate-200", mono && "font-mono text-xs")}>{text}</div>
    </div>
  );
}

function DecisionTree({ onResult }: { onResult: (id: string) => void }) {
  const [path, setPath] = useState<Node[]>([TREE]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<string | null>(null);
  const cur = path[path.length - 1];

  const answer = (yes: boolean) => {
    const nxt = yes ? cur.yes : cur.no;
    setAnswers((a) => [...a, yes ? "Yes" : "No"]);
    if (typeof nxt === "string") {
      setResult(nxt);
      onResult(nxt);
    } else setPath((p) => [...p, nxt]);
  };
  const reset = () => {
    setPath([TREE]);
    setAnswers([]);
    setResult(null);
  };

  return (
    <div className="mt-10 rounded-3xl border border-white/10 bg-gradient-to-br from-violet-600/15 to-cyan-500/10 p-5 sm:p-7">
      <div className="flex items-center justify-between">
        <div className="font-display text-xl font-bold">🌳 Not sure? Walk the decision tree</div>
        <button onClick={reset} className="btn-ghost text-xs">
          <RotateCcw className="h-3.5 w-3.5" /> Restart
        </button>
      </div>
      <div className="mt-4 space-y-2">
        {path.slice(0, result ? path.length : -1).map((n, i) => (
          <div key={i} className="text-sm text-slate-400">
            {n.q} <span className="font-semibold text-white">{answers[i]}</span>
          </div>
        ))}
      </div>
      {!result ? (
        <motion.div key={cur.q} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="mt-4 rounded-2xl border border-white/10 bg-ink-900/80 p-5">
          <div className="font-display text-lg font-semibold">{cur.q}</div>
          <div className="mt-4 flex gap-3">
            <button className="btn-primary" onClick={() => answer(true)}>
              Yes
            </button>
            <button className="btn-ghost" onClick={() => answer(false)}>
              No
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="mt-4 rounded-2xl border border-emerald-300/30 bg-emerald-400/10 p-4 text-sm">
          🎯 Recommendation: <span className="font-bold">{GOALS.find((g) => g.id === result)?.use}</span> — details shown above.
        </div>
      )}
    </div>
  );
}
