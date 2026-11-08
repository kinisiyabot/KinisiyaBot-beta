// • Developers : yeritchi
// • Channel : https://whatsapp.com/channel/0029Vb80wch30LKFioKenc2V
import axios from 'axios'
import FormData from 'form-data'

import pkg from 'baileys-pro'
const { generateWAMessageContent, generateWAMessageFromContent, proto } = pkg

// دالة رفع الصورة إلى Catbox
async function uploadToCatbox(buffer) {
  try {
    const form = new FormData()
    form.append('reqtype', 'fileupload')
    form.append('fileToUpload', buffer, { filename: 'image.jpg' })

    const response = await axios.post('https://catbox.moe/user/api.php', form, {
      headers: form.getHeaders()
    })

    return response.data
  } catch (error) {
    throw new Error('فشل رفع الصورة إلى Catbox')
  }
}

let handler = async (m, { conn }) => {
  const q = m.quoted
  if (!q || !q.mimetype || !q.mimetype.startsWith('image/')) {
    return m.reply('❌ يرجى الرد على *صورة* لإجراء البحث.')
  }

  try {
    await m.react('⌛')
    await conn.reply(m.chat, '> 🔍 *جاري رفع الصورة والبحث باستخدام Pinterest Lens...*', m)

    const buffer = await q.download()
    if (!buffer || buffer.length === 0) {
      return m.reply('❌ فشل في تحميل الصورة من الرسالة.')
    }

    // رفع الصورة إلى Catbox
    const imageUrl = await uploadToCatbox(buffer)
    
    if (!imageUrl) {
      return m.reply('❌ فشل في رفع الصورة، حاول مرة أخرى.')
    }

    // البحث باستخدام Pinterest Lens
    const { data } = await axios.get(
      `https://apex-api-five.vercel.app/api/v1/search/pinlens?imageUrl=${encodeURIComponent(imageUrl)}`
    )

    if (!data?.status || !data?.results || data.results.length === 0) {
      await m.react("❌")
      return m.reply('❌ لم يتم العثور على نتائج مشابهة على Pinterest.')
    }

    const results = data.results.slice(0, 10)

    async function createImageMessage(url) {
      const { imageMessage } = await generateWAMessageContent(
        { image: { url } },
        { upload: conn.waUploadToServer }
      )
      return imageMessage
    }

    const decorationTop = '༺┏⌟─໋─໋━᮫⃔⁺˚*•̩̩͙✩•̩̩͙*━᮫⃔─໋─໋⌜┓༻'
    const decorationBottom = '༺┗⌜─໋─໋━᮫⃔⁺˚*•̩̩͙✩•̩̩͙*━᮫⃔─໋─໋⌟┛༻'
    const botCredit = '♡︎✿︎𝐊𝐈𝐍𝐈𝐒𝐈𝐘𝐀 𝐁𝐎𝐓ꨄ︎ఌ'

    let cards = []
    for (let i = 0; i < results.length; i++) {
      const item = results[i]
      const image = item.image
      if (!image) continue

      const title = item.title || 'بدون عنوان'
      const description = item.description || 'لا يوجد وصف'
      const pinnerName = item.pinner?.full_name || item.pinner?.username || 'غير معروف'
      const boardName = item.board?.name || 'غير معروفة'
      const createdAt = item.createdAt || 'غير متوفر'

      const caption = `
${decorationTop}
┠ְ᳹ᩖ7🎭᠀ ͜ 📌 *نتيجة رقم:* ${i + 1}
┠ְ᳹ᩖ7🎭᠀ ͜ 📝 *العنوان:* ${title}
┠ְ᳹ᩖ7🎭᠀ ͜ 👤 *المستخدم:* ${pinnerName}
┠ְ᳹ᩖ7🎭᠀ ͜ 📂 *اللوحة:* ${boardName}
┠ְ᳹ᩖ7🎭᠀ ͜ 💬 *الوصف:* ${description.substring(0, 100)}${description.length > 100 ? '...' : ''}
┠ְ᳹ᩖ7🎭᠀ ͜ 🕒 *تاريخ الإنشاء:* ${createdAt}
${decorationBottom}
${botCredit}`.trim()

      cards.push({
        body: proto.Message.InteractiveMessage.Body.fromObject({
          text: caption
        }),
        header: proto.Message.InteractiveMessage.Header.fromObject({
          hasMediaAttachment: true,
          imageMessage: await createImageMessage(image)
        }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
          buttons: [{
            name: "cta_url",
            buttonParamsJson: JSON.stringify({
              display_text: "📌 افتح في Pinterest",
              url: item.pinLink || "https://pinterest.com"
            })
          }]
        })
      })
    }

    const headerText = `
${decorationTop}
┠ְ᳹ᩖ7🎭᠀ ͜ 📸 *عرض أفضل النتائج المشابهة*
┠ְ᳹ᩖ7🎭᠀ ͜ 🔍 *Pinterest Lens Search*
┠ְ᳹ᩖ7🎭᠀ ͜ 📊 *عدد النتائج:* ${results.length}
${decorationBottom}
${botCredit}`

    const finalMessage = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          interactiveMessage: proto.Message.InteractiveMessage.fromObject({
            body: proto.Message.InteractiveMessage.Body.create({
              text: headerText
            }),
            carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
              cards
            })
          })
        }
      }
    }, { quoted: m })

    await m.react("✅")
    await conn.relayMessage(m.chat, finalMessage.message, { messageId: finalMessage.key.id })

  } catch (err) {
    console.error('❌ خطأ أثناء تنفيذ Pinterest Lens:', err)
    await m.react("❌")
    m.reply('❌ حدث خطأ أثناء معالجة الصورة أو الاتصال بـ Pinterest Lens:\n' + (err.message || err))
  }
}

handler.help = ['عدسة']
handler.tags = ['search']
handler.command = /^(عدسة|عدسه|lens)$/i

export default handler