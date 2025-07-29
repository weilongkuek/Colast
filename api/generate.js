import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { keywords, language } = req.body;

  const prompt =
    language === "zh"
      ? `你是CO HAIR SALOON的顾客，请写一段发文推荐文案，内容要围绕关键词「${keywords}」，文风自然真实，可以带emoji，赞美理发师与环境，适合发到小红书。请同时生成一个不超过10字的吸睛标题。格式如下：

标题：xxx
文案：xxx`
      : `You are a customer of CO HAIR SALOON. Write a short and natural post to recommend the salon based on the keyword "${keywords}". Mention great service, cozy environment, and praise the hairstylist naturally. Include emojis. Also generate a short, catchy title within 10 words. Format:

Title: xxx
Post: xxx`;

  try {
    const chat = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.85,
      max_tokens: 500
    });

    const reply = chat.choices[0].message.content;

    const titleRegex = language === "zh" ? /标题[:：](.*)/ : /Title[:：](.*)/;
    const bodyRegex = language === "zh" ? /文案[:：]([\s\S]*)/ : /Post[:：]([\s\S]*)/;

    const title = reply.match(titleRegex)?.[1]?.trim() || "";
    const result = reply.match(bodyRegex)?.[1]?.trim() || reply;

    res.status(200).json({ title, result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
