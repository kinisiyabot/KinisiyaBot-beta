// lib/self-heal.js
// 🛠️ نظام التصحيح الذاتي (Self-Healing)
//
// يراقب أخطاء البوت أثناء التشغيل (uncaughtException / unhandledRejection /
// console.error)، ويرسل تقريراً واحداً للمطور على واتساب مع زرّي "نعم / لا".
// إذا ضغط المطور "نعم" خلال 5 دقائق، يُعيد تحميل البلوجن المتسبب (إن عُرف).
//
// ملاحظات مهمة (بناءً على طلب المستخدم):
//   - التنبيه يُرسل مرة واحدة فقط لكل خطأ مميّز (لا تنبيه كل دقيقة).
//   - لا يُعيد تشغيل العملية أبداً (بدون spawn/exit) — فقط reload للبلوجن.
//
// الملف مقسوم إلى:
//   - دوال نقية (fingerprint / isIgnored / formatReport / matchYes / matchNo)
//     قابلة للاختبار بدون شبكة.
//   - createSelfHeal(options) مصنع مستقلّ قابل للحقن (send/now/onHeal).
//   - selfHeal كائن مفرد مربوط بـ global.conn / global.owner.

export const PENDING_TTL = 5 * 60 * 1000 // صلاحية رسالة التأكيد: 5 دقائق
export const DEDUPE_TTL = Infinity // تنبيه واحد فقط لكل خطأ مميّز (طوال التشغيل)
export const COOLDOWN = 0 // بلا تهدئة دورية: لا تنبيه كل دقيقة

// أخطاء اتصال/جلسة متوقّعة لا نُبلّغ عنها (وإلا امتلأت الرسائل بلا فائدة).
const IGNORE_PATTERNS = [
  /please scan this qr/i,
  /scan this qr/i,
  /reconnecting the main bot/i,
  /is connected/i,
  /connection closed/i,
  /connection terminated/i,
  /closing open session/i,
  /closing stale session/i,
  /session error/i,
  /failed to decrypt/i,
  /bad mac/i,
  /messagecountererror/i,
  /prekey/i,
  /timeout in awaitinginitialsync/i,
  /stream errored/i,
  /restart required/i,
  /statuscode\s*[:=]?\s*(401|405|428|440|500|515)/i,
  /code\s*[:=]?\s*(401|405|428|440|515)/i,
  /socket closed/i,
  /econnreset/i,
  /etimedout/i,
  /fetch failed/i,
  /getaddrinfo/i,
  /network request failed/i,
  /qr render error/i,
  /selfheal/i, // لا نراقب أخطاء نظامنا نفسه
  /نظام التصحيح الذاتي/
]

export function isIgnored(text) {
  const s = String(text || '')
  if (s.trim().length < 6) return true
  return IGNORE_PATTERNS.some((re) => re.test(s))
}

// بصمة ثابتة للخطأ: تُزيل المعرّفات المتغيّرة (أرقام/hex) حتى يُعتبر نفس
// الخطأ مكرّراً مهما تغيّرت أرقام السطر أو معرّفات الرسائل.
export function fingerprint(text) {
  return String(text || '')
    .replace(/[0-9a-f]{8,}/gi, 'HEX')
    .replace(/\b\d{5,}\b/g, 'NUM')
    .replace(/\d{1,2}:\d{2}:\d{2}(?:\.\d+)?/g, 'TIME')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 300)
}

// ملاحظة: لا نستخدم \b بعد كلمات عربية لأن الحروف العربية ليست \w في JS
// (بدون علم u)، فيفشل التطابق. نستخدم نهاية النص أو مسافة/ترقيم بدلاً منه.
const YES_RE = /^(?:نعم|أكيد|اكيد|ايوه|أيوه|ايوا|اه|أه|صح|موافق|تمام|صلح|صلّح|صلحه|صلحو|صحح|yes|yep|yeah|ok|okay|sure)(?:\s|$|[.!،؟,])/i
const NO_RE = /^(?:لا|لأ|مش|مابغي|تجاهل|بعدين|سيب|وقف|no|nope|later|cancel|skip)(?:\s|$|[.!،؟,])/i

