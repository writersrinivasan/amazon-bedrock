"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Clock, MessageCircleQuestion } from "lucide-react";
import clsx from "clsx";
import { MODULES, getModule } from "@/lib/content/modules";
import { getLab } from "@/lib/content/labs";
import { useStore } from "@/lib/store";
import { BlockView } from "./Blocks";
import { Quiz } from "./Quiz";

export default function LessonView({ slug }: { slug: string }) {
  const m = getModule(slug)!;
  const { progress, completeSection, completeModule } = useStore();
  const idx = MODULES.findIndex((x) => x.slug === slug);
  const prev = MODULES[idx - 1];
  const next = MODULES[idx + 1];
  const lab = m.labSlug ? getLab(m.labSlug) : undefined;

  const isDone = (id: string) => progress.sections.includes(`${slug}:${id}`);
  const sectionsDone = m.sections.filter((s) => isDone(s.id)).length;
  const quizAnswered = m.quiz.filter((q) => q.id in progress.quiz).length;
  const canComplete = sectionsDone === m.sections.length && quizAnswered === m.quiz.length;
  const moduleDone = progress.modules.includes(slug);

  return (
    <div>
      {/* Hero */}
      <div className={clsx("relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br p-[1px]", m.gradient)}>
        <div className="relative overflow-hidden rounded-3xl bg-ink-950/80 p-6 sm:p-10">
          <div className={clsx("absolute inset-0 bg-gradient-to-br opacity-20", m.gradient)} />
          <motion.div className="absolute -right-6 -top-6 text-[9rem] opacity-30 sm:text-[12rem]" animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 6 }}>
            {m.emoji}
          </motion.div>
          <div className="relative">
            <Link href="/learn" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-white">
              <ArrowLeft className="h-3 w-3" /> All modules
            </Link>
            <div className="mt-4 text-xs font-bold uppercase tracking-[0.3em] text-white/70">Module {m.num}</div>
            <h1 className="mt-2 max-w-3xl font-display text-3xl font-bold tracking-tight sm:text-5xl">{m.title}</h1>
            <p className="mt-3 max-w-2xl text-lg text-slate-200">{m.tagline}</p>
            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
              <span className="chip"><Clock className="h-3 w-3" /> {m.minutes} min</span>
              <span className="chip">{m.level}</span>
              <span className="chip">
                {sectionsDone}/{m.sections.length} sections
              </span>
              <span className="chip">
                {quizAnswered}/{m.quiz.length} quiz
              </span>
              {moduleDone && <span className="chip border-emerald-300/40 bg-emerald-400/15 text-emerald-200"><Check className="h-3 w-3" /> Complete</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        {/* TOC */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-1">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">In this module</div>
            {m.sections.map((s, i) => (
              <a key={s.id} href={`#${s.id}`} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white">
                <span className={clsx("grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-bold", isDone(s.id) ? "bg-emerald-400 text-ink-950" : "bg-white/10")}>
                  {isDone(s.id) ? "✓" : i + 1}
                </span>
                <span className="line-clamp-1">{s.title}</span>
              </a>
            ))}
            <a href="#quiz" className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-fuchsia-500/30 text-[10px]">?</span> Quiz
            </a>
            {lab && (
              <a href="#lab" className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-violet-500/30 text-[10px]">🧪</span> Hands-on lab
              </a>
            )}
          </div>
        </aside>

        <div className="min-w-0 space-y-8">
          {m.sections.map((s, i) => (
            <motion.section
              key={s.id}
              id={s.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              className="glass scroll-mt-24 p-5 sm:p-7"
            >
              <div className="flex items-center gap-3">
                <span className={clsx("grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br font-display font-bold text-ink-950", m.gradient)}>{i + 1}</span>
                <h2 className="font-display text-xl font-bold sm:text-2xl">{s.title}</h2>
              </div>
              <div className="mt-5 space-y-5">
                {s.blocks.map((b, j) => (
                  <BlockView key={j} block={b} />
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => completeSection(slug, s.id)}
                  disabled={isDone(s.id)}
                  className={clsx(isDone(s.id) ? "btn border border-emerald-300/30 bg-emerald-400/10 text-emerald-200 disabled:opacity-100" : "btn-primary")}
                >
                  {isDone(s.id) ? (
                    <>
                      <Check className="h-4 w-4" /> Got it
                    </>
                  ) : (
                    "Got it! +10 XP"
                  )}
                </button>
              </div>
            </motion.section>
          ))}

          {/* Quiz */}
          <section id="quiz" className="glass scroll-mt-24 p-5 sm:p-7">
            <h2 className="font-display text-xl font-bold sm:text-2xl">🧩 Quick quiz</h2>
            <p className="mt-1 text-sm text-slate-400">+20 XP for each correct first answer. No pressure — explanations included.</p>
            <div className="mt-5">
              <Quiz questions={m.quiz} />
            </div>
          </section>

          {/* Lab + ask */}
          <div className="grid gap-5 md:grid-cols-2">
            {lab ? (
              <Link id="lab" href={`/sandbox/${lab.slug}`} className={clsx("group scroll-mt-24 rounded-2xl bg-gradient-to-br p-[1px]", lab.gradient)}>
                <div className="h-full rounded-2xl bg-ink-900/90 p-5">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Hands-on lab</div>
                  <div className="mt-2 font-display text-lg font-bold">
                    {lab.emoji} {lab.title}
                  </div>
                  <p className="mt-1 text-sm text-slate-300">{lab.summary}</p>
                  <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold">
                    Open in sandbox <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ) : (
              <Link href="/sandbox" className="glass glass-hover p-5">
                <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Practice</div>
                <div className="mt-2 font-display text-lg font-bold">🧪 Explore the sandbox</div>
                <p className="mt-1 text-sm text-slate-300">Six labs to try what you've learned with real API shapes.</p>
              </Link>
            )}
            <div className="glass p-5">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                <MessageCircleQuestion className="h-4 w-4" /> Ask Rocky, your AI tutor
              </div>
              <div className="mt-3 flex flex-col gap-2">
                {m.askPrompts.map((p) => (
                  <Link key={p} href={`/assistant?q=${encodeURIComponent(p)}`} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:border-fuchsia-300/40 hover:bg-fuchsia-400/10">
                    “{p}”
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Complete */}
          <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-fuchsia-500/15 via-orange-400/10 to-cyan-400/15 p-6 text-center">
            {moduleDone ? (
              <div className="font-display text-xl font-bold">🏆 Module complete — awesome work!</div>
            ) : (
              <>
                <div className="font-display text-xl font-bold">Ready to finish Module {m.num}?</div>
                <p className="mt-1 text-sm text-slate-300">Complete all sections and answer every quiz question to claim +50 XP.</p>
                <button className="btn-primary mt-4" disabled={!canComplete} onClick={() => completeModule(slug)}>
                  Complete module +50 XP
                </button>
              </>
            )}
            <div className="mt-6 flex flex-wrap justify-between gap-3">
              {prev ? (
                <Link href={`/learn/${prev.slug}`} className="btn-ghost">
                  <ArrowLeft className="h-4 w-4" /> {prev.title}
                </Link>
              ) : (
                <span />
              )}
              {next && (
                <Link href={`/learn/${next.slug}`} className="btn-ghost">
                  {next.title} <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
