import { igdl } from "ruhend-scraper";

let handler = async (m, { args, conn }) => {
  if (!args[0]) {
    return conn.reply(m.chat, '*ادخل لينك الفيديو لتنزيله بواسطة ابيس-بوت*', m);
  }

  try {
    await m.react('🕑');
    let res = await igdl(args[0]);
    let data = res.data;

    for (let media of data) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await m.react('✅');

      // إرسال الفيديو
      conn.sendMessage(m.chat, {
        video: { url: media.url },
        caption: `اسم الفيديو: ${media.title}\nحجم الفيديو: ${media.size}`,
        footer: dev,
        buttons: [
          {
            buttonId: `.tiktokmp3 ${media.url}`,
            buttonText: { displayText: 'تحميل الصوت ', },
          },
        ],
      }, { quoted: m });

      // إرسال الصوت
      conn.sendFile(m.chat, media.url, 'instagram.mp3', dev, null, m);
    }
  } catch (err) {
    conn.reply(m.chat, '*خطأ في تنزيل الفيديو!*', m);
  }
}

handler.command = ['انستا', 'igdl', 'انستغرام'];
handler.tags = ['dl'];
handler.help = ['انستا *<link>*'];
export default handler;