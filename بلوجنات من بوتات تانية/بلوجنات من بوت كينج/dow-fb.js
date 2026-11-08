import fetch from 'node-fetch';

let handler = async (m, { conn, args }) => {
  try {
    if (!args[0]) {
      return m.reply(
        `🕸 أدخل رابط فيديو من فيسبوك`
      );
    }

    if (!args[0].match(/facebook\.com|fb\.watch|video\.fb\.com/)) {
      return m.reply('🫗 الرابط غير صحيح. تأكد أنه رابط فيديو من فيسبوك.');
    }

    // رسالة أثناء التحميل
    await conn.sendMessage(m.chat, { text: '⏳ جاري معالجة الفيديو...' }, { quoted: m });

    const res = await fetch(`${api.url}/dow/facebook?url=${args[0]}&apikey=${api.key}`);
    const json = await res.json();

    if (!json.status || !json.data?.dl) {
      return m.reply('🫟 لم يمكن الحصول على الفيديو. حاول برابط آخر.');
    }

    const videoUrl = json.data.dl;

    const caption = `🅕🅑 تحميل الفيديو\n\n🫗 *الرابط:* ${args[0]}`;

    await conn.sendMessage(
      m.chat,
      {
        video: { url: videoUrl },
        caption,
        mimetype: 'video/mp4',
        fileName: 'فيديو_فيسبوك.mp4'
      },
      { quoted: m }
    );

  } catch (error) {
    console.error(error);
    m.reply('⚠️ حدث خطأ أثناء معالجة الفيديو. حاول لاحقاً.');
  }
};

handler.help = ['فيسبوك', 'fb'];
handler.tags = ['تحميل'];
handler.command = ['فيسبوك', 'fb'];

export default handler;