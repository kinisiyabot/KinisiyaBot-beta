let handler = async (m, { conn, participants }) => {
  // قائمة النخبة (ضع الأرقام بدون @)
  let elite = [
    '212705655633', // مثال: رقمك
  ]

  let sender = m.sender.split('@')[0]

  if (!elite.includes(sender)) {
    throw 'هذا الأمر حصري فقط لأعضاء النخبة.'
  }

  // تحديد من سيتم طردهم (استثناء النخبة والبوت نفسه)
  let usersToKick = participants
    .map(u => u.id)
    .filter(id => {
      let num = id.split('@')[0]
      return !elite.includes(num) && id !== conn.user.jid
    })

  if (usersToKick.length === 0) throw 'ما في أحد لطرده، كلهم نخبة؟'

  m.reply(`جاري طرد ${usersToKick.length} عضو من المجموعة...`)

  for (let user of usersToKick) {
    try {
      await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
      await new Promise(res => setTimeout(res, 1000))
    } catch (e) {
      console.log(`فشل في طرد ${user}:`, e)
    }
  }

  m.reply('تم طرد كل الأعضاء ما عدا النخبة.')
}

handler.help = ['liliht']
handler.tags = ['owner']
handler.command = /^(liliht)$/i
handler.group = true
// ما نستخدم admin هنا لأننا نعتمد على تحقق النخبة فقط

export default handler