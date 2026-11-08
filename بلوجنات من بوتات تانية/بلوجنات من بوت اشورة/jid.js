import { isElite, extractPureNumber } from '../lib/elite.js';

const handler = async (m, { conn, text }) => {
    const sender = extractPureNumber(m.sender); // تحويل JID إلى رقم صافي

    // التحقق إذا الرقم من النخبة
    if (!isElite(sender)) {
        return m.reply('🚫 هذا الأمر مخصص فقط لأعضاء النخبة.');
    }

  // معرف الشات (القروب، القناة، أو الخاص)
  let chatJid = m.chat;

  // رسالة ترسل معرف الشات
  let message = `
┏━━━━━━━[ معرف الشات ]━━━━━━━┓

${chatJid}

┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
  `.trim();

  await conn.reply(m.chat, message, m);
}

handler.help = ['jid']
handler.tags = ['group']
handler.command = /^jid$/i
handler.group = false

export default handler