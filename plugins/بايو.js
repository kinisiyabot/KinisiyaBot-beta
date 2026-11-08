let handler = async (m, { conn }) => {
  if (!m.isGroup) return conn.reply(m.chat, '❌ هذا الأمر يعمل فقط داخل الجروبات.', m)

  try {
    const metadata = await conn.groupMetadata(m.chat)
    const subject = metadata.subject || "لا يوجد اسم للجروب"
    const desc = metadata.desc?.toString() || "لا يوجد بايو للجروب"
    const owner = metadata.owner || "غير معروف"
    const participants = metadata.participants || []
    const admins = participants.filter(u => u.admin !== null).length
    const total = participants.length

    conn.reply(m.chat, `
📌 اسم الجروب: ${subject}
📝 بايو الجروب: ${desc}
👑 صاحب الجروب: @${owner.split("@")[0]}
🧑‍🤝‍🧑 عدد الأعضاء: ${total}
⚡ عدد الأدمن: ${admins}
    `.trim(), m, { mentions: [owner] })

  } catch (err) {
    console.error(err)
    conn.reply(m.chat, '⚠️ حدث خطأ أثناء جلب معلومات الجروب.', m)
  }
}

handler.command = ['بايو']
handler.tags = ['group']
handler.group = true

export default handler