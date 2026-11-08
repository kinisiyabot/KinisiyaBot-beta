import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {

let fake = {
  key: {
    fromMe: false,
    participant: '0@s.whatsapp.net',
    remoteJid: '120363384250924818@g.us',
  },
  message: {
    conversation: '｢🍷┊𝓡𝓪𝓫𝓫𝓲𝓽 𝓼𝓲𝓷𝓹𝓪𝓲 ༆┊🍭｣'
  },
  participant: '0@s.whatsapp.net',
};

const info = `*❲ ❗ ❳ يرجي إدخال نص للتحميل من اليوتيوب .*\nمثال :\n> ➤  ${usedPrefix + command} القرآن الكريم\n> ➤  ${usedPrefix + command} https://youtu.be/rmW_wQwDkJU?si=W8P7-ujM9w24V24S`;

  if (!text) { 
  await conn.sendMessage(m.chat, {text: info, mentions: [m.sender]}, { quoted: fake });
  await conn.sendMessage(m.chat, { react: { text: '❗', key: m.key } });
  return;
  }

await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } });

  const apiUrl = `https://the-end-api.vercel.app/api/download/youtube/all_media?q=${encodeURIComponent(text)}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const json = await response.json();
    const data = json?.data;

    if (!data) {
      throw new Error('No data found in response');
    }
    
    
    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    const infoitem = `
*⋄┄┄┄┄┄┄┄〘 تحــميل اليــوتيوب 〙┄┄┄┄┄┄┄⋄*


│ *◈ العنوان : ${data.title || 'غير متوفر'}*

│ *◈ الوصف : ${data.description || 'غير متوفر'}*

│ *◈ الوقت : ${data.time || 'غير متوفر'}*

│ *◈ النشر : ${data.ago || 'غير متوفر'}*

│ *◈ الصانع : ${data.author || 'غير متوفر'}*


> © ${wm}
`;

const infovideo = `

 *◈ العنوان : ${data.title || 'غير متوفر'}*

 *◈ الوصف : ${data.description || 'غير متوفر'}*


> © ${wm}
`;


    const imageUrl = data.thumbnail;
    const videoUrl = data.video;
    const audioUrl = data.audio;
    
    
    conn.sendMessage(m.chat, {image: { url: imageUrl }, caption: infoitem, mentions: [m.sender]}, { quoted: fake });

    if (command=== 'اغنيه' && audioUrl) {

      await conn.sendMessage(m.chat, { audio: { url: audioUrl }, fileName: 'the_end.mp3', mimetype: 'audio/mpeg' }, { quoted: fake });
      
      await conn.sendMessage(m.chat, { react: { text: '🎧', key: m.key } });
      
    } else if (command === 'فيديو' && videoUrl) {
      
      await conn.sendMessage(m.chat, { react: { text: '🎥', key: m.key } });
      
      await conn.sendMessage(
        m.chat,
        { video: { url: videoUrl }, caption: infovideo, fileName: 'the_end.mp4', mimetype: 'video/mp4', },
        { quoted: fake }
      );
      
    } 
    
  } catch (error) {
    console.error(error);
    await conn.sendMessage(m.chat, { text: '`حدث خطأ أثناء محاولة التحميل :`' + error.message}, { quoted: fake });
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
  }
};

handler.help = ['اغنيه <النص>', 'فيديو <النص>'];
handler.tags = ['التحميل'];
handler.command = ['اغنيه', 'فيديو'];

export default handler;