export function matchYes(text) {
  return YES_RE.test(String(text || '').trim())
}

export function matchNo(text) {
  return NO_RE.test(String(text || '').trim())
}

// يستخرج اسم البلوجن من نص الـ stack trace إن وُجد.
export function guessPlugin(text) {
  const m = String(text || '').match(/plugins[\\/]([^\\/\s:)]+\.js)/)
  return m ? m[1] : null
}

export function formatReport(item) {
  const when = new Date(item.at).toLocaleString('ar-EG')
  const where = item.meta?.plugin || guessPlugin(item.text) || 'غير معروف'
  const lines = [
    '🚨 *خطأ جديد في البوت*',
    '',
    `🔖 *الرقم:* #${item.id}`,
    `🕐 *الوقت:* ${when}`,
    `📍 *المكان:* ${where}`,
    `⚠️ *النوع:* ${item.meta?.type || 'Error'}`,
    '',
    '📝 *التفاصيل:*',
    '```',
    String(item.text).slice(0, 900),
    '```',
    '',
    `⏳ عندك *5 دقائق* للرد. اضغط *نعم* لأصلحه، أو *لا* لتجاهله.`
  ]
  return lines.join('\n')
}

// ---------------------------------------------------------------------------
// المصنع القابل للحقن (يُستخدم في الاختبارات وفي التشغيل الفعلي)
// ---------------------------------------------------------------------------
export function createSelfHeal(options = {}) {
  const now = options.now || (() => Date.now())
  const send = options.send || (async () => {})
  const onHeal = options.onHeal || (() => {})
  const log = options.log || (() => {})
  const ttl = options.ttl ?? PENDING_TTL
  const dedupeTtl = options.dedupeTtl ?? DEDUPE_TTL
  const cooldown = options.cooldown ?? COOLDOWN

  const pending = new Map()
  const notified = new Map()
  let seq = 0
  let lastNotify = 0

  function purge() {
    const t = now()
    for (const [id, item] of pending) {
      if (t >= item.expires && item.status === 'pending') {
        item.status = 'expired'
        pending.delete(id)
      }
    }
    for (const [fp, at] of notified) {
      if (t - at > dedupeTtl) notified.delete(fp)
    }
  }

  // يستقبل نص خطأ خام، يُقرّر إن كان يستحق الإبلاغ، ويُرسل التقرير.
  function observe(text, meta = {}) {
    const raw = String(text || '').trim()
    if (!raw || isIgnored(raw)) return null
    const t = now()
    purge()
    const fp = fingerprint(raw)
    const seen = notified.get(fp)
    if (seen !== undefined && t - seen < dedupeTtl) return null
    if (t - lastNotify < cooldown) return null
    notified.set(fp, t)
    lastNotify = t
    const id = ++seq
    const item = { id, fingerprint: fp, text: raw, meta, at: t, expires: t + ttl, status: 'pending' }
    pending.set(id, item)
    Promise.resolve(send(item)).catch((e) => log('send failed:', e?.message || e))
    return item
  }

  function capture(error, meta = {}) {
    const text = error instanceof Error ? (error.stack || error.message) : String(error)
    return observe(text, { ...meta, type: meta.type || (error?.name || 'Error') })
  }

  function getPending(id) {
    purge()
    return pending.get(Number(id)) || null
  }

  function confirm(id) {
    const item = getPending(id)
    if (!item) return { ok: false, reason: 'not-found' }
    item.status = 'healing'
    pending.delete(item.id)
    log(`self-heal: confirmed #${item.id}`)
    try {
      onHeal(item)
      return { ok: true, item }
    } catch (e) {
      return { ok: false, reason: 'heal-failed', error: e }
    }
  }

  function cancel(id) {
    const item = getPending(id)
    if (!item) return { ok: false, reason: 'not-found' }
    item.status = 'cancelled'
    pending.delete(item.id)
    log(`self-heal: cancelled #${item.id}`)
    return { ok: true, item }
  }

  // يُحلّل رد المطور دون تنفيذ أي إجراء: { action: 'yes'|'no', id } أو null.
  function resolveOwnerReply(text, isOwner = true) {
    if (!isOwner) return null
    const raw = String(text || '').trim()
    if (!raw) return null
    const cmd = raw.match(/^[#!./-]?\s*selfheal(-no)?\s*(\d+)?/i)
    if (cmd && cmd[2]) return { action: cmd[1] ? 'no' : 'yes', id: Number(cmd[2]) }
    if (!pending.size) return null
    const latest = () => [...pending.values()].sort((a, b) => b.id - a.id)[0].id
    if (matchYes(raw)) return { action: 'yes', id: latest() }
    if (matchNo(raw)) return { action: 'no', id: latest() }
    return null
  }

  // رد المطور النصّي: "نعم/لا" يؤكد آخر خطأ معلّق، أو ".selfheal <id>".
  function handleOwnerText(text, sender, isOwner = true) {
    const parsed = resolveOwnerReply(text, isOwner)
    if (!parsed) return null
    return parsed.action === 'no' ? cancel(parsed.id) : confirm(parsed.id)
  }

  return {
    observe,
    capture,
    confirm,
    cancel,
    getPending,
    handleOwnerText,
    resolveOwnerReply,
    purge,
    listPending: () => [...pending.values()],
    _state: { pending, notified }
  }
}

// ---------------------------------------------------------------------------
// الكائن المفرد المستخدم فعلياً داخل البوت
// ---------------------------------------------------------------------------
function ownerJids() {
  const list = global.owner || []
  const out = []
  for (const entry of list) {
    const raw = Array.isArray(entry) ? entry[0] : entry
    const num = String(raw || '').replace(/\D/g, '')
    if (num) out.push(`${num}@s.whatsapp.net`)
  }
  return [...new Set(out)]
}

function buttons(id) {
  return [
    { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '✅ نعم، أصلحه', id: `.selfheal ${id}` }) },
    { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: '❌ لا، تجاهل', id: `.selfheal-no ${id}` }) }
  ]
}

