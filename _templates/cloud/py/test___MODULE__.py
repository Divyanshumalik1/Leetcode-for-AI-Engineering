import pytest

from {{MODULE}} import solve  # noqa: F401


# Offline tests: wrap the cloud SDK client behind a small interface and pass a fake here.
@pytest.mark.skip(reason="write this test")
def test_logic_with_a_fake_client():
    ...


# Live test against the real deployment: runs only with RUN_LIVE=1 and your cloud login.
@pytest.mark.live
def test_against_the_deployed_service():
    pytest.skip("write this test after you deploy")
