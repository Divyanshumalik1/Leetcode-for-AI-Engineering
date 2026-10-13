import pytest

from common.fake_llm import FakeLLM
from stateful_agent_graph_in_langgraph import STEP_LIMIT_MESSAGE, ask, build_graph


# ---------- test tools ----------

def add(a, b):
    return a + b


def get_weather(city):
    return f"Sunny in {city}"


def boom():
    raise RuntimeError("database is down")


TOOLS = {"add": add, "get_weather": get_weather, "boom": boom}


def tool_call(name, **args):
    return {"tool": name, "args": args}


def answer(text):
    return {"answer": text}


def roles(state):
    return [m["role"] for m in state["messages"]]


# ---------- graph structure ----------

def test_graph_has_agent_and_tools_nodes():
    graph = build_graph(FakeLLM([]), TOOLS)
    nodes = set(graph.get_graph().nodes)
    assert {"agent", "tools"} <= nodes


# ---------- answering ----------

def test_answers_directly_without_tools():
    llm = FakeLLM([answer("Paris")])
    state = ask(build_graph(llm, TOOLS), "Capital of France?")

    assert state["final_answer"] == "Paris"
    assert state["steps"] == 1
    assert roles(state) == ["user", "assistant"]
    assert state["messages"][-1] == {"role": "assistant", "content": "Paris"}
    assert len(llm.calls) == 1


def test_calls_a_tool_then_answers():
    llm = FakeLLM([tool_call("add", a=2, b=3), answer("2 + 3 = 5")])
    state = ask(build_graph(llm, TOOLS), "What is 2 + 3?")

    assert state["final_answer"] == "2 + 3 = 5"
    assert state["steps"] == 2
    assert roles(state) == ["user", "assistant", "tool", "assistant"]
    assert state["messages"][1] == {"role": "assistant", "tool_call": {"name": "add", "args": {"a": 2, "b": 3}}}
    assert state["messages"][2] == {"role": "tool", "name": "add", "content": "5"}


def test_the_model_sees_the_tool_result_on_its_next_call():
    llm = FakeLLM([tool_call("get_weather", city="Oslo"), answer("It's sunny.")])
    ask(build_graph(llm, TOOLS), "Weather in Oslo?")

    second_call_messages = llm.calls[1]["messages"]
    assert second_call_messages[-1] == {"role": "tool", "name": "get_weather", "content": "Sunny in Oslo"}


def test_handles_several_tool_calls_in_a_row():
    llm = FakeLLM([
        tool_call("get_weather", city="Oslo"),
        tool_call("get_weather", city="Rome"),
        answer("Both sunny."),
    ])
    state = ask(build_graph(llm, TOOLS), "Weather in Oslo and Rome?")

    assert state["final_answer"] == "Both sunny."
    assert [m["content"] for m in state["messages"] if m["role"] == "tool"] == ["Sunny in Oslo", "Sunny in Rome"]


def test_keeps_a_log_of_tool_calls_in_state():
    llm = FakeLLM([tool_call("add", a=1, b=1), tool_call("add", a=2, b=2), answer("done")])
    state = ask(build_graph(llm, TOOLS), "Add things")

    assert state["tool_log"] == [
        {"name": "add", "args": {"a": 1, "b": 1}, "ok": True},
        {"name": "add", "args": {"a": 2, "b": 2}, "ok": True},
    ]


# ---------- failures ----------

def test_unknown_tool_becomes_an_error_message_not_a_crash():
    llm = FakeLLM([tool_call("send_email", to="x"), answer("Sorry, I can't send email.")])
    state = ask(build_graph(llm, TOOLS), "Email my boss")

    tool_msg = state["messages"][2]
    assert tool_msg["role"] == "tool"
    assert tool_msg["name"] == "send_email"
    assert tool_msg["content"].startswith("Error:")
    assert state["tool_log"][0]["ok"] is False
    assert state["final_answer"] == "Sorry, I can't send email."


def test_tool_exception_becomes_an_error_message_not_a_crash():
    llm = FakeLLM([tool_call("boom"), answer("The database is down, try later.")])
    state = ask(build_graph(llm, TOOLS), "Check the database")

    tool_msg = state["messages"][2]
    assert tool_msg["content"].startswith("Error:")
    assert "database is down" in tool_msg["content"]
    assert state["final_answer"] == "The database is down, try later."


def test_bad_arguments_become_an_error_message_not_a_crash():
    llm = FakeLLM([tool_call("add", a=1), answer("I need two numbers.")])
    state = ask(build_graph(llm, TOOLS), "Add 1")

    assert state["messages"][2]["content"].startswith("Error:")
    assert state["final_answer"] == "I need two numbers."


def test_invalid_model_response_stops_with_an_error():
    llm = FakeLLM([{"something": "else"}])
    state = ask(build_graph(llm, TOOLS), "Hi")

    assert state["final_answer"].startswith("Error:")
    assert len(llm.calls) == 1


# ---------- step limit ----------

def test_stops_at_the_step_limit():
    llm = FakeLLM([tool_call("add", a=1, b=1)] * 10)
    state = ask(build_graph(llm, TOOLS, max_steps=3), "Loop forever")

    assert state["final_answer"] == STEP_LIMIT_MESSAGE
    assert len(llm.calls) == 3          # the model was called max_steps times
    assert len(state["tool_log"]) == 2  # the last requested tool call was NOT executed
    assert state["steps"] == 3


def test_a_high_step_limit_does_not_hit_langgraph_recursion_limit():
    # 20 model calls + 19 tool runs is ~40 graph steps — more than LangGraph's default limit of 25.
    llm = FakeLLM([tool_call("add", a=1, b=1)] * 19 + [answer("finally")])
    state = ask(build_graph(llm, TOOLS, max_steps=20), "Long task")

    assert state["final_answer"] == "finally"
    assert state["steps"] == 20


# ---------- streaming ----------

def test_stream_yields_node_updates_in_order():
    llm = FakeLLM([tool_call("add", a=2, b=2), answer("4")])
    graph = build_graph(llm, TOOLS)
    order = [
        node
        for update in graph.stream({"messages": [{"role": "user", "content": "2+2?"}]}, stream_mode="updates")
        for node in update
    ]
    assert order == ["agent", "tools", "agent"]