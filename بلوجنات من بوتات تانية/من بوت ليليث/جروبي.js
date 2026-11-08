let handler = async (m, { conn, participants, groupMetadata }) => {
const pp = await conn.profilePictureUrl(m.chat, 'image').catch(_ => null) || './avatar_contact.png'
const { antiToxic, antiTraba, antiviewonce, isBanned, welcome, detect, sWelcome, sBye, sPromote, sDemote, antiLink, antiLink2, temporal, reaction, antiTelegram, antiFacebook, antiTiktok, antiYoutube, modohorny, antiTwitter, antiInstagram, stickers, autolevelup, autosticker, antitoxic, antibadword, antifake, modoadmin, audios, delete: del } = global.db.data.chats[m.chat]
const groupAdmins = participants.filter(p => p.admin)
const listAdmin = groupAdmins.map((v, i) => `✨ ${i + 1}. @${v.id.split('@')[0]}`).join('\n')
const owner = groupMetadata.owner || groupAdmins.find(p => p.admin === 'superadmin')?.id || m.chat.split`-`[0] + '@s.whatsapp.net'

let text = `
*╔⏤⏤🌹🍓🌹⏤⏤╗*
『✨💖 معلومات القروب 💖✨』
*╚⏤⏤🌹🍓🌹⏤⏤╝*

🩷 *آيـدي الـقـروب:* ${groupMetadata.id}  
💜 *إســم الـقـروب:* ${groupMetadata.subject}  
💙 *عــدد الأعـضـاء:* ${participants.length}  
💖 *مـالـك الـقـروب:* @${owner.split('@')[0]}  

*✿ ──⊰ 🌹 ⊱── ✿*  
🎀 *الــمــشــرفــيــن:*  
${listAdmin}  

*✿ ──⊰ 🌹 ⊱── ✿*  
💎 *إعـدادات الـقـروب:*  
💌 *الترحيب:* ${welcome ? '✅' : '❌'}  
🕵🏻‍♀ *مُكتَشَف:* ${detect ? '✅' : '❌'}  
🎀 *المستوى التلقائي:* ${global.db.data.users[m.sender].autolevelup ? '✅' : '❌'}  
🚫 *التحكم بالطرد والإضافة:* ${global.db.data.settings[conn.user.jid].restrict ? '✅' : '❌'}  
💢 *مـضاد الشتائم:* ${antibadword ? '✅' : '❌'}  
🖇️ *مـضاد الروابط:* ${antiLink ? '✅' : '❌'}  
✨ *الملصقات التلقائية:* ${autosticker ? '✅' : '❌'}  

*✿ ──⊰ 🌹 ⊱── ✿*  
📩 *إعدادات الرسائل:*  
💌 *رسالة الترحيب:* ${sWelcome}  
👋 *رسالة الوداع:* ${sBye}  
🌹 *رسالة الترقية:* ${sPromote}  
🍂 *رسالة التخفيض:* ${sDemote}  

*✿ ──⊰ 🌹 ⊱── ✿*  
📜 *وصــف الـقـروب:*  
 ${groupMetadata.desc?.toString() || '🤍 غير متوفر 🤍'}  
*✿ ──⊰ 🌹 ⊱── ✿*  
`.trim()

conn.sendFile(m.chat, pp, 'group.jpg', text, m, false, { mentions: [...groupAdmins.map(v => v.id), owner] })
}

handler.help = ['infogp']
handler.tags = ['group']
handler.command = ['قروبي','infogroup', 'groupinfo', 'infogp','جروبي'] 
handler.group = true
handler.admin = true

export default handler