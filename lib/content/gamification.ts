export const XP = {
  section: 10,
  moduleComplete: 50,
  quizCorrect: 20,
  question: 5,
  modelFinder: 25,
  compass: 15,
  useCaseStep: 25,
  useCaseComplete: 75,
};

export const LEVELS = [
  { min: 0, name: "Cloud Cadet", emoji: "🐣" },
  { min: 150, name: "Prompt Apprentice", emoji: "🪄" },
  { min: 400, name: "Model Wrangler", emoji: "🤠" },
  { min: 800, name: "RAG Ranger", emoji: "🏹" },
  { min: 1300, name: "Agent Architect", emoji: "🏗️" },
  { min: 2000, name: "Bedrock Legend", emoji: "👑" },
];

export function levelFor(xp: number) {
  let idx = 0;
  LEVELS.forEach((l, i) => {
    if (xp >= l.min) idx = i;
  });
  const cur = LEVELS[idx];
  const next = LEVELS[idx + 1];
  const pct = next ? Math.min(100, ((xp - cur.min) / (next.min - cur.min)) * 100) : 100;
  return { ...cur, index: idx, next, pct };
}

export type Badge = { id: string; name: string; emoji: string; desc: string };

export const BADGES: Badge[] = [
  { id: "first-steps", name: "First Steps", emoji: "👣", desc: "Complete your first lesson section" },
  { id: "first-call", name: "Hello, Bedrock", emoji: "📞", desc: "Make your first sandbox model call" },
  { id: "quiz-whiz", name: "Quiz Whiz", emoji: "🧩", desc: "Answer 10 quiz questions correctly" },
  { id: "prompt-whisperer", name: "Prompt Whisperer", emoji: "🪄", desc: "Finish the Prompt Dojo lab" },
  { id: "rag-ranger", name: "RAG Ranger", emoji: "🏹", desc: "Finish RAG Studio" },
  { id: "bouncer", name: "The Bouncer", emoji: "🛡️", desc: "Finish the Guardrail Gym" },
  { id: "agent-smith", name: "Agent Smith", emoji: "🤖", desc: "Finish the Agent Workshop" },
  { id: "curious", name: "Curious Mind", emoji: "🔍", desc: "Ask the AI assistant 5 questions" },
  { id: "matchmaker", name: "Model Matchmaker", emoji: "💘", desc: "Use the Model Finder" },
  { id: "navigator", name: "Navigator", emoji: "🧭", desc: "Explore the Compass" },
  { id: "industry-first", name: "Shipped It", emoji: "🏗️", desc: "Complete your first industry use case" },
  { id: "industry-pro", name: "Industry Pro", emoji: "🏭", desc: "Complete all 5 industry use cases" },
  { id: "halfway", name: "Halfway Hero", emoji: "⛰️", desc: "Complete 5 modules" },
  { id: "graduate", name: "Bedrock Graduate", emoji: "🎓", desc: "Complete all 10 modules" },
];
