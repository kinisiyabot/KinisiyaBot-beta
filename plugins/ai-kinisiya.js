// • Feature : صنع صور وفيديوهات بالذكاء الصناعي
// • Developers : song
// • Channel : https://whatsapp.com/channel/0029Vb80wch30LKFioKenc2V
//for cjs( صيغة const):https://whatsapp.com/channel/0029Vb80wch30LKFioKenc2V

import axios from 'axios';

const aiLabs = {
  api: {
    base: 'https://apex-api-five.vercel.app/api/v1/ai/draw',
    endpoints: {
      text2img: '/text2img',
      text2vid: '/text2vid'
    }
  },

  text2img: async (prompt) => {
    if (!prompt?.trim()) {
      return { success: false, code: 400, result: { error: '⚠️ النص فارغ يا زعيم' } };
    }

    try {
      const url = `${aiLabs.api.base}${aiLabs.api.endpoints.text2img}?prompt=${encodeURIComponent(prompt)}`;
      const res = await axios.get(url, { timeout: 30000 });

      const { status, message, imageUrl } = res.data;
      
      if (!status || !imageUrl) {
        return { success: false, code: res.status, result: { error: message || '❌ فشل في إنشاء الصورة' } };
      }

      return { 
        success: true, 
        code: res.status, 
        result: { 
          url: imageUrl, 
          prompt: prompt,
          message: message 
        } 
      };
    } catch (err) {
      return { 
        success: false, 
        code: err.response?.status || 500, 
        result: { error: err.message || '❌ خطأ غير معروف' } 
      };
    }
  },

  text2vid: async (prompt) => {
    if (!prompt?.trim()) {
      return { success: false, code: 400, result: { error: '⚠️ النص فارغ يا زعيم' } };
    }

    try {
      const url = `${aiLabs.api.base}${aiLabs.api.endpoints.text2vid}?prompt=${encodeURIComponent(prompt)}`;
      const res = await axios.get(url, { timeout: 60000 });

      const { status, message, videoUrl } = res.data;
      
      if (!status || !videoUrl) {
        return { success: false, code: res.status, result: { error: message || '❌ فشل في إنشاء الفيديو' } };
      }

      return { 
        success: true, 
        code: res.status, 
        result: { 
          url: videoUrl, 
          prompt: prompt,
          message: message 
        } 
      };
    } catch (err) {
      return { 
        success: false, 
        code: err.response?.status || 500, 
        result: { error: err.message || '❌ خطأ غير معروف' } 
      };
    }
  },

  generate: async ({ prompt = '', type = 'video' } = {}) => {
    if (!prompt?.trim()) {
      return { success: false, code: 400, result: { error: '⚠️ النص فارغ يا زعيم' } };
    }

    if (!/^(image|video)$/.test(type)) {
      return { success: false, code: 400, result: { error: '⚠️ النوع غير صالح (استخدم image أو video فقط)' } };
    }

    if (type === 'image') {
      return await aiLabs.text2img(prompt);
    } else {
      return await aiLabs.text2vid(prompt);
    }
  }
};

// ================== HANDLER ==================
const handler = async (m, { command, text, conn }) => {
  try {
    if (!text) return m.reply(`⚠️ اكتب النص بعد الأمر يا زعيم.\n\nمثال:\n${command} قطة جميلة في حديقة`);

    if (command === 'ارسم-صورة') {
      m.reply('⏳ جاري توليد الصورة من النص...');
      const result = await aiLabs.generate({ prompt: text, type: 'image' });

      if (result.success) {
        await conn.sendMessage(m.chat, { 
          image: { url: result.result.url }, 
          caption: `✅ تم توليد الصورة بنجاح\n📜 النص: ${result.result.prompt}` 
        }, { quoted: m });
      } else {
        m.reply(`❌ فشل في إنشاء الصورة\n${result.result.error}`);
      }
    }

    if (command === 'ارسم-فيديو') {
      m.reply('⏳ جاري إنشاء الفيديو من النص... (قد يستغرق دقيقة)');
      const result = await aiLabs.generate({ prompt: text, type: 'video' });

      if (result.success) {
        await conn.sendMessage(m.chat, { 
          video: { url: result.result.url }, 
          caption: `🎬 تم إنشاء الفيديو بنجاح\n📜 النص: ${text}` 
        }, { quoted: m });
      } else {
        m.reply(`❌ فشل في إنشاء الفيديو\n${result.result.error}`);
      }
    }
  } catch (err) {
    m.reply(`❌ حدث خطأ: ${err.message}`);
  }
};

handler.command = ['ارسم-صورة', 'ارسم-فيديو'];
handler.help = ['ارسم-صورة', 'ارسم-فيديو'];
handler.tags = ['ai'];

export default handler;