import axios from 'axios';
import cheerio from 'cheerio';

let handler = async (m, { conn }) => {
  try {
    const { data: html } = await axios.get('http://quotes.toscrape.com/');
    const $ = cheerio.load(html);

    const quotes = [];
    $('.quote').each((i, el) => {
      const text = $(el).find('.text').text().trim();
      const author = $(el).find('.author').text().trim();
      quotes.push({ text, author });
    });

    const random = quotes[Math.floor(Math.random() * quotes.length)];
    const message = `📝 *اقتباس عشوائي:*\n\n"${random.text}"\n\n— *${random.author}*`;

    await conn.sendMessage(m.chat, { text: message }, { quoted: m });
  } catch (err) {
    console.error(err);
    await conn.sendMessage(m.chat, { text: '❌ فشل في جلب الاقتباس.' }, { quoted: m });
  }
};

handler.command = ['اقتباس', 'quote'];
handler.tags = ['fun'];
handler.help = ['اقتباس'];

export default handler;