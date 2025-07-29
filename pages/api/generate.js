import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { keywords, style, language } = req.body;

  const zhPrompt = `你是CO HAIR SALOON的顾客，请用「${style}」风格写一段推荐文案，重点围绕关键词「${keywords}」，内容可以自然带入赞美理发师的服务，描述店内环境舒适、手艺专业，推荐其他人来尝试。文案要简短、不要太官方，要像真人发文。可以适当加emoji。
  
同时，请为该文案生成一个不超过10个字的标题，要求吸引人、真实、简短，可以带emoji。返回格式如下：

标题：xxx
文案：xxx`;

  const enPrompt = `You are a happy customer of CO HAIR SALOON. Write a short and natural-looking social media post in a 「${style}」 style, focusing on the keywords: 「${keywords}」. Feel free to compliment the hairstylist's skill, describe the cozy environment, and recommend others to visit. Keep it casual, short, and authentic, with some emojis.

Also, create a catchy and honest title for this post, no longer than 10 words. Return format:

Title: xxx
Content: xxx`;

  const fullPrompt = language === "en" ? enPrompt : zhPrompt;

  try {
    const chat = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: fullPrompt }],
      temperature: 0.9,
      max_tokens: 500
    });

    const reply = chat.choices[0].message.content;

    const titleMatch = reply.match(/标题[:：]|Title[:：]?\s*(.*)/i);
    const contentMatch = reply.match(/文案[:：]|Content[:：]?\s*([\s\S]*)/i);

    const title =
      titleMatch && titleMatch.length >= 2
        ? titleMatch[1].trim()
        : reply.split("\n")[0].trim();

    const result =
      contentMatch && contentMatch.length >= 2
        ? contentMatch[1].trim()
        : reply.split("\n").slice(1).join("\n").trim();

    res.status(200).json({ title, result });
  } catch (err) {
    console.error("API Error:", err);
    res.status(500).json({ error: "文案生成失败，请稍后再试" });
  }
}
