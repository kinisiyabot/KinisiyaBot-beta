import{ prepareWAMessageMedia } from '@whiskeysockets/baileys';
import * as pkg from '@whiskeysockets/baileys';
import axios from 'axios';
const { generateWAMessageFromContent, proto } = pkg
const handler = async (m, { conn, usedPrefix, command }) => {
    // جلب بيانات كريستيانو رونالدو من الملف JSON
    const cristiano = (await axios.get('https://raw.githubusercontent.com/BrunoSobrino/TheMystic-Bot-MD/master/src/JSON/CristianoRonaldo.json')).data;
    const ronaldo = cristiano[Math.floor(cristiano.length * Math.random())];

    // إرسال رد فعل الرموز التعبيرية
    await conn.sendMessage(m.chat, { react: { text: '🤾‍♀️', key: m.key } });

    // إعداد رسالة الوسائط
    const mediaMessage = await prepareWAMessageMedia({ image: { url: ronaldo } }, { upload: conn.waUploadToServer });

    let msg = generateWAMessageFromContent(m.chat, {
  viewOnceMessage: {
    message: {
        interactiveMessage: proto.Message.InteractiveMessage.create({
          body: proto.Message.InteractiveMessage.Body.create({
            text: ""
          }),
          footer: proto.Message.InteractiveMessage.Footer.create({
            text: ""
          }),
          header: proto.Message.InteractiveMessage.Header.create({
            title: "*ســووووووووو*",
            subtitle: `${global.gt}`,
            hasMediaAttachment: true, 
            imageMessage: mediaMessage.imageMessage,  
          }),
          nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
            buttons: [
                {
                "name": "quick_reply",
                "buttonParamsJson": "{\"display_text\":\"الـمـ🤾‍♀️ــزيـد\",\"id\":\".رونالدو\"}"
             }, 
                {
                "name": "quick_reply",
                "buttonParamsJson": "{\"display_text\":\"قــ🪧ــنـاة الـبـوت\",\"id\":\".مطور\"}"
              }
           ],
          }) 
        }) 
       } 
     } 
   },{}) 
    // إرسال الرسالة
    await conn.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id })
    } 
handler.help = ['رونالدو'];
handler.tags = ['صور'];
handler.command = /^(رونالدو|كريستيانو)$/i;

export default handler;