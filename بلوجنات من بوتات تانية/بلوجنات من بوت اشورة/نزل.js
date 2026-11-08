import { isElite, extractPureNumber } from '../const/elite.js';

const handler = async (m, { conn }) => {
    const sender = extractPureNumber(m.sender); // تحويل JID إلى رقم صافي

    // التحقق إذا الرقم من النخبة
    if (!isElite(sender)) {
        return m.reply('🚫 هذا الأمر مخصص فقط لأعضاء النخبة.');
            if (!m.isGroup) return m.reply('🚫 هذا الأمر يعمل فقط في الجروبات.');
    }

    let userToDemote;

    // تحديد الشخص من الرد
    if (m.quoted) {
        userToDemote = m.quoted.sender;
    } 
    // أو من منشن
    else if (m.mentionedJid && m.mentionedJid.length > 0) {
        userToDemote = m.mentionedJid[0];
    } else {
        return m.reply('⚠ يرجى الرد على رسالة الشخص أو منشنه لتنزيله من أدمن.');
    }

    try {
        await conn.groupParticipantsUpdate(m.chat, [userToDemote], 'demote');
        m.reply(`✅ تم تنزيل ${userToDemote} من أدمن بنجاح.`);
    } catch (e) {
        console.log('خطأ في تنزيل العضو:', e);
        m.reply('⚠ حدث خطأ أثناء محاولة تنزيل العضو.');
    }
};

handler.command = ['نزل']; // اسم الأمر
handler.group = true;

export default handler;