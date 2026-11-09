// يفحص كل بلوجن في plugins/ و يطبع أي مشاكل: فشل تحميل، تعليق، أوامر مكررة.
// التشغيل:  npm run audit:plugins
import '../lib/config.js'
import { resolvePluginExports } from '../lib/plugin-loader.js'
import { readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'plugins')
const files = readdirSync(dir).filter(f => f.endsWith('.js')).sort()

const withTimeout = (p, ms) => Promise.race([
  p, new Promise((_, rej) => setTimeout(() => rej(new Error('TIMEOUT')), ms))
])

const plugins = {}
const loadFail = []
const hang = []
const noHandler = []
const wildcards = []
const cmdOwners = new Map()

for (const f of files) {
  let mod
  try {
    mod = await withTimeout(import(pathToFileURL(join(dir, f)).href), 8000)
  } catch (e) {
    ;(String(e.message).startsWith('TIMEOUT') ? hang : loadFail).push([f, e.message.slice(0, 160)])
    continue
  }
  for (const [key, v] of Object.entries(resolvePluginExports(mod, f))) {
    const usable = v && (typeof v === 'function' || v.run || v.all || v.before || v.after)
    if (!usable) { noHandler.push(key); continue }
    plugins[key] = v
    if (!v.command) continue
    const names = v.command instanceof RegExp ? [v.command.source] : (Array.isArray(v.command) ? v.command : [v.command])
    for (const n of names) {
      const k = String(n)
      // تعبير نمطي فارغ (?:) = يطابق كل شيء؛ هذه بلوجنات تعتمد على customPrefix
      // أو حماية المالك، فلا تُعتبر تعارضاً على اسم أمر حقيقي.
      if (k === '(?:)' || k === '') { wildcards.push(key); continue }
      if (!cmdOwners.has(k)) cmdOwners.set(k, [])
      cmdOwners.get(k).push(key)
    }
  }
}

const conflicts = [...cmdOwners].filter(([, o]) => o.length > 1)
const withCmd = Object.values(plugins).filter(p => p.command).length

console.log(`files:              ${files.length}`)
console.log(`handlers:           ${Object.keys(plugins).length}`)
console.log(`with .command:      ${withCmd}`)
console.log(`load failures:      ${loadFail.length}`)
console.log(`hangs:              ${hang.length}`)
console.log(`no usable handler:  ${noHandler.length}`)
console.log(`wildcard handlers:  ${wildcards.length}`)
console.log(`duplicate commands: ${conflicts.length}`)
for (const [f, m] of loadFail) console.log('  LOAD FAIL', f, '->', m)
for (const [f, m] of hang) console.log('  HANG', f, '->', m)
for (const f of noHandler) console.log('  NO HANDLER', f)
for (const f of wildcards) console.log('  WILDCARD (customPrefix-gated)', f)
for (const [k, o] of conflicts) console.log('  DUPLICATE', k, '->', o.join(', '))

const broken = loadFail.length + hang.length
process.exit(broken ? 1 : 0)
