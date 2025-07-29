// pages/api/generate.ts

import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const prompt = req.body.prompt || '帮我写一句广告文案';
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Missing OpenAI API key in environment' });
    }

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo', // 或 'gpt-4'，看你是否开通权限
        messages: [
          { role: 'system', content: '你是一个专业文案助手。' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
      }),
    });

    const contentType = openaiRes.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    if (!openaiRes.ok) {
      const errorText = isJson ? await openaiRes.json() : await openaiRes.text();
      return res.status(openaiRes.status).json({
        error: errorText,
      });
    }

    const data = await openaiRes.json();
    const message = data?.choices?.[0]?.message?.content ?? '生成失败';

    return res.status(200).json({ result: message });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || '服务器错误' });
  }
}
