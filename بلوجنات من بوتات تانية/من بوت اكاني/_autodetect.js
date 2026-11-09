let WAMessageStubType = await import('@whiskeysockets/baileys')

export async function before(m, { conn, participants, groupMetadata }) {
if (!m.messageStubType || !m.isGroup) return
const fkontak = { "key": { "participants":"0@s.whatsapp.net", "remoteJid": "status@broadcast", "fromMe": false, "id": "Halo" }, "message": { "contactMessage": { "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` }}, "participant": "0@s.whatsapp.net"}  
let chat = global.db.data.chats[m.chat]
let usuario = `@${m.sender.split`@`[0]}`
let pp = await conn.profilePictureUrl(m.chat, 'image').catch(_ => null) || 'https://qu.ax/QGAVS.jpg'  

let nombre, foto, edit, newlink, status, admingp, noadmingp
nombre = `*❍━━━══━━❪🌸❫━━══━━━❍*\n*❍⇇تـم تـغـيـر اسـم الـمـجـمـوعـه*\n*❍⇇بـواسـطـت↜❪${usuario}❫*\n*❍⇇الاسـم الـجـديـد↶*\n❍⇇┊${m.messageStubParameters[0]}┊\n*❍━━━══━━❪🌸❫━━══━━━❍*`
foto = `*❍━━━══━━❪🌸❫━━══━━━❍*\n*❍⇇تـم تـغـيـر صوره الـمـجـمـوعـه*\n*❍⇇بـواسـطـت↜❪${usuario}❫*\n*❍━━━══━━❪🌸❫━━══━━━❍*`
edit = `*❍━━━══━━❪🌸❫━━══━━━❍*\n*❍⇇تـم تـغـيـر اعدادات الـمـجـمـوعـه*\n*❍⇇بـواسـطـت↜❪${usuario}❫*
❍⇇+{m.messageStubParameters[0] == 'on' ? '*لادمن-فقط*' : 'الجميع'} *من يمكنهم ثحدث*\n*❍━━━══━━❪🌸❫━━══━━━❍*`
newlink = `*❍━━━══━━❪🌸❫━━══━━━❍*\n*❍⇇تـم تـغـيـر رابط الـمـجـمـوعـه*\n*❍⇇بـواسـطـت↜❪${usuario}❫*\n*❍━━━══━━❪🌸❫━━══━━━❍*`
status = `*❍━━━══━━❪🌸❫━━══━━━❍*\n*❍⇇تـم تـغـيـر اعدادات الـمـجـمـوعـه*\n*❍⇇بـواسـطـت↜❪${usuario}❫*
❍⇇${m.messageStubParameters[0] == 'on' ? '*لادمن-فقط*' : 'الجميع'} *من يمكنهم ثحدث*\n*❍━━━══━━❪🌸❫━━══━━━❍*`
admingp = `*❍━━━══━━❪🌸❫━━══━━━❍*\n*❍⇇تم ترقيه↜❪@${m.messageStubParameters[0].split`@`[0]}❫*\n*❍⇇بواسطت↜❪${usuario}❫*\n*❍↜مبارك لك الترقيه🐤👏*\n*❍━━━══━━❪🌸❫━━══━━━❍*`
noadmingp =  `*❍━━━══━━❪🌸❫━━══━━━❍*\n*❍⇇تم اعفاء↜❪@${m.messageStubParameters[0].split`@`[0]}❫*\n*❍⇇بواسطت↜❪${usuario}❫*\n*❍↜للاسف تم اعفائك من رتبتك😔💔*\n*❍━━━══━━❪🌸❫━━══━━━❍*`

if (chat.detect && m.messageStubType == 21) {
await conn.sendMessage(m.chat, { text: nombre, mentions: [m.sender] }, { quoted: fkontak })   

} else if (chat.detect && m.messageStubType == 22) {
await conn.sendMessage(m.chat, { image: { url: pp }, caption: foto, mentions: [m.sender] }, { quoted: fkontak })

} else if (chat.detect && m.messageStubType == 23) {
await conn.sendMessage(m.chat, { text: newlink, mentions: [m.sender] }, { quoted: fkontak })    

} else if (chat.detect && m.messageStubType == 25) {
await conn.sendMessage(m.chat, { text: edit, mentions: [m.sender] }, { quoted: fkontak })  

} else if (chat.detect && m.messageStubType == 26) {
await conn.sendMessage(m.chat, { text: status, mentions: [m.sender] }, { quoted: fkontak })  

} else if (chat.detect && m.messageStubType == 29) {
await conn.sendMessage(m.chat, { text: admingp, mentions: [`${m.sender}`,`${m.messageStubParameters[0]}`] }, { quoted: fkontak })  

return;
} if (chat.detect && m.messageStubType == 30) {
await conn.sendMessage(m.chat, { text: noadmingp, mentions: [`${m.sender}`,`${m.messageStubParameters[0]}`] }, { quoted: fkontak })  

} else {
console.log({ messageStubType: m.messageStubType,
messageStubParameters: m.messageStubParameters,
type: WAMessageStubType[m.messageStubType]})
}}