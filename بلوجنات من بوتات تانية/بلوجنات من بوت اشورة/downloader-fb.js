import fetch from 'node-fetch'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) return m.reply(
    `📥 الاستخدام الصحيح:
${usedPrefix + command} <رابط فيسبوك صالح>

مثال:
${usedPrefix + command} https://www.facebook.com/watch/?v=201065826587`
  )

  try {
    await conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key } })

    let api = `https://api.dorratz.com/fbvideo?url=${encodeURIComponent(args[0])}`
    let res = await fetch(api)
    let json = await res.json()

    if (!Array.isArray(json) || json.length === 0) throw new Error('الاستجابة غير صالحة من API')

    for (let item of json) {
      if (!item.url || !item.resolution) continue

      let caption = `
🎬 الجودة: *${item.resolution}*
📎 الملف: *${item.url.endsWith('.mp4') ? item.url.split('/').pop() : 'تحميل متاح'}*`.trim()

      await conn.sendMessage(m.chat, {
        video: { url: item.url },
        caption,
        fileName: `${item.resolution.replace(/\s/g, '_')}.mp4`,
        mimetype: 'video/mp4',
        contextInfo: {
          externalAdReply: {
            title: 'تحميل من فيسبوك',
            body: item.resolution,
            thumbnailUrl: item.thumbnail,
            sourceUrl: args[0],
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: m })
    }

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    m.reply('❌ لم يتمكن من الحصول على الفيديو. تحقق من الرابط وحاول مرة أخرى.')
  }
}

handler.command = ['فيس', 'فيسبوك']
handler.help = ['facebook']
handler.tags = ['downloader']

export default handler