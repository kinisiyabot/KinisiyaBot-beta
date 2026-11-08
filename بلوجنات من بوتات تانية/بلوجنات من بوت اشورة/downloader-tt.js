import fetch from 'node-fetch'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) return m.reply(
    `📥 الاستخدام الصحيح:
${usedPrefix + command} <رابط فيديو تيك توك>

مثال:
${usedPrefix + command} https://www.tiktok.com/@user/video/123456789`
  )

  try {
    await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } })

    let apiURL = `https://myapiadonix.vercel.app/api/tiktok?url=${encodeURIComponent(args[0])}`
    let response = await fetch(apiURL)
    let data = await response.json()

    if (data.status !== 200 || !data.result?.video)
      throw new Error('لم يتم العثور على الفيديو')

    let info = data.result

    let caption = `
🎬 *${info.title}*

👤 *الناشر:* @${info.author.username || 'غير معروف'}
⏱️ *المدة:* ${info.duration || 'غير محددة'} ثانية

📊 *الإحصائيات:*
❤️ الإعجابات: ${info.likes?.toLocaleString() || 0}
💬 التعليقات: ${info.comments?.toLocaleString() || 0}
🔁 المشاركات: ${info.shares?.toLocaleString() || 0}
👁️ المشاهدات: ${info.views?.toLocaleString() || 0}
`.trim()

    await conn.sendMessage(m.chat, {
      video: { url: info.video },
      caption,
      fileName: `${info.title}.mp4`,
      mimetype: 'video/mp4',
      contextInfo: {
        externalAdReply: {
          title: info.title,
          body: `الناشر: ${info.author.name || 'غير معروف'}`,
          thumbnailUrl: info.thumbnail,
          sourceUrl: args[0],
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

  } catch (err) {
    console.error(err)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    m.reply('❌ حدث خطأ أثناء تحميل الفيديو، حاول مرة أخرى لاحقاً.')
  }
}

handler.command = ['تحميل_تيكتوك']
handler.help = ['تحميل_تيكتوك']
handler.tags = ['downloader']

export default handler