import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'
import { exec } from 'child_process'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 🧾 النصوص
const TEXT = {
  help:
`❌ الاستخدام:
.تحويل + رابط mp3
أو
رد على أي صوت واكتب:
.تحويل`,

  downloadError: '❌ فشل تحميل الصوت',
  ffmpegError: '❌ فشل تحويل الصوت',
  unknownError: '❌ خطأ غير متوقع'
}

let handler = async (m, { conn, text }) => {
  const inputPath = path.join(__dirname, `input_${Date.now()}.mp3`)
  const outputPath = path.join(__dirname, `ptt_${Date.now()}.ogg`)

  try {
    // 📥 من رد
    if (m.quoted && m.quoted.mimetype?.startsWith('audio')) {
      const buffer = await m.quoted.download()
      fs.writeFileSync(inputPath, buffer)

    // 🌐 من رابط
    } else if (text && text.startsWith('http')) {
      const res = await fetch(text)
      if (!res.ok) return m.reply(TEXT.downloadError)
      const buffer = await res.arrayBuffer()
      fs.writeFileSync(inputPath, Buffer.from(buffer))

    } else {
      return m.reply(TEXT.help)
    }

    // 🔄 تحويل بإعدادات واتساب العادية
    exec(
      `ffmpeg -y -i "${inputPath}" -vn -c:a libopus -b:a 32k -ar 48000 -ac 1 "${outputPath}"`,
      async (err) => {
        if (err) {
          console.error(err)
          return m.reply(TEXT.ffmpegError)
        }

        const ptt = fs.readFileSync(outputPath)

        await conn.sendMessage(
          m.chat,
          {
            audio: ptt,
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true
          },
          { quoted: m }
        )

        fs.unlinkSync(inputPath)
        fs.unlinkSync(outputPath)
      }
    )

  } catch (e) {
    console.error(e)
    m.reply(TEXT.unknownError)
  }
}

handler.command = ['تحويل']
export default handler