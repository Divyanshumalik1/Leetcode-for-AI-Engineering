"""Benchmark for: {{TITLE}}

Run: npm run bench -- <this folder>
Each line of eval/dataset.jsonl is one example. run_one() returns a score from 0 to 1.
"""
import json
import statistics
import time
from pathlib import Path

HERE = Path(__file__).parent


def load_dataset():
    lines = (HERE / "eval" / "dataset.jsonl").read_text(encoding="utf-8").splitlines()
    return [json.loads(line) for line in lines if line.strip()]


def run_one(example: dict) -> float:
    """Run your implementation on one example and return a score between 0 and 1."""
    # from {{MODULE}} import solve
    # output = solve(example["input"])
    # return 1.0 if output == example["expected"] else 0.0
    raise NotImplementedError


def percentile(values, p):
    ordered = sorted(values)
    return ordered[min(len(ordered) - 1, round(p / 100 * (len(ordered) - 1)))]


def main():
    data = load_dataset()
    scores, latencies = [], []
    for example in data:
        start = time.perf_counter()
        scores.append(run_one(example))
        latencies.append((time.perf_counter() - start) * 1000)

    print(f"examples   {len(data)}")
    print(f"score      {statistics.mean(scores):.3f}")
    print(f"p50 ms     {percentile(latencies, 50):.1f}")
    print(f"p95 ms     {percentile(latencies, 95):.1f}")
    print("\nAdd a row to BENCHMARK.md with these numbers and what you changed.")


if __name__ == "__main__":
    main()
