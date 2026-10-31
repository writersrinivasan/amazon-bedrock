"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Check, Copy, MapPin } from "lucide-react";
import clsx from "clsx";
import type { CodeTab } from "@/lib/content/types";

/** Renders **bold**, `code` and [links](url) inside a plain string. */
export function Rich({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g);
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith("**") && p.endsWith("**")) return <strong key={i} className="font-semibold text-white">{p.slice(2, -2)}</strong>;
        if (p.startsWith("`") && p.endsWith("`")) return <code key={i} className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[0.85em] text-amber-200">{p.slice(1, -1)}</code>;
        const link = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        // Links can come from model output, so only allow https:// and same-site paths (never javascript: or data:).
        if (link && (/^https:\/\//i.test(link[2]) || /^\/(?!\/)/.test(link[2]))) {
          const ext = link[2].startsWith("https://");
          return ext ? (
            <a key={i} href={link[2]} target="_blank" rel="noreferrer" className="text-cyan-300 underline decoration-cyan-300/40 underline-offset-2">{link[1]}</a>
          ) : (
            <Link key={i} href={link[2]} className="text-cyan-300 underline decoration-cyan-300/40 underline-offset-2">{link[1]}</Link>
          );
        }
        return <span key={i}>{p}</span>;
      })}
    </>
  );
}

export function PageHeader({ emoji, title, subtitle, gradient = "from-fuchsia-500 via-orange-400 to-amber-300", children }: { emoji: string; title: string; subtitle: string; gradient?: string; children?: ReactNode }) {
  return (
    <div className="relative mb-8 overflow-hidden rounded-3xl border border-white/10 p-6 sm:p-8">
      <div className={clsx("absolute inset-0 bg-gradient-to-br opacity-25", gradient)} />
      <div className="grid-bg absolute inset-0 opacity-40" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-4xl sm:text-5xl">{emoji}</div>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-slate-300">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

/** "You are here" banner so participants always know what a page is for and what to do next. */
export function GuideBanner({ what, how, next }: { what: string; how?: string; next?: { label: string; href: string } }) {
  return (
    <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-cyan-300/20 bg-cyan-400/[0.06] p-4 sm:flex-row sm:items-center">
      <MapPin className="h-5 w-5 shrink-0 text-cyan-300" />
      <div className="flex-1 text-sm">
        <span className="font-semibold text-cyan-200">You are here: </span>
        <span className="text-slate-200">{what}</span>
        {how && <span className="text-slate-400"> {how}</span>}
      </div>
      {next && (
        <Link href={next.href} className="btn-ghost shrink-0 text-xs">
          Next: {next.label} →
        </Link>
      )}
    </div>
  );
}

export function CopyButton({ text, className }: { text: string; className?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      className={clsx("inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-slate-300 transition hover:bg-white/10 hover:text-white", className)}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        } catch {
          /* clipboard unavailable */
        }
      }}
    >
      {done ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
      {done ? "Copied" : "Copy"}
    </button>
  );
}

const LANG_DOT: Record<string, string> = {
  python: "bg-sky-400",
  javascript: "bg-yellow-300",
  typescript: "bg-blue-400",
  bash: "bg-lime-400",
  json: "bg-orange-400",
  text: "bg-slate-400",
};

export function CodeTabs({ tabs, className }: { tabs: CodeTab[]; className?: string }) {
  const [i, setI] = useState(0);
  const tab = tabs[Math.min(i, tabs.length - 1)];
  return (
    <div className={clsx("overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b18]", className)}>
      <div className="flex items-center gap-1 overflow-x-auto border-b border-white/10 bg-white/[0.03] px-2 py-1.5">
        <div className="mr-2 flex gap-1.5 pl-1">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
        </div>
        {tabs.map((t, idx) => (
          <button
            key={t.label}
            onClick={() => setI(idx)}
            className={clsx("flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition", idx === i ? "bg-white/10 text-white" : "text-slate-400 hover:text-white")}
          >
            <span className={clsx("h-1.5 w-1.5 rounded-full", LANG_DOT[t.lang] ?? "bg-slate-400")} />
            {t.label}
          </button>
        ))}
        <CopyButton text={tab.code} className="ml-auto shrink-0" />
      </div>
      <pre className="max-h-[480px] overflow-auto p-4 font-mono text-[12.5px] leading-relaxed text-slate-200">
        <code>{tab.code}</code>
      </pre>
    </div>
  );
}

