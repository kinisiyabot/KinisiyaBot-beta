// يتحقق أن كل معرّف زرّ في البلوجنات يقابله أمر مسجّل فعلاً، وأن عدد الأزرار
// في الرسالة الواحدة لا يتجاوز حدّ واتساب (3). زرّ بلا أمر = زر ميت يظهر
// للمستخدم ولا يفعل شيئاً، وهو بالضبط ما يشتكي منه المستخدمون.
// التشغيل: npm run audit:buttons
import '../lib/config.js'
import { resolvePluginExports } from '../lib/plugin-loader.js'
import { readdirSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { MAX_BUTTONS } from '../lib/interactive.js'

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'plugins')
const files = readdirSync(dir).filter((f) => f.endsWith('.js')).sort()

const withTimeout = (p, ms) =>
  Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('TIMEOUT')), ms))])

global.plugins = {}
for (const f of files) {
  let mod
  try {
    mod = await withTimeout(import(pathToFileURL(join(dir, f)).href), 8000)
  } catch {
    continue
  }
  Object.assign(global.plugins, resolvePluginExports(mod, f))
}

// كل الأوامر المسجّلة، بأشكالها الثلاثة (نصّ / مصفوفة / regex).
const commandMatchers = []
for (const [name, p] of Object.entries(global.plugins)) {
  const c = p?.command
  if (!c) continue
  const arr = Array.isArray(c) ? c : [c]
  for (const x of arr) {
    if (x instanceof RegExp) {
      if (x.source === '(?:)' || x.source === '') continue
      commandMatchers.push({ name, re: x })
    } else if (typeof x === 'string' && x) {
      commandMatchers.push({ name, str: x.toLowerCase() })
    }
  }
}

const isRegistered = (cmd) =>
  commandMatchers.some((m) => (m.re ? m.re.test(cmd) : m.str === cmd))

// معرّفات الأزرار: نفحص كتل الأزرار الحقيقية فقط، لا كل `id:` في الملف.
// كتلة الزر = كائن `{...}` يحوي `display_text` (زر ردّ سريع) أو يحوي `title`
// و`id` معاً (صفّ قائمة). الاعتماد على `id:` وحده يلتقط معرّفات حزم/اقتباسات
// ليست أزراراً إطلاقاً (إيجابيات كاذبة).
function buttonBlocks(src) {
  const out = []
  const stack = []
  for (let i = 0; i < src.length; i++) {
    const ch = src[i]
    if (ch === '{') stack.push(i)
    else if (ch === '}' && stack.length) {
      const start = stack.pop()
      const block = src.slice(start, i + 1)
      // اقتباس/بطاقة جهة اتصال تحوي `title:` و`id:` لكنها ليست زرّاً.
      if (block.includes('status@broadcast') || block.includes('VCARD')) continue
      // عنصر باقة (`id` + `desc`/`price`) يُستخدم لبناء معرّف الزر لاحقاً
      // بـ ``.طلب_${pkg.id}`` — ليس زرّاً بحدّ ذاته.
      if (/\bdesc\s*:/.test(block) || /\bprice\s*:/.test(block)) continue
      if (block.includes('display_text') || (block.includes('title:') && /\bid\s*:/.test(block))) {
        out.push(block)
      }
    }
  }
  return out
}

const ID_IN_BLOCK = /\bid\s*:\s*[`'"]([^`'"]+)[`'"]/g
const ids = []
for (const f of files) {
  const src = readFileSync(join(dir, f), 'utf8')
  for (const block of buttonBlocks(src)) {
    for (const m of block.matchAll(ID_IN_BLOCK)) {
      const raw = m[1]
      // تجاهل ما ليس أمراً: jids، روابط، أرقام هواتف، ومعرّفات تُبنى بالمتغيّرات.
      if (/@|^https?:|^[\d+\-\s]+$/.test(raw) || raw.includes('${')) continue
      ids.push({ file: f, id: raw })
    }
  }
}

const toCommand = (id) => id.replace(/^[.!#/]/, '').split(/\s+/)[0].toLowerCase()

// معرّفات مقصودة تُعالَج في خطّاف before داخل البلوجن نفسه (لا تحتاج أمراً).
const BEFORE_OWNED = /^(rate_\d+|answer_|quiz_)/i

const dead = []
for (const { file, id } of ids) {
  const cmd = toCommand(id)
  if (!cmd) continue
  if (BEFORE_OWNED.test(cmd)) continue
  if (!isRegistered(cmd)) dead.push({ file, id, cmd })
}

// عدد الأزرار الحرفية في كل ملف: تحذير إن تجاوز حدّ واتساب (يُقلَّص تلقائياً
// في relayMessage، لكن الأفضل ألا يُكتب أصلاً).
const QR_RE = /name:\s*['"](?:quick_reply|cta_url|cta_copy|cta_call|single_select)['"]/g
const oversized = []
for (const f of files) {
  const src = readFileSync(join(dir, f), 'utf8')
  const n = (src.match(QR_RE) || []).length
  if (n > MAX_BUTTONS) oversized.push({ file: f, count: n })
}

console.log(`button ids scanned:  ${ids.length}`)
console.log(`registered commands: ${commandMatchers.length}`)
console.log(`dead button ids:     ${dead.length}`)
for (const d of dead) console.log(`  DEAD ${d.file} → ${d.id} (no plugin registers "${d.cmd}")`)
console.log(`over ${MAX_BUTTONS} buttons:      ${oversized.length} (extra ones move into a bottom sheet, none dropped)`)
for (const o of oversized) console.log(`  SHEET ${o.file} (${o.count})`)

process.exit(dead.length ? 1 : 0)
