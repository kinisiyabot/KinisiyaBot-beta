import { 
useMultiFileAuthState,
DisconnectReason,
prepareWAMessageMedia,
generateWAMessageFromContent, 
makeCacheableSignalKeyStore, 
fetchLatestBaileysVersion
 } from '@whiskeysockets/baileys';
import qrcode from "qrcode"
import NodeCache from "node-cache"
import fs from "fs"
import path from "path"
import pino from 'pino'
import chalk from 'chalk'
import util from 'util' 
import * as ws from 'ws'
import { getDevice } from '@whiskeysockets/baileys'

// دالــة الــتــرجــمــة مــع قــيــمــة افــتــراضــيــة
const tr = text => text || "نــص افــتــراضــي";

const { child, spawn, exec } = await import('child_process')
const { CONNECTING } = ws
import { makeWASocket } from '../lib/simple.js'
import { fileURLToPath } from 'url'

let crm1 = "Y2QgcGx1Z2lucy"
let crm2 = "A7IG1kNXN1b"
let crm3 = "SBpbmZvLWRvbmFyLmpz"
let crm4 = "IF9hdXRvcmVzcG9uZGVyLmpzIGluZm8tYm90Lmpz"
let drm1 = "CkphZGlib3QsIEhlY2hv"
let drm2 = "IHBvciBAQWlkZW5fTm90TG9naWM"

let rtx = `⛄┊≡ ◡̈⃝🍷↜♡︎✿︎𝑲𝑰𝑵𝑰𝑺𝑰𝒀𝑨ఌ
🎤┊≡ ◡̈⃝🎼↜اســتــخــدم هــذا الــكــود لــتــصــبــح بــوت فــرعــي
❄️┊ ۬.͜ـ🧸˖ ↜ الــخــطــوات كــالــتــالــي
*❍━━━══━━❪🫦❫━━══━━━❍*
┤─ׅ─ׅ┈ ─๋︩︪──ׅ─ׅ┈ ─๋︩︪─☇
┤┌
│┊𝟣 : اضــغــط عــلــى الــثــلاث نــقــاط
│┊𝟤 : اضــغــط عــلــى الأجــهــزة الــمــرتــبــطــة
│┊𝟥 : امــســح الـرمـز هــذا
┤└─ׅ─ׅ┈ ─๋︩︪──ׅ─ׅ┈ ─๋︩︪☇
*❍━━━══━━❪🫦❫━━══━━━❍*`

let rtx2 = `⛄┊≡ ◡̈⃝🍷↜♡︎✿︎𝐊𝐈𝐍𝐈𝐒𝐈𝐘𝐀 𝐁𝐎𝐓ఌ
🎤┊≡ ◡̈⃝🎼↜اســتــخــدم هــذا الــكــود لــتــصــبــح بــوت فــرعــي
❄️┊ ۬.͜ـ🐍˖ ↜ الــخــطــوات كــالــتــالــي

*❍━━━══━━❪🫦❫━━══━━━❍*
┤─ׅ─ׅ┈ ─๋︩︪──ׅ─ׅ┈ ─๋︩︪─☇
┤┌
│┊𝟣 : اضــغــط عــلــى الــثــلاث نــقــاط
│┊𝟤 : اضــغــط عــلــى الأجــهــزة الــمــرتــبــطــة
│┊𝟥 : اخــتــر ربــط مــع رقــم الــهــاتــف
│┊𝟦 : اكــتــب الــكــود
┤└─ׅ─ׅ┈ ─๋︩︪──ׅ─ׅ┈ ─๋︩︪☇
*❍━━━══━━❪🫦❫━━══━━━❍*`

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const freddyJBOptions = {}
const retryMap = new Map()
const maxAttempts = 5
if (global.conns instanceof Array) console.log()
else global.conns = []

