const handler = async (m, { conn }) => {
  try {
    let texto = await m.mentionedJid
    let who = texto.length > 0 ? texto[0] : (m.quoted ? await m.quoted.sender : false)

    if (!who) return m.reply('⚠️ من فضلك قم بعمل منشن للي عايز ترفعه أدمن.');

    const groupMetadata = await conn.groupMetadata(m.chat);
    const participant = groupMetadata.participants.find(p => p.jid === who);

    if (participant && participant.admin) {
      return conn.reply(
        m.chat,
        `✅ *@${who.split('@')[0]}* بالفعل أدمن في المجموعة!`,
        m,
        { mentions: [who] }
      );
    }

    await conn.groupParticipantsUpdate(m.chat, [who], 'promote');
    await conn.reply(
      m.chat,
      `🎉 *@${who.split('@')[0]}* تم ترقيته ليصبح أدمن في المجموعة!`,
      m,
      { mentions: [who] }
    );
  } catch (e) {
    await m.reply(`❌ حصل خطأ غير متوقع.`);
  }
};

handler.help = ['ادمن'];
handler.tags = ['المجموعة'];
handler.command = ['ادمن', 'ترقيه'];
handler.admin = true;
handler.botAdmin = true;

export default handler;