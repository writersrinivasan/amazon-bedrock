"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { BADGES, XP } from "./content/gamification";
import { LABS } from "./content/labs";
import { MODULES } from "./content/modules";
import { USE_CASES } from "./content/usecases";

export type Progress = {
  name: string;
  xp: number;
  events: Record<string, number>;
  sections: string[];
  modules: string[];
  quiz: Record<string, boolean>;
  labs: Record<string, string[]>;
  usecases: Record<string, string[]>;
  questions: number;
  badges: string[];
  onboarded: boolean;
};

export type Settings = {
  groqKey: string;
  groqModel: string;
  mode: "simulate" | "live";
  awsRegion: string;
  awsAccessKeyId: string;
  awsSecretAccessKey: string;
  awsSessionToken: string;
};

export type Toast = { id: number; title: string; sub?: string; emoji: string; kind: "xp" | "badge" | "info" };

const EMPTY: Progress = {
  name: "",
  xp: 0,
  events: {},
  sections: [],
  modules: [],
  quiz: {},
  labs: {},
  usecases: {},
  questions: 0,
  badges: [],
  onboarded: false,
};

const DEFAULT_SETTINGS: Settings = {
  groqKey: "",
  groqModel: "llama-3.3-70b-versatile",
  mode: "simulate",
  awsRegion: "us-east-1",
  awsAccessKeyId: "",
  awsSecretAccessKey: "",
  awsSessionToken: "",
};

const P_KEY = "bedrock-academy:progress:v1";
const S_KEY = "bedrock-academy:settings:v1";

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}
function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — progress lives in memory only */
  }
}

function earnedBadges(p: Progress): string[] {
  const labDone = (slug: string) => {
    const lab = LABS.find((l) => l.slug === slug)!;
    return lab.objectives.every((o) => p.labs[slug]?.includes(o.id));
  };
  const anyLabRun = Object.values(p.labs).some((objs) => objs.length > 0);
  const ucDone = USE_CASES.filter((u) => u.steps.every((st) => p.usecases?.[u.slug]?.includes(st.id))).length;
  const correct = Object.values(p.quiz).filter(Boolean).length;
  const rules: Record<string, boolean> = {
    "first-steps": p.sections.length > 0,
    "first-call": anyLabRun,
    "quiz-whiz": correct >= 10,
    "prompt-whisperer": labDone("prompt-dojo"),
    "rag-ranger": labDone("rag-studio"),
    bouncer: labDone("guardrail-gym"),
    "agent-smith": labDone("agent-workshop"),
    curious: p.questions >= 5,
    matchmaker: !!p.events["model-finder"],
    navigator: !!p.events["compass"],
    "industry-first": ucDone >= 1,
    "industry-pro": ucDone >= USE_CASES.length,
    halfway: p.modules.length >= 5,
    graduate: p.modules.length >= MODULES.length,
  };
  return BADGES.filter((b) => rules[b.id]).map((b) => b.id);
}

