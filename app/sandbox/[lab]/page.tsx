import { notFound } from "next/navigation";
import { Suspense } from "react";
import { LABS } from "@/lib/content/labs";
import FirstCallLab from "@/components/sandbox/FirstCallLab";
import ParamLab from "@/components/sandbox/ParamLab";
import PromptLab from "@/components/sandbox/PromptLab";
import RagLab from "@/components/sandbox/RagLab";
import GuardrailLab from "@/components/sandbox/GuardrailLab";
import AgentLab from "@/components/sandbox/AgentLab";

const COMPONENTS: Record<string, React.ComponentType> = {
  "first-call": FirstCallLab,
  "param-playground": ParamLab,
  "prompt-dojo": PromptLab,
  "rag-studio": RagLab,
  "guardrail-gym": GuardrailLab,
  "agent-workshop": AgentLab,
};

export function generateStaticParams() {
  return LABS.map((l) => ({ lab: l.slug }));
}

export default async function LabPage({ params }: { params: Promise<{ lab: string }> }) {
  const { lab } = await params;
  const C = COMPONENTS[lab];
  if (!C) notFound();
  return (
    <Suspense>
      <C />
    </Suspense>
  );
}
