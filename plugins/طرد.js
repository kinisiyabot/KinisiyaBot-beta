let handler = async (m, { conn, participants, usedPrefix, command }) => {
  let developerNumber = '212693863911@s.whatsapp.net'; // رقم المطور بصيغة JID

  let kickte = `*مــنشـن الـشـخص*`;

  if (!m.mentionedJid[0] && !m.quoted)
    return m.reply(kickte, m.chat, { mentions: conn.parseMention(kickte) });

  let user = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted.sender;

  let botNumber = conn.user.jid ? conn.user.jid : conn.user.id.split(':')[0] + '@s.whatsapp.net';

  // 1. التحقق إذا كان المستخدم المستهدف هو البوت نفسه
  if (user === botNumber) {
    return m.reply(
      `*عايزني أطرد نفسي ولا إيه؟! غريب أمرك والله!*`,
      m.chat
    );
  }

  // 2. التحقق إذا كان المستخدم المستهدف هو المطور
  if (user === developerNumber) {
    return m.reply(
      `*عايزني أطرد مطوري ليه؟ أنا أحول زيك ولا إيه؟!*`,
      m.chat,
      { mentions: [developerNumber] }
    );
  }

  let owr = m.chat.split`-`[0];
  await conn.groupParticipantsUpdate(m.chat, [user], 'remove');
  m.reply(
    `*❍━━━══━━❪🫦❫━━══━━━❍*\n*｢🐍｣⇇تـم طـردك بـي نـجـاح*\n*｢🍷｣⇇بـي امـر مـن↜┊@${m.sender.split('@')[0]}┊*\n*❍━━━══━━❪🫦❫━━══━━━❍*`,
    null,
    { mentions: [m.sender] }
  );
};

handler.help = ['kick @user'];
handler.tags = ['group'];
handler.command = ['kick', 'طرد'];
handler.admin = true;
handler.group = true;
handler.botAdmin = true;

export default handler;
