# Build a LangGraph multi-agent supervisor

> Section 20 · guided — the spec, starter and tests are provided; you write the graph.

## Prompt
"Build a supervisor that coordinates specialist workers. The supervisor reads the conversation, picks a worker and gives it one task, reads the result, and repeats until it can answer. Workers only see their task. Handle broken workers, made-up worker names and runaway loops."

## Interfaces (given)
- `llm.complete(messages)` (the supervisor's model) returns either `{"next": "<worker>", "task": "..."}` or `{"finish": "<answer>"}`
- `workers` is a dict of name → function: `{"researcher": fn, "writer": fn}`; each `fn(task: str) -> str`
- `build_supervisor(llm, workers, max_rounds=6)` returns a compiled graph
- `run(graph, request)` runs it and returns the final state

## Message formats
- user: `{"role": "user", "content": request}`
- worker result: `{"role": "worker", "name": "<worker>", "content": str(result)}`
- feedback to the supervisor: `{"role": "system", "content": "Error: ..."}`
- The supervisor's prompt is a system message listing the worker names, followed by the conversation (not stored in state)

## Requirements
- [DONE] Nodes: `supervisor` plus one node per worker, named after the worker. Edges: START → supervisor → (worker → supervisor)* → END
- [DONE] A worker named `supervisor` raises `ValueError` when building
- [DONE] Every supervisor call starts with a system message that names all the workers
- [ ] `{"finish": ...}` ends the run with `final_answer`
- [DONE] `{"next": w, "task": t}` runs worker `w` with **only** `t`, then returns to the supervisor, which sees the result as the last message
- [DONE] State keeps `messages` and `task_log` (both accumulate), `rounds` (number of supervisor calls) and `final_answer`
- [DONE] `task_log` gets `{"worker", "task", "ok"}` for every worker run
- [ ] A worker that raises → worker message starting `"Error:"`, `ok: False`, and the supervisor keeps going
- [ ] An unknown worker name → a system message starting `"Error:"` that names the bad worker and lists the real ones; the supervisor tries again; nothing is added to `task_log`
- [DONE] A reply with neither `next` nor `finish` → stop with `final_answer` starting `"Error:"`
- [ ] Round limit: the supervisor is called at most `max_rounds` times. If it still delegates on the last call, don't run the worker; stop with `ROUND_LIMIT_MESSAGE`.
- [ ] `max_rounds=15` must work (LangGraph's default recursion limit is 25)
- [ ] `graph.stream(..., stream_mode="updates")` yields: supervisor, researcher, supervisor, writer, supervisor

## Follow-ups (attempt 3)
- Make each worker the tool-using agent graph from the last problem (a subgraph per worker)
- Run two independent workers in parallel (hint: `Send`)
- Add a "critic" worker that must approve the writer's draft before the supervisor can finish

## Tradeoffs
<!-- After your attempt: why give workers only their task instead of the whole history? What does a supervisor cost you (latency, tokens) compared with one agent with many tools? -->