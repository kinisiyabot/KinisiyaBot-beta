// تم تطوير الكود بواسطة ༄𝐈𝐌 𝐘𝐄𝐑𝐈𝐓𝐂𝐇𝐈༆
// تابع جروب 𝑲𝑰𝑵𝑰𝑺𝑰𝒀𝑨 في واتساب: https://chat.whatsapp.com/LZANgKwDkVM3jv52qEKh5D?s=cl&p=a&ilr=1&amv=1
// تابع قناة 𝐊𝐈𝐍𝐈𝐒𝐈𝐘𝐀 𝐁𝐎𝐓 في واتساب: https://whatsapp.com/channel/0029Vb80wch30LKFioKenc2V

import axios from 'axios';
import { createSticker, StickerTypes } from 'wa-sticker-formatter';

let handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!text) return m.reply(`⚠️ أرسل الكلمة التي تريد البحث عنها وعدد الملصقات.\n\nمثال:\n*${usedPrefix + command} أنمي 5*\n*${usedPrefix + command} غون 3*`);

  // استخراج الكلمة والعدد بشكل صحيح
  const match = text.trim().match(/^(.*?)(?:\s+(\d+))?$/);
  const query = match[1]?.trim();
  let count = parseInt(match[2]) || 5;

  if (!query) return m.reply(`⚠️ يرجى كتابة نص البحث بشكل صحيح.`);
  if (count > 20) count = 20;

  await m.react('⌛');
  await conn.reply(m.chat, `> ⏳ *جاري البحث عن ${count} صورة وتحويلها لملصقات...*`, m);

  let images = [];

  try {
    const res = await axios.get('https://apex-api-five.vercel.app/api/v1/search/pinterest', {
      params: { query },
      timeout: 10000
    });

    if (res.data?.pins && Array.isArray(res.data.pins)) {
      images = res.data.pins.map(pin => pin.image).filter(Boolean).slice(0, count);
    }
  } catch (e) {
    console.error(`⚠️ خطأ في جلب الصور: ${e.message}`);
  }

  if (!images || images.length === 0) {
    await m.react('❌');
    return m.reply(`❌ لم يتم العثور على نتائج لـ *"${query}"*.`);
  }

  let successCount = 0;

  for (let i = 0; i < images.length; i++) {
    try {
      const response = await axios.get(images[i], { 
        responseType: 'arraybuffer',
        timeout: 8000
      });

      const buffer = Buffer.from(response.data);

      const sticker = await createSticker(buffer, {
        type: StickerTypes.CROPPED,
        pack: "Pinterest Pack",
        author: "𝐊𝐈𝐍𝐈𝐒𝐈𝐘𝐀 𝐁𝐎𝐓",
        quality: 70,
        keepScale: true,
        crop: true
      });

      const stickerBuffer = await sticker.toBuffer();

      await conn.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: m });
      successCount++;

      await new Promise(r => setTimeout(r, 800));
    } catch (err) {
      console.error(`❌ خطأ في تحويل الصورة رقم ${i + 1}:`, err.message);
    }
  }

  if (successCount > 0) {
    await m.react('✅');
    await conn.reply(m.chat, `✅ *تم إنتاج إجمالي ${successCount} ملصق بنجاح!*`, m);
  } else {
    await m.react('❌');
    await conn.reply(m.chat, `❌ فشل تحويل الصور لملصقات، حاول مرة أخرى.`, m);
  }
};

handler.help = ['ستيك <الكلمة> <العدد>'];
handler.tags = ['sticker', 'tools'];
handler.command = /^(ستيك|ستيكرات|استيكرات)$/i;

export default handler;
