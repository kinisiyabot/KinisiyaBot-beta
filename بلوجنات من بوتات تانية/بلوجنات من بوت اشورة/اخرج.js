import { isElite, extractPureNumber } from '../lib/elite.js';

const handler = async (m, { conn, text }) => {
    const sender = extractPureNumber(m.sender); // تحويل JID إلى رقم صافي

    // التحقق إذا الرقم من النخبة
    if (!isElite(sender)) {
        return m.reply('🚫 هذا الأمر مخصص فقط لأعضاء النخبة.');
    }

  let id = text ? text : m.chat  
  try {
    let subject = (await conn.groupMetadata(id)).subject || 'هذا الجروب'
    await conn.reply(id, `┊❄️┊:•⪼ تم تنفيذ أمر المطور بالخروج من *${subject}*`) 
    await conn.groupLeave(id)
  } catch (e) {
    await conn.reply(m.chat, '❌ حصل خطأ، تأكد من ID الجروب أو أن البوت موجود فيه.', m)
  }
}

handler.command = /^(اخرج|اطلع|غادر|خروج)$/i
handler.group = true
export default handler