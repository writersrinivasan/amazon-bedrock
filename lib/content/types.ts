export type CodeTab = { label: string; lang: string; code: string };

export type Block =
  | { t: "p"; text: string }
  | { t: "callout"; kind: "tip" | "warn" | "fun" | "aws"; title: string; text: string }
  | { t: "analogy"; emoji: string; title: string; text: string }
  | { t: "list"; items: string[] }
  | { t: "steps"; items: { title: string; text: string }[] }
  | { t: "code"; tabs: CodeTab[] }
  | { t: "flip"; cards: { front: string; back: string; emoji?: string }[] }
  | { t: "compare"; headers: string[]; rows: string[][] }
  | { t: "links"; items: { label: string; url: string; note?: string }[] }
  | { t: "flow"; nodes: { emoji: string; label: string; sub?: string }[] };

export type Section = { id: string; title: string; blocks: Block[] };

export type QuizQ = { id: string; q: string; options: string[]; answer: number; explain: string };

export type Module = {
  slug: string;
  num: number;
  title: string;
  tagline: string;
  emoji: string;
  gradient: string; // tailwind gradient classes
  minutes: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  sections: Section[];
  quiz: QuizQ[];
  labSlug?: string;
  askPrompts: string[];
};
