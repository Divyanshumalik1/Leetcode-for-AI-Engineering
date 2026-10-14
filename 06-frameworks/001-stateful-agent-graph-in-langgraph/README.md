# Build a stateful agent graph in LangGraph

> Section 20 · guided — the spec, starter and tests are provided; you write the graph.

## Prompt
"Build a tool-using agent as a LangGraph graph. The model either answers or asks for a tool. Run the tool, feed the result back, repeat until it answers. Don't let it loop forever, and don't let a broken tool crash it."

## Interfaces (given)
- `llm.complete(messages)` returns either `{"answer": "..."}` or `{"tool": "name", "args": {...}}`
- `tools` is a dict: `{"add": add, "get_weather": get_weather}`; call a tool with `fn(**args)`
- `build_graph(llm, tools, max_steps=5)` returns a compiled graph
- `ask(graph, question)` runs it and returns the final state

## Message formats
- user: `{"role": "user", "content": question}`
- tool request: `{"role": "assistant", "tool_call": {"name": ..., "args": {...}}}`
- tool result: `{"role": "tool", "name": ..., "content": str(result)}`
- answer: `{"role": "assistant", "content": answer}`

## Requirements
- [DONE] Graph has an `agent` node and a `tools` node: START → agent → (tools → agent)* → END
- [ ] State keeps `messages` (accumulates), `tool_log` (accumulates), `steps`, `final_answer`
- [ ] A direct answer ends the run: `final_answer` set, `steps == 1`
- [ ] A tool request runs the tool and feeds the result back to the model on its next call
- [ ] `tool_log` gets `{"name", "args", "ok"}` for every executed tool
- [ ] Unknown tool, tool exception or bad arguments → tool message starting `"Error:"`, `ok: False`, and the agent keeps going
- [ ] A reply with neither `answer` nor `tool` → stop with `final_answer` starting `"Error:"`
- [ ] Step limit: the model is called at most `max_steps` times. If it still wants a tool on the last call, don't run it; stop with `STEP_LIMIT_MESSAGE`.
- [ ] `max_steps=20` must work (LangGraph's default recursion limit is 25 graph steps)
- [ ] `graph.stream(..., stream_mode="updates")` yields node names in order: agent, tools, agent

## Follow-ups (attempt 3)
- Add a checkpointer and continue the same conversation across two `ask` calls (next item in the bank)
- Run several tool calls in parallel when the model asks for more than one
- Add a human-approval node before any tool marked "dangerous"

## Tradeoffs
<!-- After attempt 1: why a graph instead of a while-loop? What does LangGraph give you, and what does it cost? -->