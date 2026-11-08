import { writeFileSync, readFileSync, mkdirSync } from 'fs'
import { unlink } from 'fs/promises'
import { join } from 'path'
import { spawn } from 'child_process'
import os from 'os'

const isFFmpegAvailable = () => {
  try {
    const path = require('child_process').execSync('which ffmpeg', { encoding: 'utf8' }).trim()
    return !!path
  } catch {
    return false
  }
}

const isValidAudio = async (filePath) => {
  try {
    const result = require('child_process').execFileSync('ffprobe', [
      '-v', 'error',
      '-select_streams', 'a:0',
      '-show_entries', 'stream=codec_type',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      filePath
    ], { encoding: 'utf8' })
    return result.trim() === 'audio'
  } catch {
    return false
  }
}

const safeFFmpeg = (input, output, filters, m) => {
  return new Promise(resolve => {
    const timeout = setTimeout(() => {
      try { ff.kill('SIGTERM') } catch {}
      m.reply('⚠️ استغرق المعالجة وقتًا طويلاً وتم إلغاؤها.')
      resolve(false)
    }, 60000) // 60 ثانية

    try {
      const ff = spawn('ffmpeg', ['-y', '-i', input, ...filters, output], {
        stdio: ['ignore', 'ignore', 'pipe']
      })

      ff.stderr.on('data', d => console.log('FFmpeg:', d.toString()))
      ff.on('error', err => {
        clearTimeout(timeout)
        console.log('FFmpeg Error:', err)
        m.reply('⚠️ حدث خطأ أثناء معالجة الصوت')
        resolve(false)
      })
      ff.on('close', code => {
        clearTimeout(timeout)
        if (code === 0) resolve(true)
        else {
          console.log('FFmpeg exited with code', code)
          m.reply('⚠️ فشل ffmpeg برمز خروج ' + code)
          resolve(false)
        }
      })
    } catch (err) {
      clearTimeout(timeout)
      console.log('FFmpeg try/catch:', err)
      m.reply('⚠️ حدث خطأ أثناء تشغيل ffmpeg')
      resolve(false)
    }
  })
}

let handler = async (m, { conn, __dirname, usedPrefix, command }) => {
  if (!isFFmpegAvailable()) {
    return m.reply('❌ ffmpeg غير مثبت. شغّل:\n```pkg install ffmpeg```')
  }

  let inputPath, outputPath
  const tmpDir = os.tmpdir()

  try {
    mkdirSync(tmpDir, { recursive: true })

    const audioMsg = m.quoted?.msg?.audioMessage || 
                     m.quoted?.msg?.voiceMessage || 
                     m.message?.audioMessage || 
                     m.message?.voiceMessage
                     
    if (!audioMsg) return m.reply(`رد على الصوت الذي تريد تحويله، استخدم الامر التالي ${usedPrefix + command}`)

    let downloadFn = m.quoted?.download || m.download
    if (!downloadFn || typeof downloadFn !== 'function') {
      return m.reply('⚠️ لا يمكن تنزيل هذا الملف الصوتي')
    }

    let buffer
    try {
      buffer = await downloadFn()
    } catch (err) {
      console.error('فشل التنزيل:', err)
      return m.reply('⚠️ فشل تنزيل الصوت')
    }

    if (!buffer) return m.reply('⚠️ لم يتم استلام بيانات الصوت')
    if (buffer.length > 20 * 1024 * 1024) return m.reply('⚠️ الصوت كبير جدًا (أقصى حد 20MB)')

    const rand = Math.random().toString(36).substring(2, 8)
    inputPath = join(tmpDir, 'input-' + Date.now() + '-' + rand + '.mp3')
    outputPath = join(tmpDir, 'output-' + Date.now() + '-' + rand + '.mp3')

    writeFileSync(inputPath, buffer)

    // --- اختيار الفلتر ---
    const filtersMap = {
      'عميق': ['-af', 'equalizer=f=94:width_type=o:width=2:g=30'],
      'منفوخ': ['-af', 'acrusher=.1:1:64:0:log'],
      'تخين': ['-af', 'atempo=4/4,asetrate=44500*2/3'],
      'صاخب': ['-af', 'volume=12'],
      'سريع': ['-filter:a', 'atempo=1.63,asetrate=44100'],
      'تخينن': ['-filter:a', 'atempo=1.6,asetrate=22100'],
      'رفيع': ['-filter:a', 'atempo=1.06,asetrate=44100*1.25'],
      'تقطيع': ['-filter_complex', 'areverse'],
      'روبوت': ['-filter_complex', 'afftfilt=real=\'hypot(re,im)*sin(0)\':imag=\'hypot(re,im)*cos(0)\':win_size=512:overlap=0.75'],
      'بطيء': ['-filter:a', 'atempo=0.7,asetrate=44100'],
      'ناعم': ['-af', 'asetrate=44100*0.9,atempo=1.1'],
      'سنجاب': ['-filter:a', 'atempo=0.5,asetrate=65100']
    }

    const set = filtersMap[command] || []
    if (set.length === 0) {
      return m.reply('❌ التأثير غير معروف')
    }

    // ⬇️ رسالة بدء المعالجة ⬇️
    await m.reply('⏳ جارٍ تطبيق التأثير الصوتي... يرجى الانتظار.')

    const success = await safeFFmpeg(inputPath, outputPath, set, m)
    if (!success) return

    if (!(await isValidAudio(outputPath))) {
      return m.reply('⚠️ فشل إنشاء ملف صوتي صالح')
    }

    // ⬇️ رسالة نجاح ⬇️
    await m.reply('✅ تم! إليك صوتك بعد التأثير.')

    const final = readFileSync(outputPath)
    await conn.sendMessage(m.chat, { audio: final, mimetype: 'audio/mpeg', ptt: true }, { quoted: m })

  } catch (e) {
    console.log('Handler error:', e)
    m.reply('⚠️ حدث خطأ غير متوقع أثناء معالجة الصوت')
  } finally {
    if (inputPath) try { await unlink(inputPath) } catch (e) { console.log('فشل حذف input:', e) }
    if (outputPath) try { await unlink(outputPath) } catch (e) { console.log('فشل حذف output:', e) }
  }
}

handler.help = ['عميق','منفوخ','تخين','صاخب','سريع','تخينن','رفيع','تقطيع','روبوت','بطيء','ناعم','سنجاب'].map(v => v+' [vn]')
handler.tags = ['audio']
handler.command = /^(عميق|منفوخ|تخين|صاخب|سريع|تخينن|رفيع|تقطيع|روبوت|بطيء|ناعم|سنجاب)$/i
export default handler