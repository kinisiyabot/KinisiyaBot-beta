import { isElite, extractPureNumber } from '../lib/elite.js';

const handler = async (m, { conn, text }) => {
    const sender = extractPureNumber(m.sender); // تحويل JID إلى رقم صافي

    // التحقق إذا الرقم من النخبة
    if (!isElite(sender)) {
        return m.reply('🚫 هذا الأمر مخصص فقط لأعضاء النخبة.');
    }

    if (!m.isGroup) return m.reply('🚫 هذا الأمر يعمل فقط في الجروبات.');

    let userToPromote;

    // تحديد الشخص من الرد
    if (m.quoted) {
        userToPromote = m.quoted.sender;
    } 
    // أو من منشن
    else if (m.mentionedJid && m.mentionedJid.length > 0) {
        userToPromote = m.mentionedJid[0];
    } else {
        return m.reply('⚠ يرجى الرد على رسالة الشخص أو منشنه للرفع.');
    }

    try {
        await conn.groupParticipantsUpdate(m.chat, [userToPromote], 'promote');
        m.reply(`✅ تم رفع ${userToPromote} إلى أدمن بنجاح.`);
    } catch (e) {
        console.log('خطأ في رفع العضو:', e);
        m.reply('⚠ حدث خطأ أثناء محاولة رفع العضو.');
    }
};

handler.command = ['ادمن']; // اسم الأمر
handler.group = true;

export default handler;