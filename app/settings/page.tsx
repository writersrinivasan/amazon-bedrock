"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, ExternalLink, ShieldAlert } from "lucide-react";
import clsx from "clsx";
import { useStore } from "@/lib/store";
import { GuideBanner, PageHeader } from "@/components/ui";

const GROQ_MODELS = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "openai/gpt-oss-120b", "openai/gpt-oss-20b", "qwen/qwen3-32b"];
const REGIONS = ["us-east-1", "us-east-2", "us-west-2", "eu-central-1", "eu-west-1", "eu-west-3", "ap-south-1", "ap-southeast-1", "ap-southeast-2", "ap-northeast-1", "ca-central-1", "sa-east-1"];

function Secret({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="label">{label}</label>
      <div className="relative">
        <input className="input pr-10 font-mono" type={show ? "text" : "password"} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value.trim())} autoComplete="off" spellCheck={false} />
        <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2 top-1.5 rounded p-1 text-slate-400 hover:text-white" aria-label={show ? "Hide" : "Show"}>
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { settings, updateSettings, apiHeaders } = useStore();
  const [server, setServer] = useState<{ serverGroq: boolean; serverAws: boolean; region: string } | null>(null);
  const [test, setTest] = useState<{ ok: boolean; msg: string } | null>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then(setServer)
      .catch(() => {});
  }, []);

  const runTest = async () => {
    setTesting(true);
    setTest(null);
    try {
      const res = await fetch("/api/converse", {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify({ modelId: "us.amazon.nova-micro-v1:0", messages: [{ role: "user", content: [{ text: "Reply with exactly: Connection OK 🎉" }] }], inferenceConfig: { maxTokens: 20, temperature: 0 } }),
      });
      const d = await res.json();
      if (!res.ok) setTest({ ok: false, msg: d.error });
      else setTest({ ok: d.engine.kind !== "offline", msg: `${d.engine.detail}: “${d.response.output.message.content[0]?.text?.slice(0, 80)}”` });
    } catch (e) {
      setTest({ ok: false, msg: (e as Error).message });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <PageHeader emoji="⚙️" title="Settings & Keys" subtitle="Bring your own keys (BYOK). They're stored only in this browser and sent to this app's own server per request — never to anyone else." gradient="from-slate-400 via-violet-500 to-cyan-500" />
      <GuideBanner what="engine settings." how="A Groq key powers the AI assistant and the Simulated sandbox. AWS credentials enable Live Bedrock mode." next={{ label: "Test a lab", href: "/sandbox/first-call" }} />

      <div className="space-y-6">
        {/* Groq */}
        <section className="glass p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="font-display text-xl font-bold">⚡ Groq (BYOK)</div>
              <div className="text-sm text-slate-400">Powers Rocky the AI tutor (LangGraph) and the Simulated sandbox engine.</div>
            </div>
            <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="btn-ghost text-xs">
              Get a Groq key <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          {server?.serverGroq && <div className="mt-3 rounded-xl bg-emerald-400/10 p-2 text-xs text-emerald-200">✅ The server already has a GROQ_API_KEY configured — leave this blank to use it, or paste your own to override.</div>}
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Secret label="Groq API key" value={settings.groqKey} onChange={(v) => updateSettings({ groqKey: v })} placeholder="gsk_…" />
            <div>
              <label className="label">Groq model</label>
              <input className="input font-mono" list="groq-models" value={settings.groqModel} onChange={(e) => updateSettings({ groqModel: e.target.value.trim() })} />
              <datalist id="groq-models">
                {GROQ_MODELS.map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
            </div>
          </div>
        </section>

        {/* Mode */}
        <section className="glass p-6">
          <div className="font-display text-xl font-bold">🧪 Sandbox engine</div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(
              [
                ["simulate", "🧪 Simulated", "Bedrock-shaped requests & responses, answered by Groq. No AWS account needed."],
                ["live", "🟢 Live Bedrock", "Real Amazon Bedrock Runtime calls. Billed to the AWS account used."],
              ] as const
            ).map(([k, t, d]) => (
              <button key={k} onClick={() => updateSettings({ mode: k })} className={clsx("rounded-2xl border p-4 text-left transition", settings.mode === k ? "border-fuchsia-300/60 bg-fuchsia-400/10" : "border-white/10 bg-white/[0.03] hover:bg-white/5")}>
                <div className="font-semibold">{t}</div>
                <div className="mt-1 text-xs text-slate-400">{d}</div>
              </button>
            ))}
          </div>
        </section>

        {/* AWS */}
        <section className={clsx("glass p-6 transition", settings.mode !== "live" && "opacity-60")}>
          <div className="font-display text-xl font-bold">🟧 AWS credentials (Live mode)</div>
          <div className="mt-1 text-sm text-slate-400">
            Leave keys blank to use the server's default AWS credential chain (env vars, ~/.aws profile, SSO, or an IAM role){server?.serverAws ? " — detected on the server ✅" : ""}.
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Region</label>
              <select className="input" value={settings.awsRegion} onChange={(e) => updateSettings({ awsRegion: e.target.value })}>
                {REGIONS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
            <Secret label="Access key ID" value={settings.awsAccessKeyId} onChange={(v) => updateSettings({ awsAccessKeyId: v })} placeholder="AKIA… / ASIA…" />
            <Secret label="Secret access key" value={settings.awsSecretAccessKey} onChange={(v) => updateSettings({ awsSecretAccessKey: v })} />
            <Secret label="Session token (temporary creds)" value={settings.awsSessionToken} onChange={(v) => updateSettings({ awsSessionToken: v })} placeholder="optional" />
          </div>
          <div className="mt-4 flex gap-2 rounded-xl border border-amber-300/30 bg-amber-400/10 p-3 text-xs text-amber-100">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            For trainings, use short-lived credentials from a sandbox account with a least-privilege policy (bedrock:InvokeModel only). Never paste long-term admin keys into any web app.
          </div>
        </section>

        <section className="glass flex flex-col gap-3 p-6 sm:flex-row sm:items-center">
          <button className="btn-primary" disabled={testing} onClick={runTest}>
            {testing ? "Testing…" : "🔌 Test connection"}
          </button>
          {test && <div className={clsx("text-sm", test.ok ? "text-emerald-300" : "text-amber-300")}>{test.ok ? "✅ " : "⚠️ "}{test.msg}</div>}
          <button
            className="text-xs text-slate-500 underline hover:text-rose-300 sm:ml-auto"
            onClick={() => updateSettings({ groqKey: "", awsAccessKeyId: "", awsSecretAccessKey: "", awsSessionToken: "" })}
          >
            Forget all keys
          </button>
        </section>
      </div>
    </div>
  );
}
