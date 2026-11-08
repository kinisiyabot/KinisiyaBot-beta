const handler = async (m, { conn, participants, usedPrefix, command }) => {
  let kickte = `*✳️ الاستخدام الصحيح للأمر*\n*${usedPrefix + command}*`;

  if (!m.isGroup || !m.sender) return m.reply(kickte, m.chat, { mentions: conn.parseMention(kickte) });

  let groupMetadata = await conn.groupMetadata(m.chat);
  let owner = groupMetadata.owner || m.chat.split`-`[0] + '@s.whatsapp.net';

  let botDevelopers = ['212705655633@s.whatsapp.net'];

  // تصفية الأعضاء الذين سيتم طردهم، مع استثناء المالك والمطورين
  let participantsToKick = participants.filter(participant => 
    participant.id !== owner &&
    participant.id !== conn.user.jid &&
    !botDevelopers.includes(participant.id)
  ).map(participant => participant.id);

  // طرد جميع الأعضاء دفعة واحدة
  if (participantsToKick.length > 0) {
    await conn.groupParticipantsUpdate(m.chat, participantsToKick, 'remove');
  }

  m.reply('*✅ تم طرد جميع الأعضاء ما عدا المطورين.*');
};

handler.help = ['kickall'];
handler.tags = ['group'];
handler.command = ['𝑳𝒊𝒍𝒊𝒉𝒕🐝'];
handler.group = true;
handler.owner = true;
handler.botAdmin = true;

export default handler;