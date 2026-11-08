import axios from "axios";
import baileys from "baileys-pro";
const { generateWAMessageFromContent, proto } = baileys;

let handler = async (m, { conn, text, command }) => {
  if (!text)
    return m.reply(
      `🎯 يرجى كتابة سؤالك بعد الأمر\n\nمثال:\n${command} ما هو الذكاء الاصطناعي؟`
    );

  try {
    const res = await axios.get(
      `https://apex-api-five.vercel.app/api/v1/ai/deepseek?prompt=${encodeURIComponent(text)}`
    );

    if (res.data?.response) {
      const message = generateWAMessageFromContent(
        m.chat,
        {
          extendedTextMessage: {
            text: res.data.response,
            contextInfo: {
              externalAdReply: {
                title: res.data.model || "DeepSeek AI",
                body: "انقر لي متابعت كل جديد",
                mediaUrl: 'https://whatsapp.com/channel/0029Vb80wch30LKFioKenc2V',
                mediaType: 2,
                thumbnail: (await axios.get(
                  "https://i.postimg.cc/yJZX6q5Q/upload-1765193871898.jpg",
                  { responseType: "arraybuffer" }
                )).data,
                sourceUrl: "",
              },
            },
          },
        },
        { quoted: m }
      );

      await conn.relayMessage(m.chat, message.message, { messageId: message.key.id });
    } else {
      await m.reply("⚠️ حدث خطأ أثناء جلب الرد من DeepSeek.");
    }
  } catch (err) {
    console.error(err);
    await m.reply("❌ حدث خطأ في الاتصال بالخادم، حاول مجددًا لاحقًا.");
  }
};

handler.help = ["ديب", "ديبسيك", "deepseek"];
handler.tags = ["ai"];
handler.command = /^(ديب|ديبسيك|deepseek)$/i;

export default handler;