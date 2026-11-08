import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return conn.reply(m.chat, `⚠️ *الاستخدام الصحيح:* ${usedPrefix + command} <وصف الفيديو>`, m);

  try {
    let wait = await conn.sendMessage(m.chat, { 
      text: '⏳ *جارٍ توليد الفيديو باستخدام الذكاء الاصطناعي... الرجاء الانتظار...*' 
    }, { quoted: m });

    let apiURL = `https://myapiadonix.vercel.app/api/veo3?prompt=${encodeURIComponent(text)}&apikey=adonixveo3`;
    let res = await fetch(apiURL);
    let json = await res.json();

    if (!json.success || !json.video_url) throw new Error(json.message || 'فشل في توليد الفيديو');

    let video = await fetch(json.video_url);
    let buffer = await video.buffer();

    await conn.sendMessage(m.chat, { 
      video: buffer, 
      caption: `🎬 *فيديو تم إنشاؤه:* ${json.prompt}\n`, 
      gifPlayback: false 
    }, { quoted: m });

    await conn.sendMessage(m.chat, { delete: wait.key });
  } catch (e) {
    await conn.reply(m.chat, `❌ *حدث خطأ أثناء توليد الفيديو:*\n${e.message || e}`, m);
  }
};

handler.help = ['انشاء_فيديو <الوصف>'];
handler.tags = ['الذكاء_الاصطناعي'];
handler.command = ['فيديو', 'انشاء_فيديو', 'videoai', 'iavideo']; // دعم أوامر بالعربية والإنجليزية

export default handler;