import fetch from 'node-fetch'
import { xpRange } from '../lib/levelling.js'

let handler = async (m, { conn, usedPrefix, text, isPrems }) => {
  try {
    // صورة المنيو (تفضل ثابتة)
    let pp = await (await fetch('https://files.catbox.moe/qgu82u.jpg')).buffer()

    // صورة الشخص (تستخدم كـ thumbnail في الرابط)
    let img
    try {
      let userPP = await conn.profilePictureUrl(m.sender, 'image')
      img = await (await fetch(userPP)).buffer()
    } catch {
      img = await (await fetch('https://telegra.ph/file/0cf5ffb78a8914f20c07e.jpg')).buffer() // افتراضي لو معندوش صورة
    }

    let d = new Date(new Date + 3600000)
    let locale = 'ar'
    let week = d.toLocaleDateString(locale, { weekday: 'long' })
    let date = d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
    let _uptime = process.uptime() * 1000
    let uptime = clockString(_uptime)

    let user = global.db.data.users[m.sender]
    let { money, joincount, exp, limit, level, role } = user
    let { min, xp, max } = xpRange(level, global.multiplier)
    let taguser = '@' + m.sender.split("@s.whatsapp.net")[0]

    let str = `⎔⋅• ━ ╼╃ ⌬〔﷽〕⌬ ╄╾ ━ •⋅⎔
> 𝐋𝐀𝐂𝐊-Bot-MD
> 〔قـسـم الـتنـزيـلات┊ ˼‏ 🛡˹ 〕↶
*⎔⋅ ╼╃ ⊰ •﹝⚡﹞• ⊱ ╄╾ ⋅⎔*
            *لاك بــ🤖ــوت*
*⎔⋅ ╼╃ ⊰ •﹝⚡﹞• ⊱ ╄╾ ⋅⎔*
> 🛡 .ميجا
> 🛡 .افلام
> 🛡 .لوجوهات
> 🛡 .اديت
> 🛡 .اديت-سيارات
> 🛡 .apk
> 🛡 .اديت-كورة
> 🛡 .فديو
> 🛡 .صوره
> 🛡 .خلفيات
> 🛡 .ميديافاير
> 🛡 .اغنية
> 🛡 .تطبيق
*⎔⋅ ╼╃ ⊰ •﹝⚡﹞• ⊱ ╄╾ ⋅⎔*
*~⌬ تــ✍️︎ــوقــيــع ↡~*🖋
*𝐋𝐀𝐂𝐊-Bot-MD*
*⎔⋅ ╼╃ ⊰ •﹝⚡﹞• ⊱ ╄╾ ⋅⎔*`.trim()

    let buttonMessage = {
      image: pp, // صورة المنيو
      caption: str,
      mentions: [m.sender],
      footer: wm,
      headerType: 4,
      contextInfo: {
        mentionedJid: [m.sender],
        externalAdReply: {
          showAdAttribution: true,
          mediaType: 1,
          mediaUrl: null,
          title: "ASHURA-Team",
          body: null,
          thumbnail: img, // هنا صورة الشخص
          sourceUrl: "https://whatsapp.com/channel/0029VbApDTU3gvWhg95R4v2b"
        }
      }
    }

    conn.sendMessage(m.chat, buttonMessage, { quoted: m })

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, '[❗ خطأ في عرض القائمة ❗]', m)
  }
}

handler.command = /^(ق 4|قسم التنزيلات|ق4|ق_4)$/i
handler.exp = 20
handler.fail = null
export default handler

function clockString(ms) {
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':')
}