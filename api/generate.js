import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { keywords, style } = req.body;

  const fullPrompt = `你是CO HAIR SALOON的顾客，请用「${style}」风格写一段推荐文案，重点围绕关键词「${keywords}」，内容可以自然带入赞美理发师的服务，描述店内环境舒适、手艺专业，推荐其他人来尝试。文案要简短、不要太官方，要像真人发文。可以适当加emoji。

同时，请为该文案生成一个不超过10个字的标题，要求吸引人、真实、简短，可以带emoji，返回格式如下：

标题：xxx
文案：xxx`;

  try {
    const chat = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: fullPrompt }],
      temperature: 0.85,
      max_tokens: 500
    });

    const reply = chat.choices[0].message.content;

    // 解析标题和文案
    const titleMatch = reply.match(/标题[:：](.*)/);
    const bodyMatch = reply.match(/文案[:：]([\s\S]*)/);

    const title = titleMatch ? titleMatch[1].trim() : "";
    const result = bodyMatch ? bodyMatch[1].trim() : reply;

    res.status(200).json({ title, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
