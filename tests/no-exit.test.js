import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

// السياسة: لا يوقف البوت نفسه ولا يمحو ملفاته. lib/API.js used to run
// fs.rmSync(process.cwd(), { recursive: true }) + process.exit(1) from a
// panel-triggered "death" path — one message could wipe the source + sessions.
const coreFiles = [
  ...readdirSync(join(root, 'lib')).filter((f) => f.endsWith('.js')).map((f) => join('lib', f)),
  'index.js',
  'handler.js',
  'system.js',
  'config.js',
]

for (const rel of coreFiles) {
  const src = readFileSync(join(root, rel), 'utf8')

  test(`no process.exit in ${rel}`, () => {
    assert.ok(!/\bprocess\.exit\s*\(/.test(src), `${rel} must never force-exit the bot`)
  })

  test(`no self-wipe (rmSync on the project dir) in ${rel}`, () => {
    assert.ok(
      !/rmSync\s*\(\s*process\.cwd\s*\(/.test(src),
      `${rel} must never delete the project directory`
    )
  })
}
