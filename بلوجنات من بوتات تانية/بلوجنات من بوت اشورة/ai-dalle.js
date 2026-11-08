import fetch from 'node-fetch';

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const prompt = args.join(' ');
  if (!prompt) return m.reply(
`✿ *مولد الصور بالذكاء الاصطناعي*

📌 *طريقة الاستخدام:*
${usedPrefix + command} <وصف الصورة>

🎯 *مثال:*
${usedPrefix + command} قطة كيوت في خلفية وردية

⏳ *ملاحظة:* قد تستغرق الصورة عدة ثوانٍ للتوليد، يرجى الانتظار.`);

  try {
    // إرسال رد فعل الساعة ⏱
    await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } });

    // الاتصال بـ API لتوليد الصورة
    const api = `https://myapiadonix.vercel.app/api/IAimagen?prompt=${encodeURIComponent(prompt)}`;
    const res = await fetch(api);
    if (!res.ok) throw new Error(`خطأ في الاتصال: HTTP ${res.status}`);

    // استلام الصورة بصيغة buffer
    const buffer = await res.buffer();

    // إرسال الصورة للمستخدم
    await conn.sendMessage(m.chat, {
      image: buffer,
      caption: `
✿ *تم إنشاء الصورة بنجاح!*

🖼️ *الوصف:* ${prompt}
🎨 استمتع بإبداع الذكاء الاصطناعي.
`.trim()
    }, { quoted: m });

    // تغيير الرد الفعلي إلى ✅
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

  } catch (e) {
    console.error('خطأ أثناء إنشاء الصورة:', e);
    await conn.sendMessage(m.chat, { react: { text: '✖️', key: m.key } });
    m.reply('❌ *حدث خطأ:* لم يتم إنشاء الصورة، حاول مرة أخرى لاحقًا.');
  }
};

handler.command = ['توليد']; // أوامر إنجليزي + عربي
handler.help = ['توليد'];
handler.tags = ['توليد'];

export default handler;