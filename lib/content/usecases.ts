import type { Block } from "./types";
import { DOCS } from "./modules";

export type UseCaseStep = { id: string; title: string; where: string; blocks: Block[] };

export type IndustryUseCase = {
  slug: string;
  order: number;
  exercise: string;
  tech: string;
  industry: string;
  emoji: string;
  gradient: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  minutes: number;
  scenario: { company: string; persona: string; problem: string; solution: string; success: string[] };
  architecture: { emoji: string; label: string; sub?: string }[];
  prerequisites: string[];
  steps: UseCaseStep[];
  tryIt: { label: string; href: string; note: string };
  pitfalls: string[];
  related: { module: string; lab?: string };
  askPrompts: string[];
  docs: { label: string; url: string }[];
};

export const USE_CASES: IndustryUseCase[] = [
  // ───────────────────────────────── 1
  {
    slug: "retail-product-content",
    order: 1,
    exercise: "Invoke Claude or Nova through Bedrock",
    tech: "Python + Boto3",
    industry: "Retail & E-commerce",
    emoji: "🛍️",
    gradient: "from-orange-400 via-pink-500 to-rose-600",
    level: "Beginner",
    minutes: 30,
    scenario: {
      company: "ShopSphere, an online retailer with 50,000 products",
      persona: "Maya, catalog manager",
      problem: "Suppliers send bare product specs. Writing on-brand descriptions, SEO titles and bullet points by hand takes weeks for every seasonal drop.",
      solution: "A Python script calls Amazon Nova or Claude through the Bedrock Converse API, turns each spec into structured, on-brand copy, and scales to the full catalog with batch inference.",
      success: ["New products go live in hours, not weeks", "Consistent brand voice across every listing", "Switch between Nova (cost) and Claude (quality) with one line"],
    },
    architecture: [
      { emoji: "📄", label: "Product specs", sub: "CSV / PIM export" },
      { emoji: "🐍", label: "Python script", sub: "boto3" },
      { emoji: "🪨", label: "Bedrock Converse", sub: "bedrock-runtime" },
      { emoji: "🧠", label: "Nova Lite / Claude", sub: "same API" },
      { emoji: "🧾", label: "JSON copy", sub: "title, bullets, SEO" },
      { emoji: "🛒", label: "Storefront", sub: "PIM / CMS" },
    ],
    prerequisites: ["An AWS account with Bedrock access in us-east-1 or us-west-2", "Python 3.10+ and `pip install boto3`", "AWS CLI configured (`aws configure`) or AWS SSO login"],
    steps: [
      {
        id: "setup",
        title: "Set up credentials and check model access",
        where: "Terminal + Bedrock console → Model catalog",
        blocks: [
          { t: "p", text: "Confirm your identity and list the models you can call. If a model is missing or returns AccessDenied, open it in the **Model catalog** and complete any one-time step (for example the Anthropic use-case form)." },
          {
            t: "code",
            tabs: [
              {
                label: "Terminal",
                lang: "bash",
                code: `pip install boto3
aws sts get-caller-identity                     # who am I?
aws bedrock list-foundation-models --region us-east-1 \\
  --query "modelSummaries[?contains(modelId, 'nova') || contains(modelId, 'claude')].modelId"`,
              },
            ],
          },
        ],
      },
      {
        id: "nova",
        title: "Invoke Amazon Nova with the Converse API",
        where: "product_copy.py",
        blocks: [
          { t: "p", text: "The **system prompt** carries the brand voice. Asking for JSON makes the output easy to load into the catalog." },
          {
            t: "code",
            tabs: [
              {
                label: "product_copy.py",
                lang: "python",
                code: `import json
import boto3

client = boto3.client("bedrock-runtime", region_name="us-east-1")

BRAND_VOICE = """You write product copy for ShopSphere: warm, upbeat, honest, no hype.
Return ONLY JSON: {"title": str (max 60 chars), "bullets": [3 short strings],
"description": str (max 80 words), "seo_keywords": [5 strings]}"""

def generate_copy(spec: str, model_id: str = "us.amazon.nova-lite-v1:0") -> dict:
    response = client.converse(
        modelId=model_id,
        system=[{"text": BRAND_VOICE}],
        messages=[{"role": "user", "content": [{"text": f"<spec>\\n{spec}\\n</spec>"}]}],
        inferenceConfig={"maxTokens": 600, "temperature": 0.4},
    )
    text = response["output"]["message"]["content"][0]["text"]
    usage = response["usage"]
    print(f"{model_id}: {usage['inputTokens']} in / {usage['outputTokens']} out tokens")
    return json.loads(text[text.find("{"): text.rfind("}") + 1])

if __name__ == "__main__":
    spec = "TrailFlask 2.0 | insulated steel bottle | 750 ml | cold 36 h | recycled steel | lifetime warranty"
    print(json.dumps(generate_copy(spec), indent=2))`,
              },
            ],
          },
        ],
      },
      {
        id: "claude",
        title: "Swap to Claude — same code, new model ID",
        where: "product_copy.py",
        blocks: [
          { t: "p", text: "Because Converse is the same for every chat model, comparing Claude with Nova is a one-line change. Run both and compare quality, latency and token cost." },
          {
            t: "code",
            tabs: [
              {
                label: "compare.py",
                lang: "python",
                code: `import time
from product_copy import generate_copy

spec = "CloudCrunch chips | baked | 30% less fat | vegan | gluten-free | Wasabi Lime"

for model_id in [
    "us.amazon.nova-lite-v1:0",                        # fast & low cost
    "us.anthropic.claude-haiku-4-5-20251001-v1:0",     # check the console for newer Claude IDs
]:
    t0 = time.time()
    copy = generate_copy(spec, model_id)
    print(f"{model_id} took {time.time() - t0:.1f}s ->", copy["title"])`,
              },
              {
                label: "InvokeModel (native Claude body)",
                lang: "python",
                code: `# The older, provider-specific way. Good to recognize in existing code.
import json, boto3
client = boto3.client("bedrock-runtime", region_name="us-east-1")

body = {
    "anthropic_version": "bedrock-2023-05-31",
    "max_tokens": 600,
    "system": "You write warm, honest product copy.",
    "messages": [{"role": "user", "content": "Describe a 750 ml insulated bottle."}],
}
resp = client.invoke_model(
    modelId="us.anthropic.claude-haiku-4-5-20251001-v1:0",
    body=json.dumps(body),
)
print(json.loads(resp["body"].read())["content"][0]["text"])`,
              },
            ],
          },
          { t: "callout", kind: "tip", title: "Which one wins?", text: "Typically Nova Lite is cheaper and faster, while Claude follows a subtle brand voice more closely. Score 20 real products before deciding — see **Module 3: The Model Zoo**." },
        ],
      },
      {
        id: "stream",
        title: "Stream the response for the merchandiser UI",
        where: "stream_copy.py",
        blocks: [
          {
            t: "code",
            tabs: [
              {
                label: "stream_copy.py",
                lang: "python",
                code: `import boto3
client = boto3.client("bedrock-runtime", region_name="us-east-1")

stream = client.converse_stream(
    modelId="us.amazon.nova-lite-v1:0",
    messages=[{"role": "user", "content": [{"text": "Write a playful 2-line ad for wasabi chips."}]}],
)
for event in stream["stream"]:
    if "contentBlockDelta" in event:
        print(event["contentBlockDelta"]["delta"]["text"], end="", flush=True)
    elif "metadata" in event:
        print("\\n", event["metadata"]["usage"])`,
              },
            ],
          },
        ],
      },
      {
        id: "scale",
        title: "Scale to 50,000 products with retries and batch inference",
        where: "S3 + Bedrock console → Batch inference",
        blocks: [
          { t: "p", text: "For a few hundred items, loop with adaptive retries. For the full catalog, write one JSONL record per product to S3 and start a **batch inference job**. It's discounted for supported models and avoids throttling." },
          {
            t: "code",
            tabs: [
              {
                label: "Loop with retries",
                lang: "python",
                code: `import csv, json, boto3
from botocore.config import Config
from product_copy import BRAND_VOICE

client = boto3.client("bedrock-runtime", region_name="us-east-1",
                      config=Config(retries={"max_attempts": 8, "mode": "adaptive"}))

with open("specs.csv") as f, open("copy.jsonl", "w") as out:
    for row in csv.DictReader(f):
        resp = client.converse(
            modelId="us.amazon.nova-lite-v1:0",
            system=[{"text": BRAND_VOICE}],
            messages=[{"role": "user", "content": [{"text": row["spec"]}]}],
        )
        out.write(json.dumps({"sku": row["sku"],
                              "copy": resp["output"]["message"]["content"][0]["text"]}) + "\\n")`,
              },
              {
                label: "Batch job",
                lang: "python",
                code: `# input.jsonl — one record per product (modelInput = the model's native body)
# {"recordId": "SKU-001", "modelInput": {"schemaVersion": "messages-v1",
#   "system": [{"text": "...brand voice..."}],
#   "messages": [{"role": "user", "content": [{"text": "<spec>...</spec>"}]}],
#   "inferenceConfig": {"maxTokens": 600}}}

import boto3
bedrock = boto3.client("bedrock", region_name="us-east-1")

job = bedrock.create_model_invocation_job(
    jobName="shopsphere-fall-catalog",
    modelId="amazon.nova-lite-v1:0",
    roleArn="arn:aws:iam::123456789012:role/BedrockBatchRole",
    inputDataConfig={"s3InputDataConfig": {"s3Uri": "s3://shopsphere-genai/batch/input.jsonl"}},
    outputDataConfig={"s3OutputDataConfig": {"s3Uri": "s3://shopsphere-genai/batch/output/"}},
)
print(job["jobArn"])  # poll with get_model_invocation_job(jobIdentifier=...)`,
              },
            ],
          },
        ],
      },
    ],
    tryIt: { label: "Run it in the First Call lab", href: "/sandbox/first-call?preset=retail", note: "Loads ShopSphere's brand voice and a product spec, so you can compare Nova and Claude live." },
    pitfalls: [
      "Parsing JSON blindly. Models occasionally add prose around it, so extract the {...} block or use tool use for guaranteed structure.",
      "Calling a model that needs an inference profile with its bare ID (ValidationException). Use the `us.` profile ID.",
      "Forgetting `maxTokens`. A `stopReason` of `max_tokens` means the JSON was cut off.",
      "Running 50k on-demand calls in a tight loop. Use batch inference instead.",
    ],
    related: { module: "talking-to-models", lab: "first-call" },
    askPrompts: ["How do I make Bedrock return guaranteed JSON?", "Converse vs InvokeModel for Claude — what's the difference?", "How is batch inference priced on Bedrock?"],
    docs: [
      { label: "Converse API", url: DOCS.converse },
      { label: "boto3 bedrock-runtime", url: DOCS.boto3 },
      { label: "Batch inference", url: DOCS.batch },
    ],
  },

  // ───────────────────────────────── 2
  {
    slug: "insurance-pdf-chatbot",
    order: 2,
    exercise: "Build a PDF chatbot",
    tech: "Bedrock Knowledge Bases",
    industry: "Insurance",
    emoji: "📄",
    gradient: "from-amber-300 via-orange-500 to-red-500",
    level: "Intermediate",
    minutes: 45,
    scenario: {
      company: "SafeHarbor Insurance, with 300+ policy PDFs (home, auto, travel)",
      persona: "Raj, a claims adjuster",
      problem: "Adjusters search long PDF policy wordings to answer “Is water damage from a burst pipe covered?” Answers vary by adjuster, and nobody can see where an answer came from.",
      solution: "Upload the policy PDFs to S3, point a Bedrock Knowledge Base at them, and build a chatbot that answers with page-level citations and handles follow-up questions.",
      success: ["Answers in seconds with the exact page cited", "Consistent interpretations across adjusters", "New policy versions are searchable after a single sync"],
    },
    architecture: [
      { emoji: "📄", label: "Policy PDFs", sub: "S3 bucket" },
      { emoji: "✂️", label: "Parse + chunk", sub: "KB ingestion" },
      { emoji: "🔢", label: "Embed", sub: "Titan Embeddings V2" },
      { emoji: "🗄️", label: "Vector store", sub: "quick-create" },
      { emoji: "💬", label: "Chatbot", sub: "RetrieveAndGenerate" },
      { emoji: "📌", label: "Answer + page cite", sub: "citations" },
    ],
    prerequisites: ["An S3 bucket in the same Region as your Knowledge Base", "Access to an embeddings model (Titan Text Embeddings V2) and a generation model", "`pip install boto3 streamlit`"],
    steps: [
      {
        id: "upload",
        title: "Upload the policy PDFs to S3",
        where: "Terminal",
        blocks: [
          {
            t: "code",
            tabs: [
              {
                label: "Terminal",
                lang: "bash",
                code: `BUCKET=safeharbor-policies-yourname   # bucket names are global: make it unique

aws s3 mb "s3://$BUCKET" --region us-east-1
aws s3 cp ./policies/ "s3://$BUCKET/policies/" --recursive
aws s3 ls "s3://$BUCKET/policies/"`,
              },
            ],
          },
        ],
      },
      {
        id: "create-kb",
        title: "Create the Knowledge Base",
        where: "Bedrock console → Knowledge Bases → Create",
        blocks: [
          {
            t: "steps",
            items: [
              { title: "Create → Knowledge Base with vector store", text: "Name it `safeharbor-policies`. Let Bedrock create a new IAM service role." },
              { title: "Data source: Amazon S3", text: "Point it at `s3://…/policies/`." },
              { title: "Parsing", text: "Policies are full of tables, so choose **foundation model as a parser** (or Bedrock Data Automation) instead of the default text parser." },
              { title: "Chunking", text: "Start with **hierarchical** or **semantic** chunking for long legal text. You can tune it later with evaluation." },
              { title: "Embeddings + vector store", text: "**Titan Text Embeddings V2** and a quick-create vector store (for example Amazon OpenSearch Serverless or Amazon S3 Vectors)." },
              { title: "Create → Sync", text: "Syncing runs the ingestion job: parse → chunk → embed → store. Re-sync whenever PDFs change." },
            ],
          },
          { t: "callout", kind: "tip", title: "Test before you code", text: "Use the **Test knowledge base** panel on the right of the console. Ask “Is a burst pipe covered under HomeShield Plus?” and open the source chunks." },
        ],
      },
      {
        id: "query",
        title: "Ask questions from Python with citations",
        where: "pdf_chat.py",
        blocks: [
          {
            t: "code",
            tabs: [
              {
                label: "pdf_chat.py",
                lang: "python",
                code: `import boto3

REGION = "us-east-1"
KB_ID = "ABCDEFGHIJ"   # from the KB details page
MODEL_ARN = f"arn:aws:bedrock:{REGION}::foundation-model/amazon.nova-pro-v1:0"

agent_rt = boto3.client("bedrock-agent-runtime", region_name=REGION)

def ask(question: str, session_id: str | None = None):
    kwargs = {
        "input": {"text": question},
        "retrieveAndGenerateConfiguration": {
            "type": "KNOWLEDGE_BASE",
            "knowledgeBaseConfiguration": {
                "knowledgeBaseId": KB_ID,
                "modelArn": MODEL_ARN,
                "retrievalConfiguration": {"vectorSearchConfiguration": {"numberOfResults": 6}},
            },
        },
    }
    if session_id:                       # keeps the conversation context for follow-ups
        kwargs["sessionId"] = session_id
    resp = agent_rt.retrieve_and_generate(**kwargs)

    sources = []
    for c in resp.get("citations", []):
        for ref in c["retrievedReferences"]:
            uri = ref["location"]["s3Location"]["uri"].split("/")[-1]
            page = ref.get("metadata", {}).get("x-amz-bedrock-kb-document-page-number")
            sources.append(f"{uri} p.{int(page) if page else '?'}")
    return resp["output"]["text"], sorted(set(sources)), resp["sessionId"]

answer, sources, sid = ask("Is water damage from a burst pipe covered under HomeShield Plus?")
print(answer, "\\nSources:", sources)
answer, sources, _ = ask("What's the deductible for that?", session_id=sid)  # follow-up
print(answer, "\\nSources:", sources)`,
              },
            ],
          },
        ],
      },
      {
        id: "ui",
        title: "Wrap it in a chat UI with Streamlit",
        where: "app.py → streamlit run app.py",
        blocks: [
          {
            t: "code",
            tabs: [
              {
                label: "app.py",
                lang: "python",
                code: `import streamlit as st
from pdf_chat import ask

st.set_page_config(page_title="SafeHarbor Policy Assistant", page_icon="📄")
st.title("📄 SafeHarbor Policy Assistant")

if "messages" not in st.session_state:
    st.session_state.messages, st.session_state.sid = [], None

for m in st.session_state.messages:
    st.chat_message(m["role"]).markdown(m["content"])

if q := st.chat_input("Ask about any policy…"):
    st.chat_message("user").markdown(q)
    answer, sources, st.session_state.sid = ask(q, st.session_state.sid)
    text = answer + ("\\n\\n**Sources:** " + ", ".join(sources) if sources else "")
    st.chat_message("assistant").markdown(text)
    st.session_state.messages += [{"role": "user", "content": q},
                                  {"role": "assistant", "content": text}]`,
              },
            ],
          },
        ],
      },
      {
        id: "harden",
        title: "Add guardrails and keep it fresh",
        where: "Console → Guardrails, EventBridge",
        blocks: [
          {
            t: "list",
            items: [
              "Attach a guardrail with a **contextual grounding check** so answers not supported by the policy text are blocked. Use `generationConfiguration.guardrailConfiguration` in RetrieveAndGenerate.",
              "Mask policyholder PII (names, phone numbers, policy numbers via a regex) in outputs.",
              "Re-sync automatically. An S3 event or a nightly EventBridge schedule calls `start_ingestion_job`.",
              "Add a disclaimer in the UI: the bot assists adjusters and doesn't make claim decisions.",
            ],
          },
        ],
      },
    ],
    tryIt: { label: "Simulate it in RAG Studio", href: "/sandbox/rag-studio?preset=insurance", note: "Loads SafeHarbor policy excerpts, so you can watch chunking, retrieval scores and cited answers." },
    pitfalls: [
      "A KB and an S3 bucket in different Regions. Keep them together.",
      "Scanned PDFs without a text layer. Use a foundation-model parser or Data Automation.",
      "Forgetting to re-sync after uploading new versions, so the bot answers from old policies.",
      "Chunks too small for legal clauses. Exceptions get separated from the rule they modify.",
    ],
    related: { module: "knowledge-bases", lab: "rag-studio" },
    askPrompts: ["Which chunking strategy is best for policy PDFs?", "How do I keep a Knowledge Base in sync with S3?", "How do I show page numbers in citations?"],
    docs: [
      { label: "Knowledge Bases", url: DOCS.kb },
      { label: "Guardrails", url: DOCS.guardrails },
    ],
  },

  // ───────────────────────────────── 3
  {
    slug: "banking-enterprise-rag",
    order: 3,
    exercise: "Build an enterprise RAG application",
    tech: "Bedrock + S3",
    industry: "Banking & Financial Services",
    emoji: "🏦",
    gradient: "from-emerald-300 via-teal-500 to-blue-600",
    level: "Advanced",
    minutes: 60,
    scenario: {
      company: "Northwind Bank, with thousands of policies, procedures and regulatory circulars in an S3 data lake",
      persona: "Anika, compliance analyst. Also: Leo, branch operations",
      problem: "Staff in different departments may only see documents they're entitled to. A generic chatbot would leak restricted content, and auditors need every answer traced to its source.",
      solution: "An enterprise RAG API: S3 is the governed source of truth, with metadata on every document. A Knowledge Base syncs automatically, retrieval is filtered by each user's entitlements, and generation runs through Converse with a guardrail and citations.",
      success: ["Users only retrieve documents their role allows", "Every answer has auditable citations", "New circulars are searchable within minutes of landing in S3"],
    },
    architecture: [
      { emoji: "🗂️", label: "S3 data lake", sub: "docs + .metadata.json" },
      { emoji: "⚡", label: "Auto-sync", sub: "S3 event → Lambda" },
      { emoji: "📚", label: "Knowledge Base", sub: "ingestion job" },
      { emoji: "🔐", label: "API + Cognito", sub: "user entitlements" },
      { emoji: "🔎", label: "Retrieve", sub: "metadata filter" },
      { emoji: "🛡️", label: "Converse + Guardrail", sub: "grounded answer" },
      { emoji: "📊", label: "Audit & eval", sub: "logs, RAG eval" },
    ],
    prerequisites: ["Steps from the PDF chatbot use case (a working Knowledge Base)", "An S3 bucket with versioning and SSE-KMS enabled", "A guardrail ID (see Module 7)", "Familiarity with Lambda and IAM roles"],
    steps: [
      {
        id: "lake",
        title: "Organize the S3 data lake with metadata",
        where: "S3",
        blocks: [
          { t: "p", text: "Next to each document, put a sidecar file named `<file>.metadata.json`. Knowledge Bases ingests these attributes so you can filter on them at query time." },
          {
            t: "code",
            tabs: [
              {
                label: "Layout",
                lang: "text",
                code: `s3://northwind-knowledge/
  compliance/aml-procedure-v7.pdf
  compliance/aml-procedure-v7.pdf.metadata.json
  operations/branch-cash-handling.docx
  operations/branch-cash-handling.docx.metadata.json
  regulatory/circular-2026-14.pdf
  regulatory/circular-2026-14.pdf.metadata.json`,
              },
              {
                label: "aml-procedure-v7.pdf.metadata.json",
                lang: "json",
                code: `{
  "metadataAttributes": {
    "department": "compliance",
    "classification": "restricted",
    "doc_type": "procedure",
    "effective_year": 2026
  }
}`,
              },
            ],
          },
        ],
      },
      {
        id: "sync",
        title: "Auto-sync the Knowledge Base when S3 changes",
        where: "Lambda (triggered by S3 ObjectCreated)",
        blocks: [
          {
            t: "code",
            tabs: [
              {
                label: "sync_lambda.py",
                lang: "python",
                code: `import os
import boto3

bedrock_agent = boto3.client("bedrock-agent")

def handler(event, context):
    # One ingestion job processes all new/changed objects in the data source.
    try:
        job = bedrock_agent.start_ingestion_job(
            knowledgeBaseId=os.environ["KB_ID"],
            dataSourceId=os.environ["DATA_SOURCE_ID"],
            description=f"Triggered by {len(event.get('Records', []))} S3 event(s)",
        )
        return {"ingestionJobId": job["ingestionJob"]["ingestionJobId"]}
    except bedrock_agent.exceptions.ConflictException:
        # A sync is already running; the next event (or a schedule) will pick up the change.
        return {"status": "sync already in progress"}`,
              },
            ],
          },
          { t: "callout", kind: "tip", title: "Debounce", text: "Bulk uploads fire many events. Put them in an SQS queue, or run a sync every few minutes on an EventBridge schedule." },
        ],
      },
      {
        id: "retrieve",
        title: "Retrieve with entitlement filters",
        where: "rag_service.py",
        blocks: [
          { t: "p", text: "Use **Retrieve** rather than RetrieveAndGenerate. You get the chunks, and full control over the prompt, model, guardrail and citation format." },
          {
            t: "code",
            tabs: [
              {
                label: "rag_service.py (retrieve)",
                lang: "python",
                code: `import boto3

REGION, KB_ID = "us-east-1", "KB12345678"
agent_rt = boto3.client("bedrock-agent-runtime", region_name=REGION)

def retrieve_for_user(question: str, user: dict, k: int = 6):
    # user comes from the verified Cognito token, e.g. {"departments": ["operations"], "clearance": "internal"}
    allowed = ["public", "internal"] + (["restricted"] if user["clearance"] == "restricted" else [])
    resp = agent_rt.retrieve(
        knowledgeBaseId=KB_ID,
        retrievalQuery={"text": question},
        retrievalConfiguration={"vectorSearchConfiguration": {
            "numberOfResults": k,
            "filter": {"andAll": [
                {"in": {"key": "department", "value": user["departments"] + ["all"]}},
                {"in": {"key": "classification", "value": allowed}},
            ]},
        }},
    )
    return [
        {"text": r["content"]["text"],
         "source": r["location"]["s3Location"]["uri"],
         "score": r["score"]}
        for r in resp["retrievalResults"]
    ]`,
              },
            ],
          },
          { t: "callout", kind: "warn", title: "Never trust the client", text: "Build the filter on the server from the verified identity token. Never accept a department sent by the browser." },
        ],
      },
      {
        id: "generate",
        title: "Generate a grounded, guarded answer with citations",
        where: "rag_service.py",
        blocks: [
          {
            t: "code",
            tabs: [
              {
                label: "rag_service.py (generate)",
                lang: "python",
                code: `runtime = boto3.client("bedrock-runtime", region_name=REGION)

SYSTEM = """You are Northwind Bank's internal policy assistant.
Answer ONLY from the <sources>. Cite like [1], [2]. If the sources don't contain
the answer, say so and suggest who to contact. Never give legal advice."""

def answer(question: str, user: dict) -> dict:
    chunks = retrieve_for_user(question, user)
    if not chunks:
        return {"answer": "I couldn't find anything you have access to on that topic.", "sources": []}
    sources = "\\n\\n".join(f"[{i+1}] {c['text']}" for i, c in enumerate(chunks))
    resp = runtime.converse(
        modelId="us.amazon.nova-pro-v1:0",
        system=[{"text": SYSTEM}],
        messages=[{"role": "user", "content": [
            {"text": f"<sources>\\n{sources}\\n</sources>"},
            {"text": f"Question: {question}"},
        ]}],
        inferenceConfig={"maxTokens": 800, "temperature": 0.1},
        guardrailConfig={"guardrailIdentifier": "gr-northwind", "guardrailVersion": "3"},
    )
    if resp["stopReason"] == "guardrail_intervened":
        return {"answer": "That request isn't something I can help with.", "sources": []}
    return {
        "answer": resp["output"]["message"]["content"][0]["text"],
        "sources": [{"n": i + 1, "uri": c["source"], "score": round(c["score"], 3)} for i, c in enumerate(chunks)],
        "usage": resp["usage"],
    }`,
              },
            ],
          },
        ],
      },
      {
        id: "api",
        title: "Expose it as a secure API",
        where: "API Gateway + Lambda (Cognito authorizer)",
        blocks: [
          {
            t: "code",
            tabs: [
              {
                label: "api_lambda.py",
                lang: "python",
                code: `import json
from rag_service import answer

def handler(event, context):
    claims = event["requestContext"]["authorizer"]["claims"]     # verified by API Gateway + Cognito
    user = {
        "departments": claims["custom:departments"].split(","),
        "clearance": claims["custom:clearance"],
    }
    question = json.loads(event["body"])["question"][:2000]
    result = answer(question, user)
    print(json.dumps({"user": claims["sub"], "q": question, "sources": result["sources"]}))  # audit log
    return {"statusCode": 200, "body": json.dumps(result)}`,
              },
            ],
          },
        ],
      },
      {
        id: "operate",
        title: "Evaluate, monitor and audit",
        where: "Bedrock → Evaluations, Settings, CloudWatch",
        blocks: [
          {
            t: "list",
            items: [
              "Run a **RAG evaluation** job on 50–100 real questions to measure retrieval relevance and answer faithfulness, before and after every chunking change.",
              "Turn on **model invocation logging** (S3 or CloudWatch Logs) and keep CloudTrail for API audit.",
              "Watch the CloudWatch metrics `InvocationLatency`, `InputTokenCount` and `InvocationThrottles` per model.",
              "Use VPC interface endpoints (PrivateLink) for bedrock-runtime and bedrock-agent-runtime, and KMS for the bucket, KB and logs.",
            ],
          },
        ],
      },
    ],
    tryIt: { label: "Simulate it in RAG Studio", href: "/sandbox/rag-studio?preset=banking", note: "Loads Northwind Bank policy snippets. Try a question one department shouldn't see, then tune top-k." },
    pitfalls: [
      "Filtering on the client side or in the prompt. Entitlements must be enforced in the retrieval filter.",
      "Metadata files named wrong. The sidecar must be `<exact file name>.metadata.json` in the same folder.",
      "Over-retrieving (k=20) adds cost and confuses the model. Tune k with evaluation.",
      "No guardrail on outputs, so hallucinated policy statements go unchecked.",
    ],
    related: { module: "knowledge-bases", lab: "rag-studio" },
    askPrompts: ["Retrieve vs RetrieveAndGenerate — when should I use each?", "How do metadata filters work in Bedrock Knowledge Bases?", "How do I secure a RAG app on AWS for a bank?"],
    docs: [
      { label: "Knowledge Bases", url: DOCS.kb },
      { label: "Data protection", url: DOCS.security },
      { label: "Model evaluation", url: DOCS.evaluation },
    ],
  },

  // ───────────────────────────────── 4
  {
    slug: "airline-autonomous-agent",
    order: 4,
    exercise: "Build an autonomous AI agent",
    tech: "Bedrock Agents",
    industry: "Travel & Airlines",
    emoji: "✈️",
    gradient: "from-sky-300 via-indigo-500 to-violet-600",
    level: "Advanced",
    minutes: 60,
    scenario: {
      company: "SkyLark Airways, with thousands of disrupted passengers on stormy days",
      persona: "Passengers in the app. Also: Sofia, head of customer care",
      problem: "When flights are cancelled, call queues explode. Agents look up bookings, check fare rules, rebook and issue vouchers across four systems.",
      solution: "A Bedrock Agent that reasons through the request, calls Lambda tools (find the booking, search flights, rebook, issue a voucher), reads fare rules from a Knowledge Base, and asks the passenger to confirm before issuing compensation.",
      success: ["Most routine rebookings handled end-to-end, 24/7", "Humans focus on complex cases", "Every action logged with the agent's reasoning trace"],
    },
    architecture: [
      { emoji: "📱", label: "Passenger chat", sub: "InvokeAgent" },
      { emoji: "🤖", label: "Bedrock Agent", sub: "instructions + FM" },
      { emoji: "🧭", label: "Orchestration", sub: "plan → act → observe" },
      { emoji: "🔧", label: "Action group", sub: "Lambda tools" },
      { emoji: "📚", label: "Fare rules KB", sub: "Knowledge Base" },
      { emoji: "✋", label: "User confirmation", sub: "before vouchers" },
    ],
    prerequisites: ["An IAM role for the agent (the console can create it)", "A Lambda function in the same Region", "Optional: a fare-rules Knowledge Base from use case 2"],
    steps: [
      {
        id: "lambda",
        title: "Write the tools as a Lambda function",
        where: "Lambda → skylark-agent-tools",
        blocks: [
          { t: "p", text: "With **function details** action groups, Bedrock sends the function name and parameters, and your Lambda returns a text body. The agent decides when to call it." },
          {
            t: "code",
            tabs: [
              {
                label: "tools_lambda.py",
                lang: "python",
                code: `import json

BOOKINGS = {"SKL7Q2": {"name": "A. Rivera", "flight": "SL204", "date": "2026-11-03", "status": "CANCELLED"}}
FLIGHTS = [{"flight": "SL208", "dep": "18:40", "seats": 12}, {"flight": "SL212", "dep": "21:15", "seats": 3}]

def get_booking(p):    return BOOKINGS.get(p["pnr"].upper(), {"error": "not found"})
def search_flights(p): return {"options": FLIGHTS, "route": f"{p['origin']}->{p['destination']}"}
def rebook(p):         return {"pnr": p["pnr"], "new_flight": p["flight"], "status": "CONFIRMED"}
def issue_voucher(p):  return {"pnr": p["pnr"], "voucher": "SKY-150-EUR", "amount_eur": int(p["amount_eur"])}

TOOLS = {f.__name__: f for f in [get_booking, search_flights, rebook, issue_voucher]}

def handler(event, context):
    fn = event["function"]
    params = {p["name"]: p["value"] for p in event.get("parameters", [])}
    result = TOOLS[fn](params)
    return {
        "messageVersion": "1.0",
        "response": {
            "actionGroup": event["actionGroup"],
            "function": fn,
            "functionResponse": {"responseBody": {"TEXT": {"body": json.dumps(result)}}},
        },
    }`,
              },
            ],
          },
        ],
      },
      {
        id: "agent",
        title: "Create the agent with clear instructions",
        where: "Console → Agents → Create (or boto3)",
        blocks: [
          {
            t: "code",
            tabs: [
              {
                label: "create_agent.py",
                lang: "python",
                code: `import boto3
ba = boto3.client("bedrock-agent", region_name="us-east-1")

agent = ba.create_agent(
    agentName="skylark-rebooking-agent",
    foundationModel="us.amazon.nova-pro-v1:0",   # any agent-supported model / profile
    agentResourceRoleArn="arn:aws:iam::123456789012:role/AmazonBedrockExecutionRoleForAgents_skylark",
    idleSessionTTLInSeconds=900,
    instruction=(
        "You are SkyLark Airways' rebooking assistant. Always look up the booking first. "
        "For cancelled flights, offer up to 2 alternative flights on the same route and rebook "
        "the one the passenger chooses. Check the fare rules knowledge base before offering "
        "compensation. Never promise refunds. Be brief, warm and clear."
    ),
)
AGENT_ID = agent["agent"]["agentId"]`,
              },
            ],
          },
        ],
      },
      {
        id: "actions",
        title: "Add the action group (with confirmation) and the KB",
        where: "Console → Agent builder → Action groups / Knowledge bases",
        blocks: [
          {
            t: "code",
            tabs: [
              {
                label: "action_group.py",
                lang: "python",
                code: `p = lambda name, desc, typ="string": {name: {"type": typ, "description": desc, "required": True}}

ba.create_agent_action_group(
    agentId=AGENT_ID, agentVersion="DRAFT",
    actionGroupName="rebooking-tools",
    actionGroupExecutor={"lambda": "arn:aws:lambda:us-east-1:123456789012:function:skylark-agent-tools"},
    functionSchema={"functions": [
        {"name": "get_booking", "description": "Get a booking by PNR", "parameters": p("pnr", "6-char booking code")},
        {"name": "search_flights", "description": "Find alternative flights",
         "parameters": {**p("origin", "IATA code"), **p("destination", "IATA code"), **p("date", "YYYY-MM-DD")}},
        {"name": "rebook", "description": "Rebook a passenger onto a flight",
         "parameters": {**p("pnr", "booking code"), **p("flight", "flight number")}},
        {"name": "issue_voucher", "description": "Issue a compensation voucher",
         "parameters": {**p("pnr", "booking code"), **p("amount_eur", "amount in EUR", "integer")},
         "requireConfirmation": "ENABLED"},          # the passenger must approve first
    ]},
)

ba.associate_agent_knowledge_base(
    agentId=AGENT_ID, agentVersion="DRAFT", knowledgeBaseId="KBFARERULES",
    description="SkyLark fare rules and EU261 compensation policy", knowledgeBaseState="ENABLED",
)`,
              },
              {
                label: "Allow Bedrock to call Lambda",
                lang: "bash",
                code: `AGENT_ID=ABCDEFGHIJ   # from create_agent output

aws lambda add-permission \\
  --function-name skylark-agent-tools \\
  --statement-id bedrock-agent-invoke \\
  --action lambda:InvokeFunction \\
  --principal bedrock.amazonaws.com \\
  --source-arn "arn:aws:bedrock:us-east-1:123456789012:agent/$AGENT_ID"`,
              },
            ],
          },
        ],
      },
      {
        id: "deploy",
        title: "Prepare, alias and invoke the agent with traces",
        where: "invoke_agent.py",
        blocks: [
          {
            t: "code",
            tabs: [
              {
                label: "invoke_agent.py",
                lang: "python",
                code: `import uuid, boto3
ba = boto3.client("bedrock-agent", region_name="us-east-1")
rt = boto3.client("bedrock-agent-runtime", region_name="us-east-1")

ba.prepare_agent(agentId=AGENT_ID)                      # compiles the DRAFT
alias = ba.create_agent_alias(agentId=AGENT_ID, agentAliasName="prod")
ALIAS_ID = alias["agentAlias"]["agentAliasId"]          # wait until status is PREPARED

session = str(uuid.uuid4())
resp = rt.invoke_agent(
    agentId=AGENT_ID, agentAliasId=ALIAS_ID, sessionId=session, enableTrace=True,
    inputText="My flight SL204 tomorrow got cancelled, booking SKL7Q2. Can you get me on something tonight?",
)
for event in resp["completion"]:
    if "chunk" in event:
        print(event["chunk"]["bytes"].decode(), end="")
    elif "trace" in event:
        orch = event["trace"]["trace"].get("orchestrationTrace", {})
        if "rationale" in orch:
            print("\\n🧠", orch["rationale"]["text"])
        if "invocationInput" in orch:
            print("🔧", orch["invocationInput"].get("actionGroupInvocationInput", {}).get("function"))`,
              },
            ],
          },
          { t: "callout", kind: "aws", title: "Confirmation flow", text: "When `issue_voucher` is about to run, the agent returns a confirmation request. Your app shows Approve or Deny and sends the answer back in `sessionState`. No voucher is issued without the passenger's yes." },
        ],
      },
      {
        id: "guard",
        title: "Make it safe for production",
        where: "Agent settings, Guardrails, CloudWatch",
        blocks: [
          {
            t: "list",
            items: [
              "Attach a guardrail to the agent: deny topics like legal threats, and mask payment data.",
              "Use least-privilege Lambda roles, and keep rebooking calls idempotent (pass a request ID).",
              "Cap compensation in code, not just in the instructions. The Lambda rejects amounts above the policy.",
              "Log traces to CloudWatch, and review a sample of conversations each week.",
              "Escalate to a human when the agent is unsure or the passenger asks for one.",
            ],
          },
        ],
      },
    ],
    tryIt: { label: "Watch a tool-use loop in Agent Workshop", href: "/sandbox/agent-workshop?task=airline", note: "Same plan → call tool → observe loop that a Bedrock Agent runs for you, with every step visible." },
    pitfalls: [
      "Vague instructions. Agents need explicit rules about order of operations and limits.",
      "Missing the Lambda resource policy, so the agent fails with an access error on its first tool call.",
      "Testing only the DRAFT. Production must call a prepared alias.",
      "Letting the model decide money amounts with no server-side validation.",
    ],
    related: { module: "agents", lab: "agent-workshop" },
    askPrompts: ["How does user confirmation work in Bedrock Agents?", "Function details vs OpenAPI schema action groups?", "How do I read the orchestration trace of a Bedrock Agent?"],
    docs: [
      { label: "Bedrock Agents", url: DOCS.agents },
      { label: "Tool use", url: DOCS.tools },
    ],
  },

  // ───────────────────────────────── 5
  {
    slug: "manufacturing-workflow",
    order: 5,
    exercise: "Build a multi-step business workflow",
    tech: "Bedrock + Lambda + AgentCore",
    industry: "Manufacturing & Supply Chain",
    emoji: "🏭",
    gradient: "from-fuchsia-400 via-violet-500 to-cyan-500",
    level: "Advanced",
    minutes: 75,
    scenario: {
      company: "Apex Components, a manufacturer that processes 8,000 supplier invoices a month",
      persona: "Ken, accounts-payable lead. Also: procurement buyers",
      problem: "Invoices arrive as PDFs in every format. Clerks key them in by hand, match them to purchase orders, and spend days chasing suppliers about mismatches.",
      solution: "An event-driven workflow. Lambda extracts invoice data with Bedrock, validates it against the PO, and hands exceptions to an AI agent on **AgentCore Runtime** that investigates, drafts the supplier email and opens a ticket. A human approves before anything is sent or paid.",
      success: ["Clean invoices flow straight through to the ERP", "Exceptions arrive pre-investigated, with a drafted email", "Full audit trail per invoice"],
    },
    architecture: [
      { emoji: "📥", label: "Invoice PDF", sub: "S3 upload" },
      { emoji: "λ", label: "Extract", sub: "Lambda + Converse" },
      { emoji: "✅", label: "Validate", sub: "Lambda vs PO (DynamoDB)" },
      { emoji: "🤖", label: "Resolve exceptions", sub: "AgentCore Runtime" },
      { emoji: "🙋", label: "Human approval", sub: "SNS / UI" },
      { emoji: "🏦", label: "Post to ERP", sub: "Lambda" },
    ],
    prerequisites: ["Python 3.10+, the AWS CLI, and Docker or CodeBuild for the AgentCore deployment", "`pip install bedrock-agentcore bedrock-agentcore-starter-toolkit langgraph langchain-aws`", "A DynamoDB table of purchase orders (for the demo, a few items are fine)"],
    steps: [
      {
        id: "extract",
        title: "Step 1 · Extract invoice fields with Bedrock (Lambda)",
        where: "Lambda → apex-extract (S3 trigger)",
        blocks: [
          { t: "p", text: "Send the PDF as a Converse **document block**, and define a tool so the model returns schema-shaped JSON instead of free text." },
          {
            t: "code",
            tabs: [
              {
                label: "extract_lambda.py",
                lang: "python",
                code: `import boto3, json, urllib.parse

s3 = boto3.client("s3")
bedrock = boto3.client("bedrock-runtime")

INVOICE_TOOL = {"toolSpec": {
    "name": "record_invoice",
    "description": "Record the fields extracted from a supplier invoice",
    "inputSchema": {"json": {
        "type": "object",
        "properties": {
            "supplier": {"type": "string"}, "invoice_no": {"type": "string"},
            "po_number": {"type": "string"}, "currency": {"type": "string"},
            "total": {"type": "number"},
            "lines": {"type": "array", "items": {"type": "object", "properties": {
                "sku": {"type": "string"}, "qty": {"type": "number"}, "unit_price": {"type": "number"}}}},
        },
        "required": ["supplier", "invoice_no", "po_number", "total", "lines"],
    }},
}}

def handler(event, context):
    rec = event["Records"][0]["s3"]
    bucket, key = rec["bucket"]["name"], urllib.parse.unquote_plus(rec["object"]["key"])
    pdf = s3.get_object(Bucket=bucket, Key=key)["Body"].read()

    resp = bedrock.converse(
        modelId="us.amazon.nova-pro-v1:0",
        messages=[{"role": "user", "content": [
            {"document": {"format": "pdf", "name": "invoice", "source": {"bytes": pdf}}},
            {"text": "Extract this invoice using the record_invoice tool."},
        ]}],
        toolConfig={"tools": [INVOICE_TOOL], "toolChoice": {"tool": {"name": "record_invoice"}}},
        inferenceConfig={"temperature": 0},
    )
    tool_use = next(c["toolUse"] for c in resp["output"]["message"]["content"] if "toolUse" in c)
    invoice = tool_use["input"] | {"s3_key": key}
    return invoice   # passed to the validate step`,
              },
            ],
          },
        ],
      },
      {
        id: "validate",
        title: "Step 2 · Validate against the purchase order (Lambda)",
        where: "Lambda → apex-validate",
        blocks: [
          {
            t: "code",
            tabs: [
              {
                label: "validate_lambda.py",
                lang: "python",
                code: `import boto3
pos = boto3.resource("dynamodb").Table("apex-purchase-orders")

def handler(invoice, context):
    po = pos.get_item(Key={"po_number": invoice["po_number"]}).get("Item")
    issues = []
    if not po:
        issues.append(f"PO {invoice['po_number']} not found")
    else:
        if abs(float(po["total"]) - invoice["total"]) > 0.01 * float(po["total"]):
            issues.append(f"Total {invoice['total']} differs from PO total {po['total']} by more than 1%")
        po_skus = {l["sku"]: l for l in po["lines"]}
        for line in invoice["lines"]:
            if line["sku"] not in po_skus:
                issues.append(f"SKU {line['sku']} not on PO")
            elif line["qty"] > float(po_skus[line["sku"]]["qty"]):
                issues.append(f"Over-billed qty for {line['sku']}")
    return {"invoice": invoice, "issues": issues, "status": "MATCHED" if not issues else "EXCEPTION"}`,
              },
            ],
          },
        ],
      },
      {
        id: "agent",
        title: "Step 3 · Build the exception-resolver agent (LangGraph on AgentCore)",
        where: "agent.py",
        blocks: [
          { t: "p", text: "AgentCore Runtime hosts any agent framework. This one uses **LangGraph** with Bedrock models, the same pattern as Rocky, this academy's tutor. The agent investigates, drafts a supplier email and opens a ticket. It does **not** pay or send anything." },
          {
            t: "code",
            tabs: [
              {
                label: "agent.py",
                lang: "python",
                code: `from bedrock_agentcore.runtime import BedrockAgentCoreApp
from langchain_aws import ChatBedrockConverse
from langchain_core.tools import tool
from langgraph.prebuilt import create_react_agent

app = BedrockAgentCoreApp()

@tool
def supplier_history(supplier: str) -> dict:
    """Return recent invoice disputes and contact details for a supplier."""
    return {"supplier": supplier, "disputes_last_90d": 2, "contact": "ar@supplier.example"}

@tool
def goods_receipt(po_number: str) -> dict:
    """Return quantities actually received at the warehouse for a PO."""
    return {"po_number": po_number, "received": {"BRK-220": 400, "BLT-M8": 5000}}

@tool
def open_ticket(summary: str, severity: str) -> str:
    """Open an AP exception ticket and return its ID."""
    return "AP-48213"

llm = ChatBedrockConverse(model="us.amazon.nova-pro-v1:0", region_name="us-east-1", temperature=0)
agent = create_react_agent(llm, [supplier_history, goods_receipt, open_ticket], prompt=(
    "You resolve supplier invoice exceptions for Apex Components. Investigate each issue with "
    "the tools, decide the likely root cause, open ONE ticket, and draft a polite supplier email. "
    "Return JSON: {root_cause, ticket_id, email_draft, recommended_action}. Never approve payment."))

@app.entrypoint
def invoke(payload):
    msg = f"Invoice: {payload['invoice']}\\nIssues: {payload['issues']}"
    result = agent.invoke({"messages": [("user", msg)]})
    return {"result": result["messages"][-1].content}

if __name__ == "__main__":
    app.run()   # local test: POST http://localhost:8080/invocations`,
              },
            ],
          },
        ],
      },
      {
        id: "deploy",
        title: "Step 4 · Deploy to AgentCore Runtime",
        where: "Terminal (starter toolkit)",
        blocks: [
          {
            t: "code",
            tabs: [
              {
                label: "Terminal",
                lang: "bash",
                code: `pip install bedrock-agentcore bedrock-agentcore-starter-toolkit langgraph langchain-aws
echo -e "bedrock-agentcore\\nlanggraph\\nlangchain-aws" > requirements.txt

agentcore configure --entrypoint agent.py      # creates the config, execution role and ECR repo
agentcore launch                                # builds the container and deploys to AgentCore Runtime
agentcore invoke '{"invoice": {"po_number": "PO-7781", "total": 18250}, "issues": ["Over-billed qty for BRK-220"]}'`,
              },
            ],
          },
          { t: "callout", kind: "warn", title: "Toolkit commands evolve", text: "The AgentCore starter toolkit is updated often. If a flag differs, run `agentcore --help` or check the AgentCore docs. The concepts stay the same." },
        ],
      },
      {
        id: "orchestrate",
        title: "Step 5 · Call the agent from the workflow (Lambda) and require approval",
        where: "Lambda → apex-resolve",
        blocks: [
          {
            t: "code",
            tabs: [
              {
                label: "resolve_lambda.py",
                lang: "python",
                code: `import json, os, uuid, boto3

agentcore = boto3.client("bedrock-agentcore", region_name="us-east-1")
sns = boto3.client("sns")

def handler(validated, context):
    if validated["status"] == "MATCHED":
        return {"next": "POST_TO_ERP", **validated}

    resp = agentcore.invoke_agent_runtime(
        agentRuntimeArn=os.environ["AGENT_RUNTIME_ARN"],
        runtimeSessionId=f"inv-{validated['invoice']['invoice_no']}-{uuid.uuid4()}",  # 33+ chars
        payload=json.dumps({"invoice": validated["invoice"], "issues": validated["issues"]}),
    )
    proposal = json.loads(resp["response"].read())

    sns.publish(                              # a human reviews the proposal before anything is sent
        TopicArn=os.environ["APPROVAL_TOPIC"],
        Subject=f"Invoice exception {validated['invoice']['invoice_no']}",
        Message=json.dumps(proposal, indent=2),
    )
    return {"next": "AWAITING_APPROVAL", "proposal": proposal}`,
              },
            ],
          },
          { t: "callout", kind: "tip", title: "Optional: Step Functions", text: "Chain extract → validate → resolve → approval (a `.waitForTaskToken` task) → post-to-ERP in an AWS Step Functions state machine for retries, timeouts and a visual run history." },
        ],
      },
      {
        id: "productionize",
        title: "Step 6 · Add memory, a tool gateway and observability",
        where: "AgentCore console",
        blocks: [
          {
            t: "list",
            items: [
              "**AgentCore Memory**: remember supplier-specific patterns across invoices (for example “Supplier X always bills freight separately”).",
              "**AgentCore Gateway**: expose existing ERP and DynamoDB APIs or Lambda functions as MCP tools instead of hard-coding them.",
              "**AgentCore Identity**: give the agent scoped credentials to call the ERP on behalf of the workflow.",
              "**AgentCore Observability**: trace every agent step in CloudWatch, and alarm on error rate and latency.",
              "Use a guardrail on the agent's email drafts, and keep humans approving payments.",
            ],
          },
        ],
      },
    ],
    tryIt: { label: "Simulate the agent step in Agent Workshop", href: "/sandbox/agent-workshop?task=invoice", note: "Run a tool-calling agent that looks up an order and converts currency, the same reasoning loop as the exception resolver." },
    pitfalls: [
      "Letting the agent do everything. Keep deterministic steps (extract, validate, post) as plain Lambda code, and use the agent only where judgment is needed.",
      "No human in the loop for money movements.",
      "Session IDs that are too short. AgentCore requires long, unique session IDs.",
      "Large PDFs over the Converse document size limit. Split pages, or use Bedrock Data Automation.",
    ],
    related: { module: "agents", lab: "agent-workshop" },
    askPrompts: ["When should I use AgentCore instead of Bedrock Agents?", "How do I force JSON output with Converse tool use?", "Lambda vs Step Functions vs AgentCore — how do they fit together?"],
    docs: [
      { label: "Amazon Bedrock AgentCore", url: DOCS.agentcore },
      { label: "Tool use (Converse)", url: DOCS.tools },
      { label: "Bedrock samples (GitHub)", url: DOCS.samples },
    ],
  },
];

export const getUseCase = (slug: string) => USE_CASES.find((u) => u.slug === slug);
