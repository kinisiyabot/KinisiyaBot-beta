import { search, download } from 'aptoide-scraper'

var handler = async (m, { conn, text }) => {
  if (!text) return conn.reply(m.chat, `🚫 *يرجى إدخال اسم التطبيق الذي تريد تحميله*\n\n📌 *مثال:* .apk TikTok`, m)

  try {
    await m.react('🕓') // جاري البحث

    let resultados = await search(text)
    if (!resultados.length) {
      await m.react('❌')
      return conn.reply(m.chat, '❌ لم يتم العثور على أي تطبيق بهذا الاسم.', m)
    }

    let app = await download(resultados[0].id)

    let info = `📲 *تم العثور على تطبيق:*\n\n`
    info += `🔹 *الاسم:* ${app.name}\n`
    info += `📦 *الحزمة:* ${app.package}\n`
    info += `🕒 *آخر تحديث:* ${app.lastup}\n`
    info += `💾 *الحجم:* ${app.size}`

    await conn.sendFile(m.chat, app.icon, 'thumbnail.jpg', info, m)

    // فحص إذا كان التطبيق كبير الحجم
    let pesoNum = parseFloat(app.size.replace(/[^0-9.]/g, ''))
    let esGB = app.size.toLowerCase().includes('gb')
    if (esGB || pesoNum > 999) {
      await m.react('⚠️') // ملف ضخم جدًا
      return conn.reply(m.chat, '⚠️ التطبيق كبير الحجم ولا يمكن تحميله تلقائيًا.', m)
    }

    // تحميل التطبيق
    await conn.sendMessage(m.chat, {
      document: { url: app.dllink },
      mimetype: 'application/vnd.android.package-archive',
      fileName: `${app.name}.apk`
    }, { quoted: m })

    await m.react('✅') // تم بنجاح

  } catch (e) {
    console.error(e)
    await m.react('❌')
    conn.reply(m.chat, '❌ حدث خطأ أثناء تحميل التطبيق.', m)
  }
}

handler.tags = ['downloader']
handler.help = ['apk']
handler.command = ['apk', 'ابك']
handler.group = false
handler.register = true

export default handler