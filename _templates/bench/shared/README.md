# {{TITLE}}

> Section {{SECTION}} · {{KIND}} · {{LANGS}} · started {{DATE}}

Write this spec **before** any code — the way an interviewer would hand it to you. One spec and one eval set, shared by every language you solve it in (`py/`, `ts/`).

## Prompt
<!-- One or two lines, exactly how an interviewer would say it. -->

## Clarifying questions I'd ask
-

## Requirements (my assumptions)
- [ ]

## Edge cases and failure modes
<!-- Empty input, huge input, provider timeout, rate limit, malformed model output, unicode… -->
-

## How I'll measure it
<!-- Tests below, plus any number worth measuring (latency, cost, accuracy). -->

## Follow-ups (the interviewer changes the rules)
-

## Tradeoffs
<!-- Fill in after attempt 1. -->

---

**Benchmark problem.** Put examples in `eval/dataset.jsonl` (one JSON object per line, shared by both languages), implement `run_one` in `py/bench.py` or `runOne` in `ts/bench.ts`, then run `npm run bench -- <problem> --lang py|ts` and record each result in `BENCHMARK.md`.
