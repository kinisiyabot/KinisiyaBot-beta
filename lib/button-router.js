// lib/button-router.js
// نظام معالجة أزرار مركزي: يحوّل أي ضغط زر إلى أمر نصّي ويشغّله عبر نفس
// مسار handler.command، مهما كان شكل الردّ (interactive / list / template /
// button) ومهما كان غلافه (viewOnce / ephemeral / ...).
//
// سبب وجوده: `plugins/_templateResponse.js` يعيد إرسال الأمر كرسالة جديدة،
// لكنه يتجاهل الأزرار التي معرّفها بلا بادئة (مثل `rate_5`) أو التي معرّفها
// ليس أمراً مسجّلاً، فيبدو الزر ميتاً بلا أي تفسير. هنا نغطّي الحالات الأربع
// ونردّ برسالة واضحة عندما لا يوجد أمر مطابق، بدل الصمت التام.

import { readInteractiveReply, isButtonReply, normalizeButtonCommand } from './interactive.js'

const strRegex = (str) => String(str).replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')

// يجمع كل البادئات المعتبرة: بادئة البلوجن + بادئة السوكِت + العامة.
function prefixesFor(conn, plugin) {
  const raw = plugin?.customPrefix || conn?.prefix || global.prefix
  const list = Array.isArray(raw) ? raw : [raw]
  const out = []
  for (const p of list) {
    if (p instanceof RegExp) {
      const m = /^\^?([\\/!#.]+)/.exec(p.source)
      if (m) out.push(m[1].replace(/\\/g, ''))
    } else if (typeof p === 'string' && p) {
      out.push(p)
    }
  }
  if (!out.length) out.push('.', '/', '!', '#')
  return [...new Set(out)]
}

// يستخرج الأمر من معرّف الزر، مع إزالة أي بادئة معروفة.
function commandFromId(id, prefixes) {
  let s = String(id || '').trim()
  for (const p of prefixes) {
    if (s.startsWith(p)) {
      s = s.slice(p.length).trim()
      break
    }
  }
  return (s.split(/\s+/)[0] || '').toLowerCase()
}

// `new RegExp()` (بلا نمط) يطابق أي نصّ، وكذلك `/(?:)/` و`/.*/`. بعض البلوجنات
// تستخدمه كحاجز وتعالج أزرارها في `before`، فلا يصلح للتعريف بأمر.
const MATCH_ALL = /^(?:\(\?:\)|\.\*|\(\?:\.\*\)|)$/
const isMatchAllRegex = (re) => re instanceof RegExp && MATCH_ALL.test(re.source) && !re.flags.includes('u')

// يبحث عن بلوجن يطابق هذا الأمر. يعيد اسم البلوجن أو null.
export function findPluginForCommand(command, { plugins = global.plugins, restrict = false } = {}) {
  if (!command) return null
  for (const name in plugins) {
    const plugin = plugins[name]
    if (!plugin || plugin.disabled) continue
    if (!restrict && plugin.tags?.includes('admin')) continue
    if (!plugin.command) continue
    const cmd = plugin.command
    if (isMatchAllRegex(cmd)) continue
    const hit =
      cmd instanceof RegExp
        ? cmd.test(command)
        : Array.isArray(cmd)
          ? cmd.some((c) =>
              c instanceof RegExp ? !isMatchAllRegex(c) && c.test(command) : String(c).toLowerCase() === command,
            )
          : typeof cmd === 'string'
            ? cmd.toLowerCase() === command
            : false
    if (hit) return name
  }
  return null
}

// بعض البلوجنات تعالج أزرارها بنفسها في `handler.before` بمعرّفات ليست أوامر
// مسجّلة (مثل `rate_5` في plugins/تقيم.js). إن ردّ المعالج عليها أيضاً لظهر
// ردّان. عند وجود أي خطّاف before نترك الأمر له ونصمت.
function anyBeforeHook(plugins) {
  for (const name in plugins) {
    const plugin = plugins[name]
    if (plugin && !plugin.disabled && typeof plugin.before === 'function') return true
  }
  return false
}

// يفحص ردّ زر ويعيد قراراً: { handled, command, plugin, id, source }.
// handled=false يعني: ليست ردّ زر، فاتركها للمسار العادي.
export function routeButtonReply(m, { conn, plugins = global.plugins, restrict = false } = {}) {
  if (!m?.message) return { handled: false }
  const reply = readInteractiveReply(m.message)
  if (!reply) {
    // ردّ زر بمعرّف غير مقروء: نعامله كضغطة زر بلا أمر حتى لا يبقى صامتاً.
    if (isButtonReply(m.message)) return { handled: false, unreadable: true }
    return { handled: false }
  }
  const prefixes = prefixesFor(conn, null)
  const command = commandFromId(reply.id, prefixes)
  const plugin = findPluginForCommand(command, { plugins, restrict })
  if (!plugin && anyBeforeHook(plugins)) {
    // قد يتولّاها خطّاف before في بلوجن آخر — لا نردّ ولا نُنبّه.
    return { handled: false, silent: true, id: reply.id, command }
  }
  return {
    handled: !!plugin,
    command,
    plugin,
    id: reply.id,
    text: reply.text,
    source: reply.source,
    normalized: normalizeButtonCommand(reply.id, prefixes[0]),
  }
}

// يبني رسالة upsert من ضغط الزر، فيُعاد استخدام نفس مسار handler تماماً.
// نبني النصّ من معرّف الزر الأصلي (لا من نسخة منقّاة) حتى تصل الوسائط
// (`yt720 <url>`) كما كتبها البلوجن.
export async function buildButtonUpsert({ m, conn, text, proto, generateWAMessage, areJidsSameUser, chatUpdate }) {
  const messages = await generateWAMessage(
    m.chat,
    { text, mentions: m.mentionedJid },
    { userJid: conn.user.id, quoted: m.quoted && m.quoted.fakeObj },
  )
  messages.key.fromMe = areJidsSameUser(m.sender, conn.user.id)
  messages.key.id = m.key.id
  messages.pushName = m.name
  if (m.isGroup) {
    messages.key.participant = messages.participant = m.sender
  }
  return {
    ...chatUpdate,
    messages: [proto.WebMessageInfo.fromObject(messages)].map((v) => ((v.conn = conn), v)),
    type: 'append',
  }
}
