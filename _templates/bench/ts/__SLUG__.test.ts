import { describe, it, expect } from 'vitest';
import { FakeLLM } from '@common/fake-llm'; // scripted LLM for fast, free tests
import { fakeEmbed } from '@common/fake-embed'; // deterministic embeddings
import { solve } from './{{SLUG}}';

// Calls a real model API: skipped unless RUN_LIVE=1.
const live = process.env.RUN_LIVE === '1' ? it : it.skip;

// Turn every requirement and edge case in ../README.md into a test before you implement.
describe({{TITLE_JS}}, () => {
  it.todo('requirement 1');
  it.todo('edge case 1');

  live('works against a real model', async () => {
    expect(solve).toBeDefined();
  });
});
