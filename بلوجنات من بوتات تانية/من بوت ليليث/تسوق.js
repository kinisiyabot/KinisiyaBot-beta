const items = ['diamond', 'exp']
let confirmation = {}

async function handler(m, { conn, args, usedPrefix, command }) {
    if (confirmation[m.sender]) return m.reply('انت بتعمل تحويل دلوقتي')
    let user = global.db.data.users[m.sender]
    const item = items.filter(v => v in user && typeof user[v] == 'number')
    let lol = `✳️ الاستخدام الصح للامر 
*${usedPrefix + command}*  [النوع] [كمية] [@user]

📌 مثال: 
*${usedPrefix + command}* exp 65 @${m.sender.split('@')[0]}

📍 الحاجات اللي ممكن تحولها
┌──────────────
▢ *diamond* = الماس 💎
▢ *exp* = الخبرة 🆙
└──────────────
`.trim()
    const type = (args[0] || '').toLowerCase()
    if (!item.includes(type)) return conn.reply(m.chat, lol, m, { mentions: [m.sender] })
    const count = Math.min(Number.MAX_SAFE_INTEGER, Math.max(1, (isNumber(args[1]) ? parseInt(args[1]) : 1))) * 1
    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : args[2] ? (args[2].replace(/[@ .+-]/g, '') + '@s.whatsapp.net') : ''
    if (!who) return m.reply('✳️ لازم تشير لحد')
    if (!(who in global.db.data.users)) return m.reply(`✳️ الشخص ده مش موجود في قاعدة البيانات عندي`)
    if (user[type] * 1 < count) return m.reply(`✳️  *${type}*  مش كفاية عشان تحول`)
    let confirm = `
هل أنت متأكد أنك عايز تحول *${count}* _*${type}*_ لـ *@${(who || '').replace(/@s\.whatsapp\.net/g, '')}* ؟ 

- عندك *60 ثانية* 
_رد بـ *نعم* أو *لا*_
`.trim()

    //conn.sendButton(m.chat, confirm, fgig, null, [['نعم'], ['لا']], m, { mentions: [who] })
    m.reply(confirm, null, { mentions: [who] })
    confirmation[m.sender] = {
        sender: m.sender,
        to: who,
        message: m,
        type,
        count,
        timeout: setTimeout(() => (m.reply('⏳ الوقت خلص'), delete confirmation[m.sender]), 60 * 1000)
    }
}

handler.before = async m => {
    if (m.isBaileys) return
    if (!(m.sender in confirmation)) return
    if (!m.text) return
    let { timeout, sender, message, to, type, count } = confirmation[m.sender]
    if (m.id === message.id) return
    let user = global.db.data.users[sender]
    let _user = global.db.data.users[to]
    if (/لا?/g.test(m.text.toLowerCase())) {
        clearTimeout(timeout)
        delete confirmation[sender]
        return m.reply('✅ التحويل اتلغى')
    }
    if (/نعم?/g.test(m.text.toLowerCase())) {
        let previous = user[type] * 1
        let _previous = _user[type] * 1
        user[type] -= count * 1
        _user[type] += count * 1
        if (previous > user[type] * 1 && _previous < _user[type] * 1) m.reply(`✅ التحويل \n\n*${count}* *${type}*  لـ @${(to || '').replace(/@s\.whatsapp\.net/g, '')}`, null, { mentions: [to] })
        else {
            user[type] = previous
            _user[type] = _previous
            m.reply(`❎ حصل خطأ في تحويل *${count}* ${type} لـ *@${(to || '').replace(/@s\.whatsapp\.net/g, '')}*`, null, { mentions: [to] })
        }
        clearTimeout(timeout)
        delete confirmation[sender]
    }
}

handler.help = ['transfer'].map(v => v + ' [نوع] [كمية] [@تاج]')
handler.tags = ['econ']
handler.command = ['payxp','paydi', 'شراء', 'darxp','dardi',]

handler.disabled = false

export default handler

function isNumber(x) {
    return !isNaN(x)
}