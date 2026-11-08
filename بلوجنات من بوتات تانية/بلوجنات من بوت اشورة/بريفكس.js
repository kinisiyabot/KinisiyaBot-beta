import { isElite, extractPureNumber } from '../lib/elite.js';

const handler = async (m, { conn }) => {
    const sender = extractPureNumber(m.sender); // تحويل JID إلى رقم صافي

    // التحقق إذا الرقم من النخبة
    if (!isElite(sender)) {
        return m.reply('🚫 هذا الأمر مخصص فقط لأعضاء النخبة.');
    }

  if (!text) throw `${emoji} لم يتم العثور على أي بريفكس، من فضلك اكتب بريفكس.\n> *مثال: ${usedPrefix + command} !*`;

  global.prefix = new RegExp(
    '^[' +
      (text || global.opts['prefix'] || '‎xzXZ/i!#$%+£¢€¥^°=¶∆×÷π√✓©®:;?&.\\-')
        .replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') +
      ']'
  );

  conn.fakeReply(
    m.chat,
    `${done} *✅️ تم تحديث البريفكس بنجاح، البادئة الحالية: ${text}*`,
    '0@s.whatsapp.net',
    '✨ PREFIJO NUEVO ✨'
  );
};

handler.help = ['prefix'].map((v) => v + ' [prefix]');
handler.tags = ['owner'];
handler.command = ['بريفكس'];
handler.rowner = true;

export default handler;