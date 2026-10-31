"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Clock } from "lucide-react";
import clsx from "clsx";
import { MODULES } from "@/lib/content/modules";
import { useStore } from "@/lib/store";
import { GuideBanner, PageHeader } from "@/components/ui";

export default function LearnPage() {
  const { progress } = useStore();
  const next = MODULES.find((m) => !progress.modules.includes(m.slug));
  return (
    <div>
      <PageHeader emoji="📖" title="Learn" subtitle="Ten bite-sized modules, from 'what is Bedrock?' to production architecture. Each has flip cards, code, a quiz and a matching hands-on lab." gradient="from-amber-400 via-pink-500 to-violet-600" />
      <GuideBanner what="the curriculum." how="Go in order for the smoothest ride, or jump to what you need. Mark sections as done to earn XP." next={next ? { label: `Module ${next.num}`, href: `/learn/${next.slug}` } : { label: "Journey", href: "/journey" }} />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {MODULES.map((m, i) => {
          const done = progress.modules.includes(m.slug);
          const secDone = m.sections.filter((s) => progress.sections.includes(`${m.slug}:${s.id}`)).length;
          const pct = Math.round((secDone / m.sections.length) * 100);
          return (
            <motion.div key={m.slug} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Link href={`/learn/${m.slug}`} className="glass glass-hover group flex h-full flex-col overflow-hidden">
                <div className={clsx("relative h-28 bg-gradient-to-br p-4", m.gradient)}>
                  <div className="absolute right-3 top-2 text-6xl opacity-90 transition group-hover:scale-110">{m.emoji}</div>
                  <div className="font-display text-sm font-bold text-ink-950/80">MODULE {m.num}</div>
                  {done && (
                    <span className="absolute bottom-3 left-4 inline-flex items-center gap-1 rounded-full bg-ink-950/70 px-2 py-0.5 text-xs font-semibold text-emerald-300">
                      <Check className="h-3 w-3" /> Complete
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="font-display text-lg font-bold leading-snug">{m.title}</div>
                  <p className="mt-1 flex-1 text-sm text-slate-400">{m.tagline}</p>
                  <div className="mt-4 flex items-center gap-3 text-xs text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {m.minutes} min
                    </span>
                    <span className="chip">{m.level}</span>
                    <span className="ml-auto font-mono">{pct}%</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className={clsx("h-full rounded-full bg-gradient-to-r", m.gradient)} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
