import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('*⌬┇━───╌ •⤣⚡⤤• ──╌─━┇⌬*\n*يرجى استخدام الأمر مع رابط فيديو من تيك توك*\nمثال: ${usedPrefix + command} https://vt.tiktok.com/ZSY7P6j5Q/\n*✪┋𝐁𝐘┋❥ 𝑨𝑺𝑯𝑼𝑹𝑨☞𝐁𝐎𝐓┋✪*')
  m.react('⏳');
  const url = text.trim()
  if (!url.includes('tiktok.com') && !url.includes('vm.tiktok.com')) {
    return m.reply('*⌬┇━───╌ •⤣⚡⤤• ──╌─━┇⌬*\n*يرجى استخدام الأمر مع رابط فيديو من تيك توك*\nمثال: ${usedPrefix + command} https://vt.tiktok.com/ZSY7P6j5Q/\n*✪┋𝐁𝐘┋❥ 𝑨𝑺𝑯𝑼𝑹𝑨☞𝐁𝐎𝐓┋✪*')
  }

  try {
    // استدعاء API مباشر
    let res = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`)
    let data = await res.json()

    if (!data || !data.data || !data.data.play) {
      console.error('Tikwm API response:', data)
      return m.reply('❌ ماقدرتش أجيب الفيديو.')
    }

    let videoUrl = data.data.play

    await conn.sendMessage(m.chat, {
      video: { url: videoUrl },
      caption: '❮ ✅ ┇ تم تحميل الفيديو بنجاح ❯\n> أنا لا أتحمل ذنوب ما تشاهده أو تسمعه'
    }, { quoted: m })

  } catch (err) {
    console.error(err)
    m.reply('⚠️ حصل خطأ أثناء محاولة جلب الفيديو.')
  }
}

handler.command = /^(tiktokdl|tt|تيكتوك|تيك)$/i
export default handler