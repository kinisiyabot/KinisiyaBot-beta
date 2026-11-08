import ws from 'ws'

const handler = async (m, { conn }) => {
  const subBots = [
    ...new Set(
      [
        ...globalThis.conns.filter(
          (conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED
        ).map((conn) => conn.user.jid),
      ]
    ),
  ]

  if (!subBots.includes(globalThis.conn.user.jid)) {
    subBots.push(globalThis.conn.user.jid)
  }

  let texto = await m.mentionedJid
  let who = texto.length > 0 ? texto[0] : (m.quoted ? await m.quoted.sender : false)
  const chat = globalThis.db.data.chats[m.chat]

  if (!who) return conn.reply(m.chat, `⚠️ من فضلك قم بعمل منشن للبوت الذي تريد تعيينه كبوت أساسي.`, m)

  if (!subBots.includes(who)) return conn.reply(m.chat, `❌ المستخدم المذكور ليس من ضمن بوتات السوكيت.`, m)

  if (chat.primaryBot === who) {
    return conn.reply(
      m.chat,
      `✅ البوت @${who.split`@`[0]} هو بالفعل البوت الأساسي في هذه المجموعة.`,
      m,
      { mentions: [who] }
    )
  }

  try {
    chat.primaryBot = who
    conn.reply(
      m.chat,
      `🤖 تم تعيين @${who.split`@`[0]} كبوت أساسي في هذه المجموعة.\n> 📌 الآن سيتم تنفيذ جميع الأوامر بواسطة هذا البوت.`,
      m,
      { mentions: [who] }
    )
  } catch (e) {
    await m.reply(`❌ خطأ: ${e}`);
  }
}

handler.help = ['تعيين_الاساسي']
handler.tags = ['المجموعة']
handler.command = ['تعيين_الاساسي', 'بوت_اساسي']
handler.admin = true

export default handler