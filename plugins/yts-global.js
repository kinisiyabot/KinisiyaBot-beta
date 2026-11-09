// • Developers : SONG × yertchi
// • Channel : https://whatsapp.com/channel/0029Vb80wch30LKFioKenc2V
// • youtub channel : https://www.youtube.com/@yekay6
// • teiligram Channel : https://t.me/yertchi_kunusua
import axios from 'axios'

const handler = async (m, { conn, args, command }) => {
  if (!args[0]) return m.reply(`❗ *الاستخدام الصحيح:*\n- *${command} <رابط يوتيوب>*\n\n📥 *أوامر الصوت:*\n- ytmp3-128 (MP3 128kbps)\n- ytmp3-320 (MP3 320kbps)\n- ytflac (FLAC)\n- ytwav (WAV)\n- ytwebm (WebM)\n- ytogg (OGG)\n\n📹 *أوامر الفيديو:*\n- yt144 (144p)\n- yt240 (240p)\n- yt360 (360p)\n- yt480 (480p)\n- yt720 (720p)\n- yt1080 (1080p)\n- yt1440 (1440p)\n- yt4k (4K)`)

  const url = args[0]
  if (!/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//.test(url))
    return m.reply('❌ يرجى إدخال رابط يوتيوب صالح.')

  let type = 'video'
  let quality = '360'
  let qualityLabel = '360p'

  // ========== أوامر الصوت ==========
  if (command === 'ytmp3-128') {
    type = 'audio'
    quality = 'mp3_128'
    qualityLabel = 'MP3 128kbps'
  } 
  else if (command === 'ytmp3-320') {
    type = 'audio'
    quality = 'mp3_320'
    qualityLabel = 'MP3 320kbps'
  }
  else if (command === 'ytflac') {
    type = 'audio'
    quality = 'flac'
    qualityLabel = 'FLAC'
  }
  else if (command === 'ytwav') {
    type = 'audio'
    quality = 'wav'
    qualityLabel = 'WAV'
  }
  else if (command === 'ytwebm') {
    type = 'audio'
    quality = 'webm'
    qualityLabel = 'WebM Audio'
  }
  else if (command === 'ytogg') {
    type = 'audio'
    quality = 'ogg'
    qualityLabel = 'OGG'
  }
  
  // ========== أوامر الفيديو ==========
  else if (command === 'yt144') {
    type = 'video'
    quality = '144'
    qualityLabel = '144p'
  }
  else if (command === 'yt240') {
    type = 'video'
    quality = '240'
    qualityLabel = '240p'
  }
  else if (command === 'yt360') {
    type = 'video'
    quality = '360'
    qualityLabel = '360p'
  }
  else if (command === 'yt480') {
    type = 'video'
    quality = '480'
    qualityLabel = '480p'
  }
  else if (command === 'yt720') {
    type = 'video'
    quality = '720'
    qualityLabel = '720p'
  }
  else if (command === 'yt1080') {
    type = 'video'
    quality = '1080'
    qualityLabel = '1080p'
  }
  else if (command === 'yt1440') {
    type = 'video'
    quality = '1440'
    qualityLabel = '1440p'
  }
  else if (command === 'yt4k') {
    type = 'video'
    quality = '4k'
    qualityLabel = '4K'
  }

  try {
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } })

    const { data } = await axios.get(`${global.API_BASE}/api/v1/download/YTDL`, {
      params: { url, type, quality }
    })

    if (!data.status || !data.data?.url)
      return m.reply(`❌ تعذر الحصول على رابط التحميل.`)

    const { title, url: downloadUrl, source } = data.data

    if (type === 'audio') {
      await conn.sendMessage(m.chat, {
        audio: { url: downloadUrl },
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`
      }, { quoted: m })
      
      await m.reply(`✅ *تم التحميل!*\n🎵 *العنوان:* ${title}\n🎧 *الجودة:* ${qualityLabel}\n📡 *المصدر:* ${source}`)
    } else {
      await conn.sendMessage(m.chat, {
        video: { url: downloadUrl },
        caption: `✅ *تم التحميل!*\n🎬 *العنوان:* ${title}\n📹 *الجودة:* ${qualityLabel}\n📡 *المصدر:* ${source}`
      }, { quoted: m })
    }

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } })

  } catch (e) {
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } })
    m.reply(`❌ خطأ أثناء التحميل: ${e.response?.data?.message || e.message}`)
  }
}

handler.help = [
  // Audio
  'ytmp3-128', 'ytmp3-320', 'ytflac', 'ytwav', 'ytwebm', 'ytogg',
  // Video
  'yt144', 'yt240', 'yt360', 'yt480', 'yt720', 'yt1080', 'yt1440', 'yt4k'
]

handler.command = [
  // Audio Commands
  'ytmp3-128', 'ytmp3-320', 'ytflac', 'ytwav', 'ytwebm', 'ytogg',
  // Video Commands
  'yt144', 'yt240', 'yt360', 'yt480', 'yt720', 'yt1080', 'yt1440', 'yt4k'
]

handler.tags = ['downloader']

export default handler