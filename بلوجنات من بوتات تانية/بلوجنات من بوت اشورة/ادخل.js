const linkRegex = /chat.whatsapp.com\/([0-9A-Za-z]{20,24})/i;
let enviando;

import { isElite, extractPureNumber } from '../lib/elite.js'; // ملف النخبة

const handler = async (m, { conn, text }) => {
    // التحقق من النخبة
    const senderNumber = extractPureNumber(m.sender);
    if (!isElite(senderNumber)) {
        return m.reply('🚫 هذا الأمر مخصص فقط لأعضاء النخبة.');
    }

    if (enviando) return;
    enviando = true;

    try {
        const link = text;
        if (!link || !link.match(linkRegex)) 
            throw '*[❗] خطأ، ضع رابط النقابة الذي تريد البوت الانضمام إليه.*\n\n*—◉ مثال:*\n*◉ join https://chat.whatsapp.com/FwEUGxkvZD85fIIp0gKFC*';

        const [_, code] = link.match(linkRegex) || [];

        const res = await conn.groupAcceptInvite(code);
        await conn.sendMessage(m.chat, { text: '*[ ✔️ ] تم الانضمام بنجاح!*' }, { quoted: m });
        enviando = false;

    } catch (e) {
        enviando = false;
        console.error(e);
        throw '*[❗] حدث خطأ أثناء الانضمام، تحقق من الرابط وحاول مرة أخرى.*';
    }
};

handler.help = ['join [chat.whatsapp.com]'];
handler.tags = ['elite'];
handler.command = /^join|ادخل$/i;
handler.private = true;
handler.rowner = false; // ليس مقتصرًا على المطور
export default handler;