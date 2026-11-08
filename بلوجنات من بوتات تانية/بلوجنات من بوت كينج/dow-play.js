import yts from 'yt-search';
import fetch from 'node-fetch';
const limit = 100;

const isYTUrl = (url) => /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/i.test(url);

const handler = async (m, { conn, text, command }) => {
  try {
    if (!text.trim()) {
      return conn.reply(m.chat, `🎶 أدخل *اسم الأغنية* أو رابط من *يوتيوب*.`, m);
    }

    const esURL = isYTUrl(text);
    let url, title;

    if (!esURL) {
      const search = await yts(text);
      if (!search.all.length) return m.reply('❌ لم يتم العثور على نتائج.');

      const videoInfo = search.all[0];
      ({ title, url } = videoInfo);

      const vistas = (videoInfo.views || 0).toLocaleString();
      const canal = videoInfo.author?.name || 'غير معروف';
      const infoMessage = `
🎵 *جاري التحميل من يوتيوب...*

🎶 *العنوان:* ${title}
👤 *القناة:* ${canal}
⏱ *المدة:* ${videoInfo.timestamp}
👀 *المشاهدات:* ${vistas}
📅 *منذ:* ${videoInfo.ago}
🔗 *الرابط:* ${url}

${dev}`;

      const thumb = (await conn.getFile(videoInfo.thumbnail))?.data;
      await conn.sendMessage(m.chat, { image: thumb, caption: infoMessage }, { quoted: m });
    } else {
      url = text;
    }

    if (['شغل', 'اغنية', 'صوت', 'يوتيوب_صوت'].includes(command)) {
      const response = await fetch(`${api.url}/dow/ytmp3v2?url=${encodeURIComponent(url)}&apikey=${api.key}`);
      const result = await response.json();

      if (!result.status || !result.data) return m.reply('⚠️ خطأ أثناء تحميل الصوت.');

      const { dl, title } = result.data;

      await conn.sendMessage(
        m.chat,
        {
          audio: { url: dl },
          fileName: `${title}.mp3`,
          mimetype: 'audio/mpeg',
          ptt: true
        },
        { quoted: m }
      );
    } else if (['شغل2', 'فيديو', 'يوتيوب'].includes(command)) {
      const response = await fetch(`${api.url}/dow/ytmp4v2?url=${url}&apikey=${api.key}`);
      const result = await response.json();

      if (!result.status || !result.data) return m.reply('⚠️ خطأ أثناء تحميل الفيديو.');

      const { dl, title } = result.data;

      const res = await fetch(dl);
      const contentLength = res.headers.get('Content-Length');
      const fileSize = parseInt(contentLength || '0', 10) / (1024 * 1024);
      const asDocument = fileSize >= limit;

      await conn.sendMessage(
        m.chat,
        {
          video: { url: dl },
          fileName: `${title}.mp4`,
          mimetype: 'video/mp4',
          caption: dev,
          asDocument
        },
        { quoted: m }
      );
     } 
  } catch (e) {
    await m.reply('❌ حدث خطأ أثناء معالجة الطلب.');
  }
};

handler.command = handler.help = [
  'شغل', 'اغنية', 'صوت', 'يوتيوب_صوت',
  'شغل2', 'فيديو', 'يوتيوب'
];
handler.tags = ['تحميل'];

export default handler;