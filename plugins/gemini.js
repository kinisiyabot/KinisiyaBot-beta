import axios from "axios";

let handler = async (m, { text, command }) => {
  if (!text) {
    return m.reply(
      `╮••─๋︩︪──๋︩︪─═⊐‹💻✨›⊏═─๋︩︪──๋︩︪─┈☇
╿↵ اكتب سؤالك بعد الأمر ✨
── • ◈ • ──
📌 مثال:
${command} ما هو الذكاء الاصطناعي؟
╯────────────────────`
    );
  }

  await m.reply("⏳ جاري التفكير...");

  try {
    // نجبره يرد بالعربي
    const prompt = `جاوب بالعربية فقط:\n${text}`;

    const res = await axios.get(
      `https://apex-api-five.vercel.app/api/v1/ai/gemini?prompt=${encodeURIComponent(prompt)}`
    );

    if (res.data?.status && res.data?.response) {
      let reply = res.data.response.trim();

      await m.reply(
        `╮••─๋︩︪──๋︩︪─═⊐‹🤖›⊏═─๋︩︪──๋︩︪─┈☇
╿↵ رد الذكاء الاصطناعي
── • ◈ • ──
${reply}
╯────────────────────`
      );
    } else {
      await m.reply("⚠️ مفيش رد متاح حالياً.");
    }
  } catch (err) {
    console.error(err);
    await m.reply("❌ حصل خطأ في الاتصال، جرب تاني.");
  }
};

handler.help = ["ai", "gemini"];
handler.tags = ["ai"];
handler.command = /^(ai|gemini|ذكاء)$/i;

export default handler;