import { describe, it, expect } from 'vitest';
import { solve } from './{{SLUG}}';

// Live test against the real deployment: runs only with RUN_LIVE=1 and your cloud login.
const live = process.env.RUN_LIVE === '1' ? it : it.skip;

describe({{TITLE_JS}}, () => {
  // Offline tests: wrap the cloud SDK client behind a small interface and pass a fake here.
  it.todo('logic with a fake client');

  live('works against the deployed service', async () => {
    expect(solve).toBeDefined();
  });
});
