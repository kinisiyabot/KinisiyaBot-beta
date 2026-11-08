import { isElite, extractPureNumber } from '../lib/elite.js';

const handler = async (m, { conn }) => {
    const sender = extractPureNumber(m.sender); // تحويل JID إلى رقم صافي

    // التحقق إذا الرقم من النخبة
    if (!isElite(sender)) {
        return m.reply('🚫 هذا الأمر مخصص فقط لأعضاء النخبة.');
    }

  if (!m.isGroup) return conn.reply(m.chat, "❌ هذا الأمر يشتغل في الجروبات فقط.", m);

  await conn.groupSettingUpdate(m.chat, "announcement"); // يقفل الجروب
  await conn.sendMessage(m.chat, { react: { text: "🔒", key: m.key }});
  await conn.reply(m.chat, "🔒 تم قفل الجروب (المشرفين فقط).", m);
};

handler.command = ["قفل"];
handler.help = ["قفل"];
handler.tags = ["group"];

export default handler;