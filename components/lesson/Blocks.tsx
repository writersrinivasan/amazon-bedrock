"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import clsx from "clsx";
import type { Block } from "@/lib/content/types";
import { CodeTabs, Rich } from "@/components/ui";

const CALLOUT = {
  tip: { icon: "💡", cls: "border-cyan-300/30 bg-cyan-400/[0.07]", title: "text-cyan-200" },
  warn: { icon: "⚠️", cls: "border-amber-300/30 bg-amber-400/[0.07]", title: "text-amber-200" },
  fun: { icon: "🎉", cls: "border-fuchsia-300/30 bg-fuchsia-400/[0.07]", title: "text-fuchsia-200" },
  aws: { icon: "🟧", cls: "border-orange-300/30 bg-orange-400/[0.08]", title: "text-orange-200" },
};

const FLOW_COLORS = ["from-orange-400 to-pink-500", "from-pink-500 to-violet-500", "from-violet-500 to-indigo-500", "from-indigo-500 to-cyan-400", "from-cyan-400 to-emerald-400", "from-emerald-400 to-lime-300", "from-lime-300 to-amber-300"];

function FlipCard({ card }: { card: { front: string; back: string; emoji?: string } }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <button onClick={() => setFlipped((f) => !f)} className="h-40 w-full text-left [perspective:1000px]" aria-label={`Flip card: ${card.front}`}>
      <motion.div className="relative h-full w-full [transform-style:preserve-3d]" animate={{ rotateY: flipped ? 180 : 0 }} transition={{ duration: 0.5 }}>
        <div className="absolute inset-0 flex flex-col justify-between rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/[0.02] p-4 [backface-visibility:hidden]">
          <div className="text-3xl">{card.emoji ?? "✨"}</div>
          <div>
            <div className="font-display font-bold">{card.front}</div>
            <div className="text-[11px] text-slate-400">tap to flip ↻</div>
          </div>
        </div>
        <div className="absolute inset-0 overflow-auto rounded-2xl border border-fuchsia-300/30 bg-gradient-to-br from-fuchsia-600/30 to-violet-700/30 p-4 text-sm text-slate-100 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          {card.back}
        </div>
      </motion.div>
    </button>
  );
}

export function BlockView({ block }: { block: Block }) {
  switch (block.t) {
    case "p":
      return (
        <p className="leading-relaxed text-slate-200">
          <Rich text={block.text} />
        </p>
      );
    case "callout": {
      const c = CALLOUT[block.kind];
      return (
        <div className={clsx("rounded-2xl border p-4", c.cls)}>
          <div className={clsx("flex items-center gap-2 font-semibold", c.title)}>
            <span>{c.icon}</span> {block.title}
          </div>
          <p className="mt-1 text-sm text-slate-200">
            <Rich text={block.text} />
          </p>
        </div>
      );
    }
    case "analogy":
      return (
        <div className="relative overflow-hidden rounded-2xl border border-amber-200/20 bg-gradient-to-r from-amber-400/15 via-pink-500/10 to-transparent p-5">
          <div className="absolute -right-4 -top-6 text-8xl opacity-20">{block.emoji}</div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-amber-200">Analogy time</div>
          <div className="mt-1 font-display text-lg font-bold">
            {block.emoji} {block.title}
          </div>
          <p className="relative mt-2 text-slate-200">
            <Rich text={block.text} />
          </p>
        </div>
      );
    case "list":
      return (
        <ul className="space-y-2">
          {block.items.map((it, i) => (
            <li key={i} className="flex gap-3 text-slate-200">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-r from-fuchsia-400 to-amber-300" />
              <span>
                <Rich text={it} />
              </span>
            </li>
          ))}
        </ul>
      );
    case "steps":
      return (
        <ol className="space-y-3">
          {block.items.map((s, i) => (
            <li key={i} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-orange-400 font-display text-sm font-bold text-ink-950">{i + 1}</span>
              <div>
                <div className="font-semibold text-white">{s.title}</div>
                <div className="mt-0.5 text-sm text-slate-300">
                  <Rich text={s.text} />
                </div>
              </div>
            </li>
          ))}
        </ol>
      );
    case "code":
      return <CodeTabs tabs={block.tabs} />;
    case "flip":
      return (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {block.cards.map((c) => (
            <FlipCard key={c.front} card={c} />
          ))}
        </div>
      );
    case "compare":
      return (
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-fuchsia-500/20 via-orange-400/10 to-cyan-400/20">
                {block.headers.map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-display font-semibold text-white">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((r, i) => (
                <tr key={i} className="border-t border-white/5 odd:bg-white/[0.02]">
                  {r.map((c, j) => (
                    <td key={j} className={clsx("px-4 py-3 align-top text-slate-300", j === 0 && "font-semibold text-white")}>
                      <Rich text={c} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "links":
      return (
        <div className="flex flex-wrap gap-2">
          {block.items.map((l) => (
            <a key={l.url} href={l.url} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-400/[0.06] px-3 py-2 text-sm text-cyan-100 transition hover:bg-cyan-400/15" title={l.note}>
              <ExternalLink className="h-3.5 w-3.5" /> {l.label}
            </a>
          ))}
        </div>
      );
    case "flow":
      return (
        <div className="flex flex-col items-stretch gap-2 md:flex-row md:items-center">
          {block.nodes.map((n, i) => (
            <div key={n.label} className="flex flex-1 flex-col items-center md:flex-row">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className={clsx("w-full rounded-2xl bg-gradient-to-br p-[1px]", FLOW_COLORS[i % FLOW_COLORS.length])}
              >
                <div className="h-full rounded-2xl bg-ink-900/90 p-3 text-center">
                  <div className="text-2xl">{n.emoji}</div>
                  <div className="mt-1 text-sm font-semibold">{n.label}</div>
                  {n.sub && <div className="text-[11px] text-slate-400">{n.sub}</div>}
                </div>
              </motion.div>
              {i < block.nodes.length - 1 && <div className="rotate-90 py-1 text-slate-500 md:rotate-0 md:px-1 md:py-0">{"➜"}</div>}
            </div>
          ))}
        </div>
      );
  }
}
