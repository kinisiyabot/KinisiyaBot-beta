const handler = async (m, { conn, command }) => {
    const sender = extractPureNumber(m.sender);

    // التحقق إذا الرقم من النخبة
    if (!isElite(sender)) {
        return m.reply('🚫 هذا الأمر مخصص فقط لأعضاء النخبة.');
    }

  switch (command) {
    case 'بانشات':
      global.db.data.chats[m.chat].isBanned = true;
      m.reply('*`❲🔒❳` تم كتم المحادثه*\n\n*`⛊ هذه المحادثة ليس لها الأذن لاستعمالي الآن`*');
      break;

    case 'بانشاتفك':
      global.db.data.chats[m.chat].isBanned = false;
      m.reply('*`❲🔓❳` تم الغاء كتم المحادثه*\n\n*`⛊ هذه المحادثة لها الأذن لاستعمالي الآن`*');
      break;
  }
};

handler.help = ['بانشات'];
handler.tags = ['owner'];
handler.command = ['بانشات', 'بانشاتفك'];

export default handler;