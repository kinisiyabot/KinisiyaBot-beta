import { isElite, extractPureNumber } from '../lib/elite.js';
import { prepareWAMessageMedia, generateWAMessageFromContent } from "@soymaycol/maybailyes";

const handler = async (m, { conn }) => {
    const sender = extractPureNumber(m.sender);

    // التحقق إذا الرقم من النخبة
    if (!isElite(sender)) {
        return m.reply('🚫 هذا الأمر مخصص فقط لأعضاء النخبة.');
        if (!m.isGroup) return m.reply('🚫 هذا الأمر يعمل فقط في الجروبات.');
    }

    const imageUrl = "https://files.catbox.moe/ae43po.jpg"; 
    const link1 = "https://wa.me/201119193086";
    const link2 = "https://whatsapp.com/channel/0029Vb6UFoi05MUe24Jo7r1r";

    const media = await prepareWAMessageMedia(
        { image: { url: imageUrl } },
        { upload: conn.waUploadToServer }
    );

    const interactiveMessage = {
        body: { text: "مـرحـبـا فـي قـسـم الحماية" },
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
                        display_text: "🌑 رفع النخبة 🌑",
                        id: ".ارفعه"
                    })
                },
                {
                    name: "quick_reply",
                    buttonParamsJson: JSON.stringify({
                        display_text: "🌑 الـحمـايـة القـــصــوى 🌑",
                        id: ".حماية"
                    })
                },
                {
                    name: "quick_reply",
                    buttonParamsJson: JSON.stringify({
                        display_text: "🌑 الــحــمايــة الامــــنـة 🌑",
                        id: ".عقاب"
                    })
                }
            ]
        }
    };

    let msg = generateWAMessageFromContent(
        m.chat,
        { viewOnceMessage: { message: { interactiveMessage } } },
        { userJid: conn.user.jid, quoted: m }
    );

    conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
};

handler.command = /^T2$/i;
handler.group = true;

export default handler;