# 🪨 Bedrock Academy

A colorful, gamified, hands-on training app for **Amazon Bedrock**, built with Next.js 15, Tailwind, Framer Motion and a **LangGraph** agentic AI tutor.

| Area | What participants get |
| --- | --- |
| 📖 **Learn** | 10 story-driven modules (food-court analogies, flip cards, flow diagrams, code tabs, quizzes) from "What is Bedrock?" to production architecture |
| 🦁 **Models** | Catalog of 30+ Bedrock models: model ID, inference profile, modalities, cost/speed/power meters, *when to use / when to skip*, links to provider page, parameters docs and pricing, plus a **Model Finder** wizard |
| 🧭 **Compass** | "I want to… → use this" decision guide (feature, why, when not, API, console location, module, lab), a yes/no decision tree and a console map |
| 🧪 **Sandbox** | 6 labs: First Call, Parameter Playground, Prompt Dojo, RAG Studio, Guardrail Gym, Agent Workshop. Every lab shows the **exact request/response JSON** and **live-generated Python / JavaScript / AWS CLI code** |
| 🏭 **Use Cases** | 5 industry builds in order: ① Retail: invoke Claude/Nova (Python + Boto3) ② Insurance: PDF chatbot (Knowledge Bases) ③ Banking: enterprise RAG (Bedrock + S3) ④ Airline: autonomous agent (Bedrock Agents) ⑤ Manufacturing: multi-step workflow (Bedrock + Lambda + AgentCore). Each has a business story, an architecture flow, step-by-step code with XP, pitfalls, and a pre-loaded sandbox simulation. Content lives in `lib/content/usecases.ts` |
| 🤖 **AI Assistant** | "Rocky", a LangGraph pipeline (guardrail → router → retriever → 5 specialist agents → enricher) with a live **Agent X-ray** showing each layer, its timing, raw output and its Amazon Bedrock equivalent |
| 🏆 **Journey** | XP, 6 levels, 12 badges, lab missions, a printable certificate |

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
```

No keys are needed to explore: everything runs in **offline demo mode**, with real API shapes and code but placeholder answers.

## Keys (all optional, BYOK)

Participants can paste keys on the **Settings** page. Keys are stored only in their browser's localStorage and are sent with each request to this app's own API routes. They are never sent anywhere else, and the server doesn't store them.

| Key | Unlocks |
| --- | --- |
| **Groq API key** | Full AI answers from Rocky (LangGraph + `@langchain/groq`), and the **Simulated** sandbox engine: Bedrock Converse-shaped requests and responses, answered by Groq |
| **AWS credentials** (or the server's credential chain) | **Live Bedrock** mode: real `bedrock-runtime` Converse calls |

As the trainer, you can also set the keys once on the server: copy `.env.example` to `.env.local` and fill in `GROQ_API_KEY` and/or the AWS variables. Participants' own keys override the server's.

> 🔐 For classes, prefer short-lived credentials from a sandbox account with a least-privilege policy (`bedrock:InvokeModel` and `bedrock:InvokeModelWithResponseStream` only).

## Architecture

```
app/
  page.tsx                 Home: hero, persona paths, journey map
  learn/[slug]             Lesson renderer (blocks, quiz, lab link, "Ask Rocky")
  models, compass          Catalog + Model Finder, decision guide
  sandbox/[lab]            6 interactive labs
  assistant                Chat + Agent X-ray
  journey, settings        Gamification, BYOK
  api/converse             One Converse endpoint, three engines (live / simulated / offline)
  api/guardrail            Local guardrail engine that returns ApplyGuardrail-shaped responses
  api/assistant            Runs the LangGraph graph and streams node events over SSE
lib/
  content/                 Curriculum, models, labs, XP/levels/badges (edit these to customize)
  server/converse.ts       Bedrock ⇄ Groq adapter (messages, tools, stop reasons, usage)
  server/agent/graph.ts    LangGraph StateGraph: guardrail → router → retriever → specialists → enricher
  server/agent/retrieval.ts BM25 index over the course content, model catalog and labs
  store.tsx                Progress + settings (localStorage), XP toasts, badge rules
```

### How the agent graph streams

Each node is wrapped in a `layer()` helper that sends `node:start` and `node:end` events (with timing, summary and raw data) through `config.configurable.emit`. Specialist nodes stream tokens from `ChatGroq.stream()`. `/api/assistant` forwards all of these as Server-Sent Events, and the X-ray view lights up each layer as its events arrive.

## Customizing for your session

- **Content:** edit `lib/content/modules.ts`. Block types are `p`, `callout`, `analogy`, `list`, `steps`, `code`, `flip`, `compare`, `links` and `flow`.
- **Models:** edit `lib/content/models.ts`. AWS adds models often, so check IDs against the console's model catalog for your Region before the session.
- **XP & badges:** edit `lib/content/gamification.ts`, and the badge rules in `lib/store.tsx`.

## Security notes before deploying publicly

- **The API routes have no login or rate limit.** If you set `GROQ_API_KEY` or AWS credentials on the server, anyone who can reach the URL can spend them. For a public deployment, put the app behind authentication (e.g. Cognito, or your host's password protection) or don't set server-side keys, so participants bring their own.
- **BYOK keys travel in request headers** to this app's own API. Always serve the app over HTTPS.
- **`npm audit`** reports a PostCSS advisory bundled inside Next.js 15. It only affects processing untrusted CSS at build time; this app builds only its own CSS. The fix requires Next.js 16, a major upgrade.

## Deploy

Works on any Node host (Vercel, Amplify Hosting, App Runner, ECS). For Live mode on AWS, attach an IAM role with Bedrock invoke permissions; the SDK picks it up automatically.
