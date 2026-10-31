export type Lab = {
  slug: string;
  title: string;
  emoji: string;
  gradient: string;
  module: string; // module slug
  minutes: number;
  summary: string;
  realWorld: string; // which real Bedrock API/feature this maps to
  objectives: { id: string; text: string; xp: number }[];
};

export const LABS: Lab[] = [
  {
    slug: "first-call",
    title: "Your First Bedrock Call",
    emoji: "📞",
    gradient: "from-orange-400 to-pink-500",
    module: "launchpad",
    minutes: 8,
    summary: "Send a Converse request, inspect the exact JSON going over the wire, and copy production-ready code.",
    realWorld: "bedrock-runtime · Converse",
    objectives: [
      { id: "run", text: "Send your first Converse request", xp: 30 },
      { id: "system", text: "Add a system prompt and run again", xp: 20 },
      { id: "switch", text: "Run the same prompt on a different model", xp: 30 },
    ],
  },
  {
    slug: "param-playground",
    title: "Parameter Playground",
    emoji: "🌡️",
    gradient: "from-violet-400 to-indigo-500",
    module: "talking-to-models",
    minutes: 8,
    summary: "Run one prompt at three temperatures side by side and watch creativity — and chaos — grow.",
    realWorld: "Converse · inferenceConfig",
    objectives: [
      { id: "sweep", text: "Run a temperature sweep", xp: 30 },
      { id: "short", text: "Trigger a max_tokens stop by setting maxTokens ≤ 40", xp: 30 },
      { id: "stop", text: "Use a stop sequence", xp: 20 },
    ],
  },
  {
    slug: "prompt-dojo",
    title: "Prompt Dojo",
    emoji: "🥋",
    gradient: "from-rose-400 to-orange-500",
    module: "prompt-dojo",
    minutes: 10,
    summary: "Battle zero-shot vs. few-shot vs. structured prompts on the same task and judge the winner.",
    realWorld: "Converse · system prompts, few-shot, JSON output",
    objectives: [
      { id: "battle", text: "Run a 3-way prompt battle", xp: 30 },
      { id: "vote", text: "Vote for the winning technique", xp: 20 },
      { id: "custom", text: "Write your own task and battle again", xp: 30 },
    ],
  },
  {
    slug: "rag-studio",
    title: "RAG Studio",
    emoji: "📚",
    gradient: "from-amber-300 to-rose-500",
    module: "knowledge-bases",
    minutes: 12,
    summary: "Build a mini Knowledge Base in your browser: chunk → embed → retrieve → generate with citations.",
    realWorld: "Knowledge Bases · Retrieve / RetrieveAndGenerate",
    objectives: [
      { id: "ingest", text: "Ingest documents (chunk + embed)", xp: 30 },
      { id: "ask", text: "Ask a question and get a cited answer", xp: 30 },
      { id: "tune", text: "Change chunk size or top-k and re-ask", xp: 20 },
    ],
  },
  {
    slug: "guardrail-gym",
    title: "Guardrail Gym",
    emoji: "🛡️",
    gradient: "from-emerald-300 to-cyan-500",
    module: "guardrails",
    minutes: 10,
    summary: "Configure denied topics, word filters and PII masking — then try to sneak past the bouncer.",
    realWorld: "Guardrails · ApplyGuardrail",
    objectives: [
      { id: "pii", text: "Get PII masked", xp: 30 },
      { id: "topic", text: "Trigger a denied topic block", xp: 30 },
      { id: "clean", text: "Pass a clean input through", xp: 20 },
    ],
  },
  {
    slug: "agent-workshop",
    title: "Agent Workshop",
    emoji: "🤖",
    gradient: "from-fuchsia-400 to-cyan-500",
    module: "agents",
    minutes: 12,
    summary: "Watch a real tool-use loop: the model plans, calls your tools, reads results and answers.",
    realWorld: "Converse · toolConfig · tool_use loop",
    objectives: [
      { id: "tool", text: "Get the model to call a tool", xp: 30 },
      { id: "multi", text: "Trigger 2+ tool calls in one task", xp: 40 },
      { id: "toggle", text: "Disable a tool and see how the agent adapts", xp: 20 },
    ],
  },
];

export const getLab = (slug: string) => LABS.find((l) => l.slug === slug);
