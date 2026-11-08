import fetch from 'node-fetch';
import FormData from 'form-data';

async function uploadToUguu(buffer) {
  const body = new FormData();
  body.append('files[]', buffer, 'image.jpg');

  const res = await fetch('https://uguu.se/upload.php', {
    method: 'POST',
    body,
    headers: body.getHeaders(),
  });

  const json = await res.json();
  return json.files?.[0]?.url;
}

async function getEnhancedBuffer(url) {
  const res = await fetch(`${api.url}/tools/upscale?url=${url}&apikey=${api.key}`);
  if (!res.ok) return null;

  return Buffer.from(await res.arrayBuffer());
}

let handler = async (m, { conn }) => {
  try {
    const q = m.quoted || m;
    const mime = q.mimetype || q.msg?.mimetype || '';

    if (!mime) {
      return m.reply('🖼️ أرسل *صورة* مع الأمر لتحسين جودتها.');
    }

    if (!/image\/(jpe?g|png)/.test(mime)) {
      return m.reply(`⚠️ الصيغة *${mime}* غير مدعومة. استخدم JPG أو PNG فقط.`);
    }

    const buffer = await q.download();
    const uploadedUrl = await uploadToUguu(buffer);

    if (!uploadedUrl) {
      return m.reply('🚫 فشل في رفع الصورة، حاول مرة أخرى.');
    }

    const enhancedBuffer = await getEnhancedBuffer(uploadedUrl);

    if (!enhancedBuffer) {
      return m.reply('❌ لم أتمكن من تحسين الصورة.');
    }

    await conn.sendMessage(m.chat, { image: enhancedBuffer }, { quoted: m });

  } catch (err) {
    console.error(err);
    await m.reply('⚠️ حدث خطأ أثناء معالجة الصورة.');
  }
};

handler.help = ['وضوح'];
handler.tags = ['أدوات'];
handler.command = ['جوده'];

export default handler;