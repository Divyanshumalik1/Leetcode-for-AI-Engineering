import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: { '@common': fileURLToPath(new URL('./common', import.meta.url)) },
  },
  test: {
    include: ['**/*.test.{js,ts}'],
    exclude: ['node_modules/**', '_templates/**', '**/attempts/**', 'scripts/**', '.venv/**'],
    setupFiles: ['./scripts/vitest-setup.ts'],
    passWithNoTests: true,
  },
});
