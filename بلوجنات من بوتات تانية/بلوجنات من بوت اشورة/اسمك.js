import { isElite, extractPureNumber } from '../lib/elite.js';

const handler = async (m, { conn, text }) => {
    const sender = extractPureNumber(m.sender); // تحويل JID إلى رقم صافي

    // التحقق إذا الرقم من النخبة
    if (!isElite(sender)) {
        return m.reply('🚫 هذا الأمر مخصص فقط لأعضاء النخبة.');
    }

  if (!text) 
    return m.reply(`⚠️ من فضلك أدخل اسمًا للبوت.\n📌 مثال: #تعيين_اسم الاسم1/النص2`);

  const names = text.split('/');
  if (names.length !== 2) 
    return m.reply(`⚠️ يجب إدخال *الاسم + النص* مفصولين بعلامة "/" \n📌 مثال: اسم1/نص2`);

  global.botname = names[0].trim();
  const texto1bot = ` • بواسطة ${m.pushName || m.sender.split('@')[0]}`;
  global.textbot = `${names[1].trim()}${texto1bot}`;
  
  m.reply(`✅ تم تغيير *اسم البوت* إلى: ${global.botname}\n\n> ✨ تم تغيير *نص البوت* إلى: ${global.textbot}`);
};

handler.help = ['اسمك <اسم/نص>'];
handler.tags = ['المالك'];
handler.command = ['اسمك', 'اسم_البوت'];

export default handler;