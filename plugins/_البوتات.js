import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'
import ws from 'ws'

async function handler(m, { conn }) {

  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)

  // مسار الجلسات
  const carpetaBase = path.resolve(__dirname, '..', 'KinisiyaBot-MD')
  let cantidadCarpetas = 0

  try {
    cantidadCarpetas = fs.readdirSync(carpetaBase, { withFileTypes: true })
      .filter(dir => dir.isDirectory()).length
  } catch {}

  // وقت تشغيل السيرفر
  const uptime = convertirMs(process.uptime() * 1000)

  // تأمين conns
  const conns = Array.isArray(global.conns) ? global.conns : []

  const users = conns.filter(
    c =>
      c?.user &&
      c?.ws?.socket &&
      c.ws.socket.readyState !== ws.CLOSED
  )

  const message = users.map((v, index) => {

    const userDB = global.db?.data?.users?.[v.user.jid] || {}
    const hidden = userDB.privacy === true

    const botNumber = hidden
      ? '[ مـخـفـي بـسـبـب الـخـصـوصـيـة ]'
      : `wa.me/${v.user.jid.replace(/[^0-9]/g, '')}?text=.تنصيب`

    const prestarStatus =
      !hidden && userDB.prestar
        ? '✅ يـمـكـن اسـتـعـارة الـبـوت لإدخاله جروبات'
        : ''

    return `🔞┊≡ ◡̈⃝🫦 ↜🐍 الـرقـم: [${index + 1}]
🎤┊≡ ◡̈⃝🫦 ↜🤖 الاسـم: ${v.user.name || userDB.name || 'مجهول'}
❄️┊ ۬.͜ـ🫦˖ ↜⏱️ الـتـشـغـيـل: \`\`\`${v.uptime ? convertirMs(Date.now() - v.uptime) : 'غير معروف'}\`\`\`
╮─ׅ─๋︩︪─┈─๋︩︪─═⊐‹✨›⊏═┈─๋︩︪─
┤─ׅ─ׅ┈ ─๋︩︪──ׅ─ׅ┈ ─๋︩︪─☇
┤┌
│┊💠 الـرابـط: ${botNumber}
│┊${prestarStatus}
┤└─ׅ─ׅ┈ ─๋︩︪──ׅ─ׅ┈ ─๋︩︪☇`
  }).join('\n\n')

  const replyMessage = message.length
    ? message
    : `🔞┊≡ ◡̈⃝🫦 ↜❌ لا يـوجـد سـب بـوت مـتـصـل حـالـيـاً
🎤┊≡ ◡̈⃝🫦 ↜↜ جـرب لاحـقـاً
❄️┊ ۬.͜ـ🫦˖ ↜🐈 wa.me/${conn.user.jid.replace(/[^0-9]/g, '')}?text=.تنصيب
╮─ׅ─๋︩︪─┈─๋︩︪─═⊐‹✨›⊏═┈─๋︩︪─`

  const responseMessage = `
🔞┊≡ ◡̈⃝🫦 ↜☄️ قـائـمـة الــبـوتـات
🎤┊≡ ◡̈⃝🎼↜✨ مـمـيـزات
❄️┊ ۬.͜ـ🐍˖ ↜↜ إتـصـال تـلـقـائـي
╮─ׅ─๋︩︪─┈─๋︩︪─═⊐‹✨›⊏═┈─๋︩︪─
┤─ׅ─ׅ┈ ─๋︩︪──ׅ─ׅ┈ ─๋︩︪─☇
┤┌
│┊↜ إنـشـاء سـب بـوت مـن أي سـب بـوت
┤└─ׅ─ׅ┈ ─๋︩︪──ׅ─ׅ┈ ─๋︩︪☇
╯─ׅ─๋︩︪─┈─๋︩︪─═⊐‹♻️›⊏═┈─๋︩︪⊐

*⧉┆📊 الإحـصـائـيـات*
*⧉┆↜ البـوتـات الـمـتـصـلـة:* ${users.length}
*⧉┆↜ الـجـلـسـات الـمـنـشـأة:* ${cantidadCarpetas}
*⧉┆↜ الـجـلـسـات الـنـشـطـة:* ${users.length}
*⧉┆💻 الـسـيـرفـر:* \`\`\`${uptime}\`\`\`

${replyMessage}
`.trim()

  try {
    await conn.sendMessage(
      m.chat,
      {
        image: { url: 'https://files.catbox.moe/h01lpd.jpg' },
        caption: responseMessage
      },
      { quoted: m }
    )
  } catch {
    await conn.sendMessage(m.chat, { text: responseMessage }, { quoted: m })
  }
}

handler.command = /^(قائمة_البوتات|البوتات|بوتات|bots)$/i
export default handler

function convertirMs(ms) {
  const s = Math.floor(ms / 1000) % 60
  const m = Math.floor(ms / 60000) % 60
  const h = Math.floor(ms / 3600000) % 24
  const d = Math.floor(ms / 86400000)
  return [d ? `${d}d` : '', `${h}h`, `${m}m`, `${s}s`]
    .filter(Boolean)
    .join(' ')
}