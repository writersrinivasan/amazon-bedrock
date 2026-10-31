import type { Module } from "./types";

export const DOCS = {
  home: "https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html",
  models: "https://docs.aws.amazon.com/bedrock/latest/userguide/models-supported.html",
  params: "https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters.html",
  converse: "https://docs.aws.amazon.com/bedrock/latest/userguide/conversation-inference.html",
  profiles: "https://docs.aws.amazon.com/bedrock/latest/userguide/inference-profiles-support.html",
  kb: "https://docs.aws.amazon.com/bedrock/latest/userguide/knowledge-base.html",
  guardrails: "https://docs.aws.amazon.com/bedrock/latest/userguide/guardrails.html",
  agents: "https://docs.aws.amazon.com/bedrock/latest/userguide/agents.html",
  tools: "https://docs.aws.amazon.com/bedrock/latest/userguide/tool-use.html",
  custom: "https://docs.aws.amazon.com/bedrock/latest/userguide/custom-models.html",
  caching: "https://docs.aws.amazon.com/bedrock/latest/userguide/prompt-caching.html",
  batch: "https://docs.aws.amazon.com/bedrock/latest/userguide/batch-inference.html",
  evaluation: "https://docs.aws.amazon.com/bedrock/latest/userguide/evaluation.html",
  apiKeys: "https://docs.aws.amazon.com/bedrock/latest/userguide/api-keys.html",
  security: "https://docs.aws.amazon.com/bedrock/latest/userguide/data-protection.html",
  pricing: "https://aws.amazon.com/bedrock/pricing/",
  console: "https://console.aws.amazon.com/bedrock/home",
  catalog: "https://console.aws.amazon.com/bedrock/home#/model-catalog",
  agentcore: "https://aws.amazon.com/bedrock/agentcore/",
  boto3: "https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/bedrock-runtime.html",
  jsSdk: "https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/bedrock-runtime/",
  samples: "https://github.com/aws-samples/amazon-bedrock-samples",
  strands: "https://strandsagents.com/",
};

