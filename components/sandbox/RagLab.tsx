"use client";

import { useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Database, Search } from "lucide-react";
import clsx from "clsx";
import { LabFrame, FlowPulse, ModelSelect, ErrorBox } from "./LabFrame";
import { CodeTabs, JsonView, Markdown } from "@/components/ui";
import { codeFor, textOf, useConverse, type CallResult, type ConverseRequest } from "@/lib/sandbox";
import { useStore } from "@/lib/store";

const SAMPLE = `# Nimbus Snacks — Remote Work Policy
Employees may work remotely up to three days per week with manager approval. Core collaboration hours are 10:00 to 15:00 in the employee's local time zone. Home-office equipment up to 400 USD per year can be expensed, including chairs, monitors and standing desks. Coworking spaces are reimbursed up to 150 USD per month.
---
# Nimbus Snacks — Parental Leave
Birthing parents receive 20 weeks of fully paid leave. Non-birthing parents receive 12 weeks of fully paid leave. Leave can be taken in up to three blocks within the first 12 months. A phased return of four-day weeks for one month is available on request.
---
# Nimbus Snacks — Product FAQ: CloudCrunch Chips
CloudCrunch chips are baked, not fried, and contain 30% less fat than regular chips. They are gluten-free and vegan. Flavors are Sea Salt, Smoky Paprika and Wasabi Lime. Shelf life is nine months unopened. Store in a cool, dry place.
---
# Nimbus Snacks — Travel & Expenses
Economy class is required for flights under six hours. Hotels are capped at 220 USD per night in major cities. Meals are reimbursed up to 60 USD per day. Expense reports must be submitted within 30 days with receipts attached.`;

const PRESETS: Record<string, { docs: string; question: string; samples: string[] }> = {
  insurance: {
    question: "Is water damage from a burst pipe covered under HomeShield Plus?",
    samples: ["What is the deductible for storm damage?", "Is my laptop covered when travelling abroad?", "Does TravelSafe cover cancelled flights due to strikes?", "What is the claims adjuster's salary?"],
    docs: `# SafeHarbor HomeShield Plus — Section 4: Water Damage (page 12)
Sudden and accidental discharge of water from plumbing, including burst pipes, is covered up to 50,000 USD per claim. Gradual leaks, seepage over more than 14 days, and damage caused by lack of maintenance are excluded. Flood from external surface water requires the optional Flood Endorsement.
---
# SafeHarbor HomeShield Plus — Section 7: Deductibles (page 19)
The standard deductible is 500 USD per claim. Windstorm and hail claims carry a deductible of 2% of the dwelling limit. The deductible is waived for claims above 25,000 USD when the home has a certified water-leak detection system.
---
# SafeHarbor HomeShield Plus — Section 9: Personal Property Away From Home (page 23)
Personal belongings, including laptops and phones, are covered worldwide up to 10% of the contents limit. Theft from an unattended vehicle is covered only if the vehicle was locked and the items were out of sight.
---
# SafeHarbor TravelSafe — Section 2: Trip Cancellation (page 4)
Trip cancellation is covered for illness, injury, death of a family member, and carrier strikes announced after the policy purchase date. Cancellation for change of mind or work reasons is not covered. Claims must be filed within 60 days with proof of cancellation.`,
  },
  banking: {
    question: "What is the cash handling limit for a single teller drawer?",
    samples: ["When must a Suspicious Activity Report be filed?", "Can branch staff open accounts for minors?", "What's the AML threshold for enhanced due diligence?", "What is the CEO's bonus this year?"],
    docs: `# Northwind Bank — Branch Cash Handling Procedure [department: operations, classification: internal]
A single teller drawer may hold at most 15,000 USD at any time. Excess cash must be moved to the vault within 30 minutes. Dual control is required for vault access. Drawer counts are performed at opening, at mid-day and at close.
---
# Northwind Bank — AML Procedure v7 [department: compliance, classification: restricted]
Enhanced due diligence is required for customers with cash deposits above 10,000 USD in a 30-day period or with links to high-risk jurisdictions. A Suspicious Activity Report must be filed within 30 calendar days of initial detection. Staff must never tip off the customer.
---
# Northwind Bank — Account Opening Standards [department: operations, classification: internal]
Accounts for minors under 16 require a parent or legal guardian as joint holder. Two forms of identification are required for all new customers. Branch staff may open accounts for minors only with the guardian present.
---
# Northwind Bank — Regulatory Circular 2026-14 [department: all, classification: public]
From 1 March 2026, all customer complaints must be acknowledged within 2 business days and resolved within 15 business days. Complaints not resolved in time must be escalated to the regional compliance officer.`,
  },
};

