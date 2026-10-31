"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, ChevronDown, ExternalLink, FlaskConical, MapPin } from "lucide-react";
import clsx from "clsx";
import { USE_CASES, getUseCase } from "@/lib/content/usecases";
import { getModule } from "@/lib/content/modules";
import { useStore } from "@/lib/store";
import { BlockView } from "@/components/lesson/Blocks";
import { Rich } from "@/components/ui";

export default function UseCaseView({ slug }: { slug: string }) {
  const u = getUseCase(slug)!;
  const { progress, toggleUseCaseStep } = useStore();
  const done = progress.usecases?.[slug] ?? [];
  const [open, setOpen] = useState<string | null>(u.steps[0].id);
  const idx = USE_CASES.findIndex((x) => x.slug === slug);
  const prev = USE_CASES[idx - 1];
  const next = USE_CASES[idx + 1];
  const mod = getModule(u.related.module);
  const pct = Math.round((done.length / u.steps.length) * 100);

  const markAndAdvance = (stepId: string, i: number) => {
    const wasDone = done.includes(stepId);
    toggleUseCaseStep(slug, stepId);
    if (!wasDone && u.steps[i + 1]) {
      setOpen(u.steps[i + 1].id);
      setTimeout(() => document.getElementById(`step-${u.steps[i + 1].id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 250);
    }
  };

  return (
    <div>
      <Link href="/usecases" className="mb-4 inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-white">
        <ArrowLeft className="h-3 w-3" /> All use cases
      </Link>

      {/* Hero */}
      <div className={clsx("relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br p-[1px]", u.gradient)}>
        <div className="relative overflow-hidden rounded-3xl bg-ink-950/85 p-6 sm:p-10">
          <div className={clsx("absolute inset-0 bg-gradient-to-br opacity-20", u.gradient)} />
          <motion.div className="absolute -right-4 -top-4 text-[9rem] opacity-25 sm:text-[12rem]" animate={{ rotate: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 8 }}>
            {u.emoji}
          </motion.div>
          <div className="relative">
            <div className="text-xs font-bold uppercase tracking-[0.3em] text-white/70">
              Hands-on exercise {u.order} · {u.industry}
            </div>
            <h1 className="mt-2 max-w-3xl font-display text-3xl font-bold tracking-tight sm:text-5xl">{u.exercise}</h1>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="chip border-orange-300/40 bg-orange-400/15 text-orange-100">⚙️ {u.tech}</span>
              <span className="chip">{u.level}</span>
              <span className="chip">~{u.minutes} min</span>
              <span className="chip">
                {done.length}/{u.steps.length} steps · {pct}%
              </span>
            </div>
            <div className="mt-4 h-2 max-w-md overflow-hidden rounded-full bg-white/10">
              <motion.div className={clsx("h-full rounded-full bg-gradient-to-r", u.gradient)} animate={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Story */}
      <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <div className="glass p-5 sm:p-6">
          <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400">📖 The business story</div>
          <div className="mt-2 font-display text-lg font-bold">{u.scenario.company}</div>
          <div className="text-sm text-slate-400">👤 {u.scenario.persona}</div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-rose-400/[0.08] p-4">
              <div className="text-sm font-bold text-rose-200">😩 The problem</div>
              <p className="mt-1 text-sm text-slate-200">{u.scenario.problem}</p>
            </div>
            <div className="rounded-2xl bg-emerald-400/[0.08] p-4">
              <div className="text-sm font-bold text-emerald-200">💡 The Bedrock solution</div>
              <p className="mt-1 text-sm text-slate-200">
                <Rich text={u.scenario.solution} />
              </p>
            </div>
          </div>
        </div>
        <div className="glass p-5 sm:p-6">
          <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400">🎯 What success looks like</div>
          <ul className="mt-3 space-y-2">
            {u.scenario.success.map((s) => (
              <li key={s} className="flex gap-2 text-sm text-slate-200">
                <span className="mt-0.5 text-emerald-300">✔</span> {s}
              </li>
            ))}
          </ul>
          <div className="mt-5 text-[11px] font-bold uppercase tracking-widest text-slate-400">🧰 Before you start</div>
          <ul className="mt-2 space-y-1.5">
            {u.prerequisites.map((p) => (
              <li key={p} className="text-sm text-slate-300">
                • <Rich text={p} />
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Architecture */}
      <div className="glass mt-5 p-5 sm:p-6">
        <div className="mb-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">🏗️ Architecture</div>
        <BlockView block={{ t: "flow", nodes: u.architecture }} />
      </div>

      {/* Try it */}
      <Link href={u.tryIt.href} className="group mt-5 flex flex-col gap-3 rounded-2xl border border-violet-300/30 bg-gradient-to-r from-violet-600/20 to-cyan-500/10 p-5 sm:flex-row sm:items-center">
        <FlaskConical className="h-8 w-8 shrink-0 text-violet-300" />
        <div className="flex-1">
          <div className="font-display font-bold">No AWS account handy? {u.tryIt.label}</div>
          <div className="text-sm text-slate-300">{u.tryIt.note}</div>
        </div>
        <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
      </Link>

      {/* Steps */}
      <h2 className="mt-10 font-display text-2xl font-bold">🛠️ Build it step by step</h2>
      <p className="mt-1 text-sm text-slate-400">Open a step, build it in your AWS account, then mark it done (+25 XP each, +75 XP for finishing the use case).</p>
      <div className="mt-5 space-y-3">
        {u.steps.map((s, i) => {
          const isDone = done.includes(s.id);
          const isOpen = open === s.id;
          return (
            <div key={s.id} id={`step-${s.id}`} className={clsx("scroll-mt-24 overflow-hidden rounded-2xl border transition", isDone ? "border-emerald-300/30 bg-emerald-400/[0.04]" : isOpen ? "border-white/20 bg-white/[0.05]" : "border-white/10 bg-white/[0.03]")}>
              <button onClick={() => setOpen(isOpen ? null : s.id)} className="flex w-full items-center gap-4 p-4 text-left">
                <span className={clsx("grid h-9 w-9 shrink-0 place-items-center rounded-xl font-display font-bold", isDone ? "bg-emerald-400 text-ink-950" : clsx("bg-gradient-to-br text-ink-950", u.gradient))}>{isDone ? <Check className="h-5 w-5" /> : i + 1}</span>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{s.title}</div>
                  <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                    <MapPin className="h-3 w-3" /> {s.where}
                  </div>
                </div>
                <ChevronDown className={clsx("h-5 w-5 shrink-0 transition", isOpen && "rotate-180")} />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="space-y-4 border-t border-white/10 p-4 sm:p-5">
                      {s.blocks.map((b, j) => (
                        <BlockView key={j} block={b} />
                      ))}
                      <div className="flex justify-end">
                        <button onClick={() => markAndAdvance(s.id, i)} className={clsx(isDone ? "btn border border-emerald-300/30 bg-emerald-400/10 text-emerald-200" : "btn-primary")}>
                          {isDone ? (
                            <>
                              <Check className="h-4 w-4" /> Done (click to undo)
                            </>
                          ) : (
                            "I built this step · +25 XP"
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {pct === 100 && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-6 rounded-3xl border border-emerald-300/30 bg-gradient-to-r from-emerald-500/20 to-cyan-500/15 p-6 text-center">
          <div className="text-4xl">🏭🎉</div>
          <div className="mt-2 font-display text-xl font-bold">You shipped the {u.industry} use case!</div>
          {next && (
            <Link href={`/usecases/${next.slug}`} className="btn-primary mt-4">
              Next: {next.exercise} <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </motion.div>
      )}

      {/* Pitfalls + ask + docs */}
      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        <div className="glass p-5">
          <div className="font-display font-bold">⚠️ Common pitfalls</div>
          <ul className="mt-3 space-y-2">
            {u.pitfalls.map((p) => (
              <li key={p} className="text-sm text-slate-300">
                • <Rich text={p} />
              </li>
            ))}
          </ul>
        </div>
        <div className="glass p-5">
          <div className="font-display font-bold">🤖 Ask Rocky</div>
          <div className="mt-3 flex flex-col gap-2">
            {u.askPrompts.map((p) => (
              <Link key={p} href={`/assistant?q=${encodeURIComponent(p)}`} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm hover:border-fuchsia-300/40 hover:bg-fuchsia-400/10">
                “{p}”
              </Link>
            ))}
          </div>
        </div>
        <div className="glass p-5">
          <div className="font-display font-bold">📚 Go deeper</div>
          <div className="mt-3 flex flex-col gap-2 text-sm">
            {mod && (
              <Link href={`/learn/${mod.slug}`} className="text-cyan-300 hover:underline">
                📖 Module {mod.num}: {mod.title}
              </Link>
            )}
            {u.related.lab && (
              <Link href={`/sandbox/${u.related.lab}`} className="text-cyan-300 hover:underline">
                🧪 Related sandbox lab
              </Link>
            )}
            {u.docs.map((d) => (
              <a key={d.url} href={d.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-cyan-300 hover:underline">
                {d.label} <ExternalLink className="h-3 w-3" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-between gap-3">
        {prev ? (
          <Link href={`/usecases/${prev.slug}`} className="btn-ghost">
            <ArrowLeft className="h-4 w-4" /> {prev.order}. {prev.exercise}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={`/usecases/${next.slug}`} className="btn-ghost">
            {next.order}. {next.exercise} <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
