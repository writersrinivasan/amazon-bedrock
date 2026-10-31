"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import clsx from "clsx";
import { useStore } from "@/lib/store";
import { MODULES } from "@/lib/content/modules";
import { LABS } from "@/lib/content/labs";
import { MODELS } from "@/lib/content/models";
import { USE_CASES } from "@/lib/content/usecases";
import { levelFor } from "@/lib/content/gamification";

const PATHS = [
  { emoji: "🌱", who: "New to Gen AI", text: "Start with the food-court mental model and get set up.", href: "/learn/bedrock-101", cta: "Begin Module 1", grad: "from-lime-400/30 to-emerald-600/30" },
  { emoji: "👩‍💻", who: "Developer", text: "Jump into the APIs and make real calls in the sandbox.", href: "/sandbox/first-call", cta: "Open First Call lab", grad: "from-violet-400/30 to-indigo-600/30" },
  { emoji: "🏗️", who: "Architect / Lead", text: "Use the Compass to decide what to use, when and why.", href: "/compass", cta: "Open the Compass", grad: "from-amber-400/30 to-rose-600/30" },
];

export default function HomePage() {
  const { progress, ready } = useStore();
  const lvl = levelFor(progress.xp);
  const done = progress.modules.length;

  return (
    <div className="space-y-14">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[2rem] border border-white/10 p-6 sm:p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-600/30 via-orange-500/10 to-cyan-500/20" />
        <div className="grid-bg absolute inset-0 opacity-50" />
        <motion.div className="absolute -right-10 -top-10 text-[10rem] opacity-20 sm:text-[14rem]" animate={{ rotate: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 10 }}>
          🪨
        </motion.div>
        <div className="relative max-w-3xl">
          <span className="chip border-amber-300/30 bg-amber-300/10 text-amber-200">
            <Sparkles className="h-3 w-3" /> Hands-on training · Amazon Bedrock
          </span>
          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
            {ready && progress.name ? <>Hey {progress.name}, </> : null}
            Build with <span className="gradient-text">Amazon Bedrock</span> — and actually enjoy it.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-300">
            Story-driven lessons, a live sandbox that shows every API call as it happens, a catalog of {MODELS.length}+ models, and an agentic AI tutor whose brain you can watch think.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={`/learn/${MODULES.find((m) => !progress.modules.includes(m.slug))?.slug ?? "bedrock-101"}`} className="btn-primary px-6 py-3 text-base">
              {done ? "Continue learning" : "Start the journey"} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/sandbox" className="btn-ghost px-6 py-3 text-base">
              🧪 Open the sandbox
            </Link>
            <Link href="/assistant" className="btn-ghost px-6 py-3 text-base">
              🤖 Ask Rocky
            </Link>
          </div>
        </div>
        <div className="relative mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { n: MODULES.length, l: "Modules", c: "text-amber-300" },
            { n: LABS.length, l: "Sandbox labs", c: "text-fuchsia-300" },
            { n: `${MODELS.length}+`, l: "Models mapped", c: "text-lime-300" },
            { n: ready ? `${progress.xp}` : "0", l: `XP · ${lvl.name}`, c: "text-cyan-300" },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl border border-white/10 bg-black/20 p-4 backdrop-blur">
              <div className={clsx("font-display text-3xl font-bold", s.c)}>{s.n}</div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Paths */}
      <section>
        <h2 className="font-display text-2xl font-bold">Pick your starting point</h2>
        <p className="mt-1 text-slate-400">Not sure where to begin? Choose who you are — we'll point you to the right door.</p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {PATHS.map((p, i) => (
            <motion.div key={p.who} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
              <Link href={p.href} className={clsx("glass glass-hover group block h-full bg-gradient-to-br p-5", p.grad)}>
                <div className="text-4xl">{p.emoji}</div>
                <div className="mt-3 font-display text-lg font-bold">{p.who}</div>
                <p className="mt-1 text-sm text-slate-300">{p.text}</p>
                <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-white">
                  {p.cta} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Industry use cases */}
      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold">🏭 See Bedrock at work in real industries</h2>
            <p className="mt-1 text-slate-400">Five hands-on builds, each a real business problem solved end to end.</p>
          </div>
          <Link href="/usecases" className="btn-ghost text-xs">
            All use cases →
          </Link>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {USE_CASES.map((u, i) => (
            <motion.div key={u.slug} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
              <Link href={`/usecases/${u.slug}`} className={clsx("group block h-full rounded-2xl bg-gradient-to-br p-[1px] transition hover:scale-[1.03]", u.gradient)}>
                <div className="flex h-full flex-col rounded-2xl bg-ink-900/90 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{u.emoji}</span>
                    <span className="font-display text-2xl font-bold text-white/20">{u.order}</span>
                  </div>
                  <div className="mt-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">{u.industry}</div>
                  <div className="mt-1 flex-1 font-semibold leading-snug">{u.exercise}</div>
                  <div className="mt-3 font-mono text-[11px] text-orange-200">{u.tech}</div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Journey map */}
      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold">Your learning journey</h2>
            <p className="mt-1 text-slate-400">
              {done}/{MODULES.length} modules complete. Each stop unlocks XP, quizzes and a matching lab.
            </p>
          </div>
          <Link href="/journey" className="btn-ghost text-xs">
            View badges & certificate →
          </Link>
        </div>
        <div className="relative mt-8">
          <div className="absolute left-6 top-0 h-full w-1 rounded-full bg-gradient-to-b from-orange-400 via-fuchsia-500 to-cyan-400 opacity-40 md:left-1/2 md:-translate-x-1/2" />
          <div className="space-y-6">
            {MODULES.map((m, i) => {
              const complete = progress.modules.includes(m.slug);
              const right = i % 2 === 1;
              return (
                <motion.div
                  key={m.slug}
                  initial={{ opacity: 0, x: right ? 40 : -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  className={clsx("relative flex items-center gap-4 md:w-1/2", right ? "md:ml-auto md:pl-10" : "md:flex-row-reverse md:pr-10 md:text-right")}
                >
                  <div
                    className={clsx(
                      "relative z-10 grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-xl shadow-lg md:absolute",
                      m.gradient,
                      right ? "md:-left-6" : "md:-right-6",
                    )}
                  >
                    {complete ? <Check className="h-6 w-6 text-white" /> : m.emoji}
                  </div>
                  <Link href={`/learn/${m.slug}`} className="glass glass-hover block flex-1 p-4">
                    <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                      Module {m.num} · {m.minutes} min · {m.level}
                    </div>
                    <div className="mt-1 font-display text-lg font-bold">{m.title}</div>
                    <div className="text-sm text-slate-400">{m.tagline}</div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
