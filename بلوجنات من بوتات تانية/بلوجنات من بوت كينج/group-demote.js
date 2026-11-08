const handler = async (m, { conn }) => {
  try {
    let texto = await m.mentionedJid
    let who = texto.length > 0 ? texto[0] : (m.quoted ? await m.quoted.sender : false)

    if (!who) return m.reply('🌾 من فضلك قم بذكر المستخدم اللي عايز تنزله من الإدارة.');

    const groupMetadata = await conn.groupMetadata(m.chat);
    const participant = groupMetadata.participants.find(participant => participant.jid === who);

    if (!participant || !participant.admin) {
      return conn.reply(m.chat, `🌾 *@${who.split('@')[0]}* مش أدمن في الجروب!`, m, { mentions: [who] });
    }

    if (who === groupMetadata.owner) {
      return m.reply('⭐ مينفعش تنزل صاحب الجروب من الإدارة.');
    }

    if (who === conn.user.jid) {
      return m.reply('⭐ مينفعش تنزل البوت من الإدارة.');
    }

    await conn.groupParticipantsUpdate(m.chat, [who], 'demote');
    await conn.reply(m.chat, `🕸 *@${who.split('@')[0]}* اتشال من الإدارة!`, m, { mentions: [who] });
  } catch (e) {
    await m.reply(`🐼 حصل خطأ.`);
  }
};

handler.help = ['خفض'];
handler.tags = ['المجموعة'];
handler.command = ['خفض'];
handler.admin = true;
handler.botAdmin = true;

export default handler;