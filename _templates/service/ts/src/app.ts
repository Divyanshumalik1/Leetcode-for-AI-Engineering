// {{TITLE}}
// Run: npm run play -- <problem> --lang ts → http://localhost:3000
// Tests: npm run t -- <problem> --lang ts
import express from 'express';

export function createApp() {
  const app = express();
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  // Build it here. Pass the model client in (dependency injection) so tests can use FakeLLM.

  return app;
}
