import { isElite, extractPureNumber } from '../lib/elite.js';

let handler = async (m, { conn, usedPrefix, command }) => {
    const sender = extractPureNumber(m.sender);

    // التحقق إذا الرقم من النخبة
    if (!isElite(sender)) {
        return m.reply('🚫 هذا الأمر مخصص فقط لأعضاء النخبة.');
        if (!m.isGroup) return m.reply('🚫 هذا الأمر يعمل فقط في الجروبات.');
    }

  // تحقق إن المرسل أدمن أو هو الرقم المسموح
  if (!(m.isAdmin || m.sender === allowedNumber)) {
    throw `⚠️ هذا الأمر مخصص للمشرفين فقط.`
  }

  if (!m.quoted) throw `*❮ ❗┇يجب ان تضع ريبلاي للرسالة الذي تريد حذفها❯*`
  
  try {
    let delet = m.message.extendedTextMessage.contextInfo.participant
    let bang = m.message.extendedTextMessage.contextInfo.stanzaId
    return conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: delet }})
  } catch {
    return conn.sendMessage(m.chat, { delete: m.quoted.vM.key })
  }
}

handler.help = ['حذف', 'delete']
handler.tags = ['group']
handler.command = /^(حذف|امسح|مسح|دلت|دليت)$/i
handler.group = true
handler.botAdmin = true

export default handler