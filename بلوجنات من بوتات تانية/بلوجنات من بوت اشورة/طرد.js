import { isElite, extractPureNumber } from '../lib/elite.js'

const handler = async (m, { conn }) => {
  const sender = extractPureNumber(m.sender) // رقم صافي

  // التحقق إذا المرسل من النخبة
  if (!(await isElite(sender))) {
    return m.reply('🚫 هذا الأمر مخصص فقط لأعضاء النخبة.')
  }

  if (!m.isGroup) return m.reply('🚫 هذا الأمر يعمل فقط في الجروبات.')

  // تحديد العضو المراد طرده (رد أو منشن)
  const userToRemove = m.quoted?.sender || m.mentionedJid?.[0]
  if (!userToRemove) return m.reply('⚠ لازم ترد على رسالة الشخص أو تعمله منشن.')

  // منع طرد البوت نفسه
  if (userToRemove === conn.user.jid) {
    return m.reply('⚠ لا يمكن طرد البوت.')
  }

  try {
    await conn.groupParticipantsUpdate(m.chat, [userToRemove], 'remove')
    await conn.sendMessage(m.chat, {
      text: `✅ تم طرد @${userToRemove.split('@')[0]} من الجروب.`,
      mentions: [userToRemove]
    }, { quoted: m })
  } catch (e) {
    console.error('❌ خطأ أثناء الطرد:', e)
    m.reply('⚠ حدث خطأ أثناء محاولة طرد العضو.')
  }
}

handler.command = ['برا']
handler.group = true

export default handler