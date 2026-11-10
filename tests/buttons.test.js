import assert from 'node:assert/strict'
import { test, beforeEach } from 'node:test'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// يختبر مسار ضغط الزر الحقيقي: بلوجن _templateResponse يستقبل رد الزر،
// يعيد إرساله كأمر نصي عبر messages.upsert، ويتحقق من أن الأمر مُسجَّل.
const root = join(dirname(fileURLToPath(import.meta.url)), '..')

// الخطأ 5: نُنظّف global.plugins قبل كل اختبار، ونستورد بنسخة جديدة من الوحدة
// (query فريد) حتى لا يتأثر اختبار بآخر بسبب كاش import().
let loadSeq = 0
async function loadTemplateResponse() {
  return import(`${join(root, 'plugins/_templateResponse.js')}?v=${loadSeq++}`)
}

beforeEach(() => {
  global.plugins = {
    'menu.js': { command: ['menu', 'menu_ar', 'menu_en', 'menu_es', 'مينيو', 'القائمة', 'مهام', 'اوامر'] },
    'قسم_AI.js': { command: /^(قسم_ai)$/i },
    'قسم_التحميل.js': { command: /^(قسم_downloader)$/i },
    'only_all.js': { all() {}, tags: [] } // بلا command، يجب ألا يسبب انهياراً
  }
  global.opts = {}
})

function makeCtx() {
  const emitted = []
  const ctx = {
    user: { id: '111@s.whatsapp.net' },
    prefix: '.',
    ev: { emit: (evt, msg) => emitted.push({ evt, msg }) }
  }
  return { ctx, emitted }
}

function buttonMessage(selectedButtonId, selectedDisplayText) {
  return {
    isBaileys: false,
    chat: 'g@g.us',
    sender: '222@s.whatsapp.net',
    mentionedJid: [],
    key: { id: 'ABC' },
    isGroup: false,
    message: { buttonsResponseMessage: { selectedButtonId, selectedDisplayText } }
  }
}

test('_templateResponse re-emits a button id as the exact text command (الخطأ 6)', async () => {
  const { ctx, emitted } = makeCtx()
  const mod = await loadTemplateResponse()
  await mod.all.call(ctx, buttonMessage('.menu_en', 'English'), {})

  assert.equal(emitted.length, 1, 'expected exactly one re-emitted message')
  assert.equal(emitted[0].evt, 'messages.upsert')
  // المحتوى الفعلي: نص الأمر نفسه، وليس فقط العدد.
  const re = emitted[0].msg.messages[0]
  assert.equal(re.message.extendedTextMessage.text, '.menu_en')
  // يُعيد استخدام نفس معرّف الرسالة الأصلية
  assert.equal(re.key.id, 'ABC')
  assert.equal(re.key.fromMe, false)
})

test('_templateResponse re-emits a list-row selection too', async () => {
  const { ctx, emitted } = makeCtx()
  const mod = await loadTemplateResponse()
  const m = {
    isBaileys: false,
    chat: 'g@g.us',
    sender: '222@s.whatsapp.net',
    mentionedJid: [],
    key: { id: 'XYZ' },
    isGroup: false,
    message: { listResponseMessage: { singleSelectReply: { selectedRowId: '.menu_ar' }, title: 'العربية' } }
  }
  await mod.all.call(ctx, m, {})
  assert.equal(emitted.length, 1)
  assert.equal(emitted[0].msg.messages[0].message.extendedTextMessage.text, '.menu_ar')
})

test('_templateResponse ignores non-button messages', async () => {
  const { ctx, emitted } = makeCtx()
  const mod = await loadTemplateResponse()
  await mod.all.call(ctx, { isBaileys: false, message: { conversation: 'hi' } }, {})
  assert.equal(emitted.length, 0)
})

test('_templateResponse ignores button ids that match no plugin', async () => {
  const { ctx, emitted } = makeCtx()
  const mod = await loadTemplateResponse()
  await mod.all.call(ctx, buttonMessage('.nope_unknown'), {})
  assert.equal(emitted.length, 0)
})

test('_templateResponse is isolated between runs (الخطأ 5)', async () => {
  // اختبار ثانٍ يعتمد على نظافة الحالة: نُعيد تعريف البلوجنات ثم نتحقق
  global.plugins = { 'menu.js': { command: ['menu_en'] } }
  const { ctx, emitted } = makeCtx()
  const mod = await loadTemplateResponse()
  await mod.all.call(ctx, buttonMessage('.menu_ar'), {})
  // menu_ar غير مُسجَّل في هذه المجموعة -> لا إرسال
  assert.equal(emitted.length, 0)
})

test('menu.js really registers every language-picker command (الخطأ 4)', async () => {
  // فحص سلوكي: نقرأ تصدير البلوجن نفسه، لا نص الملف (حتى لا ينجح بسبب تعليق).
  const mod = await import(`${join(root, 'plugins/menu.js')}?v=${loadSeq++}`)
  const handler = mod.default
  assert.ok(handler && handler.command, 'menu.js must export a handler with .command')
  const commands = Array.isArray(handler.command) ? handler.command : [handler.command]
  for (const cmd of ['menu_ar', 'menu_en', 'menu_es']) {
    assert.ok(commands.includes(cmd), `menu.js must register ${cmd}`)
  }
})

test('menu.js builds sections from plugins that actually register them (الخطأ 4)', async () => {
  // نفس شكل البلوجنات الحقيقية: RegExp /^(قسم_<id>)$/i
  global.plugins = {
    'قسم_AI.js': { command: /^(قسم_ai)$/i },
    'قسم_الالعاب.js': { command: /^(قسم_game)$/i }
  }
  const mod = await import(`${join(root, 'plugins/menu.js')}?v=${loadSeq++}`)
  const cats = mod.availableCategories()
  assert.ok(cats.includes('ai'), 'ai section must be available')
  assert.ok(cats.includes('game'), 'game section must be available')
  assert.ok(!cats.includes('quran'), 'quran must be hidden when no plugin registers it')
})
