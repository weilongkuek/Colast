import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { keywords, style } = req.body;

  const prompt = `你是CO HAIR SALOON的顾客，请用「${style}」风格写一段推荐文案，重点围绕关键词「${keywords}」，内容可以自然带入赞美理发师的服务，描述店内环境舒适、手艺专业，推荐其他人来尝试。文案要简短、不要太官方，要像真人发文。可以适当加emoji。`;

  try {
    const chat = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 300
    });

    res.status(200).json({ result: chat.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}