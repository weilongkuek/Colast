import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  const { keywords, style } = req.body;

  const prompt = `
你是一名理发店文案助手，店名叫 CO HAIR SALOON。请根据以下信息生成一篇社交媒体发文内容。
- 风格：${style}
- 关键词：${keywords}
请生成两个内容：
1. 一个不超过10个字的中文标题，用于社交媒体吸引点击。
2. 一段正文文案，带点夸张但真实，推荐理发师或服务，适合小红书风格。
返回格式如下：
标题：xxx
正文：yyy
`;

  const chat = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.9,
    max_tokens: 500
  });

  const result = chat.choices[0].message.content;
  const [titleLine, contentLine] = result.split("\n").filter(Boolean);

  const title = titleLine.replace(/^标题：/, "").trim();
  const content = contentLine.replace(/^正文：/, "").trim();

  res.status(200).json({ title, content });
}
