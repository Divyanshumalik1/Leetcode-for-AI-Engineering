"""Deterministic fake embeddings for tests — no model, no network.

Texts that share words get similar vectors, so similarity search behaves sensibly:

    a, b, c = fake_embed("cats are great"), fake_embed("great cats"), fake_embed("tax law")
    # cosine(a, b) > cosine(a, c)
"""
import hashlib
import math
import re


def fake_embed(text: str, dim: int = 64) -> list[float]:
    vec = [0.0] * dim
    for word in re.findall(r"[a-z0-9]+", text.lower()):
        h = int(hashlib.md5(word.encode()).hexdigest(), 16)
        vec[h % dim] += 1.0 if (h >> 8) % 2 else -1.0
    norm = math.sqrt(sum(x * x for x in vec)) or 1.0
    return [x / norm for x in vec]
