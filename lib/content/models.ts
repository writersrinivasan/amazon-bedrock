import { DOCS } from "./modules";

export type Modality = "text" | "image" | "video" | "audio" | "document" | "embedding";
export type UseCase =
  | "chat"
  | "reasoning"
  | "coding"
  | "agents"
  | "rag"
  | "extraction"
  | "summarization"
  | "vision"
  | "image-gen"
  | "video-gen"
  | "speech"
  | "embeddings"
  | "rerank"
  | "multilingual";

export type BedrockModel = {
  id: string;
  name: string;
  provider: string;
  modelId: string;
  profileHint?: string;
  input: Modality[];
  output: Modality[];
  context?: string;
  cost: 1 | 2 | 3 | 4; // relative $ to $$$$
  speed: 1 | 2 | 3; // relative: 3 = fastest
  quality: 1 | 2 | 3 | 4;
  useCases: UseCase[];
  api: "Converse" | "InvokeModel" | "StartAsyncInvoke" | "InvokeModelWithBidirectionalStream" | "Rerank";
  tagline: string;
  whenToUse: string;
  whenNot: string;
  providerUrl?: string;
};

export const PROVIDERS: Record<string, { color: string; emoji: string; url: string }> = {
  Amazon: { color: "from-orange-400 to-amber-300", emoji: "🟧", url: "https://aws.amazon.com/ai/generative-ai/nova/" },
  Anthropic: { color: "from-amber-200 to-orange-400", emoji: "✳️", url: "https://aws.amazon.com/bedrock/anthropic/" },
  Meta: { color: "from-sky-400 to-blue-600", emoji: "🦙", url: "https://aws.amazon.com/bedrock/llama/" },
  "Mistral AI": { color: "from-orange-500 to-red-500", emoji: "🌬️", url: "https://aws.amazon.com/bedrock/mistral/" },
  Cohere: { color: "from-emerald-300 to-teal-500", emoji: "🧭", url: "https://aws.amazon.com/bedrock/cohere/" },
  "AI21 Labs": { color: "from-pink-400 to-fuchsia-600", emoji: "🔷", url: "https://aws.amazon.com/bedrock/ai21/" },
  DeepSeek: { color: "from-indigo-400 to-blue-700", emoji: "🐋", url: "https://aws.amazon.com/bedrock/deepseek/" },
  OpenAI: { color: "from-slate-200 to-slate-500", emoji: "⚪", url: DOCS.models },
  Qwen: { color: "from-violet-400 to-purple-700", emoji: "🐉", url: DOCS.models },
  "Stability AI": { color: "from-purple-400 to-pink-500", emoji: "🎨", url: "https://aws.amazon.com/bedrock/stability-ai/" },
  Writer: { color: "from-lime-300 to-green-600", emoji: "✍️", url: DOCS.models },
  "Luma AI": { color: "from-cyan-300 to-indigo-500", emoji: "🎬", url: DOCS.models },
  TwelveLabs: { color: "from-rose-300 to-red-500", emoji: "📹", url: DOCS.models },
};

