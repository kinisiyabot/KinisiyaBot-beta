import fs from 'fs'

let handler = async (m, { conn, text }) => {
  try {
    // تحميل ملف الميمز
    let memes = JSON.parse(fs.readFileSync('./src/JSON/memz.json'))
    
    if (!memes.length) {
      return m.reply('🚫 لا يوجد ميمز مضافة بعد.')
    }

    // اختيار فيديو عشوائي
    let meme = memes[Math.floor(Math.random() * memes.length)]

    // إرسال الفيديو
    await conn.sendMessage(m.chat, { video: { url: meme }, caption: '🤣 ميمز' }, { quoted: m })

  } catch (err) {
    console.error(err)
    m.reply('❌ حصل خطأ أثناء تشغيل الميمز.')
  }
}

handler.command = ['ميم']
export default handler