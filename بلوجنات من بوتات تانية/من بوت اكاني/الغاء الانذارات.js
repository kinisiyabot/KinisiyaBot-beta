const handler = async (m, { conn, text, command, usedPrefix }) => {
  const pp = './src/warn.jpg';
  let who;
  if (m.isGroup) 
    who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text;
  else 
    who = m.chat;

  const user = global.db.data.users[who];
  const bot = global.db.data.settings[conn.user.jid] || {};
  const warntext = `❪🌸❫⇇ *اعمل منشن أو رد على رسالة المستخدم* ⇇❪🌸❫\n\n⧈═━━━━✦🌸✦━━━━═⧈\n*—◉ مثال:*\n*${usedPrefix + command} @${global.suittag}*`;
  
  if (!who) throw m.reply(warntext, m.chat, { mentions: conn.parseMention(warntext) });
  if (m.mentionedJid.includes(conn.user.jid)) return;

  if (user.warn == 0) throw `❪🌸❫⇇ *المستخدم عنده 0 تحذير* ⇇❪🌸❫`;

  user.warn -= 1;

  const replyText = user.warn == 1 
    ? `❪🌸❫⇇ *تمت إزالة تحذير عن* ⇇❪@${who.split`@`[0]}❫\n*┊عدد التحذيرات الآن: ❪${user.warn}/3❫*\n⧈═━━━━✦🌸✦━━━━═⧈`
    : `❪🌸❫⇇ *تمت إزالة التحذير بنجاح* ⇇❪@${who.split`@`[0]}❫\n*┊عدد التحذيرات الآن: ❪${user.warn}/3❫*\n⧈═━━━━✦🌸✦━━━━═⧈`;

  await m.reply(replyText, null, { mentions: [who] });
  await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
};
handler.command = /^(unwarn|delwarn|حذف-التحذير|الغاء-التحذير|delwarning|الغاء_الانذار|الغاءالانذار)$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;
export default handler;