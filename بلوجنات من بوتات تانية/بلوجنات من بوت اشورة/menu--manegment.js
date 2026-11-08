import { prepareWAMessageMedia, generateWAMessageFromContent } from "@soymaycol/maybailyes";

import { isElite, extractPureNumber } from '../lib/elite.js';

const handler = async (m, { conn }) => {
    const sender = extractPureNumber(m.sender); // تحويل JID إلى رقم صافي

    // التحقق إذا الرقم من النخبة
    if (!isElite(sender)) {
        return m.reply('🚫 هذا الأمر مخصص فقط لأعضاء النخبة.');
        if (!m.isGroup) return m.reply('🚫 هذا الأمر يعمل فقط في الجروبات.');
    }

    const imageUrl = "https://files.catbox.moe/ae43po.jpg"; // رابط الصورة المصغرة
    const link1 = "https://wa.me/201119193086"; // الرابط الأول (اتصال مع المطور)
    const link2 = "https://whatsapp.com/channel/0029Vb6UFoi05MUe24Jo7r1r"; // الرابط الثاني (القناة)

    // تجهيز الصورة المصغرة
    const media = await prepareWAMessageMedia(
        { image: { url: imageUrl } },
        { upload: conn.waUploadToServer }
    );

    // إنشاء الرسالة التفاعلية
    const interactiveMessage = {
        body: { text: "مـرحـبـا فـي قـسـم الاداره" },
        footer: { text: "𝑨𝑺𝑯𝑼𝑹𝑨-𝐁𝐎𝐓" },
        header: { 
            title: "𝑪𝑹𝑶𝑪𝑶", 
            hasMediaAttachment: true, 
            imageMessage: media.imageMessage 
        },
        nativeFlowMessage: {
            buttons: [
            {
                    name: "quick_reply",
                    buttonParamsJson: JSON.stringify({
                        display_text: "🏮 منشن الـجـروب 🏮",
                        id: ".منشن"
                    })
                },
            {
                    name: "quick_reply",
                    buttonParamsJson: JSON.stringify({
                        display_text: "🏮 مغادره الـجـروب 🏮",
                        id: ".مغادرة"
                    })
                },
            {
                    name: "quick_reply",
                    buttonParamsJson: JSON.stringify({
                        display_text: "🏮 ترحيب الـجـروب 🏮",
                        id: ".ترحيب"
                    })
                },
                {
                    name: "quick_reply",
                    buttonParamsJson: JSON.stringify({
                        display_text: "🏮 وصف الـجـروب 🏮",
                        id: ".وصف"
                    })
                },
                {
                    name: "quick_reply",
                    buttonParamsJson: JSON.stringify({
                        display_text: "🏮 اسم الجروب 🏮",
                        id: ".اسم"
                    })
                },
                {
                    name: "quick_reply",
                    buttonParamsJson: JSON.stringify({
                        display_text: "🏮 فـــتــح الـجـروب 🏮",
                        id: ".فتح"
                    })
                },
                {
                    name: "quick_reply",
                    buttonParamsJson: JSON.stringify({
                        display_text: "🏮 قــــفــل الـجـروب 🏮",
                        id: ".قفل"
                    })
                }
            ]
        }
    };

    // إرسال الرسالة
    let msg = generateWAMessageFromContent(
        m.chat,
        { viewOnceMessage: { message: { interactiveMessage } } },
        { userJid: conn.user.jid, quoted: m }
    );

    conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
};

handler.command = /^T3$/i; // تشغيل الكود عند كتابة "T3"

export default handler;