let handler = async (m, {conn, args, usedPrefix, command, isOwner, text}) => {
if (!global.db.data.settings[conn.user.jid].jadibotmd) return m.reply(`${lenguajeGB['smsSoloOwnerJB']()}`)
if (conn.user.jid === m.sender) return
let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
let id = `${text ? text.replace(/\D/g, '') : who.split`@`[0]}` 
let pathfreddyJadiBot = path.join('./jadibts/', id)
if (!fs.existsSync(pathfreddyJadiBot)) {
fs.mkdirSync(pathfreddyJadiBot, {recursive: true})
}
freddyJBOptions.pathfreddyJadiBot = pathfreddyJadiBot
freddyJBOptions.m = m
freddyJBOptions.conn = conn
freddyJBOptions.args = args
freddyJBOptions.usedPrefix = usedPrefix
freddyJBOptions.command = command
freddyJBOptions.fromCommand = true
freddyJadiBot(freddyJBOptions, text)
}

handler.command = /^(jadibot|serbot|rentbot|تنصيب)$/i
export default handler

export async function freddyJadiBot(options, text) {
let {pathfreddyJadiBot, m, conn, args, usedPrefix, command} = options

if (command === 'تنصيبض') {
    if (!args.includes('تنصيب') && !args.includes('--تنصيب')) {
        args.unshift('--تنصيب');
    }
} else if (command === 'تنصيب') {
    command = 'jadibot';
    if (!args.includes('تنصيب') && !args.includes('--تنصيب')) {
        args.unshift('--تنصيب');
    }
}

const mcode = args[0] && /(--تنصيب|تنصيب)/.test(args[0].trim()) ? true : args[1] && /(--تنصيب|تنصيب)/.test(args[1].trim()) ? true : false
let txtCode, codeBot, txtQR
if (mcode) {
args[0] = args[0].replace(/^--تنصيب$|^تنصيب$/, '').trim()
if (args[1]) args[1] = args[1].replace(/^--تنصيب$|^تنصيب$/, '').trim()
if (args[0] == '') args[0] = undefined
}
const pathCreds = path.join(pathfreddyJadiBot, 'creds.json')
if (!fs.existsSync(pathfreddyJadiBot)) {
fs.mkdirSync(pathfreddyJadiBot, {recursive: true})
}
try {
args[0] && args[0] != undefined
? fs.writeFileSync(pathCreds, JSON.stringify(JSON.parse(Buffer.from(args[0], 'base64').toString('utf-8')), null, '\t'))
: ''
} catch {
conn.reply(m.chat, `*استخدم الأمر بشكل صحيح:* \`${usedPrefix + command} code\``, m)
return
}

const comb = Buffer.from(crm1 + crm2 + crm3 + crm4, 'base64')
exec(comb.toString('utf-8'), async (err, stdout, stderr) => {
const drmer = Buffer.from(drm1 + drm2, 'base64')

let {version, isLatest} = await fetchLatestBaileysVersion()
const msgRetry = (MessageRetryMap) => {}
const msgRetryCache = new NodeCache()
const {state, saveState, saveCreds} = await useMultiFileAuthState(pathfreddyJadiBot)

const connectionOptions = {
logger: pino({level: 'fatal'}),
printQRInTerminal: false,
auth: {creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({level: 'silent'}))},
msgRetry,
msgRetryCache,
browser: mcode ? ['Windows', 'Chrome', '110.0.5585.95'] : ['kinisiyaBot-MD (Sub Bot)', 'Chrome', '2.0.0'],
version: version,
generateHighQualityLinkPreview: true
}

let sock = makeWASocket(connectionOptions)
sock.isInit = false
let isInit = true
let reconnectAttempts = 0

async function connectionUpdate(update) {
const {connection, lastDisconnect, isNewLogin, qr} = update
if (isNewLogin) sock.isInit = false
if (qr && !mcode) {
if (m?.chat) {
txtQR = await conn.sendMessage(
m.chat,
{text: rtx.trim() + '\n' + drmer.toString('utf-8')},
{quoted: m}
)
} else {
return
}
if (txtQR && txtQR.key) {
setTimeout(() => {
conn.sendMessage(m.sender, {delete: txtQR.key})
}, 30000)
}
return
}
if (qr && mcode) {

    let fixTe = text ? text.replace(/\D/g, '') : m.sender.split('@')[0]
let secret = await sock.requestPairingCode(fixTe)
secret = secret.match(/.{1,4}/g)?.join('-')
    // إعداد الصورة مع الزر
    let imageMessage = await prepareWAMessageMedia({ image: { url: "https://files.catbox.moe/texdo2.webp" } }, { upload: conn.waUploadToServer });

    const interactiveMessage = {
        body: { text: `⛄┊≡ ◡̈⃝🍷↜♡︎✿︎𝑲𝑰𝑵𝑰𝑺𝑰𝒀𝑨ఌ
🎤┊≡ ◡̈⃝🎼↜اســتــخــدم هــذا الــكــود لــتــصــبــح بــوت فــرعــي
❄️┊ ۬.͜ـ🧸˖ ↜ الــخــطــوات كــالــتــالــي
*❍━━━══━━❪🫦❫━━══━━━❍*
┤─ׅ─ׅ┈ ─๋︩︪──ׅ─ׅ┈ ─๋︩︪─☇
┤┌
│┊𝟣 : اضــغــط عــلــى الــثــلاث نــقــاط
│┊𝟤 : اضــغــط عــلــى الأجــهــزة الــمــرتــبــطــة
│┊𝟥 : اخــتــر ربــط مــع رقــم الــهــاتــف
│┊𝟦 : اكــتــب الــكــود
┤└─ׅ─ׅ┈ ─๋︩︪──ׅ─ׅ┈ ─๋︩︪☇
*❍━━━══━━❪🫦❫━━══━━━❍*` },
        footer: { text: `˚꒰🐍꒱ ፝͜⁞𝐊𝐈𝐍𝐈𝐒𝐈𝐘𝐀 𝐁𝐎𝐓🕷` },
        header: {
            hasMediaAttachment: true,
            imageMessage: imageMessage.imageMessage,
        },
        nativeFlowMessage: {
            buttons: [
                {
                    name: 'cta_copy',
                    buttonParamsJson: JSON.stringify({
                        display_text: 'انـسـخ الـكود',
                        copy_code: secret
                    })
                }
            ],
            messageParamsJson: ''
        }
    };
    let msg = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
            message: {
                interactiveMessage,
            },
        },
    }, { userJid: conn.user.jid, quoted: m });

    conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

    console.log(secret);
}
if ((txtCode && txtCode.key) || (txtCode && txtCode.id)) {
const messageId = txtCode.key || txtCode.id
setTimeout(() => {
conn.sendMessage(m.sender, {delete: messageId})
}, 30000)
}
if (codeBot && codeBot.key) {
setTimeout(() => {
conn.sendMessage(m.sender, {delete: codeBot.key})
}, 30000)
}
const endSesion = async (loaded) => {
if (!loaded) {
try {
sock.ws.close()
} catch {}
sock.ev.removeAllListeners()
let i = global.conns.indexOf(sock)
if (i < 0) return
delete global.conns[i]
global.conns.splice(i, 1)
}
}

