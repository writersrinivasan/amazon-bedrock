import "server-only";
import { MODULES } from "@/lib/content/modules";
import { MODELS } from "@/lib/content/models";
import { LABS } from "@/lib/content/labs";
import { USE_CASES } from "@/lib/content/usecases";
import type { Block } from "@/lib/content/types";

export type Chunk = { id: string; title: string; href: string; kind: "lesson" | "model" | "lab" | "usecase"; text: string; score?: number };

const strip = (s: string) => s.replace(/\*\*|`/g, "");

function blockText(b: Block): string {
  switch (b.t) {
    case "p":
      return b.text;
    case "callout":
    case "analogy":
      return `${b.title}. ${b.text}`;
    case "list":
      return b.items.join(" ");
    case "steps":
      return b.items.map((i) => `${i.title}: ${i.text}`).join(" ");
    case "flip":
      return b.cards.map((c) => `${c.front}: ${c.back}`).join(" ");
    case "compare":
      return [b.headers.join(" | "), ...b.rows.map((r) => r.join(" | "))].join("\n");
    case "flow":
      return b.nodes.map((n) => `${n.label} (${n.sub ?? ""})`).join(" → ");
    case "code":
      return b.tabs.map((t) => `${t.label}:\n${t.code}`).join("\n").slice(0, 900);
    case "links":
      return b.items.map((l) => `${l.label} ${l.url}`).join(" ");
  }
}

function buildChunks(): Chunk[] {
  const chunks: Chunk[] = [];
  for (const m of MODULES) {
    for (const s of m.sections) {
      chunks.push({
        id: `${m.slug}#${s.id}`,
        title: `${m.title} › ${s.title}`,
        href: `/learn/${m.slug}#${s.id}`,
        kind: "lesson",
        text: strip(s.blocks.map(blockText).join("\n")),
      });
    }
  }
  for (const md of MODELS) {
    chunks.push({
      id: `model:${md.id}`,
      title: `${md.name} (${md.provider})`,
      href: `/models?q=${encodeURIComponent(md.name)}`,
      kind: "model",
      text: `${md.name} by ${md.provider}. Model ID ${md.modelId}${md.profileHint ? `, inference profile ${md.profileHint}` : ""}. Input: ${md.input.join(", ")}. Output: ${md.output.join(", ")}. ${md.context ? `Context ${md.context}.` : ""} API: ${md.api}. ${md.tagline} Use when: ${md.whenToUse} Avoid when: ${md.whenNot} Use cases: ${md.useCases.join(", ")}.`,
    });
  }
  for (const l of LABS) {
    chunks.push({
      id: `lab:${l.slug}`,
      title: `Lab: ${l.title}`,
      href: `/sandbox/${l.slug}`,
      kind: "lab",
      text: `${l.title}. ${l.summary} Real Bedrock feature: ${l.realWorld}. Missions: ${l.objectives.map((o) => o.text).join("; ")}.`,
    });
  }
  for (const u of USE_CASES) {
    chunks.push({
      id: `usecase:${u.slug}`,
      title: `Use case ${u.order}: ${u.exercise} (${u.industry})`,
      href: `/usecases/${u.slug}`,
      kind: "usecase",
      text: strip(`${u.exercise} using ${u.tech} for ${u.industry}. ${u.scenario.company}. Problem: ${u.scenario.problem} Solution: ${u.scenario.solution} Steps: ${u.steps.map((s) => s.title).join("; ")}. Pitfalls: ${u.pitfalls.join(" ")}`),
    });
    for (const s of u.steps) {
      chunks.push({
        id: `usecase:${u.slug}#${s.id}`,
        title: `${u.industry} use case › ${s.title}`,
        href: `/usecases/${u.slug}`,
        kind: "usecase",
        text: strip(s.blocks.map(blockText).join("\n")),
      });
    }
  }
  return chunks;
}

const STOP = new Set(
  "a an the and or but of to in on for with is are was be been it its this that these those i you we they me my your our how what when where which who why do does can could should would will use using vs about from as at by into than then so if not no yes".split(" "),
);
const tokenize = (s: string) => (s.toLowerCase().match(/[a-z0-9]+/g) ?? []).filter((w) => !STOP.has(w) && w.length > 1);

// BM25 index (built once per server process)
const CHUNKS = buildChunks();
const DOCS = CHUNKS.map((c) => tokenize(`${c.title} ${c.title} ${c.text}`));
const AVG = DOCS.reduce((a, d) => a + d.length, 0) / DOCS.length;
const DF = new Map<string, number>();
DOCS.forEach((d) => new Set(d).forEach((w) => DF.set(w, (DF.get(w) ?? 0) + 1)));

export function retrieve(query: string, k = 4, kind?: Chunk["kind"]): Chunk[] {
  const q = tokenize(query);
  if (!q.length) return [];
  const N = DOCS.length;
  const scored = DOCS.map((d, i) => {
    if (kind && CHUNKS[i].kind !== kind) return { i, s: 0 };
    const tf = new Map<string, number>();
    d.forEach((w) => tf.set(w, (tf.get(w) ?? 0) + 1));
    let s = 0;
    for (const w of q) {
      const f = tf.get(w);
      if (!f) continue;
      const idf = Math.log(1 + (N - (DF.get(w) ?? 0) + 0.5) / ((DF.get(w) ?? 0) + 0.5));
      s += idf * ((f * 2.2) / (f + 1.2 * (0.25 + 0.75 * (d.length / AVG))));
    }
    return { i, s };
  })
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, k);
  const max = scored[0]?.s ?? 1;
  return scored.map(({ i, s }) => ({ ...CHUNKS[i], score: Number((s / max).toFixed(3)) }));
}
