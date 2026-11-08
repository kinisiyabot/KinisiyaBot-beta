import fetch from 'node-fetch';

const handler = async (m, { conn, text }) => {
  if (!text) throw `*🚀 أدخل وصفًا للصورة التي تريد تخيلها.*`;

  m.react('🎨');
  await conn.sendMessage(m.chat, { text: '*🎨 يتم معالجة طلبك... لا تطلب الأمر مرة أخرى حتى يكتمل التنفيذ!*' });

  try {
    const response = await fetch(`https://image-generator-xvi.vercel.app/api/generate-image?text=${encodeURIComponent(text)}`);
    
    if (!response.ok) throw new Error('⚠️ حدث خطأ أثناء جلب الصورة.');

    const buffer = await response.buffer();
    m.react('✅');
    await conn.sendMessage(m.chat, { image: buffer, caption: `✨ **تم إنشاء الصورة بنجاح!**` });
  } catch (error) {
    console.error(error);
    throw `*❌ حدث خطأ أثناء تنفيذ الطلب، حاول مرة أخرى لاحقًا.*`;
  }
};

handler.tags = ['حية1'];
handler.help = ['تخيل'];
handler.command = ['تخيل'];

export default handler;