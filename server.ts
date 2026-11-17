import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import {
  handleAi,
  handleExtractWords,
  handleStatus,
  handleWordHelp,
} from './server/handlers';
import { bncStatus, isAIConfigured } from './server/ai';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '15mb' }));

app.post('/api/ai', async (req, res) => {
  const result = await handleAi(req.body || {});
  res.status(result.status).json(result.body);
});

app.post('/api/extract-words', async (req, res) => {
  const result = await handleExtractWords(req.body || {});
  res.status(result.status).json(result.body);
});

app.post('/api/word-help', async (req, res) => {
  const result = await handleWordHelp(req.body || {});
  res.status(result.status).json(result.body);
});

app.get('/api/status', (_req, res) => {
  const result = handleStatus();
  res.status(result.status).json(result.body);
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`WriteTechAI http://0.0.0.0:${PORT}`);
    console.log(`Gemini: ${isAIConfigured() ? 'faol' : 'GEMINI_API_KEY yo‘q — mahalliy rejim'}`);
    const bnc = bncStatus();
    console.log(`BNC: ${bnc.connected ? 'ulangan' : 'ulanmagan'}`);
  });
}

startServer();