type Ctx = {
  ready: boolean;
  progress: Progress;
  settings: Settings;
  toasts: Toast[];
  award: (key: string, xp: number, title: string, emoji?: string) => void;
  completeSection: (slug: string, sectionId: string) => void;
  completeModule: (slug: string) => void;
  answerQuiz: (qid: string, correct: boolean) => void;
  completeObjective: (lab: string, objective: string) => void;
  toggleUseCaseStep: (slug: string, stepId: string) => void;
  askedQuestion: () => void;
  updateProgress: (patch: Partial<Progress>) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  resetProgress: () => void;
  dismissToast: (id: number) => void;
  apiHeaders: () => Record<string, string>;
};

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState<Progress>(EMPTY);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  useEffect(() => {
    setProgress(load(P_KEY, EMPTY));
    setSettings(load(S_KEY, DEFAULT_SETTINGS));
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) save(P_KEY, progress);
  }, [progress, ready]);
  useEffect(() => {
    if (ready) save(S_KEY, settings);
  }, [settings, ready]);

  const pushToast = useCallback((t: Omit<Toast, "id">) => {
    const id = ++toastId.current;
    setToasts((ts) => [...ts.slice(-3), { ...t, id }]);
    setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== id)), 4200);
  }, []);

  // Badge evaluation whenever progress changes
  useEffect(() => {
    if (!ready) return;
    const earned = earnedBadges(progress);
    const fresh = earned.filter((b) => !progress.badges.includes(b));
    if (fresh.length) {
      setProgress((p) => ({ ...p, badges: [...p.badges, ...fresh] }));
      fresh.forEach((id) => {
        const b = BADGES.find((x) => x.id === id)!;
        pushToast({ kind: "badge", emoji: b.emoji, title: `Badge unlocked: ${b.name}`, sub: b.desc });
      });
    }
  }, [progress, ready, pushToast]);

  // Latest committed progress, plus keys awarded since the last render, so awards are idempotent.
  const progressRef = useRef(progress);
  progressRef.current = progress;
  const pendingKeys = useRef(new Set<string>());

  const award = useCallback(
    (key: string, xp: number, title: string, emoji = "✨") => {
      if (progressRef.current.events[key] !== undefined || pendingKeys.current.has(key)) return;
      pendingKeys.current.add(key);
      setProgress((p) => (p.events[key] !== undefined ? p : { ...p, xp: p.xp + xp, events: { ...p.events, [key]: xp } }));
      if (xp > 0) pushToast({ kind: "xp", emoji, title: `+${xp} XP`, sub: title });
    },
    [pushToast],
  );

  const completeSection = useCallback(
    (slug: string, sectionId: string) => {
      const k = `${slug}:${sectionId}`;
      setProgress((p) => (p.sections.includes(k) ? p : { ...p, sections: [...p.sections, k] }));
      award(`section:${k}`, XP.section, "Section complete", "📖");
    },
    [award],
  );

  const completeModule = useCallback(
    (slug: string) => {
      setProgress((p) => (p.modules.includes(slug) ? p : { ...p, modules: [...p.modules, slug] }));
      award(`module:${slug}`, XP.moduleComplete, "Module complete!", "🏆");
    },
    [award],
  );

  const answerQuiz = useCallback(
    (qid: string, correct: boolean) => {
      setProgress((p) => (qid in p.quiz ? p : { ...p, quiz: { ...p.quiz, [qid]: correct } }));
      if (correct) award(`quiz:${qid}`, XP.quizCorrect, "Correct answer", "🧠");
    },
    [award],
  );

  const completeObjective = useCallback(
    (lab: string, objective: string) => {
      const def = LABS.find((l) => l.slug === lab)?.objectives.find((o) => o.id === objective);
      setProgress((p) => {
        const cur = p.labs[lab] ?? [];
        if (cur.includes(objective)) return p;
        return { ...p, labs: { ...p.labs, [lab]: [...cur, objective] } };
      });
      award(`lab:${lab}:${objective}`, def?.xp ?? 20, def ? `Mission: ${def.text}` : "Mission complete", "🧪");
    },
    [award],
  );

  const toggleUseCaseStep = useCallback(
    (slug: string, stepId: string) => {
      const uc = USE_CASES.find((u) => u.slug === slug);
      if (!uc) return;
      const cur = progressRef.current.usecases?.[slug] ?? [];
      // Steps can be un-checked, but XP is only ever awarded once per step.
      const next = cur.includes(stepId) ? cur.filter((s) => s !== stepId) : [...cur, stepId];
      setProgress((p) => ({ ...p, usecases: { ...p.usecases, [slug]: next } }));
      if (!cur.includes(stepId)) {
        award(`usecase:${slug}:${stepId}`, XP.useCaseStep, "Build step done", "🛠️");
        if (uc.steps.every((s) => next.includes(s.id))) award(`usecase:${slug}`, XP.useCaseComplete, `Use case complete: ${uc.industry}`, "🏭");
      }
    },
    [award],
  );

  const askedQuestion = useCallback(() => {
    const n = progressRef.current.questions + 1;
    setProgress((p) => ({ ...p, questions: p.questions + 1 }));
    // Cap assistant XP at 20 questions
    if (n <= 20) award(`question:${n}`, XP.question, "Curiosity bonus", "💡");
  }, [award]);

  const updateProgress = useCallback((patch: Partial<Progress>) => setProgress((p) => ({ ...p, ...patch })), []);
  const updateSettings = useCallback((patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch })), []);
  const resetProgress = useCallback(() => {
    pendingKeys.current.clear();
    setProgress((p) => ({ ...EMPTY, name: p.name, onboarded: true }));
  }, []);
  const dismissToast = useCallback((id: number) => setToasts((ts) => ts.filter((t) => t.id !== id)), []);

  const apiHeaders = useCallback(() => {
    const h: Record<string, string> = { "content-type": "application/json", "x-bedrock-mode": settings.mode };
    if (settings.groqKey) h["x-groq-key"] = settings.groqKey;
    if (settings.groqModel) h["x-groq-model"] = settings.groqModel;
    if (settings.awsRegion) h["x-aws-region"] = settings.awsRegion;
    if (settings.awsAccessKeyId) h["x-aws-access-key-id"] = settings.awsAccessKeyId;
    if (settings.awsSecretAccessKey) h["x-aws-secret-access-key"] = settings.awsSecretAccessKey;
    if (settings.awsSessionToken) h["x-aws-session-token"] = settings.awsSessionToken;
    return h;
  }, [settings]);

  const value = useMemo<Ctx>(
    () => ({
      ready,
      progress,
      settings,
      toasts,
      award,
      completeSection,
      completeModule,
      answerQuiz,
      completeObjective,
      toggleUseCaseStep,
      askedQuestion,
      updateProgress,
      updateSettings,
      resetProgress,
      dismissToast,
      apiHeaders,
    }),
    [ready, progress, settings, toasts, award, completeSection, completeModule, answerQuiz, completeObjective, toggleUseCaseStep, askedQuestion, updateProgress, updateSettings, resetProgress, dismissToast, apiHeaders],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
