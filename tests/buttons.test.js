import assert from 'node:assert/strict'
import { test } from 'node:test'

// يختبر مسار ضغط الزر الحقيقي: بلوجن _templateResponse يستقبل رد الزر،
// يعيد إرساله كأمر نصي عبر messages.upsert، ويتحقق من أن الأمر مُسجَّل.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function registerPlugins() {
  global.plugins = {
    'menu.js': { command: ['menu', 'menu_ar', 'menu_en', 'menu_es', 'مينيو', 'القائمة', 'مهام', 'اوامر'] },
    'قسم_AI.js': { command: /^(قسم_ai)$/i },
    'قسم_التحميل.js': { command: /^(قسم_downloader)$/i },
    'only_all.js': { all() {}, tags: [] } // بلا command، يجب ألا يسبب انهياراً
  }
}

test('_templateResponse re-emits a button id as a text command', async () => {
  registerPlugins()
  const emitted = []
  const ctx = {
    user: { id: '111@s.whatsapp.net' },
    prefix: '.',
    ev: { emit: (evt, msg) => emitted.push({ evt, msg }) }
  }
  const mod = await import(join(root, 'plugins/_templateResponse.js'))
  const m = {
    isBaileys: false,
    chat: 'g@g.us',
    sender: '222@s.whatsapp.net',
    mentionedJid: [],
    key: { id: 'ABC' },
    isGroup: false,
    message: { buttonsResponseMessage: { selectedButtonId: '.menu_en', selectedDisplayText: 'English' } }
  }
  await mod.all.call(ctx, m, {})
  assert.equal(emitted.length, 1, 'expected exactly one re-emitted message')
  assert.equal(emitted[0].evt, 'messages.upsert')
})

test('_templateResponse ignores non-button messages', async () => {
  registerPlugins()
  const emitted = []
  const ctx = { user: { id: '111@s.whatsapp.net' }, ev: { emit: (...a) => emitted.push(a) } }
  const mod = await import(join(root, 'plugins/_templateResponse.js'))
  await mod.all.call(ctx, { isBaileys: false, message: { conversation: 'hi' } }, {})
  assert.equal(emitted.length, 0)
})

test('_templateResponse ignores button ids that match no plugin', async () => {
  registerPlugins()
  const emitted = []
  const ctx = { user: { id: '111@s.whatsapp.net' }, prefix: '.', ev: { emit: (...a) => emitted.push(a) } }
  const mod = await import(join(root, 'plugins/_templateResponse.js'))
  const m = {
    isBaileys: false,
    chat: 'g@g.us',
    sender: '222@s.whatsapp.net',
    key: { id: 'ABC' },
    isGroup: false,
    message: { buttonsResponseMessage: { selectedButtonId: '.nope_unknown' } }
  }
  await mod.all.call(ctx, m, {})
  assert.equal(emitted.length, 0)
})

test('menu registers every language-picker command as a real command', async () => {
  global.plugins = {}
  const src = readFileSync(join(root, 'plugins/menu.js'), 'utf8')
  for (const cmd of ['menu_ar', 'menu_en', 'menu_es']) {
    assert.ok(src.includes(cmd), `menu.js must register ${cmd}`)
  }
})
