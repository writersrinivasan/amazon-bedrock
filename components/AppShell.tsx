"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Bot, Boxes, Compass, Factory, FlaskConical, Home, Menu, Settings, Trophy, X } from "lucide-react";
import clsx from "clsx";
import { useStore } from "@/lib/store";
import { levelFor } from "@/lib/content/gamification";
import { MODULES } from "@/lib/content/modules";

const NAV = [
  { href: "/", label: "Home", icon: Home, color: "text-pink-300" },
  { href: "/learn", label: "Learn", icon: BookOpen, color: "text-amber-300" },
  { href: "/models", label: "Models", icon: Boxes, color: "text-lime-300" },
  { href: "/compass", label: "Compass", icon: Compass, color: "text-cyan-300" },
  { href: "/sandbox", label: "Sandbox", icon: FlaskConical, color: "text-violet-300" },
  { href: "/usecases", label: "Use Cases", icon: Factory, color: "text-rose-300" },
  { href: "/assistant", label: "AI Assistant", icon: Bot, color: "text-fuchsia-300" },
  { href: "/journey", label: "Journey", icon: Trophy, color: "text-orange-300" },
  { href: "/settings", label: "Settings", icon: Settings, color: "text-slate-300" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const { progress, settings, ready } = useStore();
  const lvl = levelFor(progress.xp);
  const next = MODULES.find((m) => !progress.modules.includes(m.slug));

  useEffect(() => setOpen(false), [path]);

  const isActive = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));
  const modeLabel = settings.mode === "live" ? "Live Bedrock" : settings.groqKey ? "Simulated" : "Offline demo";
  const modeColor = settings.mode === "live" ? "bg-emerald-400" : settings.groqKey ? "bg-fuchsia-400" : "bg-slate-400";

  const sidebar = (
    <div className="flex h-full flex-col gap-4 p-4">
      <Link href="/" className="flex items-center gap-3 px-2 pt-2">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-orange-400 via-pink-500 to-violet-600 text-xl shadow-lg shadow-pink-500/30">🪨</div>
        <div>
          <div className="font-display text-lg font-bold leading-none">Bedrock</div>
          <div className="text-xs font-semibold tracking-[0.25em] text-slate-400">ACADEMY</div>
        </div>
      </Link>

      <nav className="mt-2 flex flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon, color }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
              isActive(href) ? "bg-white/10 text-white shadow-inner" : "text-slate-300 hover:bg-white/5 hover:text-white",
            )}
          >
            <Icon className={clsx("h-4 w-4", color)} />
            {label}
            {isActive(href) && <motion.span layoutId="nav-dot" className="ml-auto h-1.5 w-1.5 rounded-full bg-gradient-to-r from-pink-400 to-amber-300" />}
          </Link>
        ))}
      </nav>

      {ready && next && (
        <Link href={`/learn/${next.slug}`} className="glass glass-hover mt-auto block p-3">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Your next step</div>
          <div className="mt-1 flex items-center gap-2 text-sm font-semibold">
            <span className="text-lg">{next.emoji}</span>
            <span className="line-clamp-2">{next.title}</span>
          </div>
        </Link>
      )}
      <Link href="/settings" className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-slate-400 hover:text-white">
        <span className={clsx("h-2 w-2 animate-pulse rounded-full", modeColor)} /> Engine: {modeLabel}
      </Link>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      <aside className="no-print sticky top-0 hidden h-screen w-64 shrink-0 border-r border-white/5 bg-ink-950/60 backdrop-blur-xl lg:block">{sidebar}</aside>

      <AnimatePresence>
        {open && (
          <>
            <motion.div className="fixed inset-0 z-40 bg-black/60 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-72 border-r border-white/10 bg-ink-900 lg:hidden"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 26, stiffness: 260 }}
            >
              <button className="absolute right-3 top-3 rounded-lg p-2 hover:bg-white/10" onClick={() => setOpen(false)} aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
              {sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="no-print sticky top-0 z-30 flex items-center gap-3 border-b border-white/5 bg-ink-950/70 px-4 py-3 backdrop-blur-xl sm:px-6">
          <button className="rounded-lg p-2 hover:bg-white/10 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <div className="font-display text-sm font-semibold text-slate-300 lg:hidden">Bedrock Academy</div>
          <Link href="/journey" className="ml-auto flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-1.5 transition hover:bg-white/10">
            <span className="text-lg">{lvl.emoji}</span>
            <div className="hidden sm:block">
              <div className="text-xs font-semibold leading-tight">{lvl.name}</div>
              <div className="mt-1 h-1.5 w-32 overflow-hidden rounded-full bg-white/10">
                <motion.div className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 via-orange-400 to-amber-300" animate={{ width: `${lvl.pct}%` }} />
              </div>
            </div>
            <span className="font-mono text-sm font-bold text-amber-300">{progress.xp} XP</span>
          </Link>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</main>
      </div>

      <Toasts />
      <Onboarding />
    </div>
  );
}

function Toasts() {
  const { toasts, dismissToast } = useStore();
  return (
    <div className="no-print pointer-events-none fixed bottom-4 right-4 z-[60] flex w-72 flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.button
            key={t.id}
            layout
            onClick={() => dismissToast(t.id)}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80 }}
            className={clsx(
              "pointer-events-auto flex items-center gap-3 rounded-2xl border p-3 text-left shadow-2xl backdrop-blur-xl",
              t.kind === "badge" ? "border-amber-300/40 bg-gradient-to-r from-amber-500/30 to-fuchsia-600/30" : "border-white/10 bg-ink-800/90",
            )}
          >
            <span className={clsx("text-2xl", t.kind === "badge" && "animate-pop")}>{t.emoji}</span>
            <div>
              <div className="text-sm font-bold">{t.title}</div>
              {t.sub && <div className="text-xs text-slate-300">{t.sub}</div>}
            </div>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}

function Onboarding() {
  const { ready, progress, updateProgress, award } = useStore();
  const [name, setName] = useState("");
  if (!ready || progress.onboarded) return null;

  const steps = [
    { emoji: "📖", title: "Learn", text: "10 bite-sized, story-driven modules with flip cards and quizzes." },
    { emoji: "🧪", title: "Build", text: "6 sandbox labs that show the exact Bedrock API JSON and code — live." },
    { emoji: "🤖", title: "Ask", text: "An agentic AI tutor (LangGraph) — watch every layer think." },
    { emoji: "🏆", title: "Level up", text: "Earn XP, unlock badges and claim your certificate." },
  ];

  const finish = () => {
    updateProgress({ onboarded: true, name: name.trim() });
    award("welcome", 10, "Welcome aboard!", "🎉");
  };

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, y: 20, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="glass w-full max-w-lg overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 via-pink-500 to-violet-600 p-6">
          <div className="text-4xl">🪨✨</div>
          <h2 className="mt-2 font-display text-2xl font-bold">Welcome to Bedrock Academy</h2>
          <p className="mt-1 text-sm text-white/90">Your colorful, hands-on journey into Amazon Bedrock. Here's how it works:</p>
        </div>
        <div className="grid gap-3 p-6 sm:grid-cols-2">
          {steps.map((s) => (
            <div key={s.title} className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="text-xl">{s.emoji}</div>
              <div className="mt-1 text-sm font-bold">{s.title}</div>
              <div className="text-xs text-slate-300">{s.text}</div>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3 border-t border-white/10 p-6 sm:flex-row">
          <input className="input" placeholder="Your name (for your certificate)" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && finish()} />
          <button className="btn-primary shrink-0" onClick={finish}>
            Let's go 🚀
          </button>
        </div>
      </motion.div>
    </div>
  );
}
