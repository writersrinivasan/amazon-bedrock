"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, Printer } from "lucide-react";
import clsx from "clsx";
import { useStore } from "@/lib/store";
import { BADGES, LEVELS, levelFor } from "@/lib/content/gamification";
import { MODULES } from "@/lib/content/modules";
import { LABS } from "@/lib/content/labs";
import { USE_CASES } from "@/lib/content/usecases";
import { GuideBanner, PageHeader, Stat } from "@/components/ui";

export default function JourneyPage() {
  const { progress, updateProgress, resetProgress } = useStore();
  const lvl = levelFor(progress.xp);
  const correct = Object.values(progress.quiz).filter(Boolean).length;
  const missions = Object.values(progress.labs).reduce((a, l) => a + l.length, 0);
  const totalMissions = LABS.reduce((a, l) => a + l.objectives.length, 0);
  const graduated = progress.modules.length === MODULES.length;

  return (
    <div>
      <PageHeader emoji="🏆" title="Your Journey" subtitle="Every lesson, quiz, lab mission and question earns XP. Level up, collect badges and claim your certificate." gradient="from-orange-400 via-rose-500 to-fuchsia-600" />
      <GuideBanner what="your progress dashboard." how="Progress is saved in this browser." next={{ label: "Keep learning", href: "/learn" }} />

      {/* Level */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 p-6 sm:p-8">
        <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600/25 via-orange-500/15 to-amber-400/20" />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
          <motion.div initial={{ scale: 0.6, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} className="grid h-24 w-24 shrink-0 place-items-center rounded-3xl bg-gradient-to-br from-amber-300 via-orange-400 to-fuchsia-500 text-5xl shadow-2xl shadow-orange-500/30">
            {lvl.emoji}
          </motion.div>
          <div className="flex-1">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-300">Level {lvl.index + 1}</div>
            <div className="font-display text-3xl font-bold">{lvl.name}</div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 via-orange-400 to-amber-300" initial={{ width: 0 }} animate={{ width: `${lvl.pct}%` }} transition={{ duration: 1 }} />
            </div>
            <div className="mt-1 text-sm text-slate-300">
              <b className="font-mono text-amber-300">{progress.xp} XP</b> {lvl.next ? `· ${lvl.next.min - progress.xp} XP to ${lvl.next.emoji} ${lvl.next.name}` : "· max level reached 👑"}
            </div>
          </div>
        </div>
        <div className="relative mt-6 flex gap-2 overflow-x-auto pb-1">
          {LEVELS.map((l, i) => (
            <div key={l.name} className={clsx("flex shrink-0 items-center gap-2 rounded-full border px-3 py-1 text-xs", i <= lvl.index ? "border-amber-300/50 bg-amber-400/15 text-amber-100" : "border-white/10 text-slate-500")}>
              {l.emoji} {l.name} <span className="font-mono opacity-70">{l.min}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Modules" value={`${progress.modules.length}/${MODULES.length}`} />
        <Stat label="Quiz correct" value={correct} accent="text-fuchsia-300" />
        <Stat label="Lab missions" value={`${missions}/${totalMissions}`} accent="text-cyan-300" />
        <Stat label="Questions asked" value={progress.questions} accent="text-lime-300" />
      </div>

      {/* Badges */}
      <h2 className="mt-10 font-display text-2xl font-bold">🎖️ Badges</h2>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {BADGES.map((b, i) => {
          const got = progress.badges.includes(b.id);
          return (
            <motion.div key={b.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className={clsx("rounded-2xl border p-4 text-center", got ? "border-amber-300/40 bg-gradient-to-br from-amber-400/20 to-fuchsia-500/20" : "border-white/10 bg-white/[0.02]")}>
              <div className={clsx("text-4xl", !got && "opacity-30 grayscale")}>{got ? b.emoji : <Lock className="mx-auto h-9 w-9 text-slate-600" />}</div>
              <div className="mt-2 text-sm font-bold">{b.name}</div>
              <div className="text-[11px] text-slate-400">{b.desc}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Checklists */}
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="glass p-5">
          <div className="font-display text-lg font-bold">📖 Modules</div>
          <div className="mt-3 space-y-2">
            {MODULES.map((m) => (
              <Link key={m.slug} href={`/learn/${m.slug}`} className="flex items-center gap-3 rounded-xl px-2 py-1.5 text-sm hover:bg-white/5">
                <span className={clsx("grid h-6 w-6 place-items-center rounded-full text-xs", progress.modules.includes(m.slug) ? "bg-emerald-400 text-ink-950" : "bg-white/10")}>{progress.modules.includes(m.slug) ? "✓" : m.num}</span>
                {m.emoji} {m.title}
              </Link>
            ))}
          </div>
        </div>
        <div className="glass p-5">
          <div className="font-display text-lg font-bold">🧪 Labs</div>
          <div className="mt-3 space-y-3">
            {LABS.map((l) => {
              const d = progress.labs[l.slug]?.length ?? 0;
              return (
                <Link key={l.slug} href={`/sandbox/${l.slug}`} className="block rounded-xl px-2 py-1.5 hover:bg-white/5">
                  <div className="flex justify-between text-sm">
                    <span>
                      {l.emoji} {l.title}
                    </span>
                    <span className="text-xs text-slate-400">
                      {d}/{l.objectives.length}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className={clsx("h-full rounded-full bg-gradient-to-r", l.gradient)} style={{ width: `${(d / l.objectives.length) * 100}%` }} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="glass mt-6 p-5">
        <div className="font-display text-lg font-bold">🏭 Industry use cases</div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {USE_CASES.map((u) => {
            const d = progress.usecases?.[u.slug]?.length ?? 0;
            return (
              <Link key={u.slug} href={`/usecases/${u.slug}`} className="rounded-xl border border-white/10 bg-white/[0.03] p-3 hover:bg-white/[0.06]">
                <div className="text-sm font-semibold">
                  {u.emoji} {u.industry}
                </div>
                <div className="mt-0.5 line-clamp-1 text-xs text-slate-400">{u.exercise}</div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className={clsx("h-full rounded-full bg-gradient-to-r", u.gradient)} style={{ width: `${(d / u.steps.length) * 100}%` }} />
                </div>
                <div className="mt-1 text-[11px] text-slate-500">
                  {d}/{u.steps.length} steps
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Certificate */}
      <h2 className="mt-10 font-display text-2xl font-bold">🎓 Certificate</h2>
      <div className="no-print mt-3 flex flex-wrap items-center gap-3">
        <input className="input max-w-xs" placeholder="Name on certificate" value={progress.name} onChange={(e) => updateProgress({ name: e.target.value })} />
        <button className="btn-primary" disabled={!graduated} onClick={() => window.print()}>
          <Printer className="h-4 w-4" /> Print / save as PDF
        </button>
        {!graduated && <span className="text-sm text-slate-400">Complete all {MODULES.length} modules to unlock ({progress.modules.length}/{MODULES.length}).</span>}
      </div>
      <div className={clsx("relative mt-5 overflow-hidden rounded-3xl bg-gradient-to-br from-amber-300 via-fuchsia-500 to-cyan-400 p-[3px]", !graduated && "opacity-40 blur-[1px]")}>
        <div className="rounded-[1.35rem] bg-ink-950 p-8 text-center sm:p-14">
          <div className="text-5xl">🪨🎓</div>
          <div className="mt-4 text-xs font-bold uppercase tracking-[0.4em] text-amber-200">Certificate of completion</div>
          <div className="mt-6 text-sm text-slate-400">This certifies that</div>
          <div className="gradient-text mt-2 font-display text-4xl font-bold sm:text-5xl">{progress.name || "Your Name"}</div>
          <div className="mx-auto mt-4 max-w-lg text-slate-300">
            completed the <b>Bedrock Academy</b> journey on Amazon Bedrock — foundation models, prompting, Knowledge Bases, Guardrails, Agents, customization and production — earning <b className="text-amber-300">{progress.xp} XP</b> as a <b>{lvl.name}</b>.
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {progress.badges.map((id) => {
              const b = BADGES.find((x) => x.id === id)!;
              return (
                <span key={id} className="text-2xl" title={b.name}>
                  {b.emoji}
                </span>
              );
            })}
          </div>
          <div className="mt-8 text-xs text-slate-500" suppressHydrationWarning>{new Date().toLocaleDateString(undefined, { dateStyle: "long" })}</div>
        </div>
      </div>

      <div className="no-print mt-10 text-right">
        <button
          className="text-xs text-slate-500 underline hover:text-rose-300"
          onClick={() => {
            if (confirm("Reset all XP, badges and progress in this browser?")) resetProgress();
          }}
        >
          Reset my progress
        </button>
      </div>
    </div>
  );
}
