import { isElite, extractPureNumber } from '../lib/elite.js';

const handler = async (m, { conn, text }) => {
    const sender = extractPureNumber(m.sender); // تحويل JID إلى رقم صافي

    // التحقق إذا الرقم من النخبة
    if (!isElite(sender)) {
        return m.reply('🚫 هذا الأمر مخصص فقط لأعضاء النخبة.');
    }

    let newName = text || (m.quoted && m.quoted.text);
    if (!newName) return m.reply('⚠ يرجى كتابة الاسم الجديد أو الرد على رسالة تحتوي الاسم.');

    try {
        await conn.groupUpdateSubject(m.chat, newName);
        m.reply(`✅ تم تغيير اسم الجروب إلى: ${newName}`);
    } catch (e) {
        console.log('خطأ في تغيير الاسم:', e);
        m.reply('⚠ حدث خطأ أثناء تغيير الاسم.');
    }
};

handler.command = ['اسم','جروب_اسم'];
handler.group = true;
export default handler;