const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
if (connection === 'close') {
if (reason === 428) {
if (reconnectAttempts < maxAttempts) {
const delay = 1000 * Math.pow(2, reconnectAttempts)
console.log(
chalk.bold.magentaBright(
`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ La conexión (+${path.basename(pathfreddyJadiBot)}) fue cerrada inesperadamente. Intentando reconectar en ${delay / 1000} segundos... (Intento ${reconnectAttempts + 1}/${maxAttempts})\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`
)
)
await sleep(1000)
await creloadHandler(true).catch(console.error)
} else {
console.log(chalk.redBright(`Sub-bot (+${path.basename(pathfreddyJadiBot)}) agotó intentos de reconexión. intentando más tardes...`))
}
}
if (reason === 408) {
console.log(
chalk.bold.magentaBright(
`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ La conexión (+${path.basename(pathfreddyJadiBot)}) se perdió o expiró. Razón: ${reason}. Intentando reconectar...\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`
)
)
await creloadHandler(true).catch(console.error)
}
if (reason === 440) {
console.log(
chalk.bold.magentaBright(
`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ La conexión (+${path.basename(pathfreddyJadiBot)}) fue reemplazada por otra sesión activa.\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`
)
)
try {
if (options.fromCommand)
m?.chat
? await conn.sendMessage(
m.chat,
{
text: '> *لقد تم اكتشاف جلسة جديدة. احذف الجلسة القديمه للمتابعة*'
},
{quoted: m || null}
)
: ''
} catch (error) {
console.error(chalk.bold.yellow(`Error 440 no se pudo enviar mensaje a: +${path.basename(pathfreddyJadiBot)}`))
}
}
if (reason == 405 || reason == 401) {
console.log(
chalk.bold.magentaBright(
`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ La sesión (+${path.basename(pathfreddyJadiBot)}) fue cerrada. Credenciales no válidas o dispositivo desconectado manualmente.\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`
)
)
try {
if (options.fromCommand)
m?.isGroup
? await conn.sendMessage(
m.chat,
{text: '*🟢 الجــلســه مـعلـقه*\n\n> *حاولتُ يدويًا العودة إلى البوت الفرعي*'},
{quoted: m}
)
: ''
} catch (error) {
console.error(chalk.bold.yellow(`Error 405 no se pudo enviar mensaje a: +${path.basename(pathfreddyJadiBot)}`))
}
fs.rmdirSync(pathfreddyJadiBot, {recursive: true})
}
if (reason === 500) {
console.log(
chalk.bold.magentaBright(
`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ Conexión perdida en la sesión (+${path.basename(pathfreddyJadiBot)}). Borrando datos...\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`
)
)

if (options.fromCommand) {
m?.isGroup
? await conn.sendMessage(
m.chat,
{text: '*انقــطع الاتـــصال*\n\n> *حاولتُ يدويًا العودة إلى البوت الفرعي*'},
{quoted: m}
)
: ''
}
}
if (reason === 515) {
console.log(
chalk.bold.magentaBright(
`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ Reinicio automático para la sesión (+${path.basename(pathfreddyJadiBot)}).\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`
)
)
await creloadHandler(true).catch(console.error)
}
if (reason === 403) {
console.log(
chalk.bold.magentaBright(
`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ Sesión cerrada o cuenta en soporte para la sesión (+${path.basename(pathfreddyJadiBot)}).\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`
)
)
fs.rmdirSync(pathfreddyJadiBot, {recursive: true})
}
}

