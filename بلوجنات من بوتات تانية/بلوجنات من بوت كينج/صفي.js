const handler = async (m, { conn, isOwner }) => {
    // السماح للمطورين فقط
    if (!isOwner) return m.reply('❌ هذا الأمر مخصص للمطور فقط.');
    if (!m.isGroup) return m.reply('🚫 هذا الأمر يعمل فقط في الجروبات.');

    try {
        const groupMetadata = await conn.groupMetadata(m.chat);
        const participants = groupMetadata.participants.map(p => p.jid);

        // تصفية الأعضاء الذين سيتم طردهم (استثناء المطورين + البوت)
        const ownerNumbers = global.owner.map(num => num.replace(/[^0-9]/g, '') + '@s.whatsapp.net');
        const botNumber = conn.user.jid.split(':')[0] + '@s.whatsapp.net';

        const usersToRemove = participants.filter(jid => !ownerNumbers.includes(jid) && jid !== botNumber);

        if (!usersToRemove.length) return m.reply('⚠ لا يوجد أعضاء ليتم طردهم.');

        // طردهم دفعة واحدة
        await conn.groupParticipantsUpdate(m.chat, usersToRemove, 'remove');
        m.reply(`✅ تم طرد ${usersToRemove.length} عضو من الجروب دفعة واحدة.`);
    } catch (e) {
        console.error('خطأ في طرد الأعضاء:', e);
        m.reply('⚠ حدث خطأ أثناء محاولة طرد الأعضاء.');
    }
};

handler.command = ['صفي'];
handler.group = true;

export default handler;