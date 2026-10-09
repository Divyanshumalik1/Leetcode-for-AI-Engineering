# {{TITLE}}

> Section {{SECTION}} · template: {{TYPE}} · started {{DATE}}

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

`npm run play -- <this folder>` starts the API on http://localhost:8000 (docs at /docs).
Local Postgres + pgvector, Qdrant and Redis: `npm run services:up`.
