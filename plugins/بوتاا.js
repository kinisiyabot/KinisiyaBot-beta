import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'
import ws from 'ws'

async function handler(m, { conn, usedPrefix }) {
    const vsJB = '1.7.0(beta)'

    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)

    // 📂 عدد الجلسات
    const carpetaBase = path.resolve(__dirname, '..', 'FREDDY_WORLD')
    let cantidadCarpetas = 0

    if (fs.existsSync(carpetaBase)) {
        cantidadCarpetas = fs.readdirSync(carpetaBase, { withFileTypes: true })
            .filter(d => d.isDirectory()).length
    }

    // ⏱️ uptime
    const uptime = convertirMs(process.uptime() * 1000)

    // 👥 البوتات المتصلة
    const conns = Array.isArray(global.conns) ? global.conns : []
    const users = conns.filter(v =>
        v?.user &&
        v?.ws &&
        v.ws.readyState === ws.OPEN
    )

    // 🧾 قائمة البوتات
    const message = users.map((v, i) => {
        const jid = v.user.jid
        const dbUser = global.db?.data?.users?.[jid] || {}

        const botNumber = dbUser.privacy
            ? '[ مخفي للخصوصية ]'
            : `wa.me/${jid.replace(/\D/g, '')}?text=${usedPrefix}تنصيب`

        return `👤 \`[${i + 1}]\` *${v.user.name || dbUser.name || 'مجهول'}*
⏱️ \`\`\`${v.uptime ? convertirMs(Date.now() - v.uptime) : 'غير معروف'}\`\`\`
🩸 ${botNumber}`
    }).join('\n\n⸶⸶⸶⸶⸶⸶⸶⸶⸶⸶\n\n')

    const replyMessage = users.length === 0
        ? `*⚠️ لا يوجد بوت فرعي متاح حالياً*
🐈 wa.me/${conn.user.jid.replace(/\D/g, '')}?text=${usedPrefix}تنصيب`
        : message

    // 📦 الرسالة النهائية
    const responseMessage = `
*~⧼❆˹─━═┉⌯⤸◞🧭◜⤹⌯┉═━─˼❆⧽~*
*🧭┊⪼• ◈╷TAIME ⥏🧭⥑ KINISIYA BOT Beta╵◈*
*¦ ⌗╎بـرمـجـة الـمـطـور╎⌗ ¦*
> *~『◈yeritchi◈』~*

*~˼‏※⸃─┉┈┈⥏🧭⥑┈┈┉─⸂※ ˹~*
*⸂┊˼‏قائمة البوتات الفرعية V${vsJB} ¦↓⸃*
> *💠 عدد البوتات المتصلة: ${users.length}*
> *📁 عدد الجلسات: ${cantidadCarpetas}*
> *💻 وقت التشغيل: \`\`\`${uptime}\`\`\`*

${replyMessage}

*~⧼❆˹─━═┉⌯⤸◞🧭◜⤹⌯┉═━─˼❆⧽~*
`.trim()

    const images = [
        'https://qu.ax/spUwF.jpeg',
        'https://qu.ax/ZfKAD.jpeg',
        'https://qu.ax/UKUqX.jpeg'
    ]

    try {
        await conn.sendMessage(
            m.chat,
            {
                image: { url: images[Math.floor(Math.random() * images.length)] },
                caption: responseMessage
            },
            { quoted: m }
        )
    } catch {
        await conn.sendMessage(m.chat, { text: responseMessage }, { quoted: m })
    }
}

handler.command = /^(بوتات|bots|subsbots)$/i
export default handler

// ⏱️ تحويل الوقت
function convertirMs(ms) {
    const s = Math.floor(ms / 1000) % 60
    const m = Math.floor(ms / 60000) % 60
    const h = Math.floor(ms / 3600000) % 24
    const d = Math.floor(ms / 86400000)
    return [
        d ? `${d}d` : '',
        `${h}h`,
        `${m}m`,
        `${s}s`
    ].filter(Boolean).join(' ')
}