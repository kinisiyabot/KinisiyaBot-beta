import { exec } from 'child_process'
import { promisify } from 'util'
import axios from 'axios'
import fs from 'fs'
import path from 'path'

const execAsync = promisify(exec)

const BRAND = 'AnimeRift'
const DEFAULT_THUMB = 'https://i.postimg.cc/xkDFYjjR/upload-1765983116440.jpg'

async function resolveDirectUrl(url) {
  // حل رابط MediaFire
  if (url.includes('mediafire.com')) {
    try {
      const res = await axios.get(url, { 
        maxRedirects: 10,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      })
      const match = res.data.match(/href="(https:\/\/download\d+\.mediafire\.com\/[^"]+\.mp4[^"]*)"/)
      if (match) return match[1]
      const match2 = res.data.match(/["'](https:\/\/download\d+\.mediafire\.com\/[^"']+)["']/)
      if (match2) return match2[1]
    } catch (e) {}
    return url
  }

  // حل رابط KrakenCloud
  if (url.includes('krakencloud.net')) {
    try {
      const res = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Referer': 'https://krakencloud.net'
        },
        maxRedirects: 10
      })
      const mp4Match = res.data.match(/["'](https?:\/\/[^"']+\.mp4[^"']*)["']/)
      if (mp4Match) return mp4Match[1]
      const m3u8Match = res.data.match(/["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/)
      if (m3u8Match) return m3u8Match[1]
    } catch (e) {}
    return url
  }

  return url
}

async function convertToMp4(inputUrl, outputPath, maxSizeMB = 50) {
  const isHLS = inputUrl.includes('.m3u8')
  
  // حساب المدة المناسبة حسب الحجم المسموح
  const bitrateKbps = 400
  const maxSeconds = Math.floor((maxSizeMB * 8 * 1024) / bitrateKbps)
  
  const ffmpegCmd = isHLS
    ? `ffmpeg -y -i "${inputUrl}" -t ${maxSeconds} -c:v libx264 -preset ultrafast -crf 30 -vf "scale=480:-2" -c:a aac -b:a 64k -movflags +faststart "${outputPath}" 2>&1`
    : `ffmpeg -y -i "${inputUrl}" -t ${maxSeconds} -c:v libx264 -preset ultrafast -crf 30 -vf "scale=480:-2" -c:a aac -b:a 64k -movflags +faststart "${outputPath}" 2>&1`

  await execAsync(ffmpegCmd, { timeout: 300000 }) // 5 دقائق max
}

if (!global.animeRiftSessions) global.animeRiftSessions = {}

const handler = async (m, { conn, text = '', usedPrefix = '.', command = '' }) => {
  const chatId = m.chat
  const session = global.animeRiftSessions[chatId] || {}

  // استقبال الرابط مباشرة للتجربة
  if (command === 'تحويل-ريفت' || command === 'convertrift') {
    const videoUrl = text?.trim()
    if (!videoUrl) return m.reply(`⚠️ أرسل الرابط\n\nمثال: ${usedPrefix}تحويل-ريفت <رابط>`)

    const wait = await conn.sendMessage(chatId, { 
      text: `⏳ جاري تحويل الفيديو...\n🔗 ${videoUrl.substring(0, 60)}...` 
    }, { quoted: m })

    const tmpFile = path.join('/tmp', `rift_${Date.now()}.mp4`)

    try {
      await conn.sendMessage(chatId, { text: `🔍 فحص الرابط...` }, { quoted: m })
      const resolvedUrl = await resolveDirectUrl(videoUrl)
      
      await conn.sendMessage(chatId, { text: `🎬 تحويل الفيديو...\n⏱️ قد يستغرق 1-3 دقائق` }, { quoted: m })
      await convertToMp4(resolvedUrl, tmpFile)

      const stats = fs.statSync(tmpFile)
      const sizeMB = (stats.size / 1024 / 1024).toFixed(1)

      await conn.sendMessage(chatId, { text: `📤 جاري الإرسال... (${sizeMB} MB)` }, { quoted: m })

      await conn.sendMessage(chatId, {
        video: fs.readFileSync(tmpFile),
        caption: `✅ تم التحويل والإرسال\n📊 الحجم: ${sizeMB} MB\n\n${BRAND}`,
        mimetype: 'video/mp4'
      }, { quoted: m })

    } catch (err) {
      await m.reply(`❌ فشل التحويل\n\n🔧 الخطأ: ${err.message.substring(0, 200)}\n\n💡 الرابط:\n${videoUrl}`)
    } finally {
      try { fs.unlinkSync(tmpFile) } catch (e) {}
    }
    return
  }
}

handler.help = ['تحويل-ريفت <رابط>']
handler.tags = ['anime']
handler.command = /^(تحويل-ريفت|convertrift)$/i
export default handler