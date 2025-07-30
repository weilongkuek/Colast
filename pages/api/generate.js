// pages/api/generate.ts

import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = {
  result?: string;
  error?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const prompt = (req.body?.prompt ?? '').trim();
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: '缺少 OpenAI API key，请设置 OPENAI_API_KEY 环境变量。' });
  }

  if (!prompt) {
    return res.status(400).json({ error: '请输入有效的 prompt 内容' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: '你是一个专业文案助手，擅长撰写有吸引力的广告语。' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
      }),
    });

    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    if (!response.ok) {
      const errorDetails = isJson ? await response.json() : await response.text();
      console.error('OpenAI API 错误：', errorDetails);

      const errMsg =
        typeof errorDetails === 'string'
          ? errorDetails
          : errorDetails?.error?.message || JSON.stringify(errorDetails);

      return res.status(response.status).json({ error: `OpenAI 返回错误：${errMsg}` });
    }

    const data = await response.json();
    const message = data?.choices?.[0]?.message?.content?.trim();

    if (!message) {
      return res.status(500).json({ error: 'OpenAI 返回数据格式错误或无内容' });
    }

    return res.status(200).json({ result: message });
  } catch (err: any) {
    console.error('服务器内部错误：', err);
    return res.status(500).json({ error: err?.message || '服务器发生未知错误' });
  }
}
