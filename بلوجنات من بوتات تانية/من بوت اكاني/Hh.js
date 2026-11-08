const { generateWAMessageFromContent, prepareWAMessageMedia } = (await import('@whiskeysockets/baileys')).default;
import yts from 'yt-search';

let handler = async (m, { conn, usedPrefix, command, text }) => {
   if (!text) return m.reply(`> *\`『 اكتب الي عايز تشغلو معا الامر 』\`*`)
   
   try {
      await m.react('🕓');
      let search = await yts(text)
      let video = search.all[0]
      let linkyt = video.url
      let teksnya = `📌 *العنوان:* ${video.title}\n👀 *عدد المشاهدات:* ${video.views}\n⏱️ *المدة:* ${video.timestamp}\n📅 *تم التحميل منذ:* ${video.ago}\n🔗 *الرابط:* ${linkyt}`

      const { imageMessage } = await prepareWAMessageMedia(
            {
                image: { url: video.thumbnail }
            },
            { upload: conn.waUploadToServer }
        );

        const messageContent = {
            buttonsMessage: {
                contentText: teksnya,
                footerText: '𝐀𝐁𝐘𝐒𝐒_𝐁𝐎𝐓',
                buttons: [
                    {
                        buttonId: `.فيديو ${linkyt}`,
                        buttonText: { displayText: '📹 الفيديو' },
                        type: 1
                    },
                    {
                        buttonId: `.اغنيه ${linkyt}`,
                        buttonText: { displayText: '🎧 الصوت' },
                        type: 1
                    }
                ],
                headerType: 4,
                imageMessage: imageMessage,
            }
        };

        const message = generateWAMessageFromContent(
            m.chat,
            {
                ephemeralMessage: {
                    message: messageContent
                }
            },
            { userJid: conn.user.id }
        );

        await conn.relayMessage(m.chat, message.message, { messageId: message.key.id });
    } catch (error) {
        console.error("⚠️ حدث خطأ أثناء إرسال الرسالة:", error);
        await conn.sendMessage(m.chat, { text: "عذرًا، حدث خطأ أثناء تنفيذ الطلب." });
    }
}

handler.help = ['تشغيل'].map(v => v + ' <اسم الأغنية/الفيديو>');
handler.tags = ['تحميل'];
handler.command = /^(شغل)$/i;


export default handler;