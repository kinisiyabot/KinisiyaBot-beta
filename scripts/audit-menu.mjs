// يتحقق أن كل زر قسم في القائمة له أمر `.قسم_<id>` مسجَّل فعلاً.
// زر بلا أمر = زر ميت يظهر للمستخدم ولا يفعل شيئاً.
// التشغيل: npm run audit:menu
import '../lib/config.js'
import { resolvePluginExports } from '../lib/plugin-loader.js'
import { readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'plugins')
const files = readdirSync(dir).filter((f) => f.endsWith('.js')).sort()

const withTimeout = (p, ms) =>
  Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('TIMEOUT')), ms))])

// نحاكي ما يفعله index.js: نملأ global.plugins بنفس المحمّل، ثم نستدعي الدالة
// الحقيقية availableCategories() من menu.js حتى لا نكرّر منطق الفلترة.
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

const { availableCategories } = await import('../plugins/menu.js')
const { categoryIds } = await import('../lib/i18n.js')

const shown = availableCategories()
const hidden = categoryIds().filter((id) => !shown.includes(id))

const hasCommand = (id) =>
  Object.values(global.plugins).some((p) => {
    const c = p?.command
    if (!c) return false
    const arr = c instanceof RegExp ? [c.source] : Array.isArray(c) ? c : [c]
    return arr.some((x) => new RegExp(`قسم_${id}(?![a-zA-Z0-9_])`).test(String(x)))
  })

const dead = shown.filter((id) => !hasCommand(id))

console.log(`categories defined:  ${categoryIds().length}`)
console.log(`categories shown:    ${shown.length}`)
console.log(`categories hidden:   ${hidden.length}${hidden.length ? ' (' + hidden.join(', ') + ')' : ''}`)
console.log(`dead buttons:        ${dead.length}${dead.length ? ' (' + dead.join(', ') + ')' : ''}`)
for (const id of dead) console.log('  DEAD BUTTON', id, '-> no plugin registers .قسم_' + id)

process.exit(dead.length ? 1 : 0)
