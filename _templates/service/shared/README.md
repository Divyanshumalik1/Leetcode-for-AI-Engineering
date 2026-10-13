# {{TITLE}}

> Section {{SECTION}} · {{KIND}} · {{LANGS}} · started {{DATE}}

Write this spec **before** any code.

## Prompt
<!-- One or two lines, exactly how an interviewer would say it. -->

## Clarifying questions I'd ask
-

## Requirements (my assumptions)
- [ ]

## API contract
| Method | Path | Request | Response | Errors |
|---|---|---|---|---|
| GET | /health | – | `200 { "ok": true }` | – |

## Edge cases and failure modes
<!-- Provider down, slow model, malformed output, empty retrieval, huge input, concurrent requests… -->
-

## How I'll know it works
<!-- Tests, an eval set, latency and cost targets. -->

## Follow-ups (the interviewer changes the rules)
-

## Tradeoffs
<!-- Fill in after attempt 1. -->

---

- **Python** (`py/`): FastAPI app in the `.py` file, tests with TestClient. `npm run play -- <problem> --lang py` → http://localhost:8000/docs
- **TypeScript** (`ts/`): Express in `src/app.ts`, tests with Supertest. `npm run play -- <problem> --lang ts` → http://localhost:3000
- Local Postgres + pgvector, Qdrant and Redis: `npm run services:up`.
