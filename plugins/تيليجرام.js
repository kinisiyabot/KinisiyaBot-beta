// • Feature : telegram downloader
// • Developers : Song × yertchi
// • Channel : https://whatsapp.com/channel/0029Vb80wch30LKFioKenc2V
import fetch from 'node-fetch';

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args.length || !args[0]) {
    return m.reply(
      `⚙️ *الاستخدام:* ${usedPrefix + command} <رابط تليجرام>\n\n` +
      `📌 *مثال:*\n${usedPrefix + command} https://t.me/mhmd_134/6931\n\n` +
      `✨ تم التطوير بواسطة 𝐊𝐈𝐍𝐈𝐒𝐈𝐘𝐀 𝐁𝐎𝐓`
    );
  }

  const telegramUrl = args[0];
  
  // التحقق من صحة رابط تليجرام
  if (!telegramUrl.includes('t.me/')) {
    return m.reply('❌ يرجى إرسال رابط تليجرام صحيح!\n📌 مثال: https://t.me/channel/123');
  }

  try {
    let loadingMsg = await conn.sendMessage(m.chat, {
      text: `⏳ *جاري تحميل الفيديو من تليجرام...*`
    }, { quoted: m });

    const apiUrl = `${global.API_BASE}/api/v1/download/telgram?url=${encodeURIComponent(telegramUrl)}`;
    
    let response;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        response = await fetch(apiUrl, { 
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (compatible; Bot)'
          }
        });
        
        if (response.ok) break;
        if (attempt < 3) await new Promise(r => setTimeout(r, 3000));
      } catch (err) {
        if (attempt < 3) await new Promise(r => setTimeout(r, 3000));
        else throw err;
      }
    }

    if (!response || !response.ok) {
      throw new Error('فشل الاتصال بخادم التحميل.');
    }

    const data = await response.json();

    if (!data.status || !data.data?.downloadUrl) {
      throw new Error('فشل في تحميل الملف من تليجرام.');
    }

    await conn.sendMessage(m.chat, { delete: loadingMsg.key }).catch(() => null);

    const { title, thumbnail, downloadUrl, quality, extension } = data.data;

    // إرسال الصورة المصغرة أولاً
    if (thumbnail) {
      await conn.sendMessage(m.chat, {
        image: { url: thumbnail },
        caption: `📥 *جاري التحميل...*\n📝 *العنوان:* ${title || 'بدون عنوان'}\n🎬 *الجودة:* ${quality || 'غير محدد'}`
      }, { quoted: m });
    }

    // إرسال الفيديو
    if (extension === 'mp4') {
      await conn.sendMessage(m.chat, {
        video: { url: downloadUrl },
        caption: `✅ *تم التحميل بنجاح*\n\n📝 *العنوان:* ${title || 'بدون عنوان'}\n🎬 *الجودة:* ${quality || 'غير محدد'}\n📦 *الصيغة:* ${extension.toUpperCase()}\n\n✨ تم التطوير بواسطة 𝐊𝐈𝐍𝐈𝐒𝐈𝐘𝐀 𝐁𝐎𝐓`,
        mimetype: 'video/mp4'
      }, { quoted: m });
    } else {
      // في حالة كان الملف ليس فيديو
      await conn.sendMessage(m.chat, {
        document: { url: downloadUrl },
        fileName: `telegram_${Date.now()}.${extension}`,
        caption: `✅ *تم التحميل بنجاح*\n\n📝 *العنوان:* ${title || 'بدون عنوان'}\n📦 *الصيغة:* ${extension.toUpperCase()}`,
        mimetype: 'application/octet-stream'
      }, { quoted: m });
    }

  } catch (e) {
    console.error('خطأ في تحميل تليجرام:', e);
    m.reply(`❌ *فشل التحميل*\n${e.message}\n\n💡 تأكد من صحة الرابط وأن المحتوى متاح للعامة.`);
  }
};

handler.help = ['تيليجرام'];
handler.tags = ['downloader'];
handler.command = ['تيليجرام', 'تليجرام', 'telegram', 'tg', 'tele'];

export default handler;