import fs from 'fs/promises';
import path from 'path';

const handler = async (m, { conn }) => {
  const folder = './plugins';
  const targetFile = 'ريفت.js';
  const filePath = path.join(folder, targetFile);

  let content;
  try {
    content = await fs.readFile(filePath, 'utf8');
  } catch (e) {
    return m.reply(`❌ لم يتم العثور على الملف: ${targetFile}`);
  }

  // الكود القديم المكسور
  const oldCode = `      const episode = session.episodes.find(ep => ep.number === session.selectedEpisodeNum)
      
      try {
        await conn.sendMessage(chatId, {
          video: { url: videoUrl },
          caption: \`🎬 \${session.selectedAnime.title.arabic || session.selectedAnime.title.original}\\n📺 Episode \${session.selectedEpisodeNum}\\n🌐 Server: \${session.selectedServer.name}\\n📊 Quality: \${quality}\\n🗣️ Language: \${session.selectedServer.language}\\n⏱️ Duration: \${formatDuration(episode?.duration || 0)}\\n\\n🍿 Enjoy watching\\n\\n\${BRAND}\`,
          mimetype: 'video/mp4'
        }, { quoted: m })
      } catch (error) {
        let message = \`✅ Video link obtained\\n\\n🎬 \${session.selectedAnime.title.arabic || session.selectedAnime.title.original}\\n📺 Episode \${session.selectedEpisodeNum}\\n🌐 Server: \${session.selectedServer.name}\\n📊 Quality: \${quality}\\n🗣️ Language: \${session.selectedServer.language}\\n\\n🔗 Watch Link:\\n\${videoUrl}\\n\\n⚠️ Link valid for limited time\\n🍿 Enjoy watching\`
        
        await conn.sendMessage(chatId, { 
          text: message,
          contextInfo: {
            externalAdReply: {
              title: \`\${session.selectedAnime.title.arabic || session.selectedAnime.title.original}\`,
              body: \`Episode \${session.selectedEpisodeNum} • \${quality}\`,
              thumbnailUrl: session.selectedAnime.images.main || DEFAULT_THUMB,
              sourceUrl: videoUrl,
              mediaType: 1,
              renderLargerThumbnail: true
            }
          }
        }, { quoted: m })
      }`;

  // الكود الجديد الصحيح
  const newCode = `      const episode = session.episodes.find(ep => ep.number === session.selectedEpisodeNum)
      const animeTitle = session.selectedAnime.title.arabic || session.selectedAnime.title.original
      const videoCaption = \`🎬 \${animeTitle}\\n📺 Episode \${session.selectedEpisodeNum}\\n🌐 Server: \${session.selectedServer.name}\\n📊 Quality: \${quality}\\n🗣️ Language: \${session.selectedServer.language}\\n⏱️ Duration: \${formatDuration(episode?.duration || 0)}\\n\\n🍿 Enjoy watching\\n\\n\${BRAND}\`

      const isHLS = videoUrl.includes('.m3u8')
      const isDirectMp4 = videoUrl.includes('.mp4') || videoUrl.toLowerCase().includes('mediafire')

      const fallbackMsg = async () => {
        await conn.sendMessage(chatId, {
          text: \`🎬 \${animeTitle}\\n📺 Episode \${session.selectedEpisodeNum}\\n🌐 Server: \${session.selectedServer.name}\\n📊 Quality: \${quality}\\n🗣️ Language: \${session.selectedServer.language}\\n\\n🔗 Watch Link:\\n\${videoUrl}\\n\\n⚠️ Link valid for limited time\\n🍿 Enjoy watching\`,
          contextInfo: {
            externalAdReply: {
              title: animeTitle,
              body: \`Episode \${session.selectedEpisodeNum} • \${quality}\`,
              thumbnailUrl: session.selectedAnime.images.main || DEFAULT_THUMB,
              sourceUrl: videoUrl,
              mediaType: 1,
              renderLargerThumbnail: true
            }
          }
        }, { quoted: m })
      }

      if (isHLS) {
        await fallbackMsg()
      } else {
        try {
          await conn.sendMessage(chatId, {
            video: { url: videoUrl },
            caption: videoCaption,
            mimetype: 'video/mp4'
          }, { quoted: m })
        } catch (error) {
          await fallbackMsg()
        }
      }`;

  if (!content.includes('let message = `✅ Video link obtained')) {
    return m.reply(`⚠️ الملف لا يحتاج إصلاح أو تم إصلاحه مسبقاً`);
  }

  const fixed = content.replace(oldCode, newCode);

  if (fixed === content) {
    return m.reply(`❌ لم يتم إيجاد الكود القديم\n\n💡 ربما الملف مختلف قليلاً، تحقق يدوياً`);
  }

  await fs.writeFile(filePath, fixed, 'utf8');
  await m.reply(`✅ تم إصلاح ملف ${targetFile} بنجاح!\n\n🔧 تم تصحيح:\n• إضافة كشف نوع الرابط (HLS / MP4)\n• روابط .m3u8 ترسل كرابط\n• روابط .mp4 ترسل كفيديو مباشر\n\n♻️ أعد تشغيل البوت لتفعيل الإصلاح`);
};

handler.help = ['fixriftvideo'];
handler.tags = ['tools'];
handler.command = ['اصلح-فيديو-ريفت', 'fixriftvideo'];
handler.owner = true;
export default handler;