export const MODULES: Module[] = [
  // ───────────────────────────────── 1
  {
    slug: "bedrock-101",
    num: 1,
    title: "Bedrock 101: The AI Food Court",
    tagline: "What Amazon Bedrock is, why it exists, and the 60-second mental model.",
    emoji: "🍱",
    gradient: "from-orange-400 via-pink-500 to-fuchsia-600",
    minutes: 12,
    level: "Beginner",
    labSlug: "first-call",
    askPrompts: [
      "Explain Amazon Bedrock like I'm 12",
      "How is Bedrock different from calling OpenAI or Anthropic directly?",
      "Is my data used to train the models on Bedrock?",
    ],
    sections: [
      {
        id: "what",
        title: "So… what is Amazon Bedrock?",
        blocks: [
          {
            t: "analogy",
            emoji: "🍱",
            title: "Think of a giant food court",
            text: "Each stall is a world-class AI chef: Anthropic, Meta, Mistral, Amazon Nova, Cohere, DeepSeek and more. You don't build a kitchen, hire staff or buy ovens (GPUs). You walk up with **one tray (one API)**, order from any stall, and pay only for what you eat (tokens).",
          },
          {
            t: "p",
            text: "**Amazon Bedrock** is a fully managed, serverless AWS service that gives you access to high-performing **foundation models (FMs)** from Amazon and leading AI companies through a single API, plus the building blocks to make real apps with them: knowledge bases (RAG), agents, guardrails, evaluation and model customization.",
          },
          {
            t: "flow",
            nodes: [
              { emoji: "🧑‍💻", label: "Your app", sub: "SDK / CLI / HTTP" },
              { emoji: "🔐", label: "IAM auth", sub: "who are you?" },
              { emoji: "🪨", label: "Bedrock Runtime", sub: "one API" },
              { emoji: "🧠", label: "Foundation model", sub: "Claude, Nova, Llama…" },
              { emoji: "📦", label: "Response", sub: "text, JSON, image…" },
            ],
          },
          {
            t: "callout",
            kind: "fun",
            title: "Why \"Bedrock\"?",
            text: "Bedrock is the solid layer of rock under the soil — the foundation everything is built on. Foundation models → Bedrock. Cute, right? 🪨",
          },
        ],
      },
      {
        id: "why",
        title: "Why teams pick Bedrock",
        blocks: [
          {
            t: "list",
            items: [
              "**Choice without lock-in** — swap models by changing a `modelId` string. Same Converse API for all chat models.",
              "**Serverless** — no GPUs to provision, patch or scale. Pay per token (or reserve capacity when you're big).",
              "**Private by design** — your prompts and outputs are not used to train the base models and aren't shared with model providers. Data is encrypted in transit and at rest.",
              "**Enterprise plumbing included** — IAM, VPC endpoints (PrivateLink), CloudWatch, CloudTrail, KMS — everything your security team already trusts.",
              "**Batteries for real apps** — Knowledge Bases, Agents, Guardrails, Flows, Evaluations, Fine-tuning, AgentCore.",
            ],
          },
          {
            t: "callout",
            kind: "aws",
            title: "Remember this one line",
            text: "Bedrock = Models + Tools to build with them + AWS-grade security, all behind one API.",
          },
        ],
      },
      {
        id: "map",
        title: "The Bedrock universe map",
        blocks: [
          { t: "p", text: "Here are the main 'neighborhoods' you'll visit in this academy. Tap a card to flip it." },
          {
            t: "flip",
            cards: [
              { emoji: "🧠", front: "Foundation Models", back: "Pre-trained models for text, chat, vision, images, video, speech and embeddings. Called via Converse / InvokeModel." },
              { emoji: "🎮", front: "Playgrounds", back: "Console UI to chat, compare models side-by-side and tweak parameters — zero code." },
              { emoji: "📚", front: "Knowledge Bases", back: "Managed RAG: connect S3/Confluence/SharePoint/web, auto-chunk + embed + store, then retrieve with citations." },
              { emoji: "🤖", front: "Agents & AgentCore", back: "Models that plan and call tools/APIs. Bedrock Agents (managed) or AgentCore (run any framework, e.g. LangGraph, Strands)." },
              { emoji: "🛡️", front: "Guardrails", back: "Filters for harmful content, denied topics, PII, prompt attacks and hallucinations (grounding checks)." },
              { emoji: "🧪", front: "Evaluations", back: "Compare models & RAG pipelines with automatic metrics, LLM-as-a-judge or human reviewers." },
              { emoji: "🎯", front: "Customization", back: "Fine-tuning, continued pre-training, distillation, and importing your own open-weight models." },
              { emoji: "🔀", front: "Flows & Prompt Mgmt", back: "Visual, deterministic workflows chaining prompts, KBs, Lambda and conditions; versioned prompt templates." },
            ],
          },
        ],
      },
      {
        id: "words",
        title: "Words you'll hear all day",
        blocks: [
          {
            t: "compare",
            headers: ["Term", "Plain English", "Why you care"],
            rows: [
              ["Token", "A chunk of text (~¾ of an English word)", "You pay per input + output token"],
              ["Context window", "How much text the model can 'see' at once", "Long docs need big windows"],
              ["Inference", "Running the model to get an answer", "Each API call = one inference"],
              ["Embedding", "A list of numbers capturing meaning", "Powers semantic search & RAG"],
              ["Model ID", "e.g. amazon.nova-lite-v1:0", "The string you pass to the API"],
              ["Inference profile", "e.g. us.anthropic.… — routes across Regions", "More throughput, required by some models"],
            ],
          },
          { t: "callout", kind: "tip", title: "Hands-on next", text: "After this module, open **Sandbox → Your First Bedrock Call** and send your first Converse request in under a minute." },
        ],
      },
    ],
    quiz: [
      { id: "m1q1", q: "What is the biggest benefit of Bedrock's single API?", options: ["It makes models free", "You can switch models by changing the modelId", "It only works with Amazon models", "It trains models on your data"], answer: 1, explain: "One API + many providers means swapping models is a one-line change." },
      { id: "m1q2", q: "Are your Bedrock prompts used to train the base foundation models?", options: ["Yes, always", "Only for Amazon models", "No — they aren't used to train base models or shared with providers", "Only if you use the playground"], answer: 2, explain: "Bedrock does not use your inputs/outputs to train base models and doesn't share them with model providers." },
      { id: "m1q3", q: "Which Bedrock capability gives you managed RAG?", options: ["Guardrails", "Knowledge Bases", "Provisioned Throughput", "CloudTrail"], answer: 1, explain: "Knowledge Bases handle ingestion, chunking, embedding, storage and retrieval for RAG." },
    ],
  },

  // ───────────────────────────────── 2
  {
    slug: "launchpad",
    num: 2,
    title: "Launchpad: Account, Access & First Call",
    tagline: "Regions, IAM, model access, SDKs and API keys — set up once, build forever.",
    emoji: "🚀",
    gradient: "from-cyan-400 via-sky-500 to-indigo-600",
    minutes: 15,
    level: "Beginner",
    labSlug: "first-call",
    askPrompts: [
      "What IAM permissions do I need to call Bedrock?",
      "What is a cross-region inference profile?",
      "How do Bedrock API keys work?",
    ],
    sections: [
      {
        id: "steps",
        title: "The 6-step launch checklist",
        blocks: [
          {
            t: "steps",
            items: [
              { title: "Get an AWS account", text: "Sign in to the AWS console. In a training, use the sandbox account your instructor gives you." },
              { title: "Pick a Region", text: "Model availability differs per Region. **us-east-1 (N. Virginia)** and **us-west-2 (Oregon)** usually get new models first. Check the 'Model support by Region' table in the docs." },
              { title: "Give yourself permissions (IAM)", text: "For learning, the managed policy **AmazonBedrockFullAccess** is fine. In production, grant least privilege, e.g. only `bedrock:InvokeModel` on specific model ARNs." },
              { title: "Enable the models", text: "Open **Bedrock console → Model catalog**. Most serverless models are ready to use; some providers ask for a one-time step (e.g. a short use-case form for Anthropic, or an AWS Marketplace subscription). If a call returns AccessDenied, check here first." },
              { title: "Try it in the Playground", text: "Chat / Text / Image playgrounds let you test prompts with zero code. Use 'Compare mode' to race two models." },
              { title: "Install an SDK & call the API", text: "Python: `pip install boto3`. JavaScript: `npm i @aws-sdk/client-bedrock-runtime`. CLI: `aws configure` then `aws bedrock-runtime converse …`." },
            ],
          },
          { t: "links", items: [
            { label: "Open the Bedrock console", url: DOCS.console },
            { label: "Model catalog (console)", url: DOCS.catalog, note: "Find model IDs, enable access, open in playground" },
            { label: "Supported models & Regions (docs)", url: DOCS.models },
          ] },
        ],
      },
      {
        id: "iam",
        title: "IAM: the bouncer at the door",
        blocks: [
          { t: "analogy", emoji: "🎟️", title: "IAM is your wristband", text: "Every request to Bedrock is signed with your AWS credentials. IAM checks your wristband: *can this identity invoke this model?* No wristband, no party." },
          {
            t: "code",
            tabs: [
              {
                label: "Least-privilege policy",
                lang: "json",
                code: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "InvokeSpecificModels",
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": [
        "arn:aws:bedrock:us-east-1::foundation-model/amazon.nova-lite-v1:0",
        "arn:aws:bedrock:*::foundation-model/anthropic.*",
        "arn:aws:bedrock:us-east-1:123456789012:inference-profile/*"
      ]
    }
  ]
}`,
              },
            ],
          },
          { t: "callout", kind: "tip", title: "Converse uses the same permissions", text: "`Converse` is authorized by `bedrock:InvokeModel`, and `ConverseStream` by `bedrock:InvokeModelWithResponseStream`." },
        ],
      },
      {
        id: "profiles",
        title: "Model IDs vs. inference profiles",
        blocks: [
          { t: "p", text: "A **model ID** like `amazon.nova-pro-v1:0` targets a model in your current Region. A **cross-Region inference profile** adds a geography prefix — `us.`, `eu.`, `apac.` or `global.` — and lets Bedrock route your request to another Region in that geography when capacity is tight." },
          {
            t: "compare",
            headers: ["You pass…", "What happens", "Use when"],
            rows: [
              ["amazon.nova-pro-v1:0", "Runs in your Region only", "Strict data residency to one Region"],
              ["us.amazon.nova-pro-v1:0", "Routed within US Regions", "More throughput, fewer throttles"],
              ["global.<model-id>", "Routed across commercial Regions worldwide", "Max availability where allowed"],
            ],
          },
          { t: "callout", kind: "warn", title: "Gotcha", text: "Many newer models can **only** be invoked on-demand through an inference profile. If you get a `ValidationException` about on-demand throughput, retry with the `us.`/`eu.`/`global.` profile ID shown in the model catalog." },
          { t: "links", items: [{ label: "Inference profiles (docs)", url: DOCS.profiles }] },
        ],
      },
      {
        id: "first",
        title: "Your first call in 3 languages",
        blocks: [
          {
            t: "code",
            tabs: [
              {
                label: "Python (boto3)",
                lang: "python",
                code: `import boto3

client = boto3.client("bedrock-runtime", region_name="us-east-1")

response = client.converse(
    modelId="amazon.nova-lite-v1:0",
    messages=[{"role": "user", "content": [{"text": "Say hi to my Bedrock class!"}]}],
    inferenceConfig={"maxTokens": 300, "temperature": 0.5},
)

print(response["output"]["message"]["content"][0]["text"])
print(response["usage"])  # inputTokens, outputTokens, totalTokens`,
              },
              {
                label: "JavaScript (SDK v3)",
                lang: "javascript",
                code: `import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({ region: "us-east-1" });

const res = await client.send(new ConverseCommand({
  modelId: "amazon.nova-lite-v1:0",
  messages: [{ role: "user", content: [{ text: "Say hi to my Bedrock class!" }] }],
  inferenceConfig: { maxTokens: 300, temperature: 0.5 },
}));

console.log(res.output.message.content[0].text);`,
              },
              {
                label: "AWS CLI",
                lang: "bash",
                code: `aws bedrock-runtime converse \\
  --region us-east-1 \\
  --model-id amazon.nova-lite-v1:0 \\
  --messages '[{"role":"user","content":[{"text":"Say hi to my Bedrock class!"}]}]'

# Discover models available to you:
aws bedrock list-foundation-models --region us-east-1 --by-provider anthropic`,
              },
            ],
          },
          { t: "callout", kind: "aws", title: "Bedrock API keys", text: "Prefer a simple bearer token for quick experiments? Bedrock supports **API keys** (short-term and long-term). Set `AWS_BEARER_TOKEN_BEDROCK` and the SDKs pick it up. For production, stick with IAM roles and temporary credentials." },
          { t: "links", items: [{ label: "Bedrock API keys (docs)", url: DOCS.apiKeys }, { label: "boto3 bedrock-runtime reference", url: DOCS.boto3 }, { label: "JS SDK v3 bedrock-runtime", url: DOCS.jsSdk }] },
        ],
      },
    ],
    quiz: [
      { id: "m2q1", q: "Which IAM action authorizes a Converse call?", options: ["bedrock:Converse", "bedrock:InvokeModel", "bedrock:Chat", "s3:GetObject"], answer: 1, explain: "Converse is authorized by bedrock:InvokeModel (ConverseStream by InvokeModelWithResponseStream)." },
      { id: "m2q2", q: "What does the `us.` prefix in `us.amazon.nova-pro-v1:0` mean?", options: ["US-only pricing", "A cross-Region inference profile routing within US Regions", "A deprecated model", "The model was trained in the US"], answer: 1, explain: "Geography prefixes identify cross-Region inference profiles." },
      { id: "m2q3", q: "You get AccessDenied for a model you've never used. First place to check?", options: ["CloudFront", "Model catalog / model access in the Bedrock console + your IAM policy", "Route 53", "Reinstall boto3"], answer: 1, explain: "Check that the model is enabled for your account/Region and that IAM allows it." },
    ],
  },

  // ───────────────────────────────── 3
  {
    slug: "model-zoo",
    num: 3,
    title: "The Model Zoo: Pick Your Champion",
    tagline: "Who's who among Bedrock's providers, and a simple recipe for choosing.",
    emoji: "🦁",
    gradient: "from-lime-300 via-emerald-500 to-teal-600",
    minutes: 14,
    level: "Beginner",
    askPrompts: [
      "Which model should I use for a customer support chatbot?",
      "Cheapest model for classifying 1 million emails?",
      "Which Bedrock models can understand images?",
    ],
    sections: [
      {
        id: "providers",
        title: "Meet the providers",
        blocks: [
          {
            t: "compare",
            headers: ["Provider", "Star models", "Superpower"],
            rows: [
              ["Amazon", "Nova Micro/Lite/Pro/Premier, Nova Canvas, Nova Reel, Nova Sonic, Titan Embeddings", "Great price-performance, multimodal, image/video/speech, embeddings"],
              ["Anthropic", "Claude Opus, Sonnet, Haiku", "Top-tier reasoning, coding, agents, long documents, safety"],
              ["Meta", "Llama 4 Maverick / Scout, Llama 3.x", "Open-weight, multimodal, good value"],
              ["Mistral AI", "Mistral Large, Pixtral Large", "Efficient, multilingual, vision"],
              ["Cohere", "Command R+, Embed, Rerank", "Enterprise RAG, embeddings, reranking"],
              ["DeepSeek / OpenAI / Qwen", "DeepSeek-R1, gpt-oss, Qwen3", "Open-weight reasoning & coding"],
              ["Stability AI, Luma, TwelveLabs", "Stable Image, Ray2, Pegasus/Marengo", "Images, video generation, video understanding"],
            ],
          },
          { t: "callout", kind: "tip", title: "Live catalog", text: "The **Models** page in this app lists every model with its ID, when to use it, and direct links. The **Model Finder** there recommends models for your scenario." },
        ],
      },
      {
        id: "recipe",
        title: "The 5-question choosing recipe",
        blocks: [
          {
            t: "steps",
            items: [
              { title: "What goes in & out?", text: "Text only? Images? PDFs? Video? Need to *generate* images or speech? That alone narrows the field fast." },
              { title: "How hard is the thinking?", text: "Simple extraction/classification → small fast models (Nova Micro/Lite, Haiku). Complex reasoning, coding, agents → Claude Sonnet/Opus, Nova Premier." },
              { title: "How long are the inputs?", text: "Check the context window. Whole contracts or codebases need 200K–1M tokens." },
              { title: "Latency & budget?", text: "Chat UIs need low time-to-first-token. Batch jobs can use slower, cheaper options (and batch inference)." },
              { title: "Where & how?", text: "Is it available in your Region? Do you need an inference profile? Any licensing or data residency rule?" },
            ],
          },
          { t: "analogy", emoji: "🚗", title: "Cars, not just 'the best car'", text: "You don't commute in a Formula 1 car or race in a minivan. Pick the **smallest model that passes your evaluation** — then upgrade only where it fails." },
        ],
      },
      {
        id: "evaluate",
        title: "Don't guess — measure",
        blocks: [
          { t: "p", text: "Build a tiny 'golden set' of 20–50 real prompts with expected answers. Run them against 2–3 candidate models using **Playground compare mode** or **Bedrock Model Evaluation** (automatic metrics, LLM-as-a-judge, or human review). Pick the cheapest model that clears your quality bar." },
          { t: "links", items: [{ label: "Model evaluation (docs)", url: DOCS.evaluation }, { label: "Bedrock pricing", url: DOCS.pricing }] },
        ],
      },
    ],
    quiz: [
      { id: "m3q1", q: "You need to generate product images. Which family fits?", options: ["Titan Text Embeddings", "Nova Canvas / Stable Image", "Cohere Rerank", "Llama 3.3 70B"], answer: 1, explain: "Nova Canvas and Stability AI models generate images." },
      { id: "m3q2", q: "Best default strategy for model choice?", options: ["Always use the biggest model", "Smallest model that passes your evaluation", "Random", "Only open-weight models"], answer: 1, explain: "Start small, measure, and upgrade only where quality falls short." },
      { id: "m3q3", q: "Which models are built for reranking search results?", options: ["Cohere Rerank", "Nova Reel", "Luma Ray2", "Nova Sonic"], answer: 0, explain: "Cohere Rerank reorders retrieved passages by relevance." },
    ],
  },

  // ───────────────────────────────── 4
  {
    slug: "talking-to-models",
    num: 4,
    title: "Talking to Models: Converse, Invoke & Streaming",
    tagline: "The APIs you'll actually write, and the dials that change a model's personality.",
    emoji: "📡",
    gradient: "from-violet-400 via-purple-500 to-indigo-600",
    minutes: 18,
    level: "Intermediate",
    labSlug: "param-playground",
    askPrompts: [
      "Converse vs InvokeModel — which should I use?",
      "What does temperature actually do?",
      "How do I stream a response with ConverseStream?",
    ],
    sections: [
      {
        id: "apis",
        title: "Two doors into the model",
        blocks: [
          {
            t: "compare",
            headers: ["", "Converse / ConverseStream", "InvokeModel / …WithResponseStream"],
            rows: [
              ["Request shape", "One unified format for all chat models", "Provider-specific JSON body"],
              ["Switching models", "Change modelId only", "Rewrite the body per provider"],
              ["Tools, images, docs", "Built-in content blocks + toolConfig", "Per provider's native format"],
              ["Best for", "✅ Almost all chat/text apps", "Embeddings, image/video gen, niche params"],
            ],
          },
          { t: "callout", kind: "aws", title: "Rule of thumb", text: "Use **Converse** for anything conversational. Reach for **InvokeModel** for embeddings, image generation, or a provider feature Converse doesn't expose (or pass it via `additionalModelRequestFields`)." },
        ],
      },
      {
        id: "anatomy",
        title: "Anatomy of a Converse request",
        blocks: [
          {
            t: "code",
            tabs: [
              {
                label: "Request",
                lang: "json",
                code: `{
  "modelId": "amazon.nova-pro-v1:0",
  "system": [{ "text": "You are a cheerful AWS tutor." }],
  "messages": [
    { "role": "user", "content": [{ "text": "What is a token?" }] }
  ],
  "inferenceConfig": {
    "maxTokens": 512,
    "temperature": 0.3,
    "topP": 0.9,
    "stopSequences": ["###"]
  }
}`,
              },
              {
                label: "Response",
                lang: "json",
                code: `{
  "output": {
    "message": {
      "role": "assistant",
      "content": [{ "text": "A token is a small chunk of text..." }]
    }
  },
  "stopReason": "end_turn",
  "usage": { "inputTokens": 21, "outputTokens": 87, "totalTokens": 108 },
  "metrics": { "latencyMs": 642 }
}`,
              },
            ],
          },
          { t: "list", items: [
            "`system` — the model's job description & rules.",
            "`messages` — alternating user/assistant turns. **You** send the history each time; the API is stateless.",
            "`content` — a list of blocks: `text`, `image`, `document`, `video`, `toolUse`, `toolResult`, `cachePoint`…",
            "`stopReason` — `end_turn`, `max_tokens` (got cut off!), `stop_sequence`, `tool_use`, `guardrail_intervened`, `content_filtered`.",
          ] },
        ],
      },
      {
        id: "dials",
        title: "The personality dials",
        blocks: [
          {
            t: "flip",
            cards: [
              { emoji: "🌡️", front: "temperature", back: "Randomness. 0 = focused & repeatable (extraction, code). ~0.7–1 = creative (stories, brainstorming)." },
              { emoji: "🎯", front: "topP", back: "Only sample from the smallest set of words whose probabilities add up to P. Lower = safer word choices. Tune temperature OR topP, not both." },
              { emoji: "✂️", front: "maxTokens", back: "Hard cap on output length. If stopReason is max_tokens, your answer was truncated." },
              { emoji: "🛑", front: "stopSequences", back: "Strings that end generation early — handy for templates and structured outputs." },
            ],
          },
          { t: "callout", kind: "tip", title: "Try it live", text: "**Sandbox → Parameter Playground** runs the same prompt at three temperatures side by side so you can *see* randomness." },
        ],
      },
      {
        id: "streaming",
        title: "Streaming & multimodal",
        blocks: [
          { t: "p", text: "Users hate staring at spinners. **ConverseStream** sends tokens as they're generated, so the first words appear in a few hundred milliseconds." },
          {
            t: "code",
            tabs: [
              {
                label: "Stream (Python)",
                lang: "python",
                code: `stream = client.converse_stream(
    modelId="amazon.nova-lite-v1:0",
    messages=[{"role": "user", "content": [{"text": "Write a haiku about S3"}]}],
)
for event in stream["stream"]:
    if "contentBlockDelta" in event:
        print(event["contentBlockDelta"]["delta"]["text"], end="", flush=True)
    if "metadata" in event:
        print("\\n", event["metadata"]["usage"])`,
              },
              {
                label: "Image input (Python)",
                lang: "python",
                code: `with open("receipt.png", "rb") as f:
    image_bytes = f.read()

response = client.converse(
    modelId="amazon.nova-pro-v1:0",
    messages=[{
        "role": "user",
        "content": [
            {"image": {"format": "png", "source": {"bytes": image_bytes}}},
            {"text": "Extract the merchant, date and total as JSON."},
        ],
    }],
)`,
              },
            ],
          },
          { t: "callout", kind: "aws", title: "Batch inference = big savings", text: "Not latency-sensitive? Put thousands of requests in a JSONL file on S3 and run a **batch inference job** — supported models are priced at roughly half the on-demand rate." },
          { t: "links", items: [{ label: "Converse API (docs)", url: DOCS.converse }, { label: "Batch inference (docs)", url: DOCS.batch }, { label: "Inference parameters per model", url: DOCS.params }] },
        ],
      },
    ],
    quiz: [
      { id: "m4q1", q: "Your answer ends mid-sentence and stopReason is `max_tokens`. Fix?", options: ["Lower temperature", "Increase maxTokens", "Add a stop sequence", "Switch Region"], answer: 1, explain: "The output hit the maxTokens cap — raise it (or ask for shorter answers)." },
      { id: "m4q2", q: "Is the Converse API stateful (does it remember previous calls)?", options: ["Yes, it stores sessions", "No — you send the conversation history each time", "Only in us-east-1", "Only with streaming"], answer: 1, explain: "Converse is stateless; your app sends the message history." },
      { id: "m4q3", q: "Best temperature for extracting invoice fields to JSON?", options: ["0–0.2", "0.9", "1.5", "Doesn't matter"], answer: 0, explain: "Low temperature = deterministic, consistent outputs." },
    ],
  },

  // ───────────────────────────────── 5
  {
    slug: "prompt-dojo",
    num: 5,
    title: "Prompt Engineering Dojo",
    tagline: "Turn vague asks into reliable outputs with a few battle-tested moves.",
    emoji: "🥋",
    gradient: "from-rose-400 via-red-500 to-orange-500",
    minutes: 16,
    level: "Intermediate",
    labSlug: "prompt-dojo",
    askPrompts: [
      "Give me a prompt template for summarizing support tickets",
      "What is few-shot prompting?",
      "How does prompt caching save money on Bedrock?",
    ],
    sections: [
      {
        id: "moves",
        title: "The 6 black-belt moves",
        blocks: [
          {
            t: "flip",
            cards: [
              { emoji: "🎭", front: "1. Give it a role", back: "Use the system prompt: 'You are a senior AWS solutions architect who explains things simply.'" },
              { emoji: "📋", front: "2. Be specific", back: "Audience, length, tone, format, what to avoid. 'Summarize in 3 bullets for a CFO, no jargon.'" },
              { emoji: "🧩", front: "3. Show examples", back: "Few-shot: 2–5 input→output pairs teach format and style better than paragraphs of rules." },
              { emoji: "🏷️", front: "4. Structure with tags", back: "Wrap inputs in tags like <document>…</document> so the model knows what's data vs. instructions." },
              { emoji: "🧠", front: "5. Let it think", back: "For tricky tasks, ask it to reason step by step before the final answer (or use a reasoning model)." },
              { emoji: "📐", front: "6. Pin the output", back: "Ask for JSON with an exact schema, or use tool use / structured output to force shape." },
            ],
          },
        ],
      },
      {
        id: "beforeafter",
        title: "Before → After",
        blocks: [
          {
            t: "code",
            tabs: [
              { label: "😬 Before", lang: "text", code: "Summarize this ticket." },
              {
                label: "😎 After",
                lang: "text",
                code: `System: You are a support lead. You write crisp, factual summaries.

User:
<ticket>
{{ticket_text}}
</ticket>

Summarize the ticket for an on-call engineer.
Return JSON exactly like:
{"issue": string, "severity": "low"|"medium"|"high", "next_action": string}
If information is missing, use "unknown". Do not invent details.`,
              },
            ],
          },
          { t: "callout", kind: "fun", title: "Dojo wisdom", text: "\"The model is a brilliant intern on day one: smart, eager, and with zero context about your company.\" Give the intern the context." },
        ],
      },
      {
        id: "bedrock-tools",
        title: "Bedrock prompt power-ups",
        blocks: [
          { t: "list", items: [
            "**Prompt Management** — store versioned prompt templates with variables, test them across models, and reference them by ARN from your code or Flows.",
            "**Prompt optimization** — let Bedrock rewrite a prompt to suit a specific model.",
            "**Prompt caching** — mark a long, repeated prefix (system prompt, big document) with a `cachePoint` block. Cached tokens are cheaper and faster on supported models.",
            "**Intelligent prompt routing** — one endpoint that sends easy prompts to a cheaper model and hard ones to a stronger model in the same family.",
          ] },
          {
            t: "code",
            tabs: [
              {
                label: "Prompt caching",
                lang: "python",
                code: `response = client.converse(
    modelId="us.anthropic.claude-haiku-4-5-20251001-v1:0",
    system=[
        {"text": LONG_POLICY_HANDBOOK},   # thousands of tokens, same every call
        {"cachePoint": {"type": "default"}} # cache everything above this line
    ],
    messages=[{"role": "user", "content": [{"text": "Can I expense a standing desk?"}]}],
)
print(response["usage"])  # look for cacheReadInputTokens / cacheWriteInputTokens`,
              },
            ],
          },
          { t: "links", items: [{ label: "Prompt caching (docs)", url: DOCS.caching }] },
        ],
      },
    ],
    quiz: [
      { id: "m5q1", q: "Best way to teach a model a specific output style?", options: ["Shout in caps", "Few-shot examples", "Higher temperature", "Longer maxTokens"], answer: 1, explain: "Examples demonstrate the exact format and tone you want." },
      { id: "m5q2", q: "Why wrap pasted documents in tags like <document>?", options: ["Makes it cheaper", "Separates data from instructions and reduces confusion/injection", "Required by Bedrock", "It enables streaming"], answer: 1, explain: "Clear delimiters help the model know what's instruction vs. content." },
      { id: "m5q3", q: "Which feature reduces cost for a long system prompt reused on every call?", options: ["Prompt caching", "Provisioned throughput", "Guardrails", "Model evaluation"], answer: 0, explain: "Prompt caching reuses a processed prefix at lower cost and latency." },
    ],
  },

  // ───────────────────────────────── 6
  {
    slug: "knowledge-bases",
    num: 6,
    title: "Knowledge Bases: RAG Without Tears",
    tagline: "Teach a model your company's documents — with citations — without retraining it.",
    emoji: "📚",
    gradient: "from-amber-300 via-orange-500 to-rose-500",
    minutes: 20,
    level: "Intermediate",
    labSlug: "rag-studio",
    askPrompts: [
      "Explain RAG with a simple example",
      "Which vector stores does Bedrock Knowledge Bases support?",
      "When should I use RAG instead of fine-tuning?",
    ],
    sections: [
      {
        id: "rag",
        title: "RAG in one picture",
        blocks: [
          { t: "analogy", emoji: "🎒", title: "Open-book exam", text: "Fine-tuning is making the student memorize the textbook. **RAG** lets the student bring the textbook to the exam — and point to the page they used. Cheaper, always up to date, and you can check the citation." },
          {
            t: "flow",
            nodes: [
              { emoji: "📄", label: "Your docs", sub: "S3, web, Confluence…" },
              { emoji: "✂️", label: "Chunk", sub: "split into pieces" },
              { emoji: "🔢", label: "Embed", sub: "Titan / Cohere" },
              { emoji: "🗄️", label: "Vector store", sub: "OpenSearch, Aurora…" },
              { emoji: "🔎", label: "Retrieve", sub: "top-k similar" },
              { emoji: "🧠", label: "Generate", sub: "answer + citations" },
            ],
          },
        ],
      },
      {
        id: "kb",
        title: "What Knowledge Bases does for you",
        blocks: [
          { t: "list", items: [
            "**Data sources**: Amazon S3, web crawler, Confluence, SharePoint, Salesforce, or custom ingestion.",
            "**Parsing**: default text parsing, or use a foundation model / Bedrock Data Automation to parse tables and images in PDFs.",
            "**Chunking**: fixed-size, hierarchical, semantic, no chunking, or your own Lambda.",
            "**Embeddings**: Amazon Titan Text Embeddings V2, Cohere Embed and others.",
            "**Vector stores**: OpenSearch Serverless, Aurora PostgreSQL (pgvector), Amazon S3 Vectors, Neptune Analytics (GraphRAG), Pinecone, Redis Enterprise Cloud, MongoDB Atlas.",
            "**Query time**: `Retrieve` (just the chunks) or `RetrieveAndGenerate` (answer + citations), metadata filters, reranking, query decomposition.",
            "**Structured data**: ask questions in natural language over data warehouses (e.g. Redshift) — the KB writes the SQL.",
          ] },
        ],
      },
      {
        id: "code",
        title: "Query a Knowledge Base",
        blocks: [
          {
            t: "code",
            tabs: [
              {
                label: "RetrieveAndGenerate",
                lang: "python",
                code: `import boto3

agent_rt = boto3.client("bedrock-agent-runtime", region_name="us-east-1")

resp = agent_rt.retrieve_and_generate(
    input={"text": "What is our parental leave policy?"},
    retrieveAndGenerateConfiguration={
        "type": "KNOWLEDGE_BASE",
        "knowledgeBaseConfiguration": {
            "knowledgeBaseId": "KB12345678",
            "modelArn": "arn:aws:bedrock:us-east-1::foundation-model/amazon.nova-pro-v1:0",
            "retrievalConfiguration": {
                "vectorSearchConfiguration": {"numberOfResults": 5}
            },
        },
    },
)
print(resp["output"]["text"])
for c in resp["citations"]:
    for ref in c["retrievedReferences"]:
        print("source:", ref["location"])`,
              },
              {
                label: "Retrieve only",
                lang: "python",
                code: `resp = agent_rt.retrieve(
    knowledgeBaseId="KB12345678",
    retrievalQuery={"text": "parental leave"},
    retrievalConfiguration={"vectorSearchConfiguration": {
        "numberOfResults": 5,
        "filter": {"equals": {"key": "department", "value": "HR"}},
    }},
)
for r in resp["retrievalResults"]:
    print(round(r["score"], 3), r["content"]["text"][:80])`,
              },
            ],
          },
          { t: "callout", kind: "tip", title: "Build one in the sandbox", text: "**Sandbox → RAG Studio** lets you paste documents, watch them get chunked and embedded, see similarity scores and get a cited answer." },
          { t: "links", items: [{ label: "Knowledge Bases (docs)", url: DOCS.kb }] },
        ],
      },
      {
        id: "tips",
        title: "Pro tips for great RAG",
        blocks: [
          { t: "list", items: [
            "Garbage in, garbage out: clean docs and good titles beat clever prompts.",
            "Chunks ~300–500 tokens with some overlap are a solid starting point; tune with evaluation.",
            "Add metadata (department, date, product) and filter on it.",
            "Use a reranker when top-k results look noisy.",
            "Pair with a **Guardrails contextual grounding check** to catch answers not supported by sources.",
          ] },
        ],
      },
    ],
    quiz: [
      { id: "m6q1", q: "In RAG, what is stored in the vector store?", options: ["Model weights", "Embeddings of your document chunks", "IAM policies", "Raw PDFs only"], answer: 1, explain: "Chunks are embedded into vectors so similar meaning can be searched." },
      { id: "m6q2", q: "Which API returns a generated answer with citations?", options: ["Retrieve", "RetrieveAndGenerate", "ListFoundationModels", "ApplyGuardrail"], answer: 1, explain: "RetrieveAndGenerate retrieves chunks and generates a cited answer." },
      { id: "m6q3", q: "Your policy docs change weekly. Best approach?", options: ["Fine-tune weekly", "RAG with a Knowledge Base + scheduled sync", "Continued pre-training", "Bigger context window only"], answer: 1, explain: "RAG keeps answers fresh by re-syncing the data source — no retraining." },
    ],
  },

  // ───────────────────────────────── 7
  {
    slug: "guardrails",
    num: 7,
    title: "Guardrails: The Friendly Bouncer",
    tagline: "Keep your AI on-topic, polite, PII-safe and grounded — for any model.",
    emoji: "🛡️",
    gradient: "from-emerald-300 via-cyan-500 to-blue-600",
    minutes: 14,
    level: "Intermediate",
    labSlug: "guardrail-gym",
    askPrompts: [
      "What policies can Bedrock Guardrails enforce?",
      "How do I mask PII in model responses?",
      "What is a contextual grounding check?",
    ],
    sections: [
      {
        id: "policies",
        title: "Six filters in your toolbelt",
        blocks: [
          {
            t: "flip",
            cards: [
              { emoji: "🚫", front: "Content filters", back: "Hate, insults, sexual, violence, misconduct — each with strength Low/Medium/High, for inputs and outputs. Includes a Prompt attack filter for jailbreaks & injection." },
              { emoji: "🙅", front: "Denied topics", back: "Describe topics in plain language (e.g. 'investment advice') and the guardrail blocks them." },
              { emoji: "🔤", front: "Word filters", back: "Block exact words/phrases (competitor names, profanity list)." },
              { emoji: "🕵️", front: "Sensitive info (PII)", back: "Detect emails, phones, SSNs, credit cards, custom regex — then BLOCK or MASK (anonymize)." },
              { emoji: "⚓", front: "Contextual grounding", back: "Scores whether the answer is grounded in the source and relevant to the query — catches hallucinations in RAG." },
              { emoji: "🧮", front: "Automated Reasoning", back: "Checks responses against formal rules derived from your policies to verify factual correctness." },
            ],
          },
        ],
      },
      {
        id: "how",
        title: "Two ways to use a guardrail",
        blocks: [
          {
            t: "code",
            tabs: [
              {
                label: "Attach to Converse",
                lang: "python",
                code: `response = client.converse(
    modelId="amazon.nova-lite-v1:0",
    messages=[{"role": "user", "content": [{"text": user_input}]}],
    guardrailConfig={
        "guardrailIdentifier": "gr-abc123",
        "guardrailVersion": "1",
        "trace": "enabled",
    },
)
if response["stopReason"] == "guardrail_intervened":
    print("Blocked:", response["output"]["message"]["content"][0]["text"])`,
              },
              {
                label: "Standalone ApplyGuardrail",
                lang: "python",
                code: `# Works for ANY model — even ones not on Bedrock
result = client.apply_guardrail(
    guardrailIdentifier="gr-abc123",
    guardrailVersion="1",
    source="INPUT",   # or "OUTPUT"
    content=[{"text": {"text": "My card is 4111 1111 1111 1111"}}],
)
print(result["action"])   # GUARDRAIL_INTERVENED | NONE
print(result["outputs"])  # masked text, e.g. "My card is {CREDIT_DEBIT_CARD_NUMBER}"`,
              },
            ],
          },
          { t: "callout", kind: "aws", title: "Versioning", text: "Create a guardrail, iterate on the DRAFT, then publish numbered versions. Point production at a fixed version so changes are deliberate." },
          { t: "links", items: [{ label: "Guardrails (docs)", url: DOCS.guardrails }] },
        ],
      },
      {
        id: "design",
        title: "Designing a guardrail people love",
        blocks: [
          { t: "list", items: [
            "Write friendly blocked messages: tell users what you *can* help with.",
            "Start strict on inputs from the public; relax with evidence.",
            "Mask PII in outputs rather than blocking whole answers when possible.",
            "Log traces and review false positives weekly.",
          ] },
          { t: "callout", kind: "tip", title: "Hands-on", text: "**Sandbox → Guardrail Gym**: configure filters and try to sneak things past the bouncer." },
        ],
      },
    ],
    quiz: [
      { id: "m7q1", q: "Which policy anonymizes phone numbers in a response?", options: ["Denied topics", "Sensitive information filter with MASK", "Word filter", "Prompt caching"], answer: 1, explain: "Sensitive info filters can BLOCK or MASK PII entities." },
      { id: "m7q2", q: "What does `ApplyGuardrail` let you do?", options: ["Train a model", "Evaluate text against a guardrail without invoking a model", "Create IAM users", "Speed up inference"], answer: 1, explain: "ApplyGuardrail checks any text against a guardrail — even for models outside Bedrock." },
      { id: "m7q3", q: "Which check helps detect hallucinations in RAG answers?", options: ["Contextual grounding check", "Word filter", "Profanity filter", "Model access"], answer: 0, explain: "Grounding scores whether the answer is supported by the source." },
    ],
  },

  // ───────────────────────────────── 8
  {
    slug: "agents",
    num: 8,
    title: "Agents & Tool Use: Giving AI Hands",
    tagline: "From a single tool call to multi-agent teams on AgentCore.",
    emoji: "🤖",
    gradient: "from-fuchsia-400 via-violet-500 to-cyan-500",
    minutes: 22,
    level: "Advanced",
    labSlug: "agent-workshop",
    askPrompts: [
      "How does the tool use loop work in the Converse API?",
      "Bedrock Agents vs AgentCore — which one should I use?",
      "Can I run a LangGraph agent on AgentCore?",
    ],
    sections: [
      {
        id: "loop",
        title: "The agent loop",
        blocks: [
          { t: "analogy", emoji: "🧑‍🍳", title: "A chef with a pantry", text: "The model is the chef. **Tools** are the pantry: weather API, database, calculator. The chef reads the order, decides which ingredient to fetch, *you* fetch it, the chef tastes and continues — until the dish is done." },
          {
            t: "flow",
            nodes: [
              { emoji: "💬", label: "User asks", sub: "with toolConfig" },
              { emoji: "🧠", label: "Model plans", sub: "stopReason: tool_use" },
              { emoji: "🔧", label: "Your code runs tool", sub: "API / DB / Lambda" },
              { emoji: "📨", label: "Send toolResult", sub: "back to model" },
              { emoji: "✅", label: "Final answer", sub: "stopReason: end_turn" },
            ],
          },
          {
            t: "code",
            tabs: [
              {
                label: "Converse tool loop (Python)",
                lang: "python",
                code: `tools = [{"toolSpec": {
    "name": "get_weather",
    "description": "Current weather for a city",
    "inputSchema": {"json": {
        "type": "object",
        "properties": {"city": {"type": "string"}},
        "required": ["city"],
    }},
}}]

messages = [{"role": "user", "content": [{"text": "Should I take an umbrella in Seattle?"}]}]

while True:
    resp = client.converse(modelId=MODEL_ID, messages=messages,
                           toolConfig={"tools": tools})
    msg = resp["output"]["message"]
    messages.append(msg)
    if resp["stopReason"] != "tool_use":
        break
    results = []
    for block in msg["content"]:
        if "toolUse" in block:
            tu = block["toolUse"]
            output = get_weather(**tu["input"])          # your function
            results.append({"toolResult": {
                "toolUseId": tu["toolUseId"],
                "content": [{"json": output}],
            }})
    messages.append({"role": "user", "content": results})

print(msg["content"][0]["text"])`,
              },
            ],
          },
        ],
      },
      {
        id: "options",
        title: "Three ways to build agents on AWS",
        blocks: [
          {
            t: "compare",
            headers: ["Option", "What it is", "Pick it when"],
            rows: [
              ["Converse + tool use", "You write the loop (like above)", "Simple assistants, full control, few tools"],
              ["Bedrock Agents", "Managed agent: instructions + action groups (OpenAPI/functions → Lambda) + Knowledge Bases + memory, multi-agent collaboration", "You want AWS to run orchestration with minimal code"],
              ["Bedrock AgentCore", "Run agents built with ANY framework (LangGraph, Strands, CrewAI…) with managed Runtime, Memory, Gateway, Identity, Code Interpreter, Browser & Observability", "Production agents, your own framework, enterprise scale"],
            ],
          },
          { t: "callout", kind: "aws", title: "Bedrock Flows vs. Agents", text: "Need the *same steps every time* (classify → retrieve → summarize → email)? Use **Flows** — deterministic and visual. Need the model to *decide* the steps? Use an **agent**." },
          { t: "callout", kind: "fun", title: "This app is an agent!", text: "The AI Assistant in this academy is a **LangGraph** graph: guardrail → router → retriever → specialist → enricher. Open it and watch each layer light up. The same graph could be deployed on AgentCore Runtime." },
          { t: "links", items: [{ label: "Tool use (docs)", url: DOCS.tools }, { label: "Bedrock Agents (docs)", url: DOCS.agents }, { label: "Amazon Bedrock AgentCore", url: DOCS.agentcore }, { label: "Strands Agents SDK", url: DOCS.strands }] },
        ],
      },
      {
        id: "safety",
        title: "Agent safety checklist",
        blocks: [
          { t: "list", items: [
            "Least-privilege IAM for every tool (Lambda role, Gateway target).",
            "Validate tool inputs — never pass model output straight into SQL or shell.",
            "Require human confirmation for irreversible actions (refunds, deletes, emails). Bedrock Agents supports user confirmation & return-of-control.",
            "Cap iterations and log every step (AgentCore Observability / CloudWatch).",
            "Attach a guardrail to catch prompt injection hidden in tool results or documents.",
          ] },
        ],
      },
    ],
    quiz: [
      { id: "m8q1", q: "What stopReason tells you the model wants to call a tool?", options: ["end_turn", "tool_use", "max_tokens", "content_filtered"], answer: 1, explain: "stopReason tool_use means: run the requested tool(s) and send back toolResult blocks." },
      { id: "m8q2", q: "Who executes the tool in a Converse tool-use loop?", options: ["The model itself", "Your application code", "Bedrock Guardrails", "IAM"], answer: 1, explain: "The model only requests the tool; your code runs it and returns the result." },
      { id: "m8q3", q: "You built an agent in LangGraph and want managed hosting, memory and identity on AWS. Use…", options: ["Bedrock Flows", "Bedrock AgentCore", "Provisioned Throughput", "Titan Embeddings"], answer: 1, explain: "AgentCore runs framework-agnostic agents with managed runtime, memory, identity and more." },
    ],
  },

  // ───────────────────────────────── 9
  {
    slug: "customization",
    num: 9,
    title: "Make It Yours: Customization & Evaluation",
    tagline: "Fine-tuning, distillation, custom model import — and when NOT to bother.",
    emoji: "🎯",
    gradient: "from-sky-300 via-blue-500 to-violet-600",
    minutes: 15,
    level: "Advanced",
    askPrompts: [
      "When should I fine-tune instead of using RAG?",
      "What is model distillation on Bedrock?",
      "How do I import my own Llama model into Bedrock?",
    ],
    sections: [
      {
        id: "ladder",
        title: "The customization ladder",
        blocks: [
          { t: "p", text: "Climb only as high as you need. Each rung costs more time, data and money." },
          {
            t: "steps",
            items: [
              { title: "🪜 1. Prompt engineering", text: "Minutes. No data needed. Always start here." },
              { title: "🪜 2. RAG (Knowledge Bases)", text: "Hours. Your documents. Adds *knowledge*, keeps it fresh, gives citations." },
              { title: "🪜 3. Fine-tuning", text: "Labeled prompt→completion examples (hundreds to thousands). Teaches *style, format, domain behavior*." },
              { title: "🪜 4. Distillation", text: "A big 'teacher' model generates training data so a small, cheap 'student' model mimics it for your use case." },
              { title: "🪜 5. Continued pre-training", text: "Lots of unlabeled domain text (e.g. medical, legal) to deepen domain language." },
              { title: "🪜 6. Custom Model Import", text: "Bring your own fine-tuned open-weight model (e.g. Llama, Mistral, Qwen architectures) and serve it serverlessly on Bedrock." },
            ],
          },
          { t: "callout", kind: "warn", title: "Fine-tuning is not a database", text: "Fine-tuning teaches *how* to respond, not reliable facts. For facts that change, use RAG." },
        ],
      },
      {
        id: "how",
        title: "How a fine-tuning job works",
        blocks: [
          {
            t: "flow",
            nodes: [
              { emoji: "📝", label: "JSONL dataset", sub: "in S3" },
              { emoji: "⚙️", label: "Create job", sub: "base model + hyperparams" },
              { emoji: "📈", label: "Training", sub: "loss metrics" },
              { emoji: "🧪", label: "Evaluate", sub: "vs. base model" },
              { emoji: "🚀", label: "Deploy", sub: "on-demand or Provisioned" },
            ],
          },
          {
            t: "code",
            tabs: [
              {
                label: "Training data (JSONL)",
                lang: "json",
                code: `{"prompt": "Ticket: Can't log in after reset", "completion": "{\\"category\\": \\"auth\\", \\"priority\\": \\"high\\"}"}
{"prompt": "Ticket: Invoice shows wrong VAT", "completion": "{\\"category\\": \\"billing\\", \\"priority\\": \\"medium\\"}"}`,
              },
              {
                label: "Start a job (Python)",
                lang: "python",
                code: `bedrock = boto3.client("bedrock", region_name="us-east-1")

bedrock.create_model_customization_job(
    jobName="ticket-classifier-ft-1",
    customModelName="ticket-classifier",
    roleArn="arn:aws:iam::123456789012:role/BedrockFineTuneRole",
    baseModelIdentifier="amazon.nova-lite-v1:0",   # check which models support FT
    customizationType="FINE_TUNING",
    trainingDataConfig={"s3Uri": "s3://my-bucket/train.jsonl"},
    outputDataConfig={"s3Uri": "s3://my-bucket/output/"},
    hyperParameters={"epochCount": "2", "learningRate": "0.00001"},
)`,
              },
            ],
          },
          { t: "links", items: [{ label: "Custom models (docs)", url: DOCS.custom }] },
        ],
      },
      {
        id: "eval",
        title: "Evaluation: your quality scoreboard",
        blocks: [
          { t: "list", items: [
            "**Automatic** — accuracy, robustness, toxicity on built-in or your datasets.",
            "**LLM-as-a-judge** — a judge model scores correctness, completeness, helpfulness, harmfulness, etc.",
            "**RAG evaluation** — measures retrieval quality and answer faithfulness for Knowledge Bases.",
            "**Human** — your own reviewers or an AWS-managed team for subjective quality.",
          ] },
          { t: "links", items: [{ label: "Model evaluation (docs)", url: DOCS.evaluation }] },
        ],
      },
    ],
    quiz: [
      { id: "m9q1", q: "You want a small model to imitate a large model on your task. Use…", options: ["Distillation", "Word filters", "Batch inference", "Inference profiles"], answer: 0, explain: "Distillation transfers a teacher model's behavior into a cheaper student." },
      { id: "m9q2", q: "What should you try FIRST to improve output quality?", options: ["Continued pre-training", "Prompt engineering", "Custom model import", "Buy Provisioned Throughput"], answer: 1, explain: "Prompting is fastest and cheapest — climb the ladder only as needed." },
      { id: "m9q3", q: "Fine-tuning is best for…", options: ["Storing frequently changing facts", "Teaching consistent style/format/behavior", "Reducing IAM permissions", "Streaming"], answer: 1, explain: "Fine-tuning shapes behavior; RAG supplies changing facts." },
    ],
  },

  // ───────────────────────────────── 10
  {
    slug: "production",
    num: 10,
    title: "Ship It: Cost, Scale, Security & Ops",
    tagline: "Pricing models, throughput, monitoring and a production-ready reference architecture.",
    emoji: "🏁",
    gradient: "from-yellow-300 via-amber-500 to-red-500",
    minutes: 16,
    level: "Advanced",
    askPrompts: [
      "How is Amazon Bedrock priced?",
      "How do I handle ThrottlingException in production?",
      "Draw me a reference architecture for a Bedrock chatbot",
    ],
    sections: [
      {
        id: "pricing",
        title: "How you pay",
        blocks: [
          {
            t: "compare",
            headers: ["Model", "How it works", "Best for"],
            rows: [
              ["On-demand", "Pay per input/output token (per image/second for media)", "Getting started, spiky traffic"],
              ["Batch", "Submit JSONL jobs on S3; discounted vs. on-demand for supported models", "Offline bulk: summaries, tagging, evals"],
              ["Prompt caching", "Cached prefix tokens billed at a reduced rate", "Long repeated system prompts/docs"],
              ["Provisioned Throughput", "Reserve model units for a term; guaranteed capacity", "Steady high volume, custom models"],
            ],
          },
          { t: "callout", kind: "fun", title: "Napkin math", text: "Cost ≈ (input tokens × input price) + (output tokens × output price). Output tokens usually cost several times more than input — so ask for concise answers!" },
          { t: "links", items: [{ label: "Bedrock pricing", url: DOCS.pricing }] },
        ],
      },
      {
        id: "scale",
        title: "Scaling without tears",
        blocks: [
          { t: "list", items: [
            "Check **Service Quotas** for tokens-per-minute and requests-per-minute per model; request increases early.",
            "Use **cross-Region inference profiles** to spread load.",
            "Retry `ThrottlingException` with exponential backoff + jitter (the AWS SDKs do this — tune `max_attempts`).",
            "Stream responses for chat UX; use batch for bulk.",
            "Route easy prompts to small models (or use **Intelligent Prompt Routing**).",
          ] },
          {
            t: "code",
            tabs: [
              {
                label: "Retries (Python)",
                lang: "python",
                code: `from botocore.config import Config

client = boto3.client(
    "bedrock-runtime",
    region_name="us-east-1",
    config=Config(retries={"max_attempts": 8, "mode": "adaptive"}),
)`,
              },
            ],
          },
        ],
      },
      {
        id: "ops",
        title: "Observe & secure",
        blocks: [
          {
            t: "flip",
            cards: [
              { emoji: "📊", front: "CloudWatch metrics", back: "Invocations, InvocationLatency, InputTokenCount, OutputTokenCount, InvocationThrottles, errors — per model." },
              { emoji: "🧾", front: "Invocation logging", back: "Turn on model invocation logging to S3 / CloudWatch Logs to audit prompts & responses." },
              { emoji: "🕵️", front: "CloudTrail", back: "Who called which Bedrock API, when — for audit and compliance." },
              { emoji: "🔒", front: "PrivateLink", back: "VPC interface endpoints keep traffic to Bedrock off the public internet." },
              { emoji: "🗝️", front: "KMS", back: "Customer-managed keys for custom models, knowledge bases, agents and logs." },
              { emoji: "🧑‍⚖️", front: "Compliance", back: "Bedrock is in scope for many programs (e.g. SOC, ISO, HIPAA eligibility, GDPR). Check AWS Artifact for your needs." },
            ],
          },
          { t: "links", items: [{ label: "Data protection (docs)", url: DOCS.security }] },
        ],
      },
      {
        id: "arch",
        title: "Reference architecture: a production chatbot",
        blocks: [
          {
            t: "flow",
            nodes: [
              { emoji: "🌐", label: "Web / mobile", sub: "Amplify, CloudFront" },
              { emoji: "🔑", label: "Auth", sub: "Cognito" },
              { emoji: "🚪", label: "API", sub: "API Gateway / Lambda" },
              { emoji: "🛡️", label: "Guardrail", sub: "input + output" },
              { emoji: "📚", label: "Knowledge Base", sub: "RAG + citations" },
              { emoji: "🧠", label: "Converse", sub: "inference profile" },
              { emoji: "📊", label: "Observe", sub: "CloudWatch, logs" },
            ],
          },
          { t: "callout", kind: "tip", title: "Graduation challenge", text: "Sketch this architecture for a use case at your company, then ask the AI Assistant to critique it. Then claim your certificate on the Journey page! 🎓" },
          { t: "links", items: [{ label: "Amazon Bedrock samples on GitHub", url: DOCS.samples }] },
        ],
      },
    ],
    quiz: [
      { id: "m10q1", q: "Cheapest way to summarize 2 million archived documents overnight?", options: ["On-demand with streaming", "Batch inference", "Provisioned Throughput for 6 months", "Playground"], answer: 1, explain: "Batch inference is discounted and built for non-urgent bulk jobs." },
      { id: "m10q2", q: "Keep Bedrock traffic off the public internet with…", options: ["CloudFront", "VPC interface endpoints (PrivateLink)", "S3 versioning", "Route 53"], answer: 1, explain: "PrivateLink endpoints keep traffic inside the AWS network." },
      { id: "m10q3", q: "Getting ThrottlingException under load. Good responses? (pick the best)", options: ["Retry with backoff + cross-Region profile + quota increase", "Disable IAM", "Raise temperature", "Switch to InvokeModel"], answer: 0, explain: "Backoff, spreading load, and quotas address throttling." },
    ],
  },
];

export const getModule = (slug: string) => MODULES.find((m) => m.slug === slug);