/** Colorized JSON viewer. */
export function JsonView({ value, title, className }: { value: unknown; title?: string; className?: string }) {
  const json = JSON.stringify(value, null, 2) ?? "undefined";
  const html = json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/("(\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, (m) => {
      let cls = "text-amber-200";
      if (/^"/.test(m)) cls = /:$/.test(m) ? "text-fuchsia-300" : "text-emerald-300";
      else if (/true|false/.test(m)) cls = "text-cyan-300";
      else if (/null/.test(m)) cls = "text-slate-500";
      return `<span class="${cls}">${m}</span>`;
    });
  return (
    <div className={clsx("overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b18]", className)}>
      {title && (
        <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-slate-300">
          {title}
          <CopyButton text={json} />
        </div>
      )}
      <pre className="max-h-[420px] overflow-auto p-3 font-mono text-[12px] leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

/** Minimal, safe markdown renderer for assistant answers. */
export function Markdown({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  const lines = text.split("\n");
  let i = 0;
  let key = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim() || "text";
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) code.push(lines[i++]);
      i++;
      blocks.push(<CodeTabs key={key++} className="my-3" tabs={[{ label: lang, lang, code: code.join("\n") }]} />);
      continue;
    }
    if (/^#{1,3}\s/.test(line)) {
      const level = line.match(/^#+/)![0].length;
      const content = line.replace(/^#+\s/, "");
      blocks.push(
        <div key={key++} className={clsx("mt-4 mb-1 font-display font-bold text-white", level === 1 ? "text-xl" : level === 2 ? "text-lg" : "text-base")}>
          <Rich text={content} />
        </div>,
      );
      i++;
      continue;
    }
    if (/^\s*([-*]|\d+\.)\s/.test(line)) {
      const ordered = /^\s*\d+\./.test(line);
      const items: string[] = [];
      while (i < lines.length && /^\s*([-*]|\d+\.)\s/.test(lines[i])) items.push(lines[i++].replace(/^\s*([-*]|\d+\.)\s/, ""));
      const Tag = ordered ? "ol" : "ul";
      blocks.push(
        <Tag key={key++} className={clsx("my-2 space-y-1 pl-5", ordered ? "list-decimal" : "list-disc marker:text-fuchsia-400")}>
          {items.map((it, j) => (
            <li key={j}>
              <Rich text={it} />
            </li>
          ))}
        </Tag>,
      );
      continue;
    }
    if (line.startsWith(">")) {
      blocks.push(
        <div key={key++} className="my-2 border-l-2 border-fuchsia-400/60 pl-3 text-slate-300">
          <Rich text={line.replace(/^>\s?/, "")} />
        </div>,
      );
      i++;
      continue;
    }
    if (line.trim() === "") {
      i++;
      continue;
    }
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() !== "" && !/^(```|#{1,3}\s|\s*([-*]|\d+\.)\s|>)/.test(lines[i])) para.push(lines[i++]);
    blocks.push(
      <p key={key++} className="my-2 leading-relaxed">
        <Rich text={para.join(" ").replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, "$1")} />
      </p>,
    );
  }
  return <div className="text-sm text-slate-200">{blocks}</div>;
}

export function Stat({ label, value, accent = "text-amber-300" }: { label: string; value: ReactNode; accent?: string }) {
  return (
    <div className="glass p-4">
      <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{label}</div>
      <div className={clsx("mt-1 font-display text-2xl font-bold", accent)}>{value}</div>
    </div>
  );
}
