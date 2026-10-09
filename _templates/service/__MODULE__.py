"""{{TITLE}}

Run:   npm run play -- <this folder>   → http://localhost:8000/docs
Tests: npm run t -- <this folder>
"""
from fastapi import FastAPI

app = FastAPI(title={{TITLE_PY}})


@app.get("/health")
def health():
    return {"ok": True}


# Build it here.
