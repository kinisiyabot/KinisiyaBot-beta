import fetch from 'node-fetch'

const handler = async (m, { conn, text, args, usedPrefix, command }) => {
  if (!text) return m.reply(
    `🚫 يرجى إدخال رابط منشور أو ريل من إنستغرام.\n\n📌 مثال:\n${usedPrefix + command} https://www.instagram.com/reel/abc123/`
  )

  try {
    m.react('🕒')

    const res = await fetch(`https://api.dorratz.com/igdl?url=${encodeURIComponent(text)}`)
    const json = await res.json()

    if (!json.data || !json.data.length) throw 'تعذر الحصول على المحتوى.'

    for (let media of json.data) {
      await conn.sendFile(m.chat, media.url, 'igdl.mp4', `*📥 تفضل :*`, m, false, {
        thumbnail: media.thumbnail ? await (await fetch(media.thumbnail)).buffer() : null,
        mimetype: 'video/mp4'
      })
    }

  } catch (e) {
    console.error(e)
    m.reply('⚠️ حدث خطأ أثناء تنزيل الفيديو.')
  }
}

handler.help = ['انستا <url>']
handler.tags = ['downloader']
handler.command = ['انستا']

export default handler