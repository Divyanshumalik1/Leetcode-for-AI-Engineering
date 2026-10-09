"""A scripted stand-in for an LLM, so tests are fast, free and deterministic.

    llm = FakeLLM(["first reply", {"tool": "search", "args": {"q": "x"}}, TimeoutError()])
    llm.complete(messages)  # → "first reply"
    llm.complete(messages)  # → {"tool": "search", ...}
    llm.complete(messages)  # raises TimeoutError — handy for testing retries
    llm.calls               # every call, so you can assert on prompts and arguments

Pass it into your code wherever a real client would go (dependency injection).
"""
from dataclasses import dataclass, field
from typing import Any


@dataclass
class FakeLLM:
    responses: list[Any]
    calls: list[dict] = field(default_factory=list)

    def complete(self, messages, **kwargs):
        self.calls.append({"messages": messages, **kwargs})
        if not self.responses:
            raise AssertionError("FakeLLM ran out of scripted responses")
        reply = self.responses.pop(0)
        if isinstance(reply, BaseException):
            raise reply
        return reply

    async def acomplete(self, messages, **kwargs):
        return self.complete(messages, **kwargs)
