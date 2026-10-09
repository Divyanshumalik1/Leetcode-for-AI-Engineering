# Capstone — {{TITLE}}

> Section {{SECTION}} · template: {{TYPE}} · started {{DATE}}

Take it through all four stages. When a stage is done, tag it so you can always go back:
`git tag capstone-{{MODULE}}-poc` (then `-mvp`, `-prod`, `-enterprise`) and `git push --tags`.

## Problem statement
<!-- Who uses it, what job it does, what "good" looks like. -->

## Stage 1 — POC
- [ ] Notebook or script, happy path, one user
- [ ] Demo of the core loop working on real data

## Stage 2 — MVP
- [ ] API + simple UI
- [ ] Eval set (≥ 50 examples) with a baseline score in EVALS.md
- [ ] Tracing on every model and tool call
- [ ] Basic error handling and timeouts

## Stage 3 — Production
- [ ] Auth, input/output guardrails, prompt-injection defense
- [ ] SLOs (latency, availability) and a cost budget per request
- [ ] Evals run in CI and block regressions
- [ ] Fallbacks for provider outages
- [ ] RUNBOOK.md for on-call

## Stage 4 — Enterprise
- [ ] Multi-tenant with tenant isolation tests
- [ ] SSO and role-based access; ACL-aware retrieval
- [ ] Audit trail and data-retention policy
- [ ] Data residency and multi-region failover
- [ ] Deployed with IaC on AWS **or** Azure

Code lives in `src/`. Architecture in ARCHITECTURE.md, evals in EVALS.md, operations in RUNBOOK.md.
