// handler.js أو الملف اللي فيه الأوامر
import fetch from 'node-fetch';

export const handler = async (m, { command, text, conn }) => {
  if (command === 'اسكراب') {
    if (!text) return conn.sendMessage(m.chat, '📌 ضع رابط SoundCloud أولاً!', { quoted: m });

    try {
      // إرسال POST للـ API
      const response = await fetch('https://sc.snapfirecdn.com/soundcloud', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ target: text, gsc: 'x' })
      });

      const data = await response.json();

      if (!data.metadata) {
        return conn.sendMessage(m.chat, '⚠️ لم يتم العثور على معلومات للصوت.', { quoted: m });
      }

      // تجهيز الرسالة
      const caption = `
🌹 العنوان: ${data.metadata.title}
👤 الفنان: ${data.metadata.username}
🖼️ الصورة: ${data.metadata.artwork_url}
🔗 رابط HLS: ${data.sound.hls_url || 'غير متوفر'}
🔗 رابط مباشر: ${data.sound.progressive_url || 'غير متوفر'}
      `;

      // إرسال الصورة مع البيانات
      await conn.sendMessage(m.chat, { 
        image: { url: data.metadata.artwork_url }, 
        caption 
      }, { quoted: m });

    } catch (err) {
      console.log(err);
      conn.sendMessage(m.chat, '❌ حدث خطأ أثناء جلب البيانات.', { quoted: m });
    }
  }
};

// التعريف بالـ command
handler.command = ['اسكراب'];