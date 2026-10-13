/**
 * Deterministic fake embeddings for tests — no model, no network.
 * Texts that share words get similar vectors, so similarity search behaves sensibly:
 *
 *   cosine(fakeEmbed('cats are great'), fakeEmbed('great cats')) > cosine(fakeEmbed('cats are great'), fakeEmbed('tax law'))
 */
import { createHash } from 'node:crypto';

export function fakeEmbed(text: string, dim = 64): number[] {
  const vec = new Array<number>(dim).fill(0);
  for (const word of text.toLowerCase().match(/[a-z0-9]+/g) ?? []) {
    const h = BigInt(`0x${createHash('md5').update(word).digest('hex')}`);
    const index = Number(h % BigInt(dim));
    vec[index] += (h >> 8n) % 2n === 1n ? 1 : -1;
  }
  const norm = Math.sqrt(vec.reduce((s, x) => s + x * x, 0)) || 1;
  return vec.map((x) => x / norm);
}
