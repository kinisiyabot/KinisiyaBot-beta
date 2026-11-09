import * as pkg from '@whiskeysockets/baileys'
import fs from 'fs'
import fetch from 'node-fetch'
import axios from 'axios'
import moment from 'moment-timezone'
const { generateWAMessageFromContent, prepareWAMessageMedia, proto } = pkg
const icono = 'https://files.catbox.moe/i9ktby.jpg' // رابط صورة صالح
var handler = m => m
handler.all = async function (m) { 
global.canalIdM = ["120363406309079902@newsletter", "120363406309079902@newsletter"]
global.canalNombreM = [
"ᥫ𝐊𝐈𝐍𝐈𝐒𝐈𝐘𝐀 𝐁𝐎𝐓 - 𝑶𝒇𝒇𝒊𝒄𝒊𝒂𝒍 𝑪𝒉𝒂𝒏𝒏𝒆𝒍 ᯓᡣ𐭩",
"ᥫ𝐊𝐈𝐍𝐈𝐒𝐈𝐘𝐀 𝐁𝐎𝐓 - 𝑶𝒇𝒇𝒊𝒄𝒊𝒂𝒍 𝑪𝒉𝒂𝒏𝒏𝒆𝒍 ᯓᡣ𐭩"
]
global.channelRD = await getRandomChannel()

global.d = new Date(new Date + 3600000)
global.locale = 'ar'
global.dia = d.toLocaleDateString(locale, {weekday: 'long'})
global.fecha = d.toLocaleDateString('es', {day: 'numeric', month: 'numeric', year: 'numeric'})
// بالعربي
global.mes_ar = d.toLocaleDateString('ar', { month: 'long' }); // اسم الشهر
global.año_ar = d.toLocaleDateString('ar', { year: 'numeric' }); // السنة
global.tiempo_ar = d.toLocaleString('ar', { 
    hour: 'numeric', 
    minute: 'numeric', 
    second: 'numeric', 
    hour12: true 
}); // الوقت

// بالإنجليزي
global.mes_en = d.toLocaleDateString('en', { month: 'long' });
global.año_en = d.toLocaleDateString('en', { year: 'numeric' });
global.tiempo_en = d.toLocaleString('en', { 
    hour: 'numeric', 
    minute: 'numeric', 
    second: 'numeric', 
    hour12: true 
});

var canal = 'https://whatsapp.com/channel/0029Vb80wch30LKFioKenc2V'  
var comunidad = 'https://whatsapp.com/channel/0029Vb80wch30LKFioKenc2V'
var correo = 'fahd.mohmd.1333.9@gmail.com'
global.redes = [canal, comunidad, correo].getRandom()

global.nombre = m.pushName || '𝑲𝑰𝑵𝑰𝑺𝑰𝒀𝑨 𝐁ׅ𝗼𝐭'
global.packsticker = `°.⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸.°\nᰔᩚ المستخدم: ${nombre}\n❀ البوت: ${botname}\n✦ التاريخ: ${fecha}\nⴵ الوقت: ${moment.tz('America/Caracas').format('HH:mm:ss')}`
global.packsticker2 = `\n°.⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸⎯ܴ⎯̶᳞͇ࠝ⎯⃘̶⎯̸.°\n\n${dev}`
  
global.fkontak = { key: { participants:"0@s.whatsapp.net", "remoteJid": "status@broadcast", "fromMe": false, "id": "Halo" }, "message": { "contactMessage": { "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` }}, "participant": "0@s.whatsapp.net" }
global.rcanal = { contextInfo: { isForwarded: true, forwardedNewsletterMessageInfo: { newsletterJid: channelRD.id, serverMessageId: '', newsletterName: channelRD.name }, externalAdReply: { title: botname, body: dev, mediaUrl: canal, description: null, previewType: "PHOTO", thumbnail: await (await fetch(icono)).buffer(), sourceUrl: redes, mediaType: 2, renderLargerThumbnail: false }, mentionedJid: null }}
}

export default handler

function pickRandom(list) {
return list[Math.floor(Math.random() * list.length)]
}

async function getRandomChannel() {
let randomIndex = Math.floor(Math.random() * canalIdM.length)
let id = canalIdM[randomIndex]
let name = canalNombreM[randomIndex]
return { id, name }
}