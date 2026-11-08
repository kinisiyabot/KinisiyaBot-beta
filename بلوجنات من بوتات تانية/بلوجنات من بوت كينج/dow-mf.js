import axios from 'axios';

function isValidMediafireUrl(url) {
  try {
    const parsed = new URL(url);
    const hostOk = parsed.hostname.includes('mediafire.com');
    const pathOk = parsed.pathname.includes('/file/');
    const queryOk = parsed.search.length > 1;
    return hostOk && (pathOk || queryOk);
  } catch {
    return false;
  }
}

let handler = async (m, { conn, args }) => {
  try {
    if (!args[0]) {
      return m.reply(`🕸 أدخل رابط APK من ميديافاير أو اسم الملف للبحث.`);
    }

    const input = args.join(' ');
    const isValidUrl = isValidMediafireUrl(input);

    let mediafireUrl = input;

    if (!isValidUrl) {
      const searchRes = await axios.get(`${api.url}/search/mediafire?query=${encodeURIComponent(input)}&apikey=${api.key}`);
      const searchData = searchRes.data;

      if (!searchData.status || !searchData.results?.length) {
        return m.reply('🌿 لم يتم العثور على نتائج.');
      }

      const result = searchData.results[Math.floor(Math.random() * searchData.results.length)];
      mediafireUrl = result.url;
    }

    const response = await axios.get(`${api.url}/dow/mediafire?url=${mediafireUrl}&apikey=${api.key}`);
    const data = response.data;

    if (!data.status || !data.data) {
      return m.reply('☁️ لم يتم معالجة الرابط.');
    }

    const { title, peso, fecha, tipo, dl } = data.data;

    const info = `📦 *ملف تم العثور عليه:*\n\n` +
      `📄 *الاسم:* ${title}\n` +
      `📦 *الحجم:* ${peso}\n` +
      `📅 *تاريخ الإنشاء:* ${fecha}\n` +
      `📁 *النوع:* ${tipo}\n\n` +
      `🔗 *رابط التحميل المباشر:* ${dl}`;

    await conn.sendMessage(m.chat, { text: info, ...fake }, { quoted: m });

    if (!/GB|gb/.test(peso)) {
      await conn.sendMessage(
        m.chat,
        {
          document: { url: dl },
          mimetype: tipo,
          fileName: title,
        },
        { quoted: m }
      );
    } else {
      await conn.sendMessage(m.chat, {
        text: `🕸 *الملف يتجاوز الحد المسموح للإرسال المباشر.*`
      }, { quoted: m });
    }

  } catch (error) {
    m.reply('☁️ تعذر تنزيل الملف. حاول مرة أخرى.');
  }
};

handler.help = ['ميديافاير', 'mf'];
handler.tags = ['تحميل'];
handler.command = ['ميديافاير', 'mf'];

export default handler;