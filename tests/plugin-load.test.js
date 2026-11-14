import { test } from 'node:test'
import assert from 'node:assert/strict'
import { writeFileSync, mkdtempSync, rmSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { pathToFileURL } from 'url'
import { loadPlugin, pluginLabel, DEFAULT_PLUGIN_TIMEOUT } from '../lib/plugin-load.js'

function tmpFile(name, contents) {
  const dir = mkdtempSync(join(tmpdir(), 'plugin-load-'))
  const file = join(dir, name)
  writeFileSync(file, contents)
  return { dir, file, cleanup: () => rmSync(dir, { recursive: true, force: true }) }
}

test('loadPlugin returns the module for a healthy plugin', async () => {
  const t = tmpFile('ok.js', 'export default { command: "ok" }; export const tag = 42;')
  try {
    const res = await loadPlugin(t.file, { name: 'ok.js' })
    assert.equal(res.ok, true)
    assert.equal(res.name, 'ok.js')
    assert.equal(res.module.tag, 42)
    assert.equal(res.module.default.command, 'ok')
  } finally {
    t.cleanup()
  }
})

test('loadPlugin never throws on a module that fails to parse', async () => {
  const t = tmpFile('broken.js', 'export default { this is not valid js')
  const errors = []
  try {
    const res = await loadPlugin(t.file, { name: 'broken.js', log: (...a) => errors.push(a.join(' ')) })
    assert.equal(res.ok, false)
    assert.ok(res.error instanceof Error)
    // the failing plugin's name must be surfaced to the log
    assert.ok(errors.some((line) => line.includes('broken.js')), 'log must name the plugin')
  } finally {
    t.cleanup()
  }
})

test('loadPlugin never throws when the module throws at import time', async () => {
  const t = tmpFile('boom.js', 'throw new Error("kaboom at import");')
  const errors = []
  try {
    const res = await loadPlugin(t.file, { name: 'boom.js', log: (...a) => errors.push(a.join(' ')) })
    assert.equal(res.ok, false)
    assert.match(String(res.error.message), /kaboom/)
    assert.ok(errors.some((line) => line.includes('boom.js')))
  } finally {
    t.cleanup()
  }
})

test('loadPlugin times out a hanging module and reports its name', async () => {
  const t = tmpFile('hang.js', 'await new Promise(() => {});')
  const errors = []
  const t0 = Date.now()
  try {
    const res = await loadPlugin(t.file, { name: 'hang.js', timeoutMs: 200, log: (...a) => errors.push(a.join(' ')) })
    assert.equal(res.ok, false)
    assert.match(String(res.error.message), /timed out/)
    assert.ok(Date.now() - t0 < 2000, 'should give up quickly, not hang the boot')
    assert.ok(errors.some((line) => line.includes('hang.js')))
  } finally {
    t.cleanup()
  }
})

test('a hanging plugin does not stop healthy plugins loaded in parallel', async () => {
  const hang = tmpFile('hang2.js', 'await new Promise(() => {});')
  const good = tmpFile('good.js', 'export const value = "loaded";')
  try {
    const [h, g] = await Promise.all([
      loadPlugin(hang.file, { name: 'hang2.js', timeoutMs: 200, log: () => {} }),
      loadPlugin(good.file, { name: 'good.js' }),
    ])
    assert.equal(h.ok, false)
    assert.equal(g.ok, true)
    assert.equal(g.module.value, 'loaded')
  } finally {
    hang.cleanup()
    good.cleanup()
  }
})

test('pluginLabel extracts the file name from a path or URL', () => {
  assert.equal(pluginLabel('/a/b/c/ستيك.js'), 'ستيك.js')
  assert.equal(pluginLabel('file:///a/b/handler.js'), 'handler.js')
  assert.equal(pluginLabel('handler.js'), 'handler.js')
})

test('DEFAULT_PLUGIN_TIMEOUT is a sane finite number', () => {
  assert.ok(Number.isFinite(DEFAULT_PLUGIN_TIMEOUT))
  assert.ok(DEFAULT_PLUGIN_TIMEOUT > 0)
})