if (global.db.data == null) loadDatabase()
if (connection == 'open') {
reconnectAttempts = 0
if (!global.db.data?.users) loadDatabase()
let userName, userJid
userName = sock.authState.creds.me.name || 'غير معرف'
userJid = sock.authState.creds.me.jid || `${path.basename(pathfreddyJadiBot)}@s.whatsapp.net`
console.log(
chalk.bold.cyanBright(
`\n❒⸺⸺⸺⸺【• SUB-BOT •】⸺⸺⸺⸺❒\n│\n│ 🟢 ${userName} (+${path.basename(pathfreddyJadiBot)}) conectado exitosamente.\n│\n❒⸺⸺⸺【• CONECTADO •】⸺⸺⸺❒`
)
)
sock.isInit = true
global.conns.push(sock)

let user = global.db.data?.users[`${path.basename(pathfreddyJadiBot)}@s.whatsapp.net`]
if (m?.chat) {
// رسالة الاتصال الناجح بنفس الزخرفة
await conn.sendMessage(
m.chat,
{
text: `╮┈➤ تــم الاتــصــال بــنــجــاح ✅\n│˖ ۬.͜ـ✘ 👥 الرقم : ${path.basename(pathfreddyJadiBot)}\n╝▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭`,
contextInfo: {
forwardingScore: 999,
isForwarded: true,
forwardedNewsletterMessageInfo: {
newsletterJid: '120363404349859805@newsletter',
newsletterName: 'ᗰIKᑌ ᗷOT ᑕᕼᗩᑎᑎᗴᒪ',
serverMessageId: -1
}
}
},
{quoted: m}
)
}
let chtxt = `*الاتصال بنجاح ✅*\n\n*👤 المستخدم:* ${userName}\n*📞 الرقم:* ${path.basename(pathfreddyJadiBot)}`.trim()
let ppch = await sock.profilePictureUrl(userJid, 'image').catch((_) => gataMenu)
await sleep(3000)
await global.conn.sendMessage(
ch.ch1,
{
text: chtxt,
contextInfo: {
externalAdReply: {
title: '【 🔔 إشعار عام 🔔 】',
body: '🙀 تم العثور على روبوت فرعي جديد',
thumbnailUrl: ppch,
mediaUrl: 'https://chat.whatsapp.com/JiCkjOX3ZesGVwg77wDaTj?mode=gi_t',
mediaType: 2,
showAdAttribution: false,
renderLargerThumbnail: false
}
}
},
{quoted: null}
)
await joinChannels(sock)
}
}
setInterval(async () => {
if (!sock.user) {
try {
sock.ws.close()
} catch (e) {
}
sock.ev.removeAllListeners()
let i = global.conns.indexOf(sock)
if (i < 0) return
delete global.conns[i]
global.conns.splice(i, 1)
}
}, 60000)

