let handler = async (m, { conn, isOwner }) => {
  // السماح للمطورين فقط
  if (!isOwner) {
    return conn.reply(m.chat, "❌ هذا الأمر مخصص للمطور فقط.", m);
  }

  if (!m.isGroup) return conn.reply(m.chat, "❌ هذا الأمر يشتغل في الجروبات فقط.", m);

  await conn.groupSettingUpdate(m.chat, "announcement"); // يقفل الجروب
  await conn.sendMessage(m.chat, { react: { text: "🔒", key: m.key }});
  await conn.reply(m.chat, "🔒 تم قفل الجروب (المشرفين فقط).", m);
};

handler.command = ["قفل"];
handler.help = ["قفل"];
handler.tags = ["group"];

export default handler;