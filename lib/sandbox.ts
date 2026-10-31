"use client";

import { useCallback, useState } from "react";
import type { ConverseRequest, ConverseResponse, Engine } from "@/lib/server/converse";
import { useStore } from "./store";

export type { ConverseRequest, ConverseResponse, Engine };

export type CallResult = { response?: ConverseResponse; engine?: Engine; error?: string; errorType?: string; clientMs: number };

export type FlowStage = "idle" | "auth" | "runtime" | "model" | "done" | "error";

/** Calls /api/converse and animates the request-flow stages for the UI. */
export function useConverse() {
  const { apiHeaders, settings } = useStore();
  const [stage, setStage] = useState<FlowStage>("idle");
  const [busy, setBusy] = useState(false);

  const call = useCallback(
    async (req: ConverseRequest): Promise<CallResult> => {
      setBusy(true);
      setStage("auth");
      const t0 = performance.now();
      const timers = [setTimeout(() => setStage("runtime"), 180), setTimeout(() => setStage("model"), 420)];
      try {
        const res = await fetch("/api/converse", { method: "POST", headers: apiHeaders(), body: JSON.stringify(req) });
        const data = await res.json();
        timers.forEach(clearTimeout);
        const clientMs = Math.round(performance.now() - t0);
        if (!res.ok) {
          setStage("error");
          return { error: data.error, errorType: data.errorType, engine: data.engine, clientMs };
        }
        setStage("done");
        return { response: data.response, engine: data.engine, clientMs };
      } catch (e) {
        timers.forEach(clearTimeout);
        setStage("error");
        return { error: (e as Error).message, clientMs: Math.round(performance.now() - t0) };
      } finally {
        setBusy(false);
      }
    },
    [apiHeaders],
  );

  return { call, stage, busy, region: settings.awsRegion };
}

export const textOf = (r?: ConverseResponse) =>
  r?.output.message.content
    .filter((c): c is { text: string } => "text" in c)
    .map((c) => c.text)
    .join("\n") ?? "";

// ── Live code generation from the current request ─────────────────────────────
function pyLiteral(v: unknown, indent = 4, level = 1): string {
  const pad = " ".repeat(indent * level);
  const padEnd = " ".repeat(indent * (level - 1));
  if (v === null || v === undefined) return "None";
  if (typeof v === "boolean") return v ? "True" : "False";
  if (typeof v === "number") return String(v);
  if (typeof v === "string") return JSON.stringify(v);
  if (Array.isArray(v)) {
    if (!v.length) return "[]";
    return `[\n${v.map((x) => pad + pyLiteral(x, indent, level + 1)).join(",\n")},\n${padEnd}]`;
  }
  const entries = Object.entries(v as Record<string, unknown>).filter(([, x]) => x !== undefined);
  if (!entries.length) return "{}";
  return `{\n${entries.map(([k, x]) => `${pad}${JSON.stringify(k)}: ${pyLiteral(x, indent, level + 1)}`).join(",\n")},\n${padEnd}}`;
}

export function codeFor(req: ConverseRequest, region: string) {
  const { modelId, ...rest } = req;
  const args = Object.entries(rest)
    .filter(([, v]) => v !== undefined && !(Array.isArray(v) && v.length === 0))
    .map(([k, v]) => `    ${k}=${pyLiteral(v, 4, 2)},`)
    .join("\n");

  const python = `import boto3

client = boto3.client("bedrock-runtime", region_name="${region}")

response = client.converse(
    modelId="${modelId}",
${args}
)

message = response["output"]["message"]
print(message["content"][0].get("text"))
print("stopReason:", response["stopReason"])
print("usage:", response["usage"])`;

  const javascript = `import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({ region: "${region}" });

const response = await client.send(new ConverseCommand(${JSON.stringify(req, null, 2).replace(/\n/g, "\n")}));

console.log(response.output.message.content[0].text);
console.log(response.stopReason, response.usage);`;

  const sh = (o: unknown) => `'${JSON.stringify(o).replace(/'/g, "'\\''")}'`;
  const cli = [
    `aws bedrock-runtime converse \\`,
    `  --region ${region} \\`,
    `  --model-id ${modelId} \\`,
    req.system?.length ? `  --system ${sh(req.system)} \\` : "",
    req.inferenceConfig ? `  --inference-config ${sh(req.inferenceConfig)} \\` : "",
    req.toolConfig ? `  --tool-config ${sh(req.toolConfig)} \\` : "",
    `  --messages ${sh(req.messages)}`,
  ]
    .filter(Boolean)
    .join("\n");

  return [
    { label: "Python (boto3)", lang: "python", code: python },
    { label: "JavaScript", lang: "javascript", code: javascript },
    { label: "AWS CLI", lang: "bash", code: cli },
  ];
}
