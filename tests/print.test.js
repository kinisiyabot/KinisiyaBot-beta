import assert from 'node:assert/strict'
import { test } from 'node:test'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

// print.js registers an fs.watchFile that keeps the event loop alive, so we
// load it in a child process and inspect the module shape there.
function probe(modulePath, script) {
  const child = spawnSync(process.execPath, ['--input-type=module', '-e', script], {
    cwd: ROOT,
    encoding: 'utf8',
    timeout: 20000
  })
  return { out: (child.stdout || '').trim(), err: (child.stderr || '').trim(), status: child.status }
}

test('lib/print.js loads and exports a callable default', () => {
  const { out, err, status } = probe(
    'lib/print.js',
    `
    import { fileURLToPath } from 'url'
    import { dirname, join } from 'path'
    global.opts = {}
    global.__filename = (p) => join(process.cwd(), p)
    const m = await import('./lib/print.js')
    console.log('default:' + typeof m.default)
    process.exit(0)
    `
  )
  assert.equal(status, 0, `child failed: ${err}`)
  assert.match(out, /default:function/, `unexpected output: ${out}`)
})

test('lib/print.js url-regex-safe import resolves to a callable factory', () => {
  const { out, err, status } = probe(
    'lib/print.js',
    `
    global.opts = {}
    const mod = await import('url-regex-safe')
    console.log('factory:' + typeof mod.default)
    const re = mod.default({ strict: false })
    console.log('regex:' + (re instanceof RegExp))
    process.exit(0)
    `
  )
  assert.equal(status, 0, `child failed: ${err}`)
  assert.match(out, /factory:function/)
  assert.match(out, /regex:true/)
})
