import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleAi } from '../server/handlers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed', messageUz: 'Faqat POST.' });
    return;
  }

  const result = await handleAi(req.body || {});
  res.status(result.status).json(result.body);
}
