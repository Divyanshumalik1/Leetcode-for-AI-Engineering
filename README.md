# 🤖 AI Engineering LeetCode

> A hands-on implementation bank for **AI engineering**: LLMs, RAG, agents, MCP, evals, memory, security, observability and AI platforms. It covers the major frameworks and **AWS and Azure**, and goes from **POC to enterprise scale**. Built for **AI Engineer / Applied AI / Agent Engineer** interviews at SDE-2 and senior level.

Every item ends in something you can run: a repo, a module, a benchmark, an experiment or a working system. Definition questions like "what is RAG?" aren't counted. You learn those by building.

<!-- badges:start -->
![Questions](https://img.shields.io/badge/questions-555-blue)
![Started](https://img.shields.io/badge/started-1-orange)
![Python](https://img.shields.io/badge/Python-0%20mastered-informational)
![TypeScript](https://img.shields.io/badge/TypeScript-0%20mastered-informational)
![Done](https://img.shields.io/badge/done-0%2F555-brightgreen)
<!-- badges:end -->

---

## 📌 How to use this repo

**Don't try to do everything.** Start with the [⭐ Mandatory 30](#-the-mandatory-30), then do the rest of the ⭐ questions (107 in total), following the [progression](#-the-progression). Treat the rest as depth and variation drills.

### The 3-attempt rule

The tracker marks a language mastered on your first `pass`, but every attempt is logged, so this rule still works as a practice habit.

| Attempt | Rules | Goal |
|---|---|---|
| **1** | Build it from the docs and your own notes. Get it working end to end. | Understand the primitive |
| **2** | Add tests, an eval set and numbers: recall, latency, cost. | Prove it works |
| **3** | Rebuild it from a blank repo, timed, explaining every decision out loud. Then handle one follow-up. | Interview-ready |

### ✅ Definition of "Mastered"

You can **build it**, **test it**, **evaluate it with real numbers**, **explain the tradeoffs**, and **adapt it when the requirements change**. Typical changes are "make it multi-tenant", "it costs too much" and "it must run on Azure".

### Legend

| Mark | Meaning |
|---|---|
| `[x]` | Done: mastered in every language you chose for that question (ticked automatically) |
| 📂 | Link to your solution folder |
| `py ✅ (2)` | Mastered in Python, after 2 attempts |
| `ts 🟡 (1)` | TypeScript: 1 attempt so far, last one partial (🔴 failed, ⚪ not attempted yet) |
| ⭐ | Most important: the Mandatory 30 plus the other core questions (107 in total) |
| 🆕 | Added beyond the original 210 |

> **Don't edit the checkboxes by hand.** GitHub doesn't make checkboxes clickable in repository files, so the tracker ticks them: `npm run log` updates this README, and a GitHub Action re-syncs it on every push.

### Difficulty

| Level | Sections | Typical time | What you're learning |
|---|---|---|---|
| 🟢 Foundations | 1–6 | 30–90 min | The primitives |
| 🟡 Retrieval & RAG | 7–12 | 1–3 h | Benchmark it, don't just check that it runs |
| 🟠 Agents & frameworks | 13–28 | 2–5 h | State, retries, failures, loops, concurrency, tool safety, checkpoints, cost |
| 🔴 Production & cloud | 29–39 | Half a day to several days | Build it, evaluate it, observe it, secure it, scale it, explain it |

### Practical tips

- **Languages:** practice in Python and TypeScript (see [Two languages](#two-languages-python-and-typescript)). Python has the widest AI tooling; most model SDKs, LangChain, LangGraph and the cloud SDKs also have TypeScript versions.
- **Keep API costs low:** develop against small or local models (Ollama, section 27), and switch to frontier models only for final evals. Set a spending limit with every provider and cloud account.
- **Measure everything:** most items in sections 7 onwards should end with a short `BENCHMARK.md` table of numbers.

---

## ⚙️ Setup & daily workflow

### One-time setup

You need **Node 20+**, **Python 3.11+** and **Git**. Docker is optional, for the local databases.

**Windows (PowerShell):**
```powershell
git clone <your-repo-url>
cd ai-engineering-leetcode
npm install
python -m venv .venv
.venv\Scripts\python -m pip install -r requirements.txt
Copy-Item .env.example .env      # then add only the API keys you use
npm run today
```

**macOS / Linux:**
```bash
git clone <your-repo-url> && cd ai-engineering-leetcode
npm install
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
cp .env.example .env
npm run today
```

The tracker finds `.venv` on its own, so you don't need to activate it to run tests. Both languages read API keys from the same `.env`.

Local Postgres + pgvector, Qdrant and Redis: `npm run services:up`. Add Neo4j with `docker compose --profile graph up -d`.

### Two languages: Python and TypeScript

Every question gets **one spec** (`README.md`) and a subfolder per language: `py/` and/or `ts/`.

| Sections | Default languages | Why |
|---|---|---|
| Most of them (1–20, 22, 28–33, 35, 36) | Python **and** TypeScript | Model SDKs, LangChain/LangGraph, MCP and the AWS/Azure SDKs exist in both |
| LlamaIndex & Haystack, multi-agent frameworks, DSPy & co., fine-tuning, serving (21, 23, 24, 26, 27) | Python | The tools are Python-first or Python-only |
| TypeScript AI stack, AI UI (25, 34) | TypeScript | Vercel AI SDK, Mastra, front-end |
| Capstones, system design, drills (37–39) | none | No fixed language |

Pick something else per question with `--lang py`, `--lang ts` or `--lang both`, and add a language later with `add-lang`.

### The loop for every problem

```bash
npm run new      -- hybrid retrieval             # 1. scaffold a folder from the question (py/ + ts/ by default here)
                                                 # 2. write the spec in its README.md, then the tests
npm run t        -- hybrid-retrieval --lang py   # 3. run the tests; they re-run every time you save
npm run bench    -- hybrid-retrieval --lang ts   #    benchmark problems: score + latency over eval/dataset.jsonl
npm run play     -- naive-rag --lang py          #    run the module, or start the API (py :8000, ts :3000)
npm run log      -- hybrid-retrieval --lang py --result partial --time 75 --missed "no score normalization"
                                                 # 4. logs the attempt; updates NOTES.md, PROGRESS.md and this README
npm run reset    -- hybrid-retrieval --lang py   # 5. before the next attempt: archives your code (tests and evals stay)
npm run add-lang -- haystack-pipeline ts         # add the other language to a question you've started
npm run today                                    # what's due and which ⭐ problem to start next
```

- **`--lang` is only needed when a question has both languages.** With one, the tracker picks it.
- **Every attempt is recorded** in the problem's `NOTES.md` and in `PROGRESS.md`, with its language, date, time, result and what you missed.
- **Mastered:** your first `pass` in a language marks that language mastered. Mastery is tracked separately for each language.
- **Done (the checkbox):** ticked when every language you chose for that question is mastered.
- **Retries:** a failed or partial attempt comes due again after 3 days (`npm run today` shows it).
- **Finding a question:** `npm run new` takes any words from the question. If several match, it lists them so you can add a word.
- **Tests that call real APIs** are skipped unless `RUN_LIVE=1`, so normal test runs are free: `@pytest.mark.live` in Python, the `live(...)` helper in TypeScript. Everywhere else use the fakes: `common.fake_llm.FakeLLM` / `common.fake_embed.fake_embed` in Python, `FakeLLM` / `fakeEmbed` from `@common/fake-llm` and `@common/fake-embed` in TypeScript.

### Repository structure

Folders are created only when you start a problem.

```
ai-engineering-leetcode/
├── 01-llm/              sections 1–2
├── 02-vectors/          sections 3–4
├── 03-rag/              sections 5–10
├── 04-evals/            sections 11–12, 18
├── 05-agents/           sections 13–17, 19
├── 06-frameworks/       sections 20–25
├── 07-models/           sections 26–28
├── 08-production/       sections 29–34
├── 09-aws/              section 35
├── 10-azure/            section 36
├── 11-capstones/        section 37
├── 12-system-design/    section 38
├── 13-drills/           section 39
├── _templates/          one template per problem kind, with shared/, py/ and ts/ parts
├── common/              FakeLLM and fake embeddings for offline tests (Python and TypeScript)
├── scripts/             the tracker (fl.mjs + tracker.config.mjs)
├── PROGRESS.md          every attempt you've logged
└── README.md            this file — checkboxes and progress update automatically
```

### What each problem folder looks like

```
03-rag/001-hybrid-retrieval/
├── README.md          ← one spec for both languages
├── NOTES.md           ← every attempt, per language
├── BENCHMARK.md       ← numbers from both languages (benchmark problems)
├── eval/dataset.jsonl ← one eval set, shared
├── meta.json          ← used by the tracker
├── py/                ← hybrid_retrieval.py, test_hybrid_retrieval.py, bench.py   (pytest)
└── ts/                ← hybrid-retrieval.ts, hybrid-retrieval.test.ts, bench.ts   (Vitest)
```

| Kind | Used for | Python (`py/`) | TypeScript (`ts/`) |
|---|---|---|---|
| `code` | Most implementation problems | `<name>.py`, `test_<name>.py` | `<name>.ts`, `<name>.test.ts` |
| `bench` | Anything to measure: vectors, chunking, retrieval, evals, serving | + `bench.py` | + `bench.ts` |
| `service` | RAG systems, platform and gateway builds | FastAPI app + test | `src/app.ts`, `src/server.ts`, `tests/` (Express + Supertest) |
| `cloud` | AWS and Azure | SDK code + test | SDK code + test (`infra/`, `COST.md`, `TEARDOWN.md` shared) |
| `capstone` | POC → enterprise projects | – | – (stage checklist, `ARCHITECTURE.md`, `EVALS.md`, `RUNBOOK.md`, `src/`) |
| `design` | AI system design | – | – (`design.md`) |
| `drill` | Incident drills | – | – (investigation log, `POSTMORTEM.md`) |

After `npm run reset`, earlier attempts live in `<lang>/attempts/attempt-N/`. Problems you started before two-language support keep their files in the folder root; they still work, and `add-lang` adds the other language next to them.

---

## 🧭 The progression

```text
                    AI ENGINEERING
                         │
        ┌────────────────┼────────────────┐
        ↓                ↓                ↓
     LLMs             Retrieval         Agents
        │                │                │
        ↓                ↓                ↓
   Embeddings          RAG          Tool Calling
        │                │                │
        └────────────┬───┴────┬───────────┘
                     ↓        ↓
                  Context   Memory
                     │        │
                     └────┬───┘
                          ↓
                    MCP & protocols
                          ↓
                    Multi-Agent
                          ↓
                    ┌─────┴─────┐
                    ↓           ↓
                  Evals      Security
                    │           │
                    └─────┬─────┘
                          ↓
                    Observability
                          ↓
                 AI Platform & Gateway
                          ↓
              ┌───────────┴───────────┐
              ↓                       ↓
             AWS                    Azure
              └───────────┬───────────┘
                          ↓
              POC → Enterprise capstones
```

Learn the frameworks (sections 20–25) **after** you've built the primitive yourself. Build a ReAct loop by hand, then build it in LangGraph. That way you know what the framework is doing for you.

---

## ⭐ The Mandatory 30

If you cut everything else, never skip these.

| # | Problem | Section | # | Problem | Section |
|---|---|---|---|---|---|
| 1 | Token-budget calculator | 1 | 16 | Agent state machine | 13 |
| 2 | Multi-provider LLM wrapper | 1 | 17 | Agent planner | 13 |
| 3 | Model router | 1 | 18 | Agent checkpointing | 13 |
| 4 | Vector index | 3 | 19 | Tool calling | 14 |
| 5 | BM25 | 7 | 20 | Tool router | 14 |
| 6 | Hybrid retrieval | 7 | 21 | MCP server | 15 |
| 7 | Reciprocal Rank Fusion | 7 | 22 | Agent memory | 16 |
| 8 | Query rewriting | 7 | 23 | Multi-agent supervisor | 17 |
| 9 | Reranker | 7 | 24 | LLM-as-judge | 12 |
| 10 | Semantic chunker | 6 | 25 | Agent trajectory evaluator | 18 |
| 11 | Production RAG | 8 | 26 | Prompt-injection defense | 29 |
| 12 | Citation RAG | 8 | 27 | Human approval system | 29 |
| 13 | RAG evaluation harness | 11 | 28 | LLM / agent tracing | 31 |
| 14 | Agent loop | 13 | 29 | AI cost / latency monitor | 31 |
| 15 | ReAct agent | 13 | 30 | AI gateway: routing + fallback + caching + eval gates | 33 |

The last group (26–30) carries the strongest interview signal for AI and agent engineering roles.

---

## 📚 Table of contents

**Part A — LLM foundations**
1. [LLM API engineering](#1-llm-api-engineering)
2. [Prompt & context engineering](#2-prompt--context-engineering)
3. [Embeddings & vector search](#3-embeddings--vector-search)
4. [Vector databases](#4-vector-databases)

**Part B — Retrieval & RAG**

5. [Document ingestion & parsing](#5-document-ingestion--parsing)
6. [Chunking](#6-chunking)
7. [Retrieval](#7-retrieval)
8. [RAG systems](#8-rag-systems)
9. [Knowledge graphs & GraphRAG](#9-knowledge-graphs--graphrag)
10. [Text-to-SQL & structured data](#10-text-to-sql--structured-data)

**Part C — Evaluation**

11. [RAG evaluation](#11-rag-evaluation)
12. [LLM evaluation & testing](#12-llm-evaluation--testing)

**Part D — Agents**

13. [Agent runtime](#13-agent-runtime)
14. [Tool calling](#14-tool-calling)
15. [MCP & agent protocols](#15-mcp--agent-protocols)
16. [Agent memory & context](#16-agent-memory--context)
17. [Multi-agent systems](#17-multi-agent-systems)
18. [Agent evaluation](#18-agent-evaluation)
19. [Durable workflows](#19-durable-workflows)

**Part E — Frameworks**

20. [LangChain & LangGraph](#20-langchain--langgraph)
21. [LlamaIndex & Haystack](#21-llamaindex--haystack)
22. [Agent SDKs](#22-agent-sdks)
23. [Multi-agent frameworks](#23-multi-agent-frameworks)
24. [Prompt optimization & typed outputs](#24-prompt-optimization--typed-outputs)
25. [TypeScript AI stack](#25-typescript-ai-stack)

**Part F — Models**

26. [Fine-tuning & customization](#26-fine-tuning--customization)
27. [Model serving & inference](#27-model-serving--inference)
28. [Multimodal & voice](#28-multimodal--voice)

**Part G — Production**

29. [Security & guardrails](#29-security--guardrails)
30. [Governance, privacy & compliance](#30-governance-privacy--compliance)
31. [Observability](#31-observability)
32. [Reliability, performance & cost](#32-reliability-performance--cost)
33. [AI platform & gateway](#33-ai-platform--gateway)
34. [AI product engineering (UI)](#34-ai-product-engineering-ui)

**Part H — Cloud**

35. [AWS](#35-aws)
36. [Azure](#36-azure)

**Part I — Scale & interviews**

37. [POC → enterprise capstones](#37-poc--enterprise-capstones)
38. [AI system design](#38-ai-system-design)
39. [Debugging & incident drills](#39-debugging--incident-drills)

[⚙️ Setup](#️-setup--daily-workflow) · [🗓️ Study plan](#️-study-plan) · [📈 Progress tracker](#-progress-tracker)

---

# 🧠 Part A — LLM foundations

## 1. LLM API engineering

- [ ] Build a token counter
- [ ] Build a token-budget calculator ⭐
- [ ] Build a context-window manager
- [ ] Build a multi-provider LLM wrapper (OpenAI, Anthropic, Gemini, Bedrock, Azure OpenAI) ⭐
- [ ] Build streaming LLM responses ⭐
- [ ] Build structured JSON output parsing ⭐
- [ ] Build malformed JSON recovery
- [ ] Build LLM retry with exponential backoff ⭐
- [ ] Build LLM timeout/cancellation
- [ ] Build model fallback ⭐
- [ ] Build LLM request caching
- [ ] Build semantic response caching
- [ ] Build token/cost accounting
- [ ] Build a model router based on cost, latency and capability ⭐
- [ ] 🆕 Build a rate-limit-aware client with RPM/TPM token buckets per model
- [ ] 🆕 Build streaming with tool calls (assemble partial tool-call deltas)
- [ ] 🆕 Use provider-side prompt caching and measure the cost and latency savings
- [ ] 🆕 Build a batch-API job runner (submit, poll, collect, retry failures)
- [ ] 🆕 Handle reasoning models: thinking budgets, and reasoning tokens in cost accounting
- [ ] 🆕 Use constrained JSON-schema outputs and compare with parse-and-retry
- [ ] 🆕 Build a message-format converter between OpenAI, Anthropic and Gemini
- [ ] 🆕 Build logprob-based confidence scoring

## 2. Prompt & context engineering

- [ ] 🆕 Build a prompt template engine with variables, partials and escaping
- [ ] 🆕 Build a few-shot example selector (semantic similarity + diversity)
- [ ] 🆕 Build a prompt A/B testing harness ⭐
- [ ] 🆕 Build system-prompt layering (platform → tenant → user → task)
- [ ] 🆕 Build a context-assembly pipeline with priorities and a token budget ⭐
- [ ] 🆕 Build a prompt compressor and measure the quality loss
- [ ] 🆕 Run a "lost in the middle" experiment on your own data
- [ ] 🆕 Benchmark long-context vs RAG on the same questions (quality, cost, latency)
- [ ] 🆕 Compare chain-of-thought vs direct answers on accuracy and cost
- [ ] 🆕 Build a prompt linter (missing variables, token size, banned patterns)
- [ ] 🆕 Build a prompt playground that runs one prompt across several models side by side

## 3. Embeddings & vector search

- [ ] Implement cosine similarity ⭐
- [ ] Implement dot-product similarity
- [ ] Build an embedding cache
- [ ] Build batch embedding generation
- [ ] Build a simple vector index ⭐
- [ ] Build top-K vector search ⭐
- [ ] Build metadata-filtered vector search
- [ ] Build vector upsert/update/delete
- [ ] Build embedding versioning
- [ ] Build embedding-model migration (dual-write and backfill)
- [ ] Implement approximate nearest-neighbor search
- [ ] Implement HNSW from scratch ⭐
- [ ] Build a vector-search benchmark
- [ ] Build multi-tenant vector collections
- [ ] Build vector retrieval observability
- [ ] 🆕 Implement IVF (inverted file) indexing
- [ ] 🆕 Implement product quantization
- [ ] 🆕 Implement scalar and binary quantization and measure the recall loss
- [ ] 🆕 Compare embedding models on your own data (a mini MTEB)
- [ ] 🆕 Truncate Matryoshka embeddings and measure recall vs storage cost
- [ ] 🆕 Build multilingual embedding search
- [ ] 🆕 Compare pre-filtering vs post-filtering for metadata search

## 4. Vector databases

- [ ] 🆕 Build vector search with pgvector (HNSW and IVFFlat indexes) ⭐
- [ ] 🆕 Build vector search with FAISS
- [ ] 🆕 Build vector search with Chroma
- [ ] 🆕 Build vector search with Qdrant (payload filters, named vectors)
- [ ] 🆕 Build vector search with Pinecone (namespaces, serverless indexes)
- [ ] 🆕 Build vector search with Weaviate (built-in hybrid search)
- [ ] 🆕 Build vector search with Milvus
- [ ] 🆕 Build vector search with Elasticsearch or OpenSearch kNN
- [ ] 🆕 Build vector search with Redis
- [ ] 🆕 Build vector search with MongoDB Atlas Vector Search
- [ ] 🆕 Build vector search with LanceDB
- [ ] 🆕 Build a vector-store abstraction that swaps between three databases
- [ ] 🆕 Tune HNSW parameters (M, ef_construction, ef_search) for recall vs latency ⭐
- [ ] 🆕 Benchmark three vector databases at 1M vectors (latency, recall, cost)
- [ ] 🆕 Build vector-database backup, restore and re-index
- [ ] 🆕 Build sharded vector search across partitions

---

# 📄 Part B — Retrieval & RAG

## 5. Document ingestion & parsing

- [ ] Build a PDF ingestion pipeline ⭐
- [ ] Build an HTML ingestion pipeline
- [ ] Build a Markdown ingestion pipeline
- [ ] Build a DOCX ingestion pipeline
- [ ] Build a CSV/JSON ingestion pipeline
- [ ] Build a web-crawler ingestion pipeline (robots.txt, sitemaps, rate limits)
- [ ] Build document metadata extraction
- [ ] Build document deduplication (exact and near-duplicate)
- [ ] Build document version tracking
- [ ] Build document provenance tracking
- [ ] Build document structure detection
- [ ] Build heading/section extraction
- [ ] Build table extraction
- [ ] Build an incremental ingestion pipeline ⭐
- [ ] Build a full re-indexing pipeline with a zero-downtime index swap
- [ ] 🆕 Build OCR for scanned PDFs and images
- [ ] 🆕 Build ingestion with a layout-aware parser (Unstructured, Docling or LlamaParse)
- [ ] 🆕 Build image and chart captioning for multimodal ingestion
- [ ] 🆕 Build source connectors for Confluence, SharePoint, Google Drive, Notion and Slack
- [ ] 🆕 Capture access-control lists (ACLs) at ingestion ⭐
- [ ] 🆕 Build change-driven ingestion from webhooks and change events
- [ ] 🆕 Build an ingestion queue with retries and a dead-letter queue
- [ ] 🆕 Build parallel ingestion for 1M+ documents
- [ ] 🆕 Build ingestion quality checks (empty pages, garbled text, encoding errors)

## 6. Chunking

- [ ] Build a fixed-size chunker with overlap
- [ ] Build a recursive chunker
- [ ] Build a sentence chunker
- [ ] Build a semantic chunker ⭐
- [ ] Build a Markdown-aware chunker
- [ ] Build an HTML-aware chunker
- [ ] Build a code-aware chunker
- [ ] Build parent-child chunking ⭐
- [ ] Build hierarchical chunking
- [ ] Build an adaptive chunk-size optimizer
- [ ] 🆕 Build a table-aware chunker
- [ ] 🆕 Build proposition chunking (LLM-extracted standalone facts)
- [ ] 🆕 Build late chunking (embed the whole document, pool per chunk)
- [ ] 🆕 Build a chunking evaluation harness that compares strategies on retrieval recall ⭐

## 7. Retrieval

- [ ] Build basic dense retrieval ⭐
- [ ] Build BM25 retrieval ⭐
- [ ] Build learned sparse retrieval (SPLADE)
- [ ] Build hybrid retrieval ⭐
- [ ] Implement Reciprocal Rank Fusion ⭐
- [ ] Implement weighted rank fusion
- [ ] Build self-query retrieval (extract metadata filters from the question)
- [ ] Build query rewriting ⭐
- [ ] Build query expansion
- [ ] Build multi-query retrieval
- [ ] Build HyDE retrieval
- [ ] Build parent-document retrieval
- [ ] Build contextual retrieval
- [ ] Build hierarchical retrieval
- [ ] Build recursive retrieval
- [ ] Build iterative retrieval
- [ ] Build retrieval routing
- [ ] Build retrieval fallback
- [ ] Build cross-encoder reranking ⭐
- [ ] Build LLM-based reranking
- [ ] 🆕 Build query decomposition for multi-part questions
- [ ] 🆕 Build step-back prompting retrieval
- [ ] 🆕 Build MMR (maximal marginal relevance) for diverse results
- [ ] 🆕 Build time-decay / freshness ranking
- [ ] 🆕 Build permission-aware (ACL-filtered) retrieval ⭐
- [ ] 🆕 Build contextual compression (trim retrieved chunks to the relevant sentences)
- [ ] 🆕 Build late-interaction retrieval (ColBERT)
- [ ] 🆕 Integrate a hosted reranker (Cohere, Voyage or Jina) and compare it with your cross-encoder

## 8. RAG systems

- [ ] Build naive RAG
- [ ] Build conversational RAG ⭐
- [ ] Build streaming RAG
- [ ] Build citation-based RAG ⭐
- [ ] Build source-attribution RAG
- [ ] Build metadata-filtered RAG
- [ ] Build multi-document RAG
- [ ] Build multi-tenant RAG ⭐
- [ ] Build hybrid RAG
- [ ] Build multimodal RAG
- [ ] Build agentic RAG
- [ ] Build multi-hop RAG
- [ ] Build corrective RAG (CRAG)
- [ ] Build adaptive RAG
- [ ] 🆕 Build production RAG end to end: auth, caching, evals, tracing and fallbacks ⭐
- [ ] 🆕 Build self-RAG (the model decides when to retrieve and critiques its own answer)
- [ ] 🆕 Build "I don't know" handling that refuses when retrieval confidence is low ⭐
- [ ] 🆕 Build RAG over code repositories
- [ ] 🆕 Build RAG over tables and spreadsheets
- [ ] 🆕 Build RAG with freshness guarantees (detect and flag stale documents)
- [ ] 🆕 Build RAG with per-answer cost and latency budgets

## 9. Knowledge graphs & GraphRAG

- [ ] Build GraphRAG with local and global search ⭐
- [ ] 🆕 Build entity extraction with an LLM
- [ ] 🆕 Build relation extraction into a triple store
- [ ] 🆕 Build a knowledge graph in Neo4j from documents
- [ ] 🆕 Build entity resolution (merge duplicates of the same entity)
- [ ] 🆕 Build graph-traversal retrieval (k-hop neighbourhoods)
- [ ] 🆕 Build community detection and community summaries
- [ ] 🆕 Build text-to-Cypher querying
- [ ] 🆕 Build hybrid graph + vector retrieval
- [ ] 🆕 Build incremental knowledge-graph updates

## 10. Text-to-SQL & structured data

- [ ] 🆕 Build text-to-SQL over a sample database ⭐
- [ ] 🆕 Build schema linking (pick the relevant tables and columns for a question)
- [ ] 🆕 Build read-only SQL validation and safe execution (AST checks, row limits, timeouts) ⭐
- [ ] 🆕 Build self-correcting SQL (feed errors back and retry)
- [ ] 🆕 Build a text-to-SQL eval set scored on execution accuracy
- [ ] 🆕 Build a semantic layer (metrics and joins defined once; the LLM picks them)
- [ ] 🆕 Build natural-language analytics over pandas or DuckDB
- [ ] 🆕 Build an LLM chart generator (question → query → chart spec)
- [ ] 🆕 Build structured extraction from documents into a schema (invoices, contracts)

---

# 📏 Part C — Evaluation

## 11. RAG evaluation

- [ ] Build a RAG evaluation dataset
- [ ] Build golden-answer evaluation
- [ ] Build retrieval Recall@K ⭐
- [ ] Build retrieval Precision@K
- [ ] Build MRR evaluation
- [ ] Build NDCG evaluation
- [ ] Build context-relevance evaluation
- [ ] Build context-precision evaluation
- [ ] Build context-recall evaluation
- [ ] Build answer-faithfulness (groundedness) evaluation ⭐
- [ ] Build citation-correctness evaluation
- [ ] Build citation-completeness evaluation
- [ ] Build hallucination evaluation
- [ ] Build RAG regression testing ⭐
- [ ] 🆕 Build a RAG evaluation harness that runs every metric above on each change ⭐
- [ ] 🆕 Generate a synthetic RAG test set from your documents
- [ ] 🆕 Evaluate with RAGAS and compare it with your own metrics
- [ ] 🆕 Evaluate with DeepEval or TruLens
- [ ] 🆕 Build an annotation tool for human relevance labels
- [ ] 🆕 Build online evaluation that samples and scores production traffic
- [ ] 🆕 A/B test two retrieval configurations on live traffic

## 12. LLM evaluation & testing

- [ ] Build an LLM-as-judge ⭐
- [ ] 🆕 Build pairwise (A vs B) judging with position-bias control
- [ ] 🆕 Calibrate an LLM judge against human labels (agreement, Cohen's kappa) ⭐
- [ ] 🆕 Build rubric-based scoring with per-criterion scores
- [ ] 🆕 Write prompt unit tests with promptfoo
- [ ] 🆕 Build a model-comparison benchmark on your own task (accuracy, cost, latency)
- [ ] 🆕 Build a mini benchmark runner (MMLU or GSM8K subset)
- [ ] 🆕 Build toxicity and bias evaluation
- [ ] 🆕 Build eval-dataset versioning and management
- [ ] 🆕 Run the same eval suite in Inspect AI, OpenAI Evals or Braintrust
- [ ] 🆕 Build a consistency eval (paraphrased questions should get the same answer)

---

# 🦾 Part D — Agents

## 13. Agent runtime

- [ ] Build a basic agent loop ⭐
- [ ] Build a ReAct agent ⭐
- [ ] Build an agent state machine ⭐
- [ ] Build agent stopping conditions
- [ ] Build agent step limits
- [ ] Build agent timeout handling
- [ ] Build agent retries
- [ ] Build agent loop detection ⭐
- [ ] Build agent checkpointing ⭐
- [ ] Build agent resume/recovery
- [ ] Build agent cancellation
- [ ] Build agent trajectory recording
- [ ] Build agent planning ⭐
- [ ] Build task decomposition
- [ ] Build plan execution
- [ ] Build plan revision
- [ ] Build plan validation
- [ ] Build partial-failure recovery
- [ ] Build long-running agents
- [ ] Build a reusable agent runtime from scratch
- [ ] 🆕 Build a code-acting agent (writes and runs Python instead of JSON tool calls)
- [ ] 🆕 Build self-reflection retries (Reflexion-style)
- [ ] 🆕 Build an agent budget controller (max tokens, dollars and tool calls per task) ⭐

## 14. Tool calling

- [ ] Build function/tool calling ⭐
- [ ] Build tool schemas (generated from type hints, Pydantic or Zod)
- [ ] Build tool argument validation ⭐
- [ ] Build tool output validation
- [ ] Build tool error handling
- [ ] Build tool retries
- [ ] Build tool timeouts
- [ ] Build tool cancellation
- [ ] Build tool idempotency ⭐
- [ ] Build tool authorization ⭐
- [ ] Build tool selection (pick the relevant tools out of 100+ before each call)
- [ ] Build tool routing (dispatch calls to the right executor or backend) ⭐
- [ ] Build tool discovery
- [ ] Build dynamic tool registration
- [ ] Build parallel/sequential tool execution
- [ ] 🆕 Build a sandboxed code-interpreter tool (container, CPU/memory/time limits, no network) ⭐
- [ ] 🆕 Build a web-search and page-reading tool
- [ ] 🆕 Build a browser-automation tool with Playwright
- [ ] 🆕 Build a file-system tool restricted to one directory
- [ ] 🆕 Handle large tool results (truncate, paginate, summarize)
- [ ] 🆕 Build a computer-use agent loop (screenshot → action) in a VM

## 15. MCP & agent protocols

- [ ] Build an MCP server ⭐
- [ ] Build an MCP client ⭐
- [ ] Expose an API through MCP
- [ ] Expose database operations through MCP
- [ ] Build MCP tool discovery
- [ ] Build MCP authentication with OAuth 2.1 ⭐
- [ ] Build MCP authorization
- [ ] Build MCP permission boundaries
- [ ] Build MCP audit logging
- [ ] Build an MCP tool registry
- [ ] 🆕 Build MCP resources and prompts, not just tools
- [ ] 🆕 Run one MCP server over both stdio and Streamable HTTP
- [ ] 🆕 Build an MCP gateway that aggregates several servers
- [ ] 🆕 Test an MCP server with MCP Inspector and automated contract tests
- [ ] 🆕 Deploy a remote MCP server (container, auth, scaling)
- [ ] 🆕 Build MCP sampling and elicitation (the server asks the client's model or user)
- [ ] 🆕 Build an A2A (Agent2Agent) agent and call it from another framework

## 16. Agent memory & context

- [ ] Build short-term agent memory
- [ ] Build conversation memory
- [ ] Build working memory
- [ ] Build long-term memory ⭐
- [ ] Build semantic memory
- [ ] Build episodic memory
- [ ] Build memory retrieval
- [ ] Build memory summarization ⭐
- [ ] Build memory compaction
- [ ] Build memory importance scoring
- [ ] Build memory expiration
- [ ] Build memory deduplication
- [ ] Build memory conflict resolution
- [ ] Build cross-session memory
- [ ] Build memory provenance
- [ ] 🆕 Build memory with Mem0, Zep or Letta and compare it with your own
- [ ] 🆕 Build user-profile memory with a view where users can see and edit what's stored

## 17. Multi-agent systems

- [ ] Build a supervisor agent ⭐
- [ ] Build a router agent
- [ ] Build planner + executor agents
- [ ] Build researcher + writer agents
- [ ] Build generator + critic agents
- [ ] Build analyst + verifier agents
- [ ] Build parallel worker agents
- [ ] Build sequential agent pipelines
- [ ] Build agent delegation
- [ ] Build agent handoffs ⭐
- [ ] Build shared agent state
- [ ] Build isolated agent state
- [ ] Build multi-agent memory
- [ ] Build agent conflict resolution
- [ ] Build a multi-agent orchestration runtime
- [ ] 🆕 Build a debate pattern (several agents argue, one judge decides)
- [ ] 🆕 Build cost-aware multi-agent (cheap models as workers, a strong model as supervisor)
- [ ] 🆕 Detect infinite delegation between agents

## 18. Agent evaluation

- [ ] Build final-answer evaluation
- [ ] Build tool-selection evaluation
- [ ] Build tool-argument evaluation
- [ ] Build task-completion evaluation ⭐
- [ ] Build trajectory evaluation ⭐
- [ ] Build agent-cost evaluation
- [ ] Build agent-latency evaluation
- [ ] Build agent regression tests
- [ ] Build an agent evaluation harness ⭐
- [ ] 🆕 Build a simulated user for multi-turn agent evaluation (τ-bench style)
- [ ] 🆕 Build a SWE-bench-style harness: the agent fixes a bug, hidden tests decide
- [ ] 🆕 Reset sandboxed environments between eval runs
- [ ] 🆕 Build pass@k and consistency metrics for agents
- [ ] 🆕 Build a failure-taxonomy labeller for agent traces

## 19. Durable workflows

- [ ] 🆕 Build a durable agent workflow with Temporal that survives crashes and restarts ⭐
- [ ] 🆕 Build an event-driven AI workflow with Inngest or a message queue
- [ ] 🆕 Build background jobs for long LLM tasks with progress reporting
- [ ] 🆕 Build saga-style compensation for multi-step agent actions (undo on failure)
- [ ] 🆕 Build scheduled agents (cron-triggered reports)
- [ ] 🆕 Build a fan-out/fan-in workflow DAG for document processing
- [ ] 🆕 Version workflows so new code doesn't break in-flight runs

---

# 🧰 Part E — Frameworks

Build the primitive by hand first (Parts A–D), then rebuild it with the framework.

## 20. LangChain & LangGraph

- [ ] 🆕 Build a chain with LangChain Expression Language (LCEL)
- [ ] 🆕 Build a RAG chain with LangChain retrievers and output parsers
- [ ] 🆕 Build a LangChain agent with custom tools
- [ ] 🆕 Build a stateful agent graph in LangGraph ⭐ <!--track--> · [📂](06-frameworks/001-stateful-agent-graph-in-langgraph) py 🟡 (1)
- [ ] 🆕 Add a LangGraph checkpointer (SQLite or Postgres) and resume a thread
- [ ] 🆕 Build human-in-the-loop with LangGraph interrupts ⭐
- [ ] 🆕 Build LangGraph subgraphs
- [ ] 🆕 Build a LangGraph multi-agent supervisor
- [ ] 🆕 Stream LangGraph tokens and node updates to a client
- [ ] 🆕 Deploy a LangGraph agent as an API (LangGraph Platform or FastAPI)
- [ ] 🆕 Trace and evaluate a LangChain app in LangSmith

## 21. LlamaIndex & Haystack

- [ ] 🆕 Build a LlamaIndex ingestion pipeline with transformations and caching
- [ ] 🆕 Build a LlamaIndex query engine with a custom retriever
- [ ] 🆕 Build a LlamaIndex router query engine
- [ ] 🆕 Build a LlamaIndex sub-question query engine
- [ ] 🆕 Build an event-driven LlamaIndex Workflow
- [ ] 🆕 Build a LlamaIndex agent with query-engine tools
- [ ] 🆕 Build a Haystack pipeline (retriever → ranker → generator)
- [ ] 🆕 Build a custom Haystack component
- [ ] 🆕 Build the same RAG app in LangChain, LlamaIndex and Haystack and compare them

## 22. Agent SDKs

- [ ] 🆕 Build an agent with the OpenAI Agents SDK (tools, handoffs, guardrails, tracing) ⭐
- [ ] 🆕 Use the OpenAI Responses API with built-in tools (file search, web search)
- [ ] 🆕 Build an agent with the Claude Agent SDK
- [ ] 🆕 Build an agent with Google's Agent Development Kit (ADK)
- [ ] 🆕 Build an agent with AWS Strands Agents
- [ ] 🆕 Build a typed agent with Pydantic AI
- [ ] 🆕 Build a code agent with Hugging Face smolagents
- [ ] 🆕 Build the same tool-using agent in three SDKs and compare control, tracing and code size

## 23. Multi-agent frameworks

- [ ] 🆕 Build a crew with CrewAI (roles, tasks, process)
- [ ] 🆕 Build a CrewAI Flow with state and branching
- [ ] 🆕 Build a group chat with AutoGen / AG2
- [ ] 🆕 Build an agent with Microsoft Agent Framework
- [ ] 🆕 Build Semantic Kernel plugins with function calling
- [ ] 🆕 Compare CrewAI, LangGraph and Microsoft Agent Framework on one multi-agent task

## 24. Prompt optimization & typed outputs

- [ ] 🆕 Build a DSPy program with signatures and modules
- [ ] 🆕 Optimize a DSPy program (BootstrapFewShot or MIPROv2) and measure the gain
- [ ] 🆕 Build structured extraction with Instructor
- [ ] 🆕 Build grammar-constrained generation for local models with Outlines
- [ ] 🆕 Build typed LLM functions with BAML
- [ ] 🆕 Build automatic prompt optimization from scratch (an LLM proposes edits, an eval scores them)

## 25. TypeScript AI stack

- [ ] 🆕 Build streaming chat with the Vercel AI SDK
- [ ] 🆕 Build tool calling and structured outputs with the Vercel AI SDK
- [ ] 🆕 Build an agent with Mastra (workflows, memory)
- [ ] 🆕 Build a RAG app with LangChain.js / LangGraph.js
- [ ] 🆕 Deploy an AI route at the edge (Cloudflare Workers AI or Vercel)

---

# 🧪 Part F — Models

## 26. Fine-tuning & customization

- [ ] 🆕 Prepare an SFT dataset (format, dedupe, split, contamination check)
- [ ] 🆕 Generate synthetic training data with a stronger model
- [ ] 🆕 Fine-tune a small open model with LoRA / QLoRA (Hugging Face PEFT, Unsloth or Axolotl) ⭐
- [ ] 🆕 Fine-tune a hosted model through a provider API
- [ ] 🆕 Train on preference data with DPO
- [ ] 🆕 Distill a large model into a small one for a single task
- [ ] 🆕 Fine-tune an embedding model on your domain and measure the retrieval gain
- [ ] 🆕 Compare fine-tuned vs base vs well-prompted models (quality, cost, latency)
- [ ] 🆕 Check for catastrophic forgetting after fine-tuning
- [ ] 🆕 Build a fine-tuning pipeline: data → train → eval → register → deploy
- [ ] 🆕 Compare a prompted LLM, a fine-tuned small model and embeddings + logistic regression on one classification task

## 27. Model serving & inference

- [ ] 🆕 Run open models locally with Ollama
- [ ] 🆕 Run a quantized GGUF model with llama.cpp
- [ ] 🆕 Serve a model with vLLM behind an OpenAI-compatible API ⭐
- [ ] 🆕 Serve a model with Hugging Face TGI
- [ ] 🆕 Compare quantization methods (GPTQ, AWQ, int8, FP8) on quality and speed
- [ ] 🆕 Benchmark TTFT and tokens/sec under increasing concurrency ⭐
- [ ] 🆕 Experiment with continuous batching and KV-cache size
- [ ] 🆕 Serve several LoRA adapters on one base model
- [ ] 🆕 Deploy autoscaling GPU inference on Kubernetes (KServe or similar)
- [ ] 🆕 Serve with NVIDIA Triton / TensorRT-LLM
- [ ] 🆕 Deploy on serverless GPUs (Modal, RunPod or similar)
- [ ] 🆕 Experiment with speculative decoding
- [ ] 🆕 Build a cost model: self-hosted GPU vs API per 1M tokens

## 28. Multimodal & voice

- [ ] 🆕 Build image understanding with a vision model and structured output
- [ ] 🆕 Compare vision-model document parsing with classic OCR
- [ ] 🆕 Build an image-generation pipeline with prompt templates and safety filters
- [ ] 🆕 Build speech-to-text with Whisper (batch and streaming)
- [ ] 🆕 Build text-to-speech with streaming playback
- [ ] 🆕 Build a real-time voice agent (WebRTC or a realtime API) that handles interruptions
- [ ] 🆕 Build video understanding (frame sampling + summarization)
- [ ] 🆕 Build a meeting summarizer with speaker diarization

---

# 🛡️ Part G — Production

## 29. Security & guardrails

- [ ] Build prompt-injection detection ⭐
- [ ] Build indirect-injection detection ⭐
- [ ] Build PII detection/redaction ⭐
- [ ] Build output guardrails
- [ ] Build tool-call guardrails ⭐
- [ ] Build tool allowlists/denylists
- [ ] Build action-risk scoring
- [ ] Build human approval checkpoints ⭐
- [ ] Build credential-scoped tools
- [ ] Build an agent security policy engine
- [ ] 🆕 Build an automated jailbreak and red-team suite (e.g. garak or PyRIT) ⭐
- [ ] 🆕 Block data exfiltration through rendered markdown links and images
- [ ] 🆕 Detect system-prompt leakage
- [ ] 🆕 Sanitize LLM output before rendering it (XSS, HTML and markdown injection)
- [ ] 🆕 Add guardrails with NeMo Guardrails or Guardrails AI
- [ ] 🆕 Add safety classification with Llama Guard
- [ ] 🆕 Build per-user abuse detection and rate limiting
- [ ] 🆕 Audit one of your apps against the OWASP Top 10 for LLM Applications
- [ ] 🆕 Detect secrets in prompts, logs and tool outputs

## 30. Governance, privacy & compliance

- [ ] 🆕 Build right-to-be-forgotten: delete one user's data from vector stores, caches, memory and logs
- [ ] 🆕 Build retention policies that expire stored prompts and responses automatically
- [ ] 🆕 Build an audit trail for AI decisions (input, model, prompt version, output, approver)
- [ ] 🆕 Build an AI system inventory with model cards
- [ ] 🆕 Build data-residency routing (EU data stays in EU regions)
- [ ] 🆕 Build consent and opt-out tracking for data use
- [ ] 🆕 Run a bias audit across user groups
- [ ] 🆕 Build an EU AI Act risk-classification checklist for one use case
- [ ] 🆕 Build a provider data-handling matrix (retention, regions, training use) and enforce it in the gateway

## 31. Observability

- [ ] Build an LLM tracing system ⭐
- [ ] Build an agent trajectory viewer
- [ ] Build token/cost dashboards ⭐
- [ ] Build AI latency monitoring (TTFT, total latency, p95) ⭐
- [ ] Build AI failure monitoring
- [ ] 🆕 Instrument an app with the OpenTelemetry GenAI semantic conventions ⭐
- [ ] 🆕 Trace one app with Langfuse, LangSmith and Arize Phoenix and compare them
- [ ] 🆕 Capture user feedback (thumbs, edits) linked to traces
- [ ] 🆕 Detect query and topic drift in production traffic
- [ ] 🆕 Log prompts and responses with PII redaction and sampling
- [ ] 🆕 Alert on cost spikes, error rates and quality drops

## 32. Reliability, performance & cost

- [ ] 🆕 Build a circuit breaker per LLM provider ⭐
- [ ] 🆕 Build request hedging (call a second provider when the first is slow)
- [ ] 🆕 Load-test an LLM endpoint (concurrency, rate limits, tail latency)
- [ ] 🆕 Optimize time-to-first-token (prompt size, caching, model choice, streaming)
- [ ] 🆕 Build graceful degradation (smaller model, cached answer or retrieval-only results) ⭐
- [ ] 🆕 Chaos-test a provider outage
- [ ] 🆕 Build a cost optimizer that routes to batch APIs, cheaper models or caches when quality allows
- [ ] 🆕 Analyze and tune cache hit rates
- [ ] 🆕 Build multi-region failover for LLM calls

## 33. AI platform & gateway

- [ ] Build a prompt/version registry ⭐
- [ ] Build AI evaluation/release gates ⭐
- [ ] Build an AI gateway with routing + fallback + caching + cost controls ⭐
- [ ] 🆕 Deploy LiteLLM as a gateway and compare it with your own
- [ ] 🆕 Build per-team API keys, budgets and quotas
- [ ] 🆕 Send shadow traffic to a new model and compare it without serving its answers
- [ ] 🆕 Build canary rollouts for prompts and models
- [ ] 🆕 Build a self-serve RAG platform (teams upload documents, get an API)
- [ ] 🆕 Build an internal AI SDK that wraps the gateway, tracing and evals
- [ ] 🆕 Build a model-upgrade workflow (re-run evals, migrate prompts, retire the old model)

## 34. AI product engineering (UI)

- [ ] 🆕 Build a streaming chat UI with stop and regenerate ⭐
- [ ] 🆕 Build a citation UI with inline references and source previews ⭐
- [ ] 🆕 Build a tool-call and agent-progress UI
- [ ] 🆕 Build generative UI (the model returns components)
- [ ] 🆕 Build branching conversations (edit a message, fork the thread)
- [ ] 🆕 Build chat history persistence and search
- [ ] 🆕 Build file upload into chat (parse, index, ask)
- [ ] 🆕 Build an approval UI for agent actions
- [ ] 🆕 Build a canvas editor where users and the model edit the same document

---

# ☁️ Part H — Cloud

Service names change often. Check the current docs before you start each item.

## 35. AWS

- [ ] 🆕 Call models with the Bedrock Converse API (streaming, tool use) ⭐
- [ ] 🆕 Switch between Bedrock model families behind one interface
- [ ] 🆕 Use Bedrock cross-region inference profiles
- [ ] 🆕 Build RAG with Bedrock Knowledge Bases (S3 source, sync, metadata filters) ⭐
- [ ] 🆕 Build an agent with Bedrock Agents and Lambda action groups
- [ ] 🆕 Deploy an agent on Bedrock AgentCore (Runtime, Memory, Gateway, Identity) ⭐
- [ ] 🆕 Add Bedrock Guardrails (content filters, denied topics, PII, contextual grounding) ⭐
- [ ] 🆕 Manage prompts with Bedrock Prompt Management and build a Bedrock Flow
- [ ] 🆕 Run Bedrock model evaluation (automatic and LLM-as-judge)
- [ ] 🆕 Run Bedrock batch inference over S3 data
- [ ] 🆕 Compare on-demand vs provisioned-throughput cost on Bedrock
- [ ] 🆕 Build vector search with OpenSearch Serverless
- [ ] 🆕 Build vector search with Aurora PostgreSQL + pgvector (managed, IAM auth)
- [ ] 🆕 Store and query vectors in Amazon S3 Vectors
- [ ] 🆕 Use Amazon Kendra as a retriever
- [ ] 🆕 Build document ingestion with Amazon Textract
- [ ] 🆕 Deploy an open model to an autoscaling SageMaker AI endpoint
- [ ] 🆕 Fine-tune a model with SageMaker JumpStart or Bedrock custom models
- [ ] 🆕 Orchestrate a document-AI pipeline with Step Functions
- [ ] 🆕 Stream LLM responses from Lambda through a function URL
- [ ] 🆕 Secure an AI API with Cognito and least-privilege IAM per agent tool
- [ ] 🆕 Keep Bedrock traffic private with VPC endpoints (PrivateLink)
- [ ] 🆕 Trace and monitor with CloudWatch and X-Ray / ADOT
- [ ] 🆕 Deploy the full AWS RAG stack with CDK or Terraform ⭐
- [ ] 🆕 Set AWS Budgets and cost alarms for AI spend

## 36. Azure

- [ ] 🆕 Deploy and call Azure OpenAI models (deployments, streaming, tool calling) ⭐
- [ ] 🆕 Configure Azure OpenAI content filters and handle filtered responses
- [ ] 🆕 Build RAG with Azure AI Search (hybrid search + semantic ranker) ⭐
- [ ] 🆕 Build integrated vectorization with Azure AI Search indexers and skillsets
- [ ] 🆕 Build an agent with Azure AI Foundry Agent Service ⭐
- [ ] 🆕 Evaluate with the Azure AI Evaluation SDK in Foundry
- [ ] 🆕 Trace an app with Foundry tracing and Application Insights
- [ ] 🆕 Build document ingestion with Azure AI Document Intelligence
- [ ] 🆕 Add Azure AI Content Safety (Prompt Shields, groundedness detection)
- [ ] 🆕 Build an AI gateway with Azure API Management (token limits, semantic caching, load balancing)
- [ ] 🆕 Authenticate with Microsoft Entra ID and managed identities instead of API keys ⭐
- [ ] 🆕 Lock down networking with private endpoints and VNet integration
- [ ] 🆕 Build vector search with Azure Cosmos DB
- [ ] 🆕 Build vector search with Azure Database for PostgreSQL + pgvector (managed, Entra auth)
- [ ] 🆕 Orchestrate an AI workflow with Durable Functions
- [ ] 🆕 Compare provisioned (PTU) vs pay-as-you-go cost and latency
- [ ] 🆕 Fail over across Azure OpenAI deployments in different regions
- [ ] 🆕 Fine-tune a model in Azure AI Foundry
- [ ] 🆕 Deploy an open model to an Azure Machine Learning managed online endpoint
- [ ] 🆕 Run GPU inference on AKS or Azure Container Apps serverless GPUs
- [ ] 🆕 Deploy the full Azure RAG stack with Bicep or Terraform ⭐
- [ ] 🆕 Set Azure budgets and cost alerts for AI spend

---

# 🏢 Part I — Scale & interviews

## 37. POC → enterprise capstones

Take each capstone through all four stages. Each stage is a separate tagged release in its folder.

| Stage | What "done" means |
|---|---|
| **POC** | A notebook or script. Happy path only, one user, hard-coded config. |
| **MVP** | An API and simple UI, an eval set, tracing, basic error handling. |
| **Production** | Auth, guardrails, SLOs, cost controls, evals in CI, fallbacks, on-call runbook. |
| **Enterprise** | Multi-tenant, SSO, ACL-aware retrieval, audit trail, data residency, multi-region, IaC on AWS **or** Azure. |

- [ ] 🆕 Enterprise knowledge assistant (Q&A over internal documents) ⭐
- [ ] 🆕 Customer-support agent (tickets, order lookups, refunds that need approval) ⭐
- [ ] 🆕 Intelligent document processing (invoices and contracts → structured data)
- [ ] 🆕 Data-analyst agent (text-to-SQL, charts, explanations)
- [ ] 🆕 Coding agent (repo-aware, runs tests, opens pull requests)
- [ ] 🆕 Research agent (web research → cited report)
- [ ] 🆕 Voice agent (phone appointment booking)
- [ ] 🆕 Internal AI gateway for 20 teams
- [ ] 🆕 Sales copilot (CRM over MCP, account research, email drafts)
- [ ] 🆕 Compliance-review agent (policy checks with human sign-off)

## 38. AI system design

Timebox 45 minutes each. Cover requirements, scale estimates, architecture, data flow, evals, failure modes, cost and security.

- [ ] 🆕 Design ChatGPT (chat, history, streaming at scale) ⭐
- [ ] 🆕 Design an enterprise RAG system for 10M documents with ACLs ⭐
- [ ] 🆕 Design Perplexity (web search with citations)
- [ ] 🆕 Design GitHub Copilot (low-latency code completion)
- [ ] 🆕 Design a customer-support agent platform for 1M conversations a day
- [ ] 🆕 Design an AI gateway for 50 teams ⭐
- [ ] 🆕 Design an LLM inference fleet (GPU scheduling, batching, autoscaling)
- [ ] 🆕 Design an evaluation platform
- [ ] 🆕 Design a multi-tenant agent platform with tools and MCP
- [ ] 🆕 Design long-term memory for a personal assistant
- [ ] 🆕 Design semantic search for an e-commerce site
- [ ] 🆕 Design an LLM content-moderation pipeline
- [ ] 🆕 Design a real-time voice agent
- [ ] 🆕 Design a document-processing pipeline for 1M pages a day
- [ ] 🆕 Design an LLM-powered recommendation system

## 39. Debugging & incident drills

Practice on a deliberately broken version of one of your own builds.

- [ ] 🆕 RAG answers got worse after re-indexing — find out why
- [ ] 🆕 LLM spend jumped 10× overnight ⭐
- [ ] 🆕 An agent loops forever in production ⭐
- [ ] 🆕 p95 latency doubled after a model upgrade
- [ ] 🆕 A prompt injection arrived inside an uploaded PDF
- [ ] 🆕 Users see another tenant's documents in answers ⭐
- [ ] 🆕 Citations point to the wrong source
- [ ] 🆕 Embeddings from two different models got mixed in one index
- [ ] 🆕 Rate-limit errors cascade across services during a traffic spike
- [ ] 🆕 Evals pass but user ratings dropped
- [ ] 🆕 A tool ran with the wrong user's credentials
- [ ] 🆕 Structured-output parsing fails on 3% of requests
- [ ] 🆕 The judge model's scores drifted after a provider update

---

## 🗓️ Study plan

About 6 months at 1–2 hours a day. Work mostly from the ⭐ items and the first half of each section, and come back for depth later.

| Weeks | Focus | Sections |
|---|---|---|
| 1–2 | LLM APIs, prompts and context | 1, 2 |
| 3–4 | Embeddings, vector search, one or two vector databases | 3, 4 |
| 5–7 | Ingestion, chunking, retrieval | 5, 6, 7 |
| 8–9 | RAG systems and RAG evaluation | 8, 11, 12 |
| 10–12 | Agent runtime, tools, MCP | 13, 14, 15 |
| 13–14 | Memory, multi-agent, agent evals | 16, 17, 18 |
| 15–16 | Frameworks: LangGraph plus one of LlamaIndex, an agent SDK or CrewAI | 20–24 |
| 17–18 | Security, observability, reliability, gateway | 29, 31, 32, 33 |
| 19–21 | AWS **or** Azure (pick the one your target companies use), then the other | 35, 36 |
| 22–24 | One capstone to the enterprise stage, system design, incident drills | 37, 38, 39 |

Fit in sections 9, 10, 19, 26–28, 30 and 34 based on the roles you're targeting. For example, serving and fine-tuning matter more for ML platform roles, and UI matters more for product AI roles.

---

## 📈 Progress tracker

Generated by the tracker — don't edit by hand. The full attempt history is in [PROGRESS.md](PROGRESS.md).

<!-- progress:start -->

| Area | Total | Started | Attempts | Mastered (py) | Mastered (ts) | ✅ Done | Progress |
|---|---|---|---|---|---|---|---|
| LLM foundations (1–4) | 71 | 0 | 0 | 0 | 0 | 0 | ░░░░░░░░░░ 0% |
| Retrieval & RAG (5–10) | 106 | 0 | 0 | 0 | 0 | 0 | ░░░░░░░░░░ 0% |
| Evaluation (11–12) | 32 | 0 | 0 | 0 | 0 | 0 | ░░░░░░░░░░ 0% |
| Agents (13–19) | 117 | 0 | 0 | 0 | 0 | 0 | ░░░░░░░░░░ 0% |
| Frameworks (20–25) | 45 | 1 | 1 | 0 | 0 | 0 | ░░░░░░░░░░ 0% |
| Models (26–28) | 32 | 0 | 0 | 0 | 0 | 0 | ░░░░░░░░░░ 0% |
| Production (29–34) | 67 | 0 | 0 | 0 | 0 | 0 | ░░░░░░░░░░ 0% |
| Cloud: AWS & Azure (35–36) | 47 | 0 | 0 | 0 | 0 | 0 | ░░░░░░░░░░ 0% |
| Capstones, design & drills (37–39) | 38 | 0 | 0 | 0 | 0 | 0 | ░░░░░░░░░░ 0% |
| ⭐ Starred questions | 107 | 1 | 1 | 0 | 0 | 0 | ░░░░░░░░░░ 0% |
| **Total** | **555** | **1** | **1** | **0** | **0** | **0** | ░░░░░░░░░░ 0% |

_✅ Done = mastered in every language you chose for that question. Last synced 2026-10-14 by `npm run sync`._

<!-- progress:end -->

---

> **The point isn't collecting checkmarks. It's being able to build an AI system from a blank repo, prove it works with numbers, keep it safe and affordable, and explain every tradeoff.**
