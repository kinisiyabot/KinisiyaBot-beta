import axios from 'axios';
import cheerio from 'cheerio';
const { generateWAMessageFromContent, prepareWAMessageMedia } = await import('@whiskeysockets/baileys');

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`🍷 اكتب اسم الأغنية أو الفنان.\n\nمثال:\n${usedPrefix + command} Joji - Glimpse of Us`);

  try {
    const res = await axios.get(`https://music.apple.com/us/search?term=${encodeURIComponent(text)}`);
    const $ = cheerio.load(res.data);

    let firstItem = $('.grid-item').first();
    let title = firstItem.find('.top-search-lockup__primary__title').text().trim();
    let artist = firstItem.find('.top-search-lockup__secondary').text().trim();
    let link = firstItem.find('.click-action').attr('href');

    if (!title || !link) return m.reply('❌ لم يتم العثور على نتيجة مناسبة.');

    // صورة ثابتة مخصصة
    const staticImage = 'https://files.catbox.moe/hlsava.jpg';
    const { imageMessage } = await prepareWAMessageMedia({
      image: { url: staticImage },
    }, { upload: conn.waUploadToServer });

    const teksnya = `🩸 *العنوان:* ${title}
👤 *الفنان:* ${artist}
🌍 *رابط:* ${link}`;

    const messageContent = {
      buttonsMessage: {
        contentText: teksnya,
        footerText: '⏤͟͞ू⃪ 𝐊𝐈𝐍𝐈𝐒𝐈𝐘𝐀 𝐁𝐎𝐓⃝',
        buttons: [
          {
            buttonId: `.ابل-تحميل ${link}`,
            buttonText: { displayText: '🩸 تحميل الأغنية' },
            type: 1
          }
        ],
        headerType: 4,
        imageMessage: imageMessage
      }
    };

    const msg = generateWAMessageFromContent(
      m.chat,
      { ephemeralMessage: { message: messageContent } },
      { userJid: conn.user.id }
    );

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

  } catch (err) {
    console.error("❌ خطأ:", err);
    m.reply("⚠️ حدث خطأ أثناء البحث، تأكد من اتصالك أو أعد المحاولة.");
  }
};

handler.command = /^(ابل|applemusic)$/i;
export default handler;