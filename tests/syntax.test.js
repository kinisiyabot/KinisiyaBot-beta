import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

// A mangled lib file (like the old lib/import.js, whose function body had been
// truncated to a bare `return` at module scope) breaks nothing at boot only
// because nothing imports it yet. Catch it here instead of at first use.
const libFiles = readdirSync(join(root, 'lib'))
  .filter((f) => f.endsWith('.js'))
  .map((f) => join('lib', f))

const entryFiles = ['index.js', 'handler.js', 'system.js', 'config.js']

for (const rel of [...libFiles, ...entryFiles]) {
  test(`parses without syntax errors: ${rel}`, () => {
    execFileSync(process.execPath, ['--check', join(root, rel)], { stdio: 'pipe' })
    assert.ok(true)
  })
}
