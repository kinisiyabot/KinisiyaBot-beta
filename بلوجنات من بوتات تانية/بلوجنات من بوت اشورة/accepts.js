import fs from 'fs';
import { generateWAMessageFromContent } from '@soymaycol/maybailyes';

const handler = async (m, { conn }) => {
    try {
        const from = m.chat;

        // جلب كل الطلبات المعلقة
        const requests = await conn.groupRequestParticipantsList(from);

        if (!requests || requests.length === 0) {
            const msg = generateWAMessageFromContent(
                from,
                { textMessage: { text: "⚠️ لا يوجد طلبات انضمام معلقة." } },
                { userJid: conn.user.jid, quoted: m }
            );
            return conn.relayMessage(from, msg.message, { messageId: msg.key.id });
        }

        // قبول كل الطلبات دفعة واحدة
        const users = requests.map(r => r.jid);
        await conn.groupRequestParticipantsUpdate(from, users, 'approve');

        // ==== إرسال رسالة مع صورة و externalAdReply ====
        const imagePath = 'image.jpeg';
        const hasImage = fs.existsSync(imagePath);
        const imageBuffer = hasImage ? fs.readFileSync(imagePath) : null;

        const replyText = `✅ تم قبول جميع طلبات الانضمام (${users.length}) بنجاح.`;

        const msg = generateWAMessageFromContent(
            from,
            {
                textMessage: { text: replyText },
                contextInfo: {
                    externalAdReply: {
                        title: 'بوت الإدارة',
                        body: 'إدارة طلبات الانضمام',
                        thumbnail: imageBuffer,
                        mediaType: 1,
                        sourceUrl: 'https://t.me/YourChannel', // غير الرابط حسب الحاجة
                        renderLargerThumbnail: false,
                        showAdAttribution: true
                    }
                }
            },
            { userJid: conn.user.jid, quoted: m }
        );

        await conn.relayMessage(from, msg.message, { messageId: msg.key.id });

    } catch (e) {
        console.error(e);
        const errorMsg = generateWAMessageFromContent(
            m.chat,
            { textMessage: { text: "❌ حدث خطأ أثناء قبول الطلبات." } },
            { userJid: conn.user.jid, quoted: m }
        );
        await conn.relayMessage(m.chat, errorMsg.message, { messageId: errorMsg.key.id });
    }
};

handler.command = /^قبول$/i;

export default handler;