"""Shared pytest setup.

- Loads API keys from .env (if python-dotenv is installed).
- Skips tests marked @pytest.mark.live unless RUN_LIVE=1, so normal runs never spend money.
"""
import os

import pytest

try:
    from dotenv import load_dotenv

    load_dotenv()
except ImportError:
    pass


def pytest_collection_modifyitems(config, items):
    if os.environ.get("RUN_LIVE") == "1":
        return
    skip_live = pytest.mark.skip(reason="live test: set RUN_LIVE=1 to call real APIs")
    for item in items:
        if "live" in item.keywords:
            item.add_marker(skip_live)
