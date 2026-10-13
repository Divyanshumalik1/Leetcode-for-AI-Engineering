import pytest

from {{MODULE}} import solve  # noqa: F401
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
