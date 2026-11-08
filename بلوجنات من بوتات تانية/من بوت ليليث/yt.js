import { prepareWAMessageMedia, generateWAMessageFromContent, getDevice } from '@whiskeysockets/baileys'
import yts from 'yt-search';
import fs from 'fs';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    
    const device = await getDevice(m.key.id);
    
  if (!text) throw `*❲ ❗ ❳ يرجي إدخال نص للبحث في اليوتيوب .*\nمثال :\n> ➤  ${usedPrefix + command} القرآن الكريم\n> ➤  ${usedPrefix + command} https://youtu.be/JLWRZ8eWyZo?si=EmeS9fJvS_OkDk7p`;
    
  if (device !== 'desktop' || device !== 'web') {      
  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
    
  const results = await yts(text);
  const videos = results.videos.slice(0, 30);
  const randomIndex = Math.floor(Math.random() * videos.length);
  const randomVideo = videos[randomIndex];

  var messa = await prepareWAMessageMedia({ image: {url: randomVideo.thumbnail}}, { upload: conn.waUploadToServer });
  
  const imagurl = 'https://files.catbox.moe/hm0l6b.jpg';
 
 let chname = '𝓡𝓪𝓫𝓫𝓲𝓽 𝓼𝓲𝓷𝓹𝓪𝓲 ༆';
 let chid = '120363376982425324@newsletter';
  
  const captain = `*⎙ نتائج البحث:* ${results.videos.length}\n\n*⛊ النتيجة:*\n*-› العنوان:* ${randomVideo.title}\n*-› الصانع:* ${randomVideo.author.name}\n*-› المشاهدات:* ${randomVideo.views}\n*-› الرابط:* ${randomVideo.url}\n*-› البوستر:* ${randomVideo.thumbnail}\n\n> 🗃️اختر من القائمه بالاسفل.\n\n`.trim();
  
  const interactiveMessage = {
    body: { text: captain },
    footer: { text: `${global.wm}`.trim() },  
      header: {
          title: `*❲ بحث اليوتيوب ❳*\n`,
          hasMediaAttachment: true,
          imageMessage: messa.imageMessage,
      },
      contextInfo: {
        mentionedJid: await conn.parseMention(captain), 
        isForwarded: true, 
        forwardingScore: 1, 
        forwardedNewsletterMessageInfo: {
        newsletterJid: chid, 
        newsletterName: chname, 
        serverMessageId: 100
        },
        externalAdReply: {
        showAdAttribution: true,
          title: "𝓡𝓪𝓫𝓫𝓲𝓽 𝓼𝓲𝓷𝓹𝓪𝓲 ༆",
          body: "❲ التحــميلات ❳",
          thumbnailUrl: imagurl,
          mediaUrl: imagurl,
          mediaType: 1,
          sourceUrl: 'https://whatsapp.com/channel/0029VaumDtWJZg4B8jLyMK2q',
          renderLargerThumbnail: false
        }
      },
    nativeFlowMessage: {
      buttons: [
        {
          name: 'single_select',
          buttonParamsJson: JSON.stringify({
            title: '❲ قائمة النتائج ❳',
            sections: videos.map((video) => ({
              title: video.title,
              rows: [
                {
                  header: video.title,
                  title: video.author.name,
                  description: '〘 🎧 صــوتي 〙',
                  id: `${usedPrefix}اغنيه ${video.url}`
                },                
                  {
                  header: video.title,
                  title: video.author.name,
                  description: '〘 📹 فيديو 〙',
                  id: `${usedPrefix}فيديو ${video.url}`
                }
              ]
            }))
          })
        }
      ],
      messageParamsJson: ''
    }
  };        
            
        let msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage,
                },
            },
        }, { userJid: conn.user.jid, quoted: m })
        
        await conn.sendMessage(m.chat, { react: { text: '✔️', key: m.key } });
      conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id});

  } else {
  
  const results = await yts(text);
  const tes = results.all;
  
  const teks = results.all.map((v) => {
    switch (v.type) {
      case 'video': return `
° *العنوان:* ${v.title}
↳ 🫐 *الرابط:* ${v.url}
↳ 🕒 *المدة:* ${v.timestamp}
↳ 📥 *منذ:* ${v.ago}
↳ 👁 *المشاهدات:* ${v.views}`;
    }
  }).filter((v) => v).join('\n\n◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦◦\n\n');
  
  conn.sendFile(m.chat, tes[0].thumbnail, 'error.jpg', teks.trim(), m);      
  }    
};
handler.help = ['ytsearch <texto>'];
handler.tags = ['search'];
handler.command = /^(ytsearch|yts|يوتيوب)$/i;
export default handler;