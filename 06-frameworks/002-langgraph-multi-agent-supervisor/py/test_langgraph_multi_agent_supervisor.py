import pytest

from langgraph_multi_agent_supervisor import solve  # noqa: F401
from common.fake_llm import FakeLLM  # noqa: F401  scripted LLM for fast, free tests
from common.fake_embed import fake_embed  # noqa: F401  deterministic embeddings

# Turn every requirement and edge case in ../README.md into a test before you implement.
# Delete the skip marker as you write each one.


@pytest.mark.skip(reason="write this test")
def test_requirement_1():
    ...


@pytest.mark.skip(reason="write this test")
def test_edge_case_1():
    ...


@pytest.mark.live  # calls a real model API: skipped unless RUN_LIVE=1
def test_against_a_real_model():
    pytest.skip("write this test once the offline tests pass")
import pytest

from common.fake_llm import FakeLLM
from langgraph_multi_agent_supervisor import ROUND_LIMIT_MESSAGE, build_supervisor, run


# ---------- test workers ----------

class Recorder:
    """A fake worker that records the tasks it was given and returns a canned result."""

    def __init__(self, reply):
        self.reply = reply
        self.tasks = []

    def __call__(self, task):
        self.tasks.append(task)
        return self.reply(task) if callable(self.reply) else self.reply


def broken(task):
    raise RuntimeError("search API is down")


def route(worker, task):
    return {"next": worker, "task": task}


def finish(text):
    return {"finish": text}


def workers(**kw):
    return {"researcher": Recorder("Paris is the capital of France."), "writer": Recorder("Draft: Paris."), **kw}


# ---------- structure ----------

def test_graph_has_a_supervisor_node_and_one_node_per_worker():
    graph = build_supervisor(FakeLLM([]), workers())
    assert {"supervisor", "researcher", "writer"} <= set(graph.get_graph().nodes)


def test_a_worker_named_supervisor_is_rejected():
    with pytest.raises(ValueError):
        build_supervisor(FakeLLM([]), {"supervisor": Recorder("x")})


def test_the_supervisor_is_told_which_workers_exist():
    llm = FakeLLM([finish("done")])
    run(build_supervisor(llm, workers()), "Hi")

    first = llm.calls[0]["messages"][0]
    assert first["role"] == "system"
    assert "researcher" in first["content"] and "writer" in first["content"]
    assert llm.calls[0]["messages"][1] == {"role": "user", "content": "Hi"}


# ---------- routing ----------

def test_finishes_without_calling_any_worker():
    llm = FakeLLM([finish("Hello!")])
    ws = workers()
    state = run(build_supervisor(llm, ws), "Say hi")

    assert state["final_answer"] == "Hello!"
    assert state["rounds"] == 1
    assert ws["researcher"].tasks == [] and ws["writer"].tasks == []


def test_routes_to_a_worker_then_finishes():
    llm = FakeLLM([route("researcher", "Find the capital of France"), finish("It's Paris.")])
    ws = workers()
    state = run(build_supervisor(llm, ws), "What's the capital of France?")

    assert ws["researcher"].tasks == ["Find the capital of France"]
    assert state["final_answer"] == "It's Paris."
    assert state["rounds"] == 2


def test_the_supervisor_sees_each_worker_result():
    llm = FakeLLM([route("researcher", "Find it"), finish("ok")])
    run(build_supervisor(llm, workers()), "Q")

    last = llm.calls[1]["messages"][-1]
    assert last == {"role": "worker", "name": "researcher", "content": "Paris is the capital of France."}


def test_chains_several_workers():
    llm = FakeLLM([
        route("researcher", "Research Paris"),
        route("writer", "Write one line about Paris"),
        finish("Draft: Paris."),
    ])
    ws = workers()
    state = run(build_supervisor(llm, ws), "Write about Paris")

    assert ws["researcher"].tasks == ["Research Paris"]
    assert ws["writer"].tasks == ["Write one line about Paris"]
    assert [m["name"] for m in state["messages"] if m["role"] == "worker"] == ["researcher", "writer"]
    assert state["final_answer"] == "Draft: Paris."


def test_workers_get_only_their_task_not_the_whole_conversation():
    seen = []
    llm = FakeLLM([route("researcher", "Just this task"), finish("ok")])
    run(build_supervisor(llm, {"researcher": lambda task: seen.append(task) or "r"}), "Long user request with lots of context")
    assert seen == ["Just this task"]


def test_keeps_a_log_of_delegations():
    llm = FakeLLM([route("researcher", "A"), route("writer", "B"), finish("done")])
    state = run(build_supervisor(llm, workers()), "Q")

    assert state["task_log"] == [
        {"worker": "researcher", "task": "A", "ok": True},
        {"worker": "writer", "task": "B", "ok": True},
    ]


# ---------- failures ----------

def test_a_failing_worker_reports_an_error_and_the_supervisor_continues():
    llm = FakeLLM([route("researcher", "Search"), finish("Search is down, sorry.")])
    state = run(build_supervisor(llm, workers(researcher=broken)), "Q")

    msg = [m for m in state["messages"] if m["role"] == "worker"][0]
    assert msg["content"].startswith("Error:")
    assert "search API is down" in msg["content"]
    assert state["task_log"][0]["ok"] is False
    assert state["final_answer"] == "Search is down, sorry."


def test_an_unknown_worker_is_reported_back_to_the_supervisor():
    llm = FakeLLM([route("translator", "Translate"), finish("I can't translate.")])
    state = run(build_supervisor(llm, workers()), "Translate this")

    feedback = llm.calls[1]["messages"][-1]
    assert feedback["role"] == "system"
    assert feedback["content"].startswith("Error:")
    assert "translator" in feedback["content"]
    assert "researcher" in feedback["content"]  # tells it which workers do exist
    assert state["final_answer"] == "I can't translate."
    assert state["task_log"] == []


def test_an_invalid_supervisor_reply_stops_with_an_error():
    llm = FakeLLM([{"something": "else"}])
    state = run(build_supervisor(llm, workers()), "Q")

    assert state["final_answer"].startswith("Error:")
    assert len(llm.calls) == 1


# ---------- limits ----------

def test_stops_at_the_round_limit():
    llm = FakeLLM([route("researcher", "again")] * 10)
    ws = workers()
    state = run(build_supervisor(llm, ws, max_rounds=3), "Loop")

    assert state["final_answer"] == ROUND_LIMIT_MESSAGE
    assert len(llm.calls) == 3                  # the supervisor was called max_rounds times
    assert len(ws["researcher"].tasks) == 2     # the last delegation was NOT run
    assert state["rounds"] == 3


def test_a_high_round_limit_does_not_hit_langgraph_recursion_limit():
    llm = FakeLLM([route("researcher", "again")] * 14 + [finish("done at last")])
    state = run(build_supervisor(llm, workers(), max_rounds=15), "Long job")

    assert state["final_answer"] == "done at last"
    assert state["rounds"] == 15


# ---------- streaming ----------

def test_stream_yields_supervisor_and_worker_updates_in_order():
    llm = FakeLLM([route("researcher", "A"), route("writer", "B"), finish("done")])
    graph = build_supervisor(llm, workers())
    start = {"messages": [{"role": "user", "content": "Q"}], "rounds": 0, "task_log": [], "final_answer": None}
    order = [node for update in graph.stream(start, stream_mode="updates") for node in update]

    assert order == ["supervisor", "researcher", "supervisor", "writer", "supervisor"]