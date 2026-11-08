const handler = async (m, { conn, text, isOwner }) => {
    // السماح للمطورين فقط
    if (!isOwner) return m.reply('🚫 هذا الأمر مخصص للمطور فقط.');
    if (!m.isGroup) return m.reply('🚫 هذا الأمر يعمل فقط في الجروبات.');

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