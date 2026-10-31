"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import type { QuizQ } from "@/lib/content/types";
import { useStore } from "@/lib/store";

export function Quiz({ questions }: { questions: QuizQ[] }) {
  const { progress, answerQuiz } = useStore();
  return (
    <div className="space-y-4">
      {questions.map((q, n) => (
        <Question key={q.id} q={q} n={n + 1} prior={progress.quiz[q.id]} onAnswer={(ok) => answerQuiz(q.id, ok)} />
      ))}
    </div>
  );
}

function Question({ q, n, prior, onAnswer }: { q: QuizQ; n: number; prior?: boolean; onAnswer: (ok: boolean) => void }) {
  const [choice, setPicked] = useState<number | null>(null);
  // Progress hydrates from storage after mount, so derive the previously-answered state on every render.
  const picked = choice !== null ? choice : prior === undefined ? null : prior ? q.answer : -1;
  const answered = picked !== null;
  const correct = picked === q.answer;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="text-[11px] font-bold uppercase tracking-widest text-fuchsia-300">Question {n}</div>
      <div className="mt-1 font-semibold text-white">{q.q}</div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {q.options.map((o, i) => (
          <button
            key={o}
            disabled={answered}
            onClick={() => {
              setPicked(i);
              onAnswer(i === q.answer);
            }}
            className={clsx(
              "rounded-xl border px-3 py-2.5 text-left text-sm transition",
              !answered && "border-white/10 bg-white/5 hover:border-fuchsia-300/50 hover:bg-fuchsia-400/10",
              answered && i === q.answer && "border-emerald-300/60 bg-emerald-400/15 text-emerald-100",
              answered && i === picked && i !== q.answer && "border-rose-300/60 bg-rose-400/15 text-rose-100",
              answered && i !== q.answer && i !== picked && "border-white/5 bg-white/[0.02] text-slate-500",
            )}
          >
            <span className="mr-2 font-mono text-xs text-slate-400">{String.fromCharCode(65 + i)}</span>
            {o}
          </button>
        ))}
      </div>
      {answered && (
        <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className={clsx("mt-3 rounded-xl p-3 text-sm", correct ? "bg-emerald-400/10 text-emerald-100" : "bg-amber-400/10 text-amber-100")}>
          {correct ? "🎯 Nailed it! " : picked === -1 ? "📝 You answered this before. " : "🤔 Not quite. "}
          {q.explain}
        </motion.div>
      )}
    </div>
  );
}
