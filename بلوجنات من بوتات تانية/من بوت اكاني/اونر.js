const handler = async (m, { conn, text, args, usedPrefix, command }) => {
  const why = `*استخدم الأمر كما يلي:*\n\n*◉ ${usedPrefix + command} @${m.sender.split('@')[0]}*\n*◉ ${usedPrefix + command} ${m.sender.split('@')[0]}*\n*◉ ${usedPrefix + command} @رقم_الشخص*`;
  
  const who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : false;
  
  if (!who) return conn.reply(m.chat, why, m, {mentions: [m.sender]});
  
  switch (command) {
    case 'اونر':
      const nuevoNumero = who;
      global.owner.push([nuevoNumero]);
      await conn.reply(m.chat, '*تم إضافة المالك بنجاح!*', m);
      break;
    case 'اناونر':
      const numeroAEliminar = who;
      const index = global.owner.findIndex(owner => owner[0] === numeroAEliminar);
      if (index !== -1) {
        global.owner.splice(index, 1);
        await conn.reply(m.chat, '*تم إزالة المالك بنجاح!*', m);
      } else {
        await conn.reply(m.chat, '*لم يتم العثور على هذا الرقم في قائمة المالكين!*', m);
      }
      break;
  }
};

handler.command = /^(اونر|اناونر)$/i;
handler.rowner = true;
export default handler;