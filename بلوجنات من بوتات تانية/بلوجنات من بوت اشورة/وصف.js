import { isElite, extractPureNumber } from '../const/elite.js';

const handler = async (m, { conn }) => {
    const sender = extractPureNumber(m.sender); // تحويل JID إلى رقم صافي

    // التحقق إذا الرقم من النخبة
    if (!isElite(sender)) {
        return m.reply('🚫 هذا الأمر مخصص فقط لأعضاء النخبة.');
        if (!m.isGroup) return m.reply('🚫 هذا الأمر يعمل فقط في الجروبات.');
    }

    let newDescription = text || (m.quoted && m.quoted.text);
    if (!newDescription) return m.reply('⚠ يرجى كتابة الوصف الجديد أو الرد على رسالة تحتوي الوصف.');

    try {
        await conn.groupUpdateDescription(m.chat, newDescription);
        m.reply('✅ تم تحديث وصف الجروب.');
    } catch (e) {
        console.log('خطأ في تغيير الوصف:', e);
        m.reply('⚠ حدث خطأ أثناء تغيير الوصف.');
    }
};

handler.command = ['وصف','جروب_وصف'];
handler.group = true;
export default handler;