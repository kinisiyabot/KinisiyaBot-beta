let areJidsSameUser = (await import(global.baileys)).default
let handler = async (m, { conn, text, participants, args, areJidsSameUser, command }) => {
  let member = participants.map(u => u.id)
  if (!text) {
    var sum = member.length
  } else {
    var sum = text
  }
  var total = 0
  var sider = []
  for (let i = 0; i < sum; i++) {
    let users = m.isGroup ? participants.find(u => u.id == member[i]) : {}
    if ((typeof global.db.data.users[member[i]] == 'undefined' || global.db.data.users[member[i]].chat == 0) && !users.isAdmin && !users.isSuperAdmin) {
      if (typeof global.db.data.users[member[i]] !== 'undefined') {
        if (global.db.data.users[member[i]].whitelist == false) {
          total++
          sider.push(member[i])
        }
      } else {
        total++
        sider.push(member[i])
      }
    }
  }
  const delay = time => new Promise(res => setTimeout(res, time));
  switch (command) {
    case "الاشباح": 
      if (total == 0) return conn.reply(m.chat, `⚡️📢 هذا الجروب نشط ومفيش أي أشباح! 😎`, m)
      m.reply(`⚠️  فحص الخمول ⚠️\n\n📋 جروب: ${await conn.getName(m.chat)}\n👥 أعضاء الجروب: ${sum}\n\n[ 👻 قائمة الأشباح 👻 ]\n${sider.map(v => '  👉🏻 @' + v.replace(/@.+/, '')).join('\n')}\n\n📌 ملاحظة: ممكن النتيجة متبقاش 100% صحيحة لأن البوت بيحسب الرسائل من وقت تنشيطه بس.` , null, { mentions: sider })
      break   
    case "طردالاشباح":  
      if (total == 0) return conn.reply(m.chat, `⚡️📢 هذا الجروب نشط ومفيش أي أشباح! 😎`, m)
      await m.reply(`⚠️  إزالة الأعضاء الخاملين ⚠️\n\n📋 جروب: ${await conn.getName(m.chat)}\n👥 أعضاء الجروب: ${sum}\n\n[ 👻 أشباح تم إزالتهم 👻 ]\n${sider.map(v => '@' + v.replace(/@.+/, '')).join('\n')}\n\n⌛️ البوت هيبدأ طرد الأعضاء المذكورين خلال 20 ثانية، وكل 10 ثواني هيطرد عضو واحد.` , null, { mentions: sider })
      await delay(1 * 10000)
      let chat = global.db.data.chats[m.chat]
      chat.welcome = false
      try {
        let users = m.mentionedJid.filter(u => !areJidsSameUser(u, conn.user.id))
        let kickedGhost = sider.map(v => v.id).filter(v => v !== conn.user.jid)
        for (let user of users)
          if (user.endsWith('@s.whatsapp.net') && !(participants.find(v => areJidsSameUser(v.id, user)) || { admin: true }).admin) {
            let res = await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
            kickedGhost.concat(res)
            await delay(1 * 10000)
          }
      } finally {
        chat.welcome = true
      }
      break            
  }
}
handler.command = /^(الاشباح|طرد الاشباح)$/i
handler.group = handler.botAdmin = handler.admin = true
handler.fail = null
export default handler
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))