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

    messages: list[dict]  # [{"role": "user"|"assistant"|"tool", "content": str}]
    tool_log: list[dict]  # [{"tool": str, "args": dict, "result": str}]
    steps: int
    final_answer: str


    


def build_graph(llm, tools: dict[str, Callable[..., Any]], max_steps: int = 5):
    """Return a compiled LangGraph graph with an "agent" node and a "tools" node."""

    def agent(state: AgentState) -> dict:
        # TODO: call llm.complete(messages) and decide: answer, tool call, step limit or invalid reply.
        
        raise NotImplementedError

    def run_tool(state: AgentState) -> dict:
        # TODO: run the requested tool; turn any failure into an "Error: ..." tool message.
        raise NotImplementedError

    def route(state: AgentState):
        # TODO: return "tools" or END.
        raise NotImplementedError

    raise NotImplementedError("wire up the StateGraph here, then return graph.compile()")


def ask(graph, question: str) -> dict:
    """Run the graph on one question and return the final state."""
    raise NotImplementedError