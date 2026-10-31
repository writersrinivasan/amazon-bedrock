"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import clsx from "clsx";
import { USE_CASES } from "@/lib/content/usecases";
import { useStore } from "@/lib/store";
import { GuideBanner, PageHeader } from "@/components/ui";

const FEATURES = ["Converse API", "Knowledge Bases", "S3", "Guardrails", "Bedrock Agents", "Lambda", "AgentCore"];
const MATRIX: Record<string, string[]> = {
  "retail-product-content": ["Converse API"],
  "insurance-pdf-chatbot": ["Knowledge Bases", "S3", "Guardrails"],
  "banking-enterprise-rag": ["Converse API", "Knowledge Bases", "S3", "Guardrails", "Lambda"],
  "airline-autonomous-agent": ["Bedrock Agents", "Lambda", "Knowledge Bases", "Guardrails"],
  "manufacturing-workflow": ["Converse API", "Lambda", "AgentCore", "S3"],
};

export default function UseCasesPage() {
  const { progress } = useStore();
  const next = USE_CASES.find((u) => !u.steps.every((s) => progress.usecases?.[u.slug]?.includes(s.id)));

  return (
    <div>
      <PageHeader emoji="🏭" title="Industry Use Cases" subtitle="Five real-world builds, from your first model call to a multi-step agentic workflow. Each one tells a business story, shows the architecture, and walks you through the build with production code." gradient="from-orange-400 via-fuchsia-500 to-cyan-500" />
      <GuideBanner what="the hands-on build track." how="Do them in order: each one builds on the last. Tick off steps as you build them in your AWS account to earn XP." next={next ? { label: `Use case ${next.order}`, href: `/usecases/${next.slug}` } : { label: "Journey", href: "/journey" }} />

      {/* Roadmap */}
      <div className="relative">
        <div className="absolute left-7 top-4 hidden h-[calc(100%-2rem)] w-1 rounded-full bg-gradient-to-b from-orange-400 via-fuchsia-500 to-cyan-400 opacity-40 md:block" />
        <div className="space-y-5">
          {USE_CASES.map((u, i) => {
            const done = progress.usecases?.[u.slug]?.length ?? 0;
            const complete = done === u.steps.length;
            return (
              <motion.div key={u.slug} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}>
                <Link href={`/usecases/${u.slug}`} className="group flex gap-4 md:gap-6">
                  <div className={clsx("relative z-10 hidden h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br font-display text-xl font-bold text-ink-950 shadow-lg md:grid", u.gradient)}>
                    {complete ? <Check className="h-7 w-7" /> : u.order}
                  </div>
                  <div className={clsx("flex-1 rounded-3xl bg-gradient-to-br p-[1px] transition group-hover:scale-[1.01]", u.gradient)}>
                    <div className="grid gap-4 rounded-3xl bg-ink-900/90 p-5 md:grid-cols-[1fr_auto] md:items-center">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="chip md:hidden">#{u.order}</span>
                          <span className="chip border-white/20">
                            {u.emoji} {u.industry}
                          </span>
                          <span className="chip border-orange-300/30 bg-orange-400/10 text-orange-200">⚙️ {u.tech}</span>
                          <span className="chip">{u.level}</span>
                          <span className="chip">~{u.minutes} min</span>
                        </div>
                        <div className="mt-2 font-display text-xl font-bold sm:text-2xl">{u.exercise}</div>
                        <p className="mt-1 text-sm text-slate-300">
                          <b className="text-white">{u.scenario.company}.</b> {u.scenario.problem}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 md:flex-col md:items-end">
                        <div className="text-xs text-slate-400">
                          {done}/{u.steps.length} steps
                        </div>
                        <div className="h-1.5 w-28 overflow-hidden rounded-full bg-white/10">
                          <div className={clsx("h-full rounded-full bg-gradient-to-r", u.gradient)} style={{ width: `${(done / u.steps.length) * 100}%` }} />
                        </div>
                        <span className="inline-flex items-center gap-1 text-sm font-semibold">
                          {complete ? "Review" : done ? "Continue" : "Start"} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Capability matrix */}
      <div className="glass mt-12 overflow-x-auto p-5">
        <div className="font-display text-lg font-bold">🧩 Which Bedrock building blocks does each use case use?</div>
        <table className="mt-4 w-full min-w-[640px] text-sm">
          <thead>
            <tr>
              <th className="p-2 text-left text-xs text-slate-400">Use case</th>
              {FEATURES.map((f) => (
                <th key={f} className="p-2 text-center text-xs font-semibold text-slate-300">
                  {f}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {USE_CASES.map((u) => (
              <tr key={u.slug} className="border-t border-white/5">
                <td className="p-2 font-medium">
                  {u.order}. {u.emoji} {u.industry}
                </td>
                {FEATURES.map((f) => (
                  <td key={f} className="p-2 text-center">
                    {MATRIX[u.slug].includes(f) ? <span className={clsx("inline-block h-3 w-3 rounded-full bg-gradient-to-br", u.gradient)} /> : <span className="text-slate-700">·</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-xs text-slate-500">Notice the progression: one API call → managed RAG → governed RAG → autonomous agent → an agent inside a deterministic business workflow.</p>
      </div>
    </div>
  );
}
