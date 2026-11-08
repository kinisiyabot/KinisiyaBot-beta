import yts from 'yt-search'
import pkg from 'baileys-pro'
const { generateWAMessageFromContent, proto, prepareWAMessageMedia } = pkg

let handler = async (m, { conn, text }) => {
  if (!text) return conn.sendMessage(
    m.chat,
    { text: "❌ ضع رابط الفيديو.\nمثال: .تفاصيل https://youtu.be/@yekay6" },
    { quoted: m }
  )

  try {
    let search = await yts(text)
    if (!search || !search.videos || !search.videos.length)
      return conn.sendMessage(m.chat, { text: "❌ لم أجد أي نتائج." }, { quoted: m })

    let video = search.videos[0]
    let url = video.url

    let caption = `
🎬 *العنوان:* ${video.title}
📺 *القناة:* ${video.author.name}
⏱ *المدة:* ${video.timestamp}
📅 *تاريخ الإصدار:* ${video.ago}
🔗 *الرابط:* ${url}
`

    // ✅ ليست زرين (تحميل صوت / تحميل فيديو)
    let sections = [
      {
        title: "⚡ اختر نوع التحميل",
        rows: [
          {
            header: "🩸 تحميل صوت",
            title: "MP3",
            description: "تحميل كملف صوتي",
            id: `.اغنيه ${url}`
          },
          {
            header: "📹 تحميل فيديو",
            title: "MP4",
            description: "تحميل كفيديو بجودة مناسبة",
            id: `.فيديو ${url}`
          }
        ]
      }
    ]

    let listMessage = {
      title: "🎬 خيارات التحميل",
      sections,
      buttonText: "📂 عرض الخيارات"
    }

    let imgMsg = await prepareWAMessageMedia({ image: { url: video.thumbnail } }, { upload: conn.waUploadToServer })

    const msg = generateWAMessageFromContent(
      m.chat,
      {
        viewOnceMessage: {
          message: {
            interactiveMessage: proto.Message.InteractiveMessage.create({
              body: proto.Message.InteractiveMessage.Body.create({ text: caption }),
              footer: proto.Message.InteractiveMessage.Footer.create({ text: "اختر نوع التحميل 👇" }),
              header: proto.Message.InteractiveMessage.Header.create({
                hasMediaAttachment: true,
                imageMessage: imgMsg.imageMessage
              }),
              nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                buttons: [
                  {
                    name: "single_select",
                    buttonParamsJson: JSON.stringify(listMessage)
                  }
                ]
              })
            })
          }
        }
      },
      { userJid: m.sender }
    )

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })

  } catch (e) {
    console.error(e)
    conn.sendMessage(m.chat, { text: "❌ حصل خطأ أثناء جلب التفاصيل." }, { quoted: m })
  }
}

handler.command = /^تفاصيل$/i
export default handler