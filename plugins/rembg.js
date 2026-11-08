// • Developers : SONG × yertchi
// • Channel : https://whatsapp.com/channel/0029Vb80wch30LKFioKenc2V
// • youtub channel : https://www.youtube.com/@yekay6 
// teiligram channel : https://t.me/yertchi_kunusua
import { fileTypeFromBuffer } from 'file-type';
import FormData from 'form-data';
import fetch from 'node-fetch';

async function uploadToUguu(buffer) {
  const { ext = 'jpg', mime = 'image/jpeg' } = (await fileTypeFromBuffer(buffer)) || {};
  const form = new FormData();
  form.append('files[]', buffer, { filename: `image.${ext}`, contentType: mime });

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch('https://uguu.se/upload.php', { method: 'POST', body: form });
      if (!res.ok) throw new Error(`Uguu upload failed: ${res.status}`);
      const json = await res.json();
      if (!json.files?.[0]?.url) throw new Error('Invalid Uguu response.');
      return json.files[0].url;
    } catch (err) {
      if (attempt < 3) await new Promise(r => setTimeout(r, 3000));
      else throw err;
    }
  }
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || '';

  if (!args.length && !/image/.test(mime)) {
    return m.reply(
      `🐍 *الاستخدام:* ${usedPrefix + command}\n` +
      `🖼️ قم بالرد على صورة أو أرسل رابط صورة.\n\n` +
      `🍧 تم التطوير بواسطة 𝐊𝐈𝐍𝐈𝐒𝐈𝐘𝐀 𝐁𝐎𝐓`
    );
  }

  try {
    let imageUrl;

    if (args.length && args[0].startsWith('http')) {
      imageUrl = args[0];
    } else if (/image/.test(mime)) {
      const media = await q.download();
      if (media.length > 10 * 1024 * 1024) {
        throw new Error('الصورة كبيرة جداً! الحد الأقصى 10 ميجا.');
      }
      imageUrl = await uploadToUguu(media);
    } else {
      throw new Error('يرجى الرد على صورة أو إرسال رابط صورة.');
    }

    if (!imageUrl) throw new Error('فشل رفع الصورة، حاول مرة أخرى.');

    let loadingMsg = await conn.sendMessage(m.chat, {
      text: `⏳ *جاري إزالة الخلفية...*`
    }, { quoted: m });

    const apiUrl = `https://apex-api-five.vercel.app/api/v1/tools/rb?imageUrl=${encodeURIComponent(imageUrl)}`;
    
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
      throw new Error('فشل الاتصال بخادم إزالة الخلفية.');
    }

    const data = await response.json();

    if (!data.status || !data.result?.cutout) {
      throw new Error('فشل في إزالة الخلفية من الصورة.');
    }

    await conn.sendMessage(m.chat, { delete: loadingMsg.key }).catch(() => null);

    await conn.sendMessage(m.chat, {
      image: { url: data.result.cutout },
      caption: `✅ *تم إزالة الخلفية بنجاح*`
    }, { quoted: m });

  } catch (e) {
    console.error('خطأ في إزالة الخلفية:', e);
    m.reply(`❌ *فشل إزالة الخلفية*\n${e.message}`);
  }
};

handler.help = ['ازالة'];
handler.tags = ['tools', 'image'];
handler.command = ['ازالة', 'ازاله', 'rb', 'removebg', 'rembg'];

export default handler;