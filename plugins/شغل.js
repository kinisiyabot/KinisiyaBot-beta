import yts from "yt-search";
import { prepareWAMessageMedia, generateWAMessageFromContent, proto } from "baileys-pro";

let handler = async (m, { conn, text }) => {
  if (!text) return conn.sendMessage(
    m.chat,
    { text: "❌ اكتب اسم الأغنية أو الفيديو\nمثال:\n.شغل fnaf song" },
    { quoted: m }
  );

  let search = await yts(text);
  if (!search.videos || !search.videos.length) return conn.sendMessage(
    m.chat,
    { text: "❌ لم يتم العثور على نتائج." },
    { quoted: m }
  );

  const v = search.videos[0];

  // نص الرسالة
  let msg = `
🎬 العنوان: ${v.title}
📺 القناة: ${v.author.name}
⏱ المدة: ${v.timestamp}
👁 المشاهدات: ${v.views.toLocaleString()}
🔗 الرابط: ${v.url}
`;

  // رابط صورة الغلاف
  const coverUrl = "https://files.catbox.moe/npidr9.jpg";

  // تحضير الصورة
  let media;
  try {
    media = await prepareWAMessageMedia({ image: { url: coverUrl } }, { upload: conn.waUploadToServer });
  } catch (e) {
    console.error("خطأ في تحميل صورة الغلاف:", e);
    media = null;
  }

  // إنشاء nativeFlowPayload بنفس شكل قائمة البوت الاحترافية
  const nativeFlowPayload = {
    body: { text: msg },
    footer: { text: "🩸 Music Player" },
    nativeFlowMessage: {
      buttons: [
        {
          name: 'quick_reply',
          buttonParamsJson: JSON.stringify({
            display_text: "🎬 مشاهدة الفيديو",
            id: `.فيديو ${v.url}`
          })
        },
        {
          name: 'quick_reply',
          buttonParamsJson: JSON.stringify({
            display_text: "🎧 تحويل لأغنية",
            id: `.اغنيه ${v.url}`
          })
        },
        {
          name: 'quick_reply',
          buttonParamsJson: JSON.stringify({
            display_text: "🔍 نتائج البحث",
            id: `.يوتيوب ${text}`
          })
        }
      ]
    }
  };

  if (media) {
    nativeFlowPayload.header = {
      hasMediaAttachment: true,
      subtitle: "البحث عن الفيديوهات",
      imageMessage: media.imageMessage
    };
  }

  // إرسال الرسالة التفاعلية
  const interactiveMessage = proto.Message.InteractiveMessage.fromObject(nativeFlowPayload);
  const msgToSend = generateWAMessageFromContent(m.chat, { interactiveMessage }, { userJid: m.sender });
  await conn.relayMessage(m.chat, msgToSend.message, { messageId: msgToSend.key.id });
};

handler.command = /^شغل$/i;
export default handler;