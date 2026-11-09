// • Feature : Instagram Search & Download
// • Developers : yertchi × Song
// • Channel : https://whatsapp.com/channel/0029Vb80wch30LKFioKenc2V

import fetch from 'node-fetch'
import * as pkg from '@whiskeysockets/baileys'
const { proto, generateWAMessageFromContent, generateWAMessageContent } = pkg

const handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    if (!args[0]) {
      return conn.reply(
        m.chat,
        `[❗️] استخدم الأمر هكذا:
${usedPrefix}${command} <كلمة البحث>
مثال: ${usedPrefix}${command} قطط مضحكة`,
        m
      )
    }

    const query = encodeURIComponent(args.join(' '))
    const searchUrl = `https://apex-api-five.vercel.app/api/v1/search/instagram?query=${query}`

    await conn.reply(m.chat, '⏳ جاري البحث في إنستغرام ...', m)

    const res = await fetch(searchUrl)
    const data = await res.json()

    if (!data.status || !data.results || data.results.length === 0)
      return conn.reply(m.chat, `❌ ما فيش نتائج ل "${args.join(' ')}"`, m)

    // تحميل أول 3 روابط فقط
    const cards = await Promise.all(
      data.results.slice(0, 3).map(async (url) => {
        try {
          const dl = await fetch(`https://apex-api-five.vercel.app/api/v1/download/instagram?url=${url}`)
          const contentType = dl.headers.get('content-type')

          let videoUrl = null
          let caption = 'منشور إنستغرام 🎬'

          if (contentType.includes('application/json')) {
            const j = await dl.json()
            if (j.status && j.result?.url) videoUrl = j.result.url
            if (j.result?.caption) caption = j.result.caption
          } else if (contentType.includes('video')) {
            // API أعاد فيديو مباشر
            videoUrl = `https://apex-api-five.vercel.app/api/v1/download/instagram?url=${url}`
          }

          if (!videoUrl) return null

          const videoMsg = await generateVideoMessage(conn, videoUrl)

          return {
            body: proto.Message.InteractiveMessage.Body.fromObject({ text: '' }),
            footer: proto.Message.InteractiveMessage.Footer.fromObject({
              text: '🎥 Instagram Reel'
            }),
            header: proto.Message.InteractiveMessage.Header.fromObject({
              title: caption,
              hasMediaAttachment: true,
              videoMessage: videoMsg
            }),
            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
              buttons: [
                {
                  name: 'cta_url',
                  buttonParamsJson: JSON.stringify({
                    display_text: '⬇️ تحميل الآن',
                    url: videoUrl,
                    merchant_url: videoUrl
                  })
                }
              ]
            })
          }
        } catch {
          return null
        }
      })
    )

    const validCards = cards.filter(c => c !== null)
    if (validCards.length === 0)
      return conn.reply(m.chat, '⚠️ لم يتم العثور على فيديوهات قابلة للتحميل.', m)

    const msg = generateWAMessageFromContent(
      m.chat,
      {
        viewOnceMessage: {
          message: {
            messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
            interactiveMessage: proto.Message.InteractiveMessage.fromObject({
              body: proto.Message.InteractiveMessage.Body.create({
                text: `📸 *نتائج البحث عن:* ${args.join(' ')}`
              }),
              footer: proto.Message.InteractiveMessage.Footer.create({
                text: '🔎 بواسطة: Dark API'
              }),
              header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: false }),
              carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
                cards: validCards
              })
            })
          }
        }
      },
      { quoted: m }
    )

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
  } catch (err) {
    console.error(err)
    conn.reply(m.chat, `❌ حصل خطأ أثناء جلب فيديوهات إنستغرام!\n\n${err}`, m)
  }
}

async function generateVideoMessage(conn, videoUrl) {
  const { videoMessage } = await generateWAMessageContent(
    { video: { url: videoUrl } },
    { upload: conn.waUploadToServer }
  )
  return videoMessage
}

handler.help = ['انستا <بحث>']
handler.tags = ['downloader']
handler.command = /^(ريلزات)$/i

export default handler