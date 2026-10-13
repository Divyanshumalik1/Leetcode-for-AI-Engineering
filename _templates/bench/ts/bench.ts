// Benchmark for: {{TITLE}}
// Run: npm run bench -- <problem> --lang ts
// Each line of ../eval/dataset.jsonl is one example. runOne() returns a score from 0 to 1.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
// import { solve } from './{{SLUG}}';

type Example = { input: unknown; expected: unknown; [key: string]: unknown };

const datasetPath = fileURLToPath(new URL('../eval/dataset.jsonl', import.meta.url));

function loadDataset(): Example[] {
  return readFileSync(datasetPath, 'utf8')
    .split(/\r?\n/)
    .filter((line) => line.trim())
    .map((line) => JSON.parse(line));
}

async function runOne(example: Example): Promise<number> {
  // const output = await solve(example.input);
  // return output === example.expected ? 1 : 0;
  throw new Error('Implement runOne');
}

function percentile(values: number[], p: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.round((p / 100) * (sorted.length - 1)))];
}

async function main() {
  const data = loadDataset();
  const scores: number[] = [];
  const latencies: number[] = [];
  for (const example of data) {
    const start = performance.now();
    scores.push(await runOne(example));
    latencies.push(performance.now() - start);
  }
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  console.log(`examples   ${data.length}`);
  console.log(`score      ${mean.toFixed(3)}`);
  console.log(`p50 ms     ${percentile(latencies, 50).toFixed(1)}`);
  console.log(`p95 ms     ${percentile(latencies, 95).toFixed(1)}`);
  console.log('\nAdd a row to ../BENCHMARK.md with these numbers and what you changed.');
}

main();
