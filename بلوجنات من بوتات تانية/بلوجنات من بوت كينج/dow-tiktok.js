import fetch from 'node-fetch'

const handler = async (m, { conn, text }) => {
  if (!text) return conn.reply(m.chat, '🎬 أدخل رابط أو كلمة للبحث في *تيك توك*.', m)

  const isUrl = /(?:https?:\/\/)?(?:www\.)?(?:vm|vt|t)?\.?tiktok\.com\/([^\s]+)/gi.test(text) 
  const apiUrl = isUrl
    ? `${api.url}/dow/tiktok?url=${text}&apikey=${api.key}`
    : `${api.url}/search/tiktok?query=${encodeURIComponent(text)}&apikey=${api.key}`

  try {
    const res = await fetch(apiUrl)
    if (!res.ok) throw new Error(`⚠️ خطأ من السيرفر: ${res.status}`)
    const json = await res.json()

    const data = isUrl ? json.data : json.data?.[0]
    if (!data) return conn.reply(m.chat, '❌ لم يتم العثور على أي نتائج.', m)

    const {
      title = 'بدون عنوان',
      dl,
      cover,
      duration,
      author = {},
      stats = {},
      music = {}
    } = data

    const caption = `
🎬 *العنوان:* ${title}

👤 *الناشر:* ${author.nickname || author.unique_id || 'غير معروف'}
⏱ *المدة:* ${duration || 'غير محددة'}
❤️ *الإعجابات:* ${(stats.likes || 0).toLocaleString()}
💬 *التعليقات:* ${(stats.comments || 0).toLocaleString()}
👀 *المشاهدات:* ${(stats.views || stats.plays || 0).toLocaleString()}
🔁 *المشاركات:* ${(stats.shares || 0).toLocaleString()}
🎵 *الصوت:* ${music.title ? music.title + " -" : 'غير معروف'} ${music.author ? music.author : ''}
    `.trim()

    const head = await fetch(dl, { method: 'HEAD' })
    const contentType = head.headers.get('content-type') || ''

    if (contentType.includes('video')) {
      return conn.sendMessage(m.chat, { video: { url: dl }, caption }, { quoted: m })
    }

    return conn.reply(m.chat, '⚠️ المحتوى غير مدعوم أو حدث خطأ في المعالجة.', m)

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, '❌ حدث خطأ أثناء جلب الفيديو.', m)
  }
}

handler.help = ['تيك', 'تيكتوك']
handler.tags = ['تحميل']
handler.command = ['تيك', 'تيكتوك']

export default handler