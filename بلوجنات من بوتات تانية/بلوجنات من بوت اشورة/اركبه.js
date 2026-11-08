import fs from 'fs';
import path from 'path';

import { isElite, extractPureNumber } from '../lib/elite.js';

const handler = async (m, { conn, text }) => {
    const sender = extractPureNumber(m.sender); // تحويل JID إلى رقم صافي

    // التحقق إذا الرقم من النخبة
    if (!isElite(sender)) {
        return m.reply('🚫 هذا الأمر مخصص فقط لأعضاء النخبة.');
    }

  let mentionedUser;
  if (m.quoted) {
    mentionedUser = m.quoted.sender;
  } else if (text && text.includes('@')) {
    mentionedUser = text.match(/@\d+/g)[0].replace('@', '') + '@s.whatsapp.net';
  } else {
    throw '*❌ قم بالرد على الشخص أو قم بمنشن الشخص الذي تريد التفاعل معه*';
  }

  try {
    let chat = m.chat;

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const messages = [
      `*@${mentionedUser.split('@')[0]} عامل اي*`,
      `*@${mentionedUser.split('@')[0]} امك عاملة اي*`,
      `*@${mentionedUser.split('@')[0]} سلملي علي امك وقولها متنسيش بكرا ها*`,
      `*@${mentionedUser.split('@')[0]} انا زهقت منك انطر يكسمك*`
    ];

    for (let msg of messages) {
      await delay(3000);
      await conn.sendMessage(chat, { text: msg, mentions: [mentionedUser] }, { quoted: m });
    }

    await conn.groupParticipantsUpdate(chat, [mentionedUser], 'remove');

  } catch (e) {
    console.error('حدث خطأ:', e);
    throw '*❌ حدث خطأ أثناء التفاعل مع الشخص. يرجى المحاولة مرة أخرى.*';
  }
};

handler.help = ['راقب <@user>'];
handler.tags = ['fun'];
handler.command = /^اركبو$/i;

export default handler;