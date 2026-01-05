import { factory } from '@/server/factory';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

export const ragRoute = factory.createApp().post(
  '/',
  zValidator('json', z.object({
    query: z.string(),
  })),
  async (c) => {
    const { query } = c.req.valid('json');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: query }],
      }),
    });
    const data = await response.json();
    return c.json(data);
  }
)