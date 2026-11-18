/**
 * @type {import('@whiskeysockets/baileys')}
 */
const {proto, generateWAMessage, areJidsSameUser} = await import('@whiskeysockets/baileys')
import { readInteractiveReply } from '../lib/interactive.js'

export async function all(m, chatUpdate) {
if (m.isBaileys || !m.message) return

// ردّ الأزرار قد يصل ملفوفاً بـ viewOnceMessage/ephemeralMessage، لذا نقرأه
// عبر readInteractiveReply الذي يفكّ الأغلفة أولاً. بدون ذلك لا يُتعرّف على
// ضغط الزر فلا يتحوّل إلى أمر نصي ولا يُرسل أي رد.
const reply = readInteractiveReply(m.message)
if (!reply) return
const id = reply.id

const opts = global.opts || {}

let isIdMessage = false
let usedPrefix = null

for (const name in global.plugins) {
const plugin = global.plugins[name]
if (!plugin || plugin.disabled) continue
if (!opts['restrict'] && plugin.tags?.includes('admin')) continue
if (!plugin.command) continue

const str2Regex = (str) => {
if (typeof str !== 'string') return ''
return str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
}

const _prefix = plugin.customPrefix || this.prefix || global.prefix || '.'
const prefixes = Array.isArray(_prefix) ? _prefix : [_prefix]

for (const p of prefixes) {
const prefixRegex = p instanceof RegExp ? p : new RegExp(`^${str2Regex(p)}`)
if (!prefixRegex.test(id)) continue

const noPrefix = id.replace(prefixRegex, '').trim()
const [command] = noPrefix.split(/\s+/)
const cmd = (command || '').toLowerCase()

let isMatch = false
if (plugin.command instanceof RegExp) {
isMatch = plugin.command.test(cmd)
} else if (Array.isArray(plugin.command)) {
isMatch = plugin.command.some((c) => (c instanceof RegExp ? c.test(cmd) : c === cmd))
} else if (typeof plugin.command === 'string') {
isMatch = plugin.command === cmd
}

if (isMatch) {
isIdMessage = true
break
}
}

if (isIdMessage) break
}

if (!isIdMessage) return

const messages = await generateWAMessage(
m.chat,
{text: id, mentions: m.mentionedJid},
{
userJid: this.user.id,
quoted: m.quoted && m.quoted.fakeObj
}
)

messages.key.fromMe = areJidsSameUser(m.sender, this.user.id)
messages.key.id = m.key.id
messages.pushName = m.name

if (m.isGroup) {
messages.key.participant = messages.participant = m.sender
}

const msg = {
...chatUpdate,
messages: [proto.WebMessageInfo.fromObject(messages)].map((v) => ((v.conn = this), v)),
type: 'append'
}

this.ev.emit('messages.upsert', msg)
}
