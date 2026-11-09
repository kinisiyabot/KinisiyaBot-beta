import axios from 'axios';
import * as pkg from '@whiskeysockets/baileys';
const { generateWAMessageFromContent, proto, prepareWAMessageMedia } = pkg;

let handler = async (m, { conn, text }) => {
    if (!text) return conn.sendMessage(
        m.chat,
        { text: '❌ اكتب كلمة للبحث عن الأغاني.\nمثال:\n.ساوند_بحث Belza' },
        { quoted: m }
    );

    try {
        // طلب البحث من API
        let res = await axios.get(`${global.API_BASE}/api/v1/search/sound_cloud?query=${encodeURIComponent(text)}`);
        let data = res.data;

        if (!data.status || !data.results || !data.results.length)
            return conn.sendMessage(m.chat, { text: "❌ لم أجد أي نتائج." }, { quoted: m });

        let results = data.results.slice(0, 10); // أول 10 نتائج

        // تكوين عناصر القائمة
        let rows = results.map((v, i) => ({
            header: `❀⃘⃛͜ ${i + 1}. ${v.title.substring(0, 40)}`,
            title: v.artist || "غير معروف",
            description: `⏱ ${v.duration} | ❤️ ${v.likes} | 👁 ${v.plays}`,
            id: `.ساوند_تحميل ${v.link}` // زر لتشغيل أو فتح الرابط
        }));

        // تجهيز غلاف أول نتيجة (لو موجود)
        let media = null;
        if (results[0].artwork) {
            media = await prepareWAMessageMedia(
                { image: { url: results[0].artwork } },
                { upload: conn.waUploadToServer }
            );
        }

        const msg = generateWAMessageFromContent(
            m.chat,
            {
                viewOnceMessage: {
                    message: {
                        interactiveMessage: proto.Message.InteractiveMessage.create({
                            body: proto.Message.InteractiveMessage.Body.create({
                                text: `🔍 نتائج البحث عن: *${text}*\nاختر أغنية من القائمة 👇`
                            }),
                            footer: proto.Message.InteractiveMessage.Footer.create({ text: "🩸 SoundCloud Search" }),
                            header: proto.Message.InteractiveMessage.Header.create({
                                title: "❀⃘⃛͜ نتائج البحث",
                                hasMediaAttachment: !!media,
                                ...(media?.imageMessage ? { imageMessage: media.imageMessage } : {})
                            }),
                            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                                buttons: [
                                    {
                                        name: "single_select",
                                        buttonParamsJson: JSON.stringify({
                                            title: "📂 عرض النتائج",
                                            sections: [
                                                {
                                                    title: "🩸 قائمة الأغاني",
                                                    rows
                                                }
                                            ]
                                        })
                                    }
                                ]
                            })
                        })
                    }
                }
            },
            { userJid: m.sender }
        );

        await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

    } catch (e) {
        console.error(e);
        conn.sendMessage(m.chat, { text: "❌ حصل خطأ أثناء البحث." }, { quoted: m });
    }
};

handler.command = /^ساوند_بحث$/i;
export default handler;