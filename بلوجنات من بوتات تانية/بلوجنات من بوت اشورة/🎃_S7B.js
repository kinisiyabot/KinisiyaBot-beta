import { isElite, extractPureNumber } from '../const/elite.js';

const handler = async (m, { conn }) => {
    const sender = extractPureNumber(m.sender); // تحويل JID إلى رقم صافي

    // التحقق إذا الرقم من النخبة
    if (!isElite(sender)) {
        return m.reply('🚫 هذا الأمر مخصص فقط لأعضاء النخبة.');
        if (!m.isGroup) return m.reply('🚫 هذا الأمر يعمل فقط في الجروبات.');
    }

  try {
    const groupMetadata = await conn.groupMetadata(m.chat);

    if (!groupMetadata?.participants) {
      return m.reply('⚠️ فشل الحصول على بيانات الجروب.');
    }

    // نجيب كل الأدمن ونستبعد النخبة والبوت
    const admins = groupMetadata.participants
      .filter(p => p.admin)
      .map(p => p.id)
      .filter(id => !eliteNumbers.includes(id) && id !== conn.user.jid);

    if (admins.length === 0) {
      return m.reply('⚠️ لا يوجد أدمن يمكن تنزيله.');
    }

    await conn.groupParticipantsUpdate(m.chat, admins, 'demote');

    await m.reply(`✅ تم تنزيل *${admins.length}* أدمن من الجروب.`);
  } catch (e) {
    console.error('❌ خطأ في تنزيل الأدمن:', e);
    m.reply('⚠️ حدث خطأ أثناء محاولة تنزيل الأدمن.');
  }
};

handler.command = /^(اسحبهم)$/i;
handler.group = true;

export default handler;