async function sendToOwners(item) {
  const conn = global.conn
  if (!conn) return
  const body = formatReport(item)
  for (const jid of ownerJids()) {
    try {
      await conn.sendMessage(jid, {
        text: body,
        footer: '🛠️ نظام التصحيح الذاتي',
        interactiveButtons: buttons(item.id)
      })
    } catch {
      try {
        await conn.sendMessage(jid, { text: `${body}\n\nللموافقة أرسل: .selfheal ${item.id}` })
      } catch {}
    }
  }
}

// يعيد تحميل البلوجن المتسبب (إن عُرف) بدون أي إعادة تشغيل للعملية.
function defaultHeal(item) {
  const plugin = item.meta?.plugin || guessPlugin(item.text)
  try {
    if (plugin && typeof global.reload === 'function') {
      global.reload(null, plugin)
      console.log(`🛠️ self-heal: reloaded plugin ${plugin}`)
    } else {
      console.log('🛠️ self-heal: no plugin to reload; nothing to do (no restart).')
    }
  } catch (e) {
    console.log(`🛠️ self-heal: plugin reload failed: ${e?.message || e}`)
  }
}

export const selfHeal = createSelfHeal({
  send: sendToOwners,
  onHeal: defaultHeal,
  log: (...a) => console.log('🛠️ self-heal:', ...a)
})

// يلتقط console.error دون كسر السلوك الأصلي، وبدون حلقة لا نهائية.
export function installConsoleMonitor() {
  if (console.__selfHealPatched) return
  const orig = console.error.bind(console)
  console.error = (...args) => {
    orig(...args)
    try {
      const text = args
        .map((a) => (a instanceof Error ? a.stack || a.message : typeof a === 'string' ? a : JSON.stringify(a)))
        .join(' ')
      selfHeal.observe(text)
    } catch {}
  }
  console.__selfHealPatched = true
}

// لم نعد نُعيد تشغيل العملية، لذا لم يبقَ شيء لإعلانه بعد الاتصال.
// نُبقي الدالة كدالة فارغة للتوافق مع الاستيراد في index.js.
export async function announceRestart() {
  return
}
