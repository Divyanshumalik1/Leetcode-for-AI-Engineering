"""{{TITLE}}

Run:   npm run play -- <problem> --lang py   → http://localhost:8000/docs
Tests: npm run t -- <problem> --lang py
"""
from fastapi import FastAPI

app = FastAPI(title={{TITLE_PY}})


@app.get("/health")
def health():
    return {"ok": True}


# Build it here.
