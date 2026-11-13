// lib/decrypt-guard.js
// 🛡️ حرس فك التشفير — يتعامل مع أخطاء Signal "Bad MAC" بأمان.
//
// عندما تفشل إحدى الرسائل في فك التشفير (Bad MAC) يرمي libsignal خطأً داخلياً
// ويطبع: "Failed to decrypt message with any known session..." و "Session error: ... Bad MAC".
// هذه الأخطاء متوقّعة ولا تعني تلفاً في البوت. القاعدة:
//   1) رسالة واحدة فشلت ⇒ تجاهلها فقط، لا تُسقط البوت، ولا process.exit.
//   2) إذا تكرّر فشل MAC لنفس الرقم أكثر من ٥ مرات ⇒ احذف جلسة ذلك الرقم
//      فقط من مجلد الجلسة (session-<رقم>*.json)، ولا تمسّ creds.json ولا
//      جلسة البوت كاملة.
//
// الملف بلا اعتماد على baileys ولا شبكة: دوال نقية + مصنع قابل للحقن،
// لذا يُختبر مباشرةً في tests/decrypt-guard.test.js.

import fs from 'fs'
import path from 'path'

export const DEFAULT_THRESHOLD = 5

// أنماط تدلّ على فشل فك التشفير (Bad MAC وأشباهه) عربي/إنجليزي.
const DECRYPT_PATTERNS = [
  /bad mac/i,
  /invalid mac/i,
  /عنوان\s*mac\s*غير\s*صالح/i, // "عنوان MAC غير صالح"
  /فشل\s*فك\s*(?:ال)?تشفير/i, // "فشل فك التشفير" / "فشل فك تشفير"
  /جلسة\s*معروفة/i, // "... باستخدام أي جلسة معروفة"
  /failed to decrypt message with any known session/i,
  /no matching sessions found/i,
  /session error/i,
  /failed to decrypt/i,
  /doDecryptWhisperMessage/i,
  /decryptWithSessions/i,
  /InvalidMessageException/,
  /key used already or never filled/i,
  /no session record/i,
  /no sessions available/i,
  /tried to decrypt on a sending chain/i
]

// يحوّل أي قيمة (JID أو رقم خام) إلى رقم الهوية المجرّد بدون أصفار/رموز.
export function extractNumber(value) {
  if (value === null || value === undefined) return ''
  let str = String(value)
  const at = str.indexOf('@')
  if (at !== -1) str = str.slice(0, at)
  const colon = str.indexOf(':')
  if (colon !== -1) str = str.slice(0, colon)
  const dot = str.indexOf('.') // لاحقة الجهاز في عنوان Signal: "212693863911.4"
  if (dot !== -1) str = str.slice(0, dot)
  return str.replace(/[^0-9]/g, '')
}

export function isDecryptError(text) {
  const s = String(text || '')
  if (!s) return false
  return DECRYPT_PATTERNS.some((re) => re.test(s))
}

// اسم ملف جلسة كامل من معرّف Signal مثل "212693863911.4" ⇒ "session-212693863911.4.json"
export function sessionFileName(address) {
  const id = String(address || '').replace(/\//g, '__').replace(/:/g, '-')
  return `session-${id}.json`
}

const SESSION_FILE_RE = /^session-(\d+)(?:\.\d+)?\.json$/

// رقم الهوية المستخرج من اسم ملف جلسة، أو null إن لم يكن ملف جلسة رقم.
export function numberFromSessionFile(filename) {
  const m = SESSION_FILE_RE.exec(String(filename || ''))
  return m ? m[1] : null
}

// كل ملفات جلسة الهاتف التي تنتمي لهذا الرقم (تُطابق الرقم بدقّة، فلا
// يطابق 21269386391 الرقم 212693863911).
export function sessionFilesForNumber(files, number) {
  const target = extractNumber(number)
  if (!target) return []
  return (files || []).filter((f) => numberFromSessionFile(f) === target)
}

// ---------------------------------------------------------------------------
// المصنع القابل للحقن (يُستخدم في الاختبارات وفي التشغيل الفعلي)
// ---------------------------------------------------------------------------
export function createDecryptGuard(options = {}) {
  const threshold = options.threshold ?? DEFAULT_THRESHOLD
  const dir = options.dir || 'session'
  const io = options.fs || fs
  const pathMod = options.path || path
  const log = options.log || (() => {})

  const counts = new Map() // رقم -> عدد حالات فشل MAC المتتالية
  let cleaned = 0

  // يحذف ملفات جلسة هذا الرقم فقط. لا يلمس creds.json إطلاقاً.
  function cleanupNumber(number) {
    const target = extractNumber(number)
    if (!target) return []
    let files = []
    try {
      files = sessionFilesForNumber(io.readdirSync(dir), target)
    } catch (e) {
      log(`cleanup: cannot read session dir '${dir}': ${e?.message || e}`)
      return []
    }
    const removed = []
    for (const file of files) {
      try {
        io.unlinkSync(pathMod.join(dir, file))
        removed.push(file)
        log(`🧹 حذف جلسة الهاتف فقط: ${file}`)
      } catch (e) {
        log(`cleanup: failed to delete '${file}': ${e?.message || e}`)
      }
    }
    if (removed.length) cleaned += removed.length
    return removed
  }

  // يسجّل فشل MAC لهذا الرقم، وإن تجاوز الحدّ يحذف جلسته فقط.
  function note(text, number) {
    const target = extractNumber(number)
    if (!target) return { number: '', count: 0, cleaned: [], triggered: false }
    const count = (counts.get(target) || 0) + 1
    counts.set(target, count)
    if (count <= threshold) return { number: target, count, cleaned: [], triggered: false }
    log(`♻️ تكرّر فشل MAC للرقم ${target} (${count} مرات) — تنظيف جلسته`)
    const removed = cleanupNumber(target)
    counts.set(target, 0) // أعِد التهيئة بعد التنظيف
    return { number: target, count, cleaned: removed, triggered: true }
  }

  // مدخل عام: نص خطأ خام (+ رقم اختياري) ⇒ يسجّل ويُنظّف عند الحاجة.
  function observe(text, number) {
    if (!isDecryptError(text)) return null
    return note(text, number)
  }

  return {
    note,
    observe,
    cleanupNumber,
    isDecryptError,
    countFor: (number) => counts.get(extractNumber(number)) || 0,
    stats: () => ({ numbers: counts.size, cleaned }),
    reset: () => counts.clear(),
    threshold
  }
}

// كائن مفرد مربوط بـ global حتى تبقى العدّادات بعد إعادة تحميل الهاندلر.
export function getDecryptGuard() {
  if (!global.__decryptGuard) {
    global.__decryptGuard = createDecryptGuard({
      dir: global.sessions || 'session',
      log: (...a) => console.log('🛡️ decrypt-guard:', ...a)
    })
  }
  return global.__decryptGuard
}

// يُسجّل فشل فك تشفير لرسالة واحدة. لا يرمي أبداً ولا يُسقط البوت.
export function noteDecryptFailure(text, number) {
  try {
    return getDecryptGuard().observe(text, number)
  } catch (e) {
    console.log('🛡️ decrypt-guard: observe failed:', e?.message || e)
    return null
  }
}
