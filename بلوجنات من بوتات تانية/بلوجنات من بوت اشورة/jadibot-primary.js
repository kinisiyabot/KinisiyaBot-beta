let handler = async (m, { conn, text }) => {
  if (!m.isGroup) throw 'هذا الأمر يعمل فقط في المجموعات.'

  if (!text) throw 'قم بوضع علامة على البوت الذي سيكون البوت الرئيسي أو مرر رقمه'

  
  let botJid = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'

  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}

  global.db.data.chats[m.chat].primaryBot = botJid

  m.reply(`البوت الرئيسي لهذه المجموعة هو الآن:\n*${botJid}*`)
}

handler.help = ['اساسي @bot']
handler.tags = ['owner']
handler.command = ['setprimary']

export default handler
