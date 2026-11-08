import { createHash } from 'crypto'

let Reg = /\|?(.*)([.|] *?)([0-9]*)$/i

let handler = async function (m, { conn, text, usedPrefix, command }) {
  if (!global.db || !global.db.data || !global.db.data.users) {
    throw 'قاعدة البيانات غير موجودة.'
  }

  let fkontak = { "key": { "participants":"0@s.whatsapp.net", "remoteJid": "status@broadcast", "fromMe": false, "id": "Halo" }, "message": { "contactMessage": { "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` }}, "participant": "0@s.whatsapp.net" }

  let user = db.data.users[m.sender]
  let name2 = conn.getName(m.sender)

  if (user.registered) throw `🙌مرحباً ، أنت مسجل بالفعل\n\n✳️تريد العودة إلى التسجيل?\nاستخدم الأمر لإزالة التسجيل \n*${usedPrefix}unreg الرقم السري*\nإذا كنت لا تتذكر الرقم التسلسلي الخاص بك ، فاستخدم\n${usedPrefix}رمزي`

  if (!Reg.test(text)) throw `✳️ استخدم الامر: *${usedPrefix + command} الاسم.العمر*\n📌مثال : *${usedPrefix + command}* ${name2}.16`

  let [_, name, splitter, age] = text.match(Reg)
  
  if (!name) throw '✳️ لا يمكن ان يكون الاسم فارغاً'
  if (!age) throw '✳️ لا يمكن ان يكون العمر فارغاً'
  if (name.length >= 30) throw '✳️ الاسم طويل جداً، صغره.'
  
  age = parseInt(age)
  if (isNaN(age)) throw '✳️ العمر يجب أن يكون رقماً.'
  if (age > 100) throw '👴🏻 جد هععععع'
  if (age < 5) throw '🚼 بيبي تشان هعععععع ✍️😳 '

  user.name = name.trim()
  user.age = age
  user.regTime = +new Date()
  user.registered = true

  global.db.data.users[m.sender].money += 400
  global.db.data.users[m.sender].limit += 4
  global.db.data.users[m.sender].exp += 150
  global.db.data.users[m.sender].joincount += 2

  let sn = createHash('md5').update(m.sender).digest('hex')

  await conn.reply(m.chat, `┌───⊷ *أكملت تسجيل*\n┆ *الاسم:*\n┆ ${name}\n┆┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n┆ *العمر:*\n┆ ${age} سنة\n┆┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n┆ *المحفظه* \n┆ *$4 الماس* 💎\n┆ *$400 تربو كوينز*\n┆ *$150 نقاط خبرة*\n┆ *$2 عملات*\n╰──────────────────`, fkontak, m)
  
  await m.reply(`${sn}`)
}

handler.help = ['daftar', 'register'].map(v => v + ' <nama>.<umur>')
handler.tags = ['xp']

handler.command = /^(التفعيل|تحقق|التحقق|reg(ister)?)$/i

export default handler