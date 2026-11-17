import type { VercelRequest, VercelResponse } from '@vercel/node';
import { handleWordHelp } from '../server/handlers';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const result = await handleWordHelp(req.body || {});
  res.status(result.status).json(result.body);
}
