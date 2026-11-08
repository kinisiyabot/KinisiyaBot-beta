import { prepareWAMessageMedia, generateWAMessageFromContent } from 'baileys-pro'
import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  try {
    let audioUrl = 'https://raw.githubusercontent.com/fazbear-Official/uploads/main/uploads/upload-1773411097762.mp3'
    let thumbnailUrl = 'https://raw.githubusercontent.com/fazbear-Official/uploads/main/uploads/upload-1773411006894.jpg'
    let videoLink = 'https://youtube.com/watch?v=tRf0pd5FS-I&si=A7Vl3LcKR9FPaSsT'

 
    let thumbArray = await (await fetch(thumbnailUrl)).arrayBuffer()
    let thumb = Buffer.from(thumbArray)

   
    let message = await prepareWAMessageMedia(
      { audio: { url: audioUrl }, mimetype: 'audio/ogg; codecs=opus' }, 
      { upload: conn.waUploadToServer }
    )


    let durationSeconds = 180
    let durationMilliseconds = durationSeconds * 1000

    const template = generateWAMessageFromContent(
      m.chat,
      {
        audioMessage: {
          ...message.audioMessage,
          duration: durationMilliseconds,
          contextInfo: {
            externalAdReply: {
              title: 'WELCOME TO KINISIYA BOT BETA',
              body: '© 2026 ༄𝐈𝐌 𝐘𝐄𝐑𝐈𝐓𝐂𝐇𝐈༆',
              mediaType: 2,
              thumbnail: thumb,
              mediaUrl: videoLink,
              renderLargerThumbnail: true
            }
          }
        }
      },
      { quoted: m }
    )

    conn.relayMessage(m.chat, template.message, { messageId: template.key.id })

  } catch (e) {
    console.log(e)
    m.reply('حصل خطأ 😢')
  }
}

handler.customPrefix = /^(بوت|يا بوت)$/i
handler.command = new RegExp() // يشتغل مع الكاستوم برفيكس فقط

export default handler