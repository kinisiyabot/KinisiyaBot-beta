import fetch from 'node-fetch';

const handler = async (message, { conn, command, text, isAdmin }) => {
  if (!isAdmin) {
    throw "👑 *فقط المسؤولين يمكنهم تنفيذ هذا الأمر*";
  }

  let targetJid = message.mentionedJid && message.mentionedJid[0] 
    ? message.mentionedJid[0] 
    : message.quoted 
      ? message.quoted.sender 
      : text;

  if (!targetJid) {
    return conn.reply(message.chat, "❗ *اذكر الشخص الذي ترغب في فك كتمه* ❗", message);
  }

  const botOwner = global.owner[0][0] + "@s.whatsapp.net";
  const groupMetadata = await conn.groupMetadata(message.chat);
  const groupOwner = groupMetadata.owner || message.chat.split('-')[0] + "@s.whatsapp.net";

  if (targetJid === botOwner) {
    throw "😼 *لا يمكن فك كتم صاحب البوت*";
  }
  
  if (targetJid === conn.user.jid) {
    throw "❌️ *لا يمكنك فك كتم البوت*";
  }

  if (targetJid === groupOwner) {
    throw "❌️ *لا يمكنك فك كتم صاحب المجموعة*";
  }

  // التأكد من أن بيانات المستخدم موجودة في قاعدة البيانات
  if (!global.db.data.users[targetJid]) {
    global.db.data.users[targetJid] = { muto: false, warnings: 0 };
  }

  let userData = global.db.data.users[targetJid];

  if (command === "فك-كتم") {
    if (!userData.muto) {
      throw "😼 *هذا المستخدم ليس مكتومًا*";
    }

    // فك الكتم وحذف التحذيرات
    userData.muto = false;
    userData.warnings = 0;  // حذف التحذيرات
    conn.reply(message.chat, `✅ *تم فك كتم هذا الشخص وحذف تحذيراته بنجاح*`, message, { mentions: [targetJid] });

  } else if (command === "كتم") {
    if (userData.muto) {
      throw "😼 *هذا المستخدم تم كتمه بالفعل*";
    }

    userData.muto = true;
    conn.reply(message.chat, `✅ *تم كتم هذا الشخص بنجاح*`, message, { mentions: [targetJid] });
  }
};

handler.command = /^(كتم|فك-كتم)$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;