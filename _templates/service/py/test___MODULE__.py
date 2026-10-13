import pytest
from fastapi.testclient import TestClient

from {{MODULE}} import app
from common.fake_llm import FakeLLM  # noqa: F401  inject this instead of a real model in tests

client = TestClient(app)


def test_health():
    res = client.get("/health")
    assert res.status_code == 200


# One test per row of the API contract, plus the failure modes in ../README.md.


@pytest.mark.skip(reason="write this test")
def test_happy_path():
    ...


@pytest.mark.skip(reason="write this test")
def test_provider_failure_returns_a_clean_error():
    ...
