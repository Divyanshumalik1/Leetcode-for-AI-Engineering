"""Build a stateful agent graph in LangGraph.

Spec: README.md · Tests: test_stateful_agent_graph_in_langgraph.py
Run the tests: npm run t -- stateful-agent-graph
"""
import operator
from typing import Annotated, Any, Callable, TypedDict

from langgraph.graph import END, START, StateGraph

STEP_LIMIT_MESSAGE = "Stopped: step limit reached"


class AgentState(TypedDict, total=False):
    # TODO: messages and tool_log must ACCUMULATE across nodes (hint: Annotated[..., operator.add]).
    # TODO: steps, final_answer, and anything else you need to pass between nodes.

    # messages: list[dict]  # [{"role": "user"|"assistant"|"tool", "content": str}]
    # tool_log: list[dict]  # [{"tool": str, "args": dict, "result": str}]
    # steps: int
    # final_answer: str

    messages: Annotated[list[dict], operator.add]  # accumulates across nodes
    tool_log: Annotated[list[dict], operator.add]  # accumulates across nodes
    steps: int
    final_answer: str


def build_graph(llm, tools: dict[str, Callable[..., Any]], max_steps: int = 5):
    """Return a compiled LangGraph graph with an "agent" node and a "tools" node."""

    
    def agent(state: AgentState) -> dict:
        # 1. Count this LLM call (first call: 0 + 1 = 1).
        curr_step = state.get("steps", 0) + 1

        # 2. Ask the model what to do next.
        response = llm.complete(state["messages"])

        # 3. Direct answer -> record it and stop.
        if "answer" in response:
            answer = response["answer"]
            return {
                "messages": [{"role": "assistant", "content": answer}],
                "final_answer": answer,
                "steps": curr_step,
            }

        # 4. Tool request.
        if "tool" in response:
            # Last allowed call and it still wants a tool -> don't run it, stop.
            if curr_step >= max_steps:
                return {
                    "messages": [{"role": "assistant", "content": STEP_LIMIT_MESSAGE}],
                    "final_answer": STEP_LIMIT_MESSAGE,
                    "steps": curr_step,
                }
            # Otherwise record the request; the router sends us to "tools".
            tool_call = {"name": response["tool"], "args": response.get("args") or {}}
            return {
                "messages": [{"role": "assistant", "tool_call": tool_call}],
                "steps": curr_step,
            }

        # 5. Neither "answer" nor "tool" -> invalid reply, stop with an error.
        error = f"Error: invalid model reply: {response!r}"
        return {
            "messages": [{"role": "assistant", "content": error}],
            "final_answer": error,
            "steps": curr_step,
        }

        

    def run_tool(state: AgentState) -> dict:

        # # TODO: run the requested tool; turn any failure into an "Error: ..." tool message.
        # tool_request = state.get("messages")[-1]

        # tool_call_name = tool_request["name"]
        # tool_call_args = tool_request["args"]

        # try:
        #     fn = tools[tool_call_name]
        #     #state.tool_log.append({tool_call_name, tool_call_args, "ok"})
        #     #state.messages.append()
        #     tool_result = fn(**tool_call_args)

        #     return {"role":"tool", "name":tool_call_name, "content": str(tool_result)}

        # except Exception as e:   

        #     return {}

        # 1. The last message is the agent's tool request.
        tool_call = state["messages"][-1]["tool_call"]
        name = tool_call["name"]
        args = tool_call["args"]

        # 2. Run it; any failure (unknown tool, bad args, exception) becomes an error message.
        try:
            fn = tools[name]                  # KeyError if the tool doesn't exist
            content = str(fn(**args))         # TypeError on bad args, or whatever the tool raises
            ok = True
        except Exception as e:
            content = f"Error: {type(e).__name__}: {e}"
            ok = False

        # 3. Return state updates; the reducers append these to the existing lists.
        return {
            "messages": [{"role": "tool", "name": name, "content": content}],
            "tool_log": [{"name": name, "args": args, "ok": ok}],
        }
        

    def route(state: AgentState):
         # Every stopping branch in agent sets final_answer; a tool request doesn't.
        if state.get("final_answer") is not None:
            return END
        return "tools"


    graph = StateGraph(AgentState)
    graph.add_node("tools", run_tool)
    graph.add_node("agent", agent)
    #graph.add_node("route_node", route)

    graph.add_edge(START, "agent")
    graph.add_conditional_edges("agent", route, ["tools", END])
    graph.add_edge("tools", "agent")
    # graph.add_edge("agent", "route_node")
    # graph.add_edge("route_node", "tools")
    # graph.add_edge("route_node", END)
    # Each round trip is 2 graph steps (agent + tools), so raise LangGraph's
    # default recursion limit of 25 to fit max_steps model calls.
    return graph.compile().with_config({"recursion_limit": 2 * max_steps + 5})
    
    
    


def ask(graph, question: str) -> dict:
    """Run the graph on one question and return the final state."""
    initial = {
        "messages": [{"role": "user", "content": question}],
        "tool_log": [],
        "steps": 0,
    }
    return graph.invoke(initial)
    