type Chunk = { id: number; doc: string; text: string; vec: number[] };

const DIM = 96;
const STOP = new Set("a an the and or of to in on for with is are be by up per can may as at it its this that from within all".split(" "));
const norm = (w: string) => w.replace(/(ies)$/, "y").replace(/(s)$/, "");
function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}
/** Feature-hashing "embedding" — a stand-in for Titan Text Embeddings so the lab runs in your browser. */
function embed(text: string): number[] {
  const v = new Array(DIM).fill(0);
  const words = (text.toLowerCase().match(/[a-z0-9]+/g) ?? []).filter((w) => !STOP.has(w)).map(norm);
  words.forEach((w, i) => {
    const h = hash(w);
    v[h % DIM] += h & 1 ? 1 : -1;
    if (i > 0) {
      const b = hash(words[i - 1] + "_" + w);
      v[b % DIM] += (b & 1 ? 1 : -1) * 0.5;
    }
  });
  const n = Math.hypot(...v) || 1;
  return v.map((x) => x / n);
}
const cosine = (a: number[], b: number[]) => a.reduce((s, x, i) => s + x * b[i], 0);

function chunkDocs(raw: string, size: number, overlap: number): Chunk[] {
  const out: Chunk[] = [];
  raw.split(/\n-{3,}\n/).forEach((doc) => {
    const title = doc.match(/^#\s*(.+)$/m)?.[1]?.trim() ?? "Untitled";
    const words = doc.replace(/^#.*$/m, "").trim().split(/\s+/).filter(Boolean);
    const step = Math.max(1, size - overlap);
    for (let i = 0; i < words.length; i += step) {
      const text = words.slice(i, i + size).join(" ");
      out.push({ id: out.length + 1, doc: title, text, vec: embed(`${title} ${text}`) });
      if (i + size >= words.length) break;
    }
  });
  return out;
}

function Barcode({ vec }: { vec: number[] }) {
  return (
    <div className="flex h-3 overflow-hidden rounded">
      {vec.map((x, i) => (
        <span key={i} className="flex-1" style={{ background: x === 0 ? "rgba(255,255,255,0.04)" : `hsl(${x > 0 ? 300 : 190} 90% ${50 + Math.min(40, Math.abs(x) * 120)}%)`, opacity: x === 0 ? 1 : 0.35 + Math.min(0.65, Math.abs(x) * 3) }} />
      ))}
    </div>
  );
}

export default function RagLab() {
  const preset = PRESETS[useSearchParams().get("preset") ?? ""];
  const { completeObjective } = useStore();
  const { call, stage, busy, region } = useConverse();
  const [modelId, setModelId] = useState("us.amazon.nova-lite-v1:0");
  const [docs, setDocs] = useState(preset?.docs ?? SAMPLE);
  const [size, setSize] = useState(40);
  const [overlap, setOverlap] = useState(8);
  const [topK, setTopK] = useState(3);
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [question, setQuestion] = useState(preset?.question ?? "Can I expense a standing desk, and how much?");
  const [hits, setHits] = useState<(Chunk & { score: number })[]>([]);
  const [result, setResult] = useState<CallResult | null>(null);
  const [step, setStep] = useState(0); // 0 idle, 1 chunked, 2 retrieved, 3 generated
  const lastAsk = useRef<{ size: number; topK: number; overlap: number } | null>(null);

  const ingest = () => {
    const c = chunkDocs(docs, size, overlap);
    setChunks(c);
    setHits([]);
    setResult(null);
    setStep(1);
    completeObjective("rag-studio", "ingest");
  };

  const genReq: ConverseRequest = useMemo(
    () => ({
      modelId,
      system: [{ text: "You answer questions using ONLY the provided sources. Cite sources inline like [1], [2]. If the answer is not in the sources, say you don't know." }],
      messages: [
        {
          role: "user",
          content: [{ text: `<sources>\n${hits.map((h, i) => `[${i + 1}] (${h.doc}) ${h.text}`).join("\n\n")}\n</sources>\n\nQuestion: ${question}` }],
        },
      ],
      inferenceConfig: { maxTokens: 400, temperature: 0.1 },
    }),
    [modelId, hits, question],
  );

  const ask = async () => {
    const base = chunks.length ? chunks : chunkDocs(docs, size, overlap);
    if (!chunks.length) {
      setChunks(base);
      completeObjective("rag-studio", "ingest");
    }
    const qv = embed(question);
    const ranked = base
      .map((c) => ({ ...c, score: cosine(qv, c.vec) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
    setHits(ranked);
    setStep(2);
    const req: ConverseRequest = {
      ...genReq,
      messages: [{ role: "user", content: [{ text: `<sources>\n${ranked.map((h, i) => `[${i + 1}] (${h.doc}) ${h.text}`).join("\n\n")}\n</sources>\n\nQuestion: ${question}` }] }],
    };
    const r = await call(req);
    setResult(r);
    if (r.response) {
      setStep(3);
      completeObjective("rag-studio", "ask");
      const prev = lastAsk.current;
      if (prev && (prev.size !== size || prev.topK !== topK || prev.overlap !== overlap)) completeObjective("rag-studio", "tune");
      lastAsk.current = { size, topK, overlap };
    }
  };

  const kbCode = [
    {
      label: "Real KB: RetrieveAndGenerate",
      lang: "python",
      code: `import boto3

agent_rt = boto3.client("bedrock-agent-runtime", region_name="${region}")

resp = agent_rt.retrieve_and_generate(
    input={"text": ${JSON.stringify(question)}},
    retrieveAndGenerateConfiguration={
        "type": "KNOWLEDGE_BASE",
        "knowledgeBaseConfiguration": {
            "knowledgeBaseId": "<YOUR_KB_ID>",
            "modelArn": "arn:aws:bedrock:${region}::foundation-model/${modelId.replace(/^(us|eu|apac|global)\./, "")}",
            "retrievalConfiguration": {
                "vectorSearchConfiguration": {"numberOfResults": ${topK}}
            },
        },
    },
)
print(resp["output"]["text"])
for c in resp["citations"]:
    for ref in c["retrievedReferences"]:
        print(" ->", ref["location"])`,
    },
    {
      label: "Chunking config",
      lang: "json",
      code: JSON.stringify(
        { chunkingConfiguration: { chunkingStrategy: "FIXED_SIZE", fixedSizeChunkingConfiguration: { maxTokens: Math.round(size * 1.3), overlapPercentage: Math.round((overlap / size) * 100) } } },
        null,
        2,
      ),
    },
    ...codeFor(genReq, region).slice(0, 1).map((t) => ({ ...t, label: "DIY: Converse with context" })),
  ];

  const PIPE = ["📄 Docs", "✂️ Chunk", "🔢 Embed", "🔎 Retrieve", "🧠 Generate"];
  const lit = [step >= 1, step >= 1, step >= 1, step >= 2, step >= 3];

  return (
    <LabFrame
      slug="rag-studio"
      side={
        <>
          <div className="rounded-2xl border border-white/10 bg-[#0b0b18] p-4">
            <div className="mb-3 text-xs font-semibold text-slate-300">RAG pipeline</div>
            <div className="flex items-center gap-1">
              {PIPE.map((p, i) => (
                <div key={p} className={clsx("flex-1 rounded-lg border px-1 py-2 text-center text-[11px] font-semibold transition", lit[i] ? "border-amber-300/50 bg-amber-400/15" : "border-white/10 bg-white/[0.02] text-slate-500")}>
                  {p}
                </div>
              ))}
            </div>
          </div>
          <FlowPulse stage={stage} modelId={modelId} latency={result?.clientMs} />
          <CodeTabs tabs={kbCode} />
          {hits.length > 0 && <JsonView title="➡️ Generation request (Converse)" value={genReq} />}
        </>
      }
    >
      <div className="glass space-y-4 p-5">
        <div>
          <label className="label">1 · Your documents (separate with ---)</label>
          <textarea className="input min-h-[160px] font-mono text-xs" value={docs} onChange={(e) => setDocs(e.target.value)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label">
              Chunk size: <span className="text-amber-300">{size} words</span>
            </label>
            <input type="range" min={15} max={150} step={5} value={size} onChange={(e) => setSize(+e.target.value)} className="w-full" />
          </div>
          <div>
            <label className="label">
              Overlap: <span className="text-amber-300">{overlap} words</span>
            </label>
            <input type="range" min={0} max={Math.floor(size / 2)} value={Math.min(overlap, Math.floor(size / 2))} onChange={(e) => setOverlap(+e.target.value)} className="w-full" />
          </div>
          <div>
            <label className="label">
              Top-k: <span className="text-amber-300">{topK}</span>
            </label>
            <input type="range" min={1} max={6} value={topK} onChange={(e) => setTopK(+e.target.value)} className="w-full" />
          </div>
        </div>
        <button className="btn-ghost" onClick={ingest}>
          <Database className="h-4 w-4" /> Ingest: chunk + embed
        </button>
      </div>

      {chunks.length > 0 && (
        <div className="glass p-5">
          <div className="flex items-center justify-between">
            <div className="font-display font-bold">✂️ {chunks.length} chunks · 🔢 {DIM}-dim vectors</div>
            <span className="text-[11px] text-slate-500">Bedrock: Titan Embeddings V2 → 256/512/1024 dims</span>
          </div>
          <div className="mt-3 max-h-64 space-y-2 overflow-auto pr-1">
            {chunks.map((c) => (
              <div key={c.id} className={clsx("rounded-xl border p-2.5 text-xs", hits.some((h) => h.id === c.id) ? "border-amber-300/50 bg-amber-400/10" : "border-white/10 bg-white/[0.02]")}>
                <div className="mb-1 flex justify-between text-slate-400">
                  <span>
                    #{c.id} · {c.doc}
                  </span>
                </div>
                <div className="mb-1.5 line-clamp-2 text-slate-300">{c.text}</div>
                <Barcode vec={c.vec} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="glass space-y-4 p-5">
        <ModelSelect value={modelId} onChange={setModelId} label="Generation model" />
        <div>
          <label className="label">2 · Ask a question</label>
          <div className="flex gap-2">
            <input className="input" value={question} onChange={(e) => setQuestion(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !busy && ask()} />
            <button className="btn-primary shrink-0" disabled={busy || !question.trim()} onClick={ask}>
              <Search className="h-4 w-4" /> {busy ? "…" : "Retrieve & generate"}
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {(preset?.samples ?? ["How long is parental leave for non-birthing parents?", "Are CloudCrunch chips vegan?", "What's the hotel cap per night?", "What is the CEO's salary?"]).map((q) => (
              <button key={q} className="chip hover:bg-white/10" onClick={() => setQuestion(q)}>
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {hits.length > 0 && (
        <div className="glass p-5">
          <div className="font-display font-bold">🔎 Retrieved (cosine similarity)</div>
          <div className="mt-3 space-y-2">
            {hits.map((h, i) => (
              <motion.div key={h.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-amber-300">[{i + 1}]</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                    <motion.div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-rose-500" initial={{ width: 0 }} animate={{ width: `${Math.max(4, h.score * 100)}%` }} />
                  </div>
                  <span className="font-mono text-xs">{h.score.toFixed(3)}</span>
                </div>
                <div className="mt-1 text-xs text-slate-400">{h.doc}</div>
                <div className="mt-1 text-slate-300">{h.text}</div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {result?.error && <ErrorBox error={result.error} errorType={result.errorType} />}
      {result?.response && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-gradient-to-br from-amber-300 to-rose-500 p-[1px]">
          <div className="rounded-2xl bg-ink-900/95 p-5">
            <div className="mb-2 font-display font-bold">🧠 Grounded answer</div>
            <Markdown text={textOf(result.response)} />
            <p className="mt-3 text-xs text-slate-400">Try the CEO salary question — a well-grounded RAG system should say it doesn't know. 🙅</p>
          </div>
        </motion.div>
      )}
    </LabFrame>
  );
}
