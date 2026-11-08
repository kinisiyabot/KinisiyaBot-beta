import fs from 'fs'

async function handler(m, {usedPrefix}) {

const user = m.sender.split('@')[0]
if (fs.existsSync(`./${jadi}/` + user + '/creds.json')) {
let token = Buffer.from(fs.readFileSync(`./${jadi}/` + user + '/creds.json'), 'utf-8').toString('base64')    

await conn.reply(m.chat, `${emoji} يتيح لك الرمز تسجيل الدخول إلى روبوتات أخرى، ونوصي بعدم مشاركته مع أي شخص. *الرمز الخاص بك هو:*`, m)
await conn.reply(m.chat, token, m)
} else {
await conn.reply(m.chat, `${emoji2} ليس لديك أي رموز نشطة، استخدم #jadibot لإنشاء واحدة..`, m)
}

}
handler.help = ['توكن']
handler.command = ['token']
handler.tags = ['serbot']
handler.private = true

export default handler 