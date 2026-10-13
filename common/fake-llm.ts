/**
 * A scripted stand-in for an LLM, so tests are fast, free and deterministic.
 *
 *   const llm = new FakeLLM(['first reply', { tool: 'search', args: { q: 'x' } }, new Error('timeout')]);
 *   await llm.complete(messages); // → 'first reply'
 *   await llm.complete(messages); // → { tool: 'search', ... }
 *   await llm.complete(messages); // throws — handy for testing retries
 *   llm.calls;                    // every call, so you can assert on prompts and arguments
 *
 * Pass it into your code wherever a real client would go (dependency injection).
 */
export class FakeLLM<T = unknown> {
  readonly calls: Array<{ messages: unknown[]; [key: string]: unknown }> = [];

  constructor(private readonly responses: Array<T | Error>) {}

  async complete(messages: unknown[], options: Record<string, unknown> = {}): Promise<T> {
    this.calls.push({ messages: structuredClone(messages), ...options });
    if (!this.responses.length) throw new Error('FakeLLM ran out of scripted responses');
    const reply = this.responses.shift()!;
    if (reply instanceof Error) throw reply;
    return reply;
  }
}
