import axios from "axios";
import * as baileys from "@whiskeysockets/baileys";
const { generateWAMessageFromContent, proto } = baileys;

let handler = async (m, { conn, text, command }) => {
  if (!text)
    return m.reply(
      `🎯 يرجى كتابة سؤالك بعد الأمر\n\nمثال:\n${command} ما هو الذكاء الاصطناعي؟`
    );

  try {
    const res = await axios.get(
      `${global.API_BASE}/api/v1/ai/claude?message=${encodeURIComponent(text)}`
    );

    if (res.data?.response) {
      const message = generateWAMessageFromContent(
        m.chat,
        {
          extendedTextMessage: {
            text: res.data.response,
            contextInfo: {
              externalAdReply: {
                title: "Claude AI",
                body: "𝐊𝐈𝐍𝐈𝐒𝐈𝐘𝐀 𝐁𝐎𝐓",
                mediaUrl: "https://whatsapp.com/channel/0029Vb80wch30LKFioKenc2V",
                mediaType: 2,
                thumbnail: (await axios.get(
                  "https://i.postimg.cc/2LDFNg6X/upload-1765230477630.jpg",
                  { responseType: "arraybuffer" }
                )).data,
            
              },
            },
          },
        },
        { quoted: m }
      );

      await conn.relayMessage(m.chat, message.message, { messageId: message.key.id });
    } else {
      await m.reply("⚠️ حدث خطأ أثناء جلب الرد من Claude.");
    }
  } catch (err) {
    console.error(err);
    await m.reply("❌ حدث خطأ في الاتصال بالخادم، حاول مجددًا لاحقًا.");
  }
};

handler.help = ["كلود", "claude"];
handler.tags = ["ai"];
handler.command = /^(كلود)$/i;

export default handler;