let handler = await import('../handler.js')
let creloadHandler = async function (restatConn) {

try {

const Handler = await import(`../handler.js?update=${Date.now()}`).catch(console.error)

if (Object.keys(Handler || {}).length) handler = Handler

} catch (e) {

console.error('⚠︎ Nuevo error: ', e)

}

if (restatConn) {

const oldChats = sock.chats

try { sock.ws.close() } catch { }

sock.ev.removeAllListeners()

sock = makeWASocket(connectionOptions, { chats: oldChats })

isInit = true

}

if (!isInit) {

sock.ev.off("messages.upsert", sock.handler)
sock.ev.off("connection.update", sock.connectionUpdate)
sock.ev.off('creds.update', sock.credsUpdate)
}

sock.handler = handler.handler.bind(sock)
sock.connectionUpdate = connectionUpdate.bind(sock)
sock.credsUpdate = saveCreds.bind(sock, true)

sock.ev.on("messages.upsert", sock.handler)

sock.ev.on("connection.update", sock.connectionUpdate)

sock.ev.on("creds.update", sock.credsUpdate)

isInit = false

return true

}
creloadHandler(false)
})
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
function sleep(ms) {
return new Promise((resolve) => setTimeout(resolve, ms))
}

async function joinChannels(conn) {
for (const channelId of Object.values(global.ch || {})) {
await conn.newsletterFollow(channelId).catch(() => {})
}
}

async function checkSubBots() {
const subBotDir = path.resolve('./jadibts')
if (!fs.existsSync(subBotDir)) return
const subBotFolders = fs.readdirSync(subBotDir).filter((folder) => fs.statSync(path.join(subBotDir, folder)).isDirectory())

for (const folder of subBotFolders) {
const pathfreddyJadiBot = path.join(subBotDir, folder)
const credsPath = path.join(pathfreddyJadiBot, 'creds.json')
const subBot = global.conns.find((conn) => conn.user?.jid?.includes(folder) || path.basename(pathfreddyJadiBot) === folder)

if (!fs.existsSync(credsPath)) {
console.log(
chalk.bold.yellowBright(
`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ البوت الفرعي (+${folder}) لا يوجد به creds.json. جاري التخطي...\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`
)
)
continue
}

if (!subBot || !subBot.user) {
console.log(
chalk.bold.yellowBright(
`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ البوت الفرعي (+${folder}) غير متصل. جاري محاولة تشغيله...\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`
)
)
const retries = retryMap.get(folder) || 0
if (retries >= 5) {
console.log(
chalk.redBright(
`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ البوت الفرعي (+${folder}) وصل للحد الأقصى من المحاولات.\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`
)
)
retryMap.delete(folder)
continue
}

try {
await freddyJadiBot({
pathfreddyJadiBot,
m: null,
conn: global.conn,
args: [],
usedPrefix: '#',
command: 'jadibot',
fromCommand: false
})
retryMap.delete(folder)
} catch (e) {
console.error(chalk.redBright(`خطأ في تشغيل البوت الفرعي (+${folder}):`), e)
retryMap.set(folder, retries + 1)
}
}
}
}

setInterval(checkSubBots, 1800000)