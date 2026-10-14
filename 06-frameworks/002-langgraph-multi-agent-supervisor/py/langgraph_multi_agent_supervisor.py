"""Build a LangGraph multi-agent supervisor.

Spec: ../README.md · Tests: test_langgraph_multi_agent_supervisor.py
Run the tests: npm run t -- multi-agent-supervisor
"""
import operator
from typing import Annotated, Callable, TypedDict

from langgraph.graph import END, START, StateGraph

ROUND_LIMIT_MESSAGE = "Stopped: round limit reached"


class SupervisorState(TypedDict, total=False):
    # TODO: messages and task_log must ACCUMULATE (Annotated[..., operator.add]).
    # TODO: rounds, final_answer, and whatever the supervisor needs to hand a task to a worker.
    messages : Annotated[list[dict], operator.add]
    task_log : Annotated[list[dict], operator.add]  
    rounds : int
    final_answer : str
    _next_worker: str
    _next_task : str

    
def build_supervisor(llm, workers: dict[str, Callable[[str], str]], max_rounds: int = 6):
    """Return a compiled graph: a "supervisor" node plus one node per worker (named after the worker)."""

    if("supervisor" in workers):
        raise ValueError("A worker cannot be named 'supervisor'")

    def supervisor(state: SupervisorState) -> dict:
        # TODO: call llm.complete([system message listing the workers, *messages]) and decide:
        #       finish, delegate, round limit, unknown worker, or invalid reply.

        curr_round = state.get("rounds", 0) + 1
        
        # system_prompt = workers.keys()
        # for i in range(len(system_prompt)):
        #     print(i + "-") #print names of worker nodes
        
        system_msg = {
            "role" : "system", 
            "content": f"Workers available: {', '.join(workers)}.",
                      }

        messages = state.get("messages", [])
        response = llm.complete([system_msg, *messages])
        
        #response = llm.complete([system_prompt, state.get("messages")])

        # if "finish" in response:
        #     return {
        #         "final_answer": state.get("messages")[-1]["finish"]
        #     }

        if "finish" in response:
            return{
                "rounds":curr_round,
                "final_answer": response["finish"],
                "_next_worker":""
            }

        if "next" in response:

            worker_name = response["next"]
            task = response.get("task", "")

            if worker_name not in workers:
                return {
                    "rounds": curr_round,
                    "messages": [{
                        "role": "system",
                        "content": f"Error: unknown worker '{worker_name}'. Available workers: {', '.join(workers)}.",
                    }],
                    "_next_worker": "supervisor",
                }

            if(curr_round >= max_rounds):
                return{
                    "rounds":curr_round,
                    "final_answer":ROUND_LIMIT_MESSAGE,
                    "_next_worker":""
                }

            return {                              
                "rounds": curr_round,
                "_next_worker": worker_name,
                "_next_task": task,
            }

        #neither "next" nor "finish"
        else:
            return{
                "rounds":curr_round,
                "final_answer": f"Error: supervisor returned an invalid reply: {response}",  # fixed
                "_next_worker":""
            }

        #raise NotImplementedError

    def make_worker(name: str, fn: Callable[[str], str]):
        def node(state: SupervisorState) -> dict:
            # TODO: run fn(task) with ONLY the task string; turn any failure into an "Error: ..." message.
            #response = fn(state.get("messages")["task"])
            task = state.get("_next_task", "")
                
            # if(response is not None):
            #     ok = True
            #     return {
            #         "role":"worker",
            #         "name":name,
            #         "content":str(response),
            #         "task_log":{"worker", "task", "ok"}
            #     }
            # else:
            #     ok = False
            #     return {
            #         "error" : e
            #     }

            try:
                result = fn(task)
                msg = {"role" : "worker", "name" : name, "content":str(result)}
                log = {"worker":name, "task":task, "ok": True}
            except Exception as e:
                msg = {"role" : "worker", "name" : name, "content": f"Error: {e}"}
                log = {"worker": name, "task": task, "ok": False}

            return {"messages":[msg], "task_log":[log]}

            #raise NotImplementedError
        return node

    def route(state: SupervisorState):
        # TODO: return END, a worker name, or "supervisor" (to let it try again after an unknown worker).
        # last_point = state.get("messages")

        # if("next" in last_point):
        #     sfds

        # elif(END in last_point):
        #     sdf        
        # else:
        #     d
        
        next_worker = state.get("_next_worker", "")
        if not next_worker:
            return END

        return next_worker
        #raise NotImplementedError

    #raise NotImplementedError("wire up the StateGraph here, then return graph.compile()")
    graph = StateGraph(SupervisorState)
    # graph.add_node(START)
    # graph.add_node(END)
    graph.add_node("supervisor", supervisor)
    graph.add_edge(START, "supervisor")

    for name, fn in workers.items():
        # worker_name = f"worker_${name}"
        # worker_fn = make_worker(worker_name, fn)
        # graph.add_node(worker_name, worker_fn)
        # graph.add_edge(worker_name, "supervisor")
        graph.add_node(name, make_worker(name, fn))
        graph.add_edge(name, "supervisor")

    
    #graph.add_conditional_edges("supervisor", route, [workers, END])
    graph.add_conditional_edges("supervisor", route)
    
    compiled = graph.compile()
    compiled._max_rounds = max_rounds
    return compiled


def run(graph, request: str) -> dict:
    """Run the graph on one user request and return the final state."""
    #return graph.invoke(request)
    # we must pass an initial request that respects the structure of all inputs used
    max_rounds = getattr(graph, "_max_rounds", 6)

    initial_state = {
        "messages" : [{"role":"user", "content": request}],
        "rounds":0,
        "task_log": [],
        "final_answer" : None,
        "_next_worker": "",
        "_next_task": "",
    }

    return graph.invoke(initial_state, {"recursion_limit":max_rounds * 3 + 10})
    #raise NotImplementedError


solve = run


if __name__ == "__main__":

    import sys, os
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", ".."))

    from common.fake_llm import FakeLLM

    def route(worker, task):
        return {"next": worker, "task": task}

    def finish(text):
        return {"finish": text}

    llm = FakeLLM([
        route("researcher", "Find the capital of France"),
        route("writer", "Write one line about Paris"),
        finish("Paris is the capital of France."),
    ])

    ws = {
        "researcher": lambda task: "Paris is the capital of France.",
        "writer": lambda task: "Draft: Paris.",
    }

    graph = build_supervisor(llm, ws)
    initial_state = {
        "messages": [{"role": "user", "content": "Write about Paris"}],
        "rounds": 0,
        "task_log": [],
        "final_answer": None,
        "_next_worker": "",
        "_next_task": "",
    }

    for update in graph.stream(initial_state, stream_mode="updates"):
        for node, data in update.items():
            print(f"\n--- {node} ---")
            for k, v in data.items():
                if not k.startswith("_"):
                    print(f"  {k}: {v}")
