import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { FakeLLM } from '@common/fake-llm'; // inject this instead of a real model in tests
import { createApp } from '../src/app';

describe({{TITLE_JS}}, () => {
  it('responds to the health check', async () => {
    const res = await request(createApp()).get('/health');
    expect(res.status).toBe(200);
  });

  // One test per row of the API contract, plus the failure modes in ../../README.md.
  it.todo('happy path');
  it.todo('provider failure returns a clean error');
});
