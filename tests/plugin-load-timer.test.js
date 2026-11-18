import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

// timer.unref() على مؤقّت المهلة كان يجعل Node يخرج قبل انتهاء المهلة عندما
// يعلّق بلوجن (لا عمل آخر مجدول)، فيموت البوت بدل تخطّي البلوجن. هذا يظهر على
// Node 22 (نسخة CI) كـ "Detected unsettled top-level await" / cancelledByParent.
const root = join(dirname(fileURLToPath(import.meta.url)), '..')

test('lib/plugin-load.js must not unref() the load timeout timer', () => {
  const src = readFileSync(join(root, 'lib/plugin-load.js'), 'utf8')
  const code = src.split('\n').filter((l) => !l.trim().startsWith('//')).join('\n')
  assert.ok(
    !/timer\s*\.\s*unref\s*\(/.test(code),
    'unref() on the load timer makes the process exit early on a hanging plugin'
  )
})
