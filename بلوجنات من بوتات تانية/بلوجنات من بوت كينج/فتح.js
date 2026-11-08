let handler = async (m, { conn, isOwner }) => {
  // السماح للمطورين فقط
  if (!isOwner) {
    return conn.reply(m.chat, "❌ هذا الأمر مخصص للمطور فقط.", m);
  }

  if (!m.isGroup) return conn.reply(m.chat, "❌ هذا الأمر يشتغل في الجروبات فقط.", m);

  await conn.groupSettingUpdate(m.chat, "not_announcement"); // يفتح الجروب
  await conn.sendMessage(m.chat, { react: { text: "🔓", key: m.key }});
  await conn.reply(m.chat, "🔓 تم فتح الجروب (الكل يقدر يكتب).", m);
};

handler.command = ["فتح"];
handler.help = ["فتح"];
handler.tags = ["group"];

export default handler;