export const MODELS: BedrockModel[] = [
  // Amazon
  { id: "nova-micro", name: "Nova Micro", provider: "Amazon", modelId: "amazon.nova-micro-v1:0", profileHint: "us.amazon.nova-micro-v1:0", input: ["text"], output: ["text"], context: "128K", cost: 1, speed: 3, quality: 2, useCases: ["chat", "extraction", "summarization", "multilingual"], api: "Converse", tagline: "Text-only speed demon at a tiny price.", whenToUse: "High-volume classification, routing, short summaries, autocomplete where latency and cost matter most.", whenNot: "Images/documents, deep reasoning or long multi-step agents." },
  { id: "nova-lite", name: "Nova Lite", provider: "Amazon", modelId: "amazon.nova-lite-v1:0", profileHint: "us.amazon.nova-lite-v1:0", input: ["text", "image", "video", "document"], output: ["text"], context: "300K", cost: 1, speed: 3, quality: 2, useCases: ["chat", "vision", "extraction", "summarization", "rag"], api: "Converse", tagline: "Cheap, fast and multimodal — the workshop favorite.", whenToUse: "Everyday chat, doc/receipt understanding, RAG answers, labs and prototypes.", whenNot: "Hard reasoning or complex coding where bigger models shine." },
  { id: "nova-2-lite", name: "Nova 2 Lite", provider: "Amazon", modelId: "amazon.nova-2-lite-v1:0", profileHint: "global.amazon.nova-2-lite-v1:0", input: ["text", "image", "video", "document"], output: ["text"], context: "1M", cost: 1, speed: 3, quality: 3, useCases: ["chat", "reasoning", "agents", "vision", "rag"], api: "Converse", tagline: "Next-gen Nova with optional extended thinking.", whenToUse: "Price-performance workloads that benefit from reasoning, tool use and long context.", whenNot: "When you need image/video generation (use Canvas/Reel)." },
  { id: "nova-pro", name: "Nova Pro", provider: "Amazon", modelId: "amazon.nova-pro-v1:0", profileHint: "us.amazon.nova-pro-v1:0", input: ["text", "image", "video", "document"], output: ["text"], context: "300K", cost: 2, speed: 2, quality: 3, useCases: ["chat", "vision", "agents", "rag", "summarization"], api: "Converse", tagline: "Balanced multimodal workhorse.", whenToUse: "Production assistants, video/document analysis, agentic workflows with moderate complexity.", whenNot: "Ultra-cheap bulk tasks (Micro/Lite) or frontier reasoning (Premier/Claude)." },
  { id: "nova-premier", name: "Nova Premier", provider: "Amazon", modelId: "amazon.nova-premier-v1:0", profileHint: "us.amazon.nova-premier-v1:0", input: ["text", "image", "video", "document"], output: ["text"], context: "1M", cost: 3, speed: 1, quality: 4, useCases: ["reasoning", "agents", "rag", "summarization"], api: "Converse", tagline: "Amazon's most capable Nova and a great distillation teacher.", whenToUse: "Complex multi-step tasks, very long context, teacher model for distilling into Micro/Lite/Pro.", whenNot: "Simple, latency-critical chat." },
  { id: "nova-canvas", name: "Nova Canvas", provider: "Amazon", modelId: "amazon.nova-canvas-v1:0", input: ["text", "image"], output: ["image"], cost: 2, speed: 2, quality: 3, useCases: ["image-gen"], api: "InvokeModel", tagline: "Studio-quality image generation & editing.", whenToUse: "Marketing visuals, product shots, inpainting/outpainting, background removal, color-guided images.", whenNot: "Understanding images (use a vision chat model)." },
  { id: "nova-reel", name: "Nova Reel", provider: "Amazon", modelId: "amazon.nova-reel-v1:1", input: ["text", "image"], output: ["video"], cost: 3, speed: 1, quality: 3, useCases: ["video-gen"], api: "StartAsyncInvoke", tagline: "Text/image → short video clips (async, output to S3).", whenToUse: "Ads, social clips, storyboards; multi-shot videos.", whenNot: "Real-time needs — generation runs asynchronously." },
  { id: "nova-sonic", name: "Nova Sonic", provider: "Amazon", modelId: "amazon.nova-sonic-v1:0", input: ["audio"], output: ["audio", "text"], cost: 2, speed: 3, quality: 3, useCases: ["speech", "chat", "agents"], api: "InvokeModelWithBidirectionalStream", tagline: "Real-time speech-to-speech conversations.", whenToUse: "Voice assistants, call centers, hands-free apps with natural turn-taking.", whenNot: "Batch transcription only (consider Amazon Transcribe)." },
  { id: "titan-embed-v2", name: "Titan Text Embeddings V2", provider: "Amazon", modelId: "amazon.titan-embed-text-v2:0", input: ["text"], output: ["embedding"], context: "8K tokens", cost: 1, speed: 3, quality: 3, useCases: ["embeddings", "rag", "multilingual"], api: "InvokeModel", tagline: "Default embedding model for Knowledge Bases (256/512/1024 dims).", whenToUse: "Semantic search, RAG, clustering, dedup.", whenNot: "Generating text." },
  { id: "titan-embed-image", name: "Titan Multimodal Embeddings G1", provider: "Amazon", modelId: "amazon.titan-embed-image-v1", input: ["text", "image"], output: ["embedding"], cost: 1, speed: 3, quality: 2, useCases: ["embeddings", "vision"], api: "InvokeModel", tagline: "Search images with text (and vice versa).", whenToUse: "Visual product search, image recommendations.", whenNot: "Text-only RAG (use Text Embeddings V2)." },

  // Anthropic
  { id: "claude-opus-5-5", name: "Claude Opus 5.5", provider: "Anthropic", modelId: "anthropic.claude-opus-5-5", input: ["text", "image", "document"], output: ["text"], context: "1M", cost: 4, speed: 1, quality: 4, useCases: ["reasoning", "coding", "agents", "rag", "summarization", "vision"], api: "Converse", tagline: "Anthropic's frontier Opus for the hardest problems.", whenToUse: "Complex agents, large codebases, deep research, high-stakes analysis.", whenNot: "Cheap high-volume tasks — try Haiku or Sonnet first." },
  { id: "claude-sonnet-5-5", name: "Claude Sonnet 5.5", provider: "Anthropic", modelId: "anthropic.claude-sonnet-5-5", input: ["text", "image", "document"], output: ["text"], context: "1M", cost: 3, speed: 2, quality: 4, useCases: ["coding", "agents", "chat", "reasoning", "rag", "vision"], api: "Converse", tagline: "Speed + intelligence for everyday coding and agents.", whenToUse: "Production assistants, coding copilots, tool-heavy agents, document analysis.", whenNot: "Trivial classification at massive scale." },
  { id: "claude-haiku-5-5", name: "Claude Haiku 5.5", provider: "Anthropic", modelId: "anthropic.claude-haiku-5-5", input: ["text", "image", "document"], output: ["text"], context: "1M", cost: 1, speed: 3, quality: 3, useCases: ["chat", "extraction", "summarization", "agents", "vision"], api: "Converse", tagline: "Fast, affordable Claude for real-time apps.", whenToUse: "Customer chat, sub-agents, extraction, moderation at scale.", whenNot: "The most demanding multi-step reasoning." },
  { id: "claude-haiku-4-5", name: "Claude Haiku 4.5", provider: "Anthropic", modelId: "anthropic.claude-haiku-4-5-20251001-v1:0", profileHint: "us.anthropic.claude-haiku-4-5-20251001-v1:0", input: ["text", "image", "document"], output: ["text"], context: "200K", cost: 2, speed: 3, quality: 3, useCases: ["chat", "coding", "agents", "extraction"], api: "Converse", tagline: "Previous-gen small Claude, widely deployed.", whenToUse: "Existing workloads already tuned for it; supports prompt caching.", whenNot: "New builds — evaluate Haiku 5.5 first." },

  // Meta
  { id: "llama4-maverick", name: "Llama 4 Maverick 17B", provider: "Meta", modelId: "meta.llama4-maverick-17b-instruct-v1:0", profileHint: "us.meta.llama4-maverick-17b-instruct-v1:0", input: ["text", "image"], output: ["text"], cost: 2, speed: 2, quality: 3, useCases: ["chat", "vision", "multilingual", "coding"], api: "Converse", tagline: "Open-weight mixture-of-experts with native vision.", whenToUse: "Multilingual multimodal assistants, open-weight preference.", whenNot: "When you need the strongest closed-model reasoning." },
  { id: "llama4-scout", name: "Llama 4 Scout 17B", provider: "Meta", modelId: "meta.llama4-scout-17b-instruct-v1:0", profileHint: "us.meta.llama4-scout-17b-instruct-v1:0", input: ["text", "image"], output: ["text"], cost: 1, speed: 3, quality: 2, useCases: ["summarization", "rag", "vision"], api: "Converse", tagline: "Efficient Llama 4 with very long context.", whenToUse: "Long-document summarization and retrieval on a budget.", whenNot: "Complex agentic tool use." },
  { id: "llama3-3-70b", name: "Llama 3.3 70B Instruct", provider: "Meta", modelId: "meta.llama3-3-70b-instruct-v1:0", profileHint: "us.meta.llama3-3-70b-instruct-v1:0", input: ["text"], output: ["text"], context: "128K", cost: 2, speed: 2, quality: 3, useCases: ["chat", "coding", "multilingual"], api: "Converse", tagline: "Popular open-weight text model.", whenToUse: "General chat & text tasks; also a common base for Custom Model Import.", whenNot: "Image inputs." },

  // Mistral
  { id: "mistral-large", name: "Mistral Large (24.07)", provider: "Mistral AI", modelId: "mistral.mistral-large-2407-v1:0", input: ["text"], output: ["text"], context: "128K", cost: 3, speed: 2, quality: 3, useCases: ["chat", "coding", "multilingual", "agents"], api: "Converse", tagline: "Multilingual flagship with strong function calling.", whenToUse: "European-language apps, code, tool use.", whenNot: "Vision tasks (use Pixtral)." },
  { id: "pixtral-large", name: "Pixtral Large (25.02)", provider: "Mistral AI", modelId: "mistral.pixtral-large-2502-v1:0", profileHint: "us.mistral.pixtral-large-2502-v1:0", input: ["text", "image"], output: ["text"], context: "128K", cost: 3, speed: 2, quality: 3, useCases: ["vision", "extraction", "chat"], api: "Converse", tagline: "Mistral's multimodal model for charts & documents.", whenToUse: "Chart/diagram understanding, document Q&A with images.", whenNot: "Pure text bulk jobs." },

  // Cohere
  { id: "command-r-plus", name: "Command R+", provider: "Cohere", modelId: "cohere.command-r-plus-v1:0", input: ["text"], output: ["text"], context: "128K", cost: 3, speed: 2, quality: 3, useCases: ["rag", "agents", "multilingual"], api: "Converse", tagline: "Built for enterprise RAG & tool use.", whenToUse: "Grounded answers with citations, multilingual enterprise search.", whenNot: "Image inputs or creative writing." },
  { id: "cohere-embed-multi", name: "Embed Multilingual v3", provider: "Cohere", modelId: "cohere.embed-multilingual-v3", input: ["text"], output: ["embedding"], cost: 1, speed: 3, quality: 3, useCases: ["embeddings", "rag", "multilingual"], api: "InvokeModel", tagline: "Embeddings across 100+ languages.", whenToUse: "Cross-language semantic search and RAG.", whenNot: "Generating text." },
  { id: "cohere-rerank", name: "Rerank 3.5", provider: "Cohere", modelId: "cohere.rerank-v3-5:0", input: ["text"], output: ["text"], cost: 1, speed: 3, quality: 3, useCases: ["rerank", "rag"], api: "Rerank", tagline: "Re-orders retrieved passages by true relevance.", whenToUse: "Improve RAG precision after vector search (also usable inside Knowledge Bases).", whenNot: "As a standalone chat model." },

  // AI21
  { id: "jamba-large", name: "Jamba 1.5 Large", provider: "AI21 Labs", modelId: "ai21.jamba-1-5-large-v1:0", input: ["text"], output: ["text"], context: "256K", cost: 3, speed: 2, quality: 3, useCases: ["summarization", "rag", "extraction"], api: "Converse", tagline: "Hybrid SSM-Transformer for long documents.", whenToUse: "Long-context summarization, financial/legal doc analysis.", whenNot: "Vision tasks." },

  // DeepSeek / OpenAI / Qwen
  { id: "deepseek-r1", name: "DeepSeek-R1", provider: "DeepSeek", modelId: "deepseek.r1-v1:0", profileHint: "us.deepseek.r1-v1:0", input: ["text"], output: ["text"], context: "128K", cost: 2, speed: 1, quality: 3, useCases: ["reasoning", "coding"], api: "Converse", tagline: "Open reasoning model that shows its thinking.", whenToUse: "Math, logic puzzles, step-by-step analysis.", whenNot: "Low-latency chat." },
  { id: "gpt-oss-120b", name: "gpt-oss-120b", provider: "OpenAI", modelId: "openai.gpt-oss-120b-1:0", input: ["text"], output: ["text"], context: "128K", cost: 1, speed: 2, quality: 3, useCases: ["reasoning", "coding", "agents"], api: "Converse", tagline: "OpenAI open-weight reasoning model.", whenToUse: "Cost-efficient reasoning, tool use, coding.", whenNot: "Image/document inputs." },
  { id: "gpt-oss-20b", name: "gpt-oss-20b", provider: "OpenAI", modelId: "openai.gpt-oss-20b-1:0", input: ["text"], output: ["text"], context: "128K", cost: 1, speed: 3, quality: 2, useCases: ["reasoning", "chat"], api: "Converse", tagline: "Small, fast open-weight reasoner.", whenToUse: "Lightweight reasoning at low cost.", whenNot: "Complex long agents." },
  { id: "qwen3-coder", name: "Qwen3 Coder 480B", provider: "Qwen", modelId: "qwen.qwen3-coder-480b-a35b-v1:0", input: ["text"], output: ["text"], cost: 2, speed: 2, quality: 3, useCases: ["coding", "agents"], api: "Converse", tagline: "Open-weight agentic coding specialist.", whenToUse: "Code generation, repo-level tasks, coding agents.", whenNot: "General multimodal chat." },

  // Writer
  { id: "palmyra-x5", name: "Palmyra X5", provider: "Writer", modelId: "writer.palmyra-x5-v1:0", profileHint: "us.writer.palmyra-x5-v1:0", input: ["text"], output: ["text"], context: "1M", cost: 2, speed: 2, quality: 3, useCases: ["agents", "summarization", "rag"], api: "Converse", tagline: "Enterprise model with huge context.", whenToUse: "Enterprise agents over very large document sets.", whenNot: "Vision tasks." },

  // Images & video
  { id: "stable-image-ultra", name: "Stable Image Ultra", provider: "Stability AI", modelId: "stability.stable-image-ultra-v1:1", input: ["text"], output: ["image"], cost: 3, speed: 1, quality: 4, useCases: ["image-gen"], api: "InvokeModel", tagline: "Photorealistic, premium image generation.", whenToUse: "Hero images, ads, high-detail visuals.", whenNot: "Lots of cheap drafts (use SD 3.5 / Canvas)." },
  { id: "sd3-5-large", name: "Stable Diffusion 3.5 Large", provider: "Stability AI", modelId: "stability.sd3-5-large-v1:0", input: ["text", "image"], output: ["image"], cost: 2, speed: 2, quality: 3, useCases: ["image-gen"], api: "InvokeModel", tagline: "Versatile text-to-image with great prompt adherence.", whenToUse: "Concept art, varied styles, iteration.", whenNot: "Image understanding." },
  { id: "luma-ray2", name: "Luma Ray2", provider: "Luma AI", modelId: "luma.ray-v2:0", input: ["text"], output: ["video"], cost: 4, speed: 1, quality: 4, useCases: ["video-gen"], api: "StartAsyncInvoke", tagline: "Cinematic, realistic video generation.", whenToUse: "High-quality short videos with realistic motion.", whenNot: "Real-time or budget-constrained work." },
  { id: "pegasus", name: "Pegasus 1.2", provider: "TwelveLabs", modelId: "twelvelabs.pegasus-1-2-v1:0", profileHint: "us.twelvelabs.pegasus-1-2-v1:0", input: ["video", "text"], output: ["text"], cost: 2, speed: 2, quality: 3, useCases: ["vision", "summarization"], api: "InvokeModel", tagline: "Ask questions about videos.", whenToUse: "Video summaries, highlights, search over video libraries.", whenNot: "Generating video." },
];

export const USE_CASE_LABELS: Record<UseCase, string> = {
  chat: "💬 Chat",
  reasoning: "🧠 Reasoning",
  coding: "👩‍💻 Coding",
  agents: "🤖 Agents",
  rag: "📚 RAG",
  extraction: "🧾 Extraction",
  summarization: "📝 Summaries",
  vision: "👁️ Vision",
  "image-gen": "🎨 Image gen",
  "video-gen": "🎬 Video gen",
  speech: "🎙️ Speech",
  embeddings: "🔢 Embeddings",
  rerank: "🔀 Rerank",
  multilingual: "🌍 Multilingual",
};

/** Models the sandbox lets you pick for chat-style labs. */
export const SANDBOX_MODELS = MODELS.filter((m) => m.api === "Converse").map((m) => ({
  label: `${m.name} · ${m.provider}`,
  value: m.profileHint ?? m.modelId,
}));
