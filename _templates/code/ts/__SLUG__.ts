// {{TITLE}}
// Spec: ../README.md · Tests: {{SLUG}}.test.ts
// Run the tests: npm run t -- <problem> --lang ts
// Run this file: npm run play -- <problem> --lang ts
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function solve(): unknown {
  throw new Error('Not implemented');
}

// Runs only when you execute this file directly (npm run play), not when tests import it.
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  console.log(solve());
}
