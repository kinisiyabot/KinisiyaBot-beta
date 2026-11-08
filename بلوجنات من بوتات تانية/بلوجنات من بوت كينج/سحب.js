const handler = async (m, { conn, isOwner }) => {
    // السماح للمطورين فقط
    if (!isOwner) return m.reply('❌ هذا الأمر مخصص للمطور فقط.');
    if (!m.isGroup) return m.reply('🚫 هذا الأمر يعمل فقط في الجروبات.');

    try {
        const groupMetadata = await conn.groupMetadata(m.chat);
        const ownerNumbers = global.owner.map(num => num.replace(/[^0-9]/g, '') + '@s.whatsapp.net');
        const botNumber = conn.user.jid.split(':')[0] + '@s.whatsapp.net';

        const admins = groupMetadata.participants
            .filter(p => p.admin) // كل الأدمن
            .map(p => p.jid)
            .filter(jid => !ownerNumbers.includes(jid) && jid !== botNumber); // استثناء المطورين + البوت

        if (admins.length === 0) return m.reply('⚠ لا يوجد أدمن لتنزيله.');

        await conn.groupParticipantsUpdate(m.chat, admins, 'demote');
        m.reply(`✅ تم تنزيل ${admins.length} أدمن من الجروب.`);
    } catch (e) {
        console.error('خطأ في تنزيل الأدمن:', e);
        m.reply('⚠ حدث خطأ أثناء محاولة تنزيل الأدمن.');
    }
};

handler.command = ['سحب'];
handler.group = true;

export default handler;