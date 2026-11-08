let handler = async (m, { conn }) => {
  global.db.data.chats[m.chat].sWelcome = global.welcomeText
  m.reply("✅ تم استرجاع رسالة الترحيب الافتراضية.")
}

handler.command = /^ترحيب_عادي$/i
export default handler