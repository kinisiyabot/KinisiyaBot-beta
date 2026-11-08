const handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin }) => {
const primaryBot = global.db.data.chats[m.chat].primaryBot
if (primaryBot && conn.user.jid !== primaryBot) throw !1
const chat = global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {}
const { antiLink, detect, welcome, modoadmin, nsfw, economy, gacha } = chat

let type = command.toLowerCase()
let isEnable = chat[type] !== undefined ? chat[type] : false

// =========================
// 📌 تفعيل وتعطيل الإعداد
// =========================

if (args[0] === 'on' || args[0] === 'enable') {
if (isEnable) 
return conn.reply(m.chat, `
*❍━━━══━━❪🫦❫━━══━━━❍*
┇🫦🔞║الخاصية *${type}* مفعّلة بالفعل.
*❍━━━══━━❪🫦❫━━══━━━❍*
`, m)
isEnable = true

} else if (args[0] === 'off' || args[0] === 'disable') {
if (!isEnable) 
return conn.reply(m.chat, `
*❍━━━══━━❪🫦❫━━══━━━❍*
┇🫦🔞║الخاصية *${type}* معطّلة بالفعل.
*❍━━━══━━❪🫦❫━━══━━━❍*
`, m)
isEnable = false

} else {
// =========================
// 📌 رسالة الشرح
// =========================
return conn.reply(m.chat, `
*❍━━━══━━❪🫦❫━━══━━━❍*
┇🍷🐍║يمكن للمشرفين تفعيل أو تعطيل *${command}* باستخدام:
┇🐍📁║• تفعيل » *${usedPrefix}${command} enable*
┇🐍📂║• تعطيل » *${usedPrefix}${command} disable*
┇🐍⚙️║الحالة الحالية » *${isEnable ? '✓ مفعّــل' : '✗ مـعـطّــل'}*
*❍━━━══━━❪🫦❫━━══━━━❍*
`, m)
}

// =========================
// 🛡️ صلاحيات الجروب
// =========================

switch (type) {
case 'welcome': case 'bienvenida': {
if (!m.isGroup && !isOwner) { global.dfail('group', m, conn); throw false }
if (m.isGroup && !isAdmin) { global.dfail('admin', m, conn); throw false }
chat.welcome = isEnable
break
}

case 'modoadmin': case 'onlyadmin': {
if (!m.isGroup && !isOwner) { global.dfail('group', m, conn); throw false }
if (m.isGroup && !isAdmin) { global.dfail('admin', m, conn); throw false }
chat.modoadmin = isEnable
break
}

case 'detect': case 'alertas': {
if (!m.isGroup && !isOwner) { global.dfail('group', m, conn); throw false }
if (m.isGroup && !isAdmin) { global.dfail('admin', m, conn); throw false }
chat.detect = isEnable
break
}

case 'antilink': case 'antienlace': {
if (!m.isGroup && !isOwner) { global.dfail('group', m, conn); throw false }
if (m.isGroup && !isAdmin) { global.dfail('admin', m, conn); throw false }
chat.antiLink = isEnable
break
}

case 'nsfw': case 'modohorny': {
if (!m.isGroup && !isOwner) { global.dfail('group', m, conn); throw false }
if (m.isGroup && !isAdmin) { global.dfail('admin', m, conn); throw false }
chat.nsfw = isEnable
break
}

case 'economy': case 'economia': {
if (!m.isGroup && !isOwner) { global.dfail('group', m, conn); throw false }
if (m.isGroup && !isAdmin) { global.dfail('admin', m, conn); throw false }
chat.economy = isEnable
break
}

case 'rpg': case 'gacha': {
if (!m.isGroup && !isOwner) { global.dfail('group', m, conn); throw false }
if (m.isGroup && !isAdmin) { global.dfail('admin', m, conn); throw false }
chat.gacha = isEnable
break
}
}

// =========================
// 🎉 رسالة النتيجة
// =========================

chat[type] = isEnable
conn.reply(m.chat, `
*❍━━━══━━❪🫦❫━━══━━━❍*
┇🐍⚙️║تم *${isEnable ? 'تفعيل' : 'تعطيل'}* الخاصية:
┇🍷📌║*${type}* داخل هذا الجروب.
*❍━━━══━━❪🫦❫━━══━━━❍*
`, m)
}

// الإعدادات
handler.help = ['welcome','bienvenida','modoadmin','onlyadmin','nsfw','modohorny','economy','economia','rpg','gacha','detect','alertas','antilink','antienlace','antilinks','antienlaces']
handler.tags = ['nable']
handler.command = ['welcome','bienvenida','modoadmin','onlyadmin','nsfw','modohorny','economy','economia','rpg','gacha','detect','alertas','antilink','antienlace']
handler.group = true

export default handler