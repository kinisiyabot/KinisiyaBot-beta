import assert from 'node:assert/strict'
import { test, beforeEach } from 'node:test'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { proto } from '@whiskeysockets/baileys'

// سيناريو المستخدم الحقيقي: بلوجن يرسل أزراره ملفوفة بـ viewOnceMessage
// (مثل علم/احزر/تقيم)، ثم يضغط المستخدم الزر فيصل الردّ ملفوفاً أيضاً.
// يجب أن يتحوّل ضغط الزر إلى أمر نصي فوراً، وإلا لا يُرسل أي رد.
const root = join(dirname(fileURLToPath(import.meta.url)), '..')
let loadSeq = 0
const loadTemplateResponse = () =>
  import(`${join(root, 'plugins/_templateResponse.js')}?v=${loadSeq++}`)

beforeEach(() => {
  global.plugins = { 'علم.js': { command: /^(علم|answer_.+)$/i } }
  global.opts = {}
})

function makeCtx() {
  const emitted = []
  return {
    ctx: { user: { id: '111@s.whatsapp.net' }, prefix: '.', ev: { emit: (e, m) => emitted.push(m) } },
    emitted,
  }
}

const wrap = (message) => ({ viewOnceMessage: { message: { messageContextInfo: {}, ...message } } })

function replyMsg(message) {
  return {
    isBaileys: false,
    chat: 'g@g.us',
    sender: '222@s.whatsapp.net',
    mentionedJid: [],
    key: { id: 'A' },
    isGroup: false,
    message,
  }
}

test('a viewOnce-wrapped native-flow button reply is re-emitted as its command', async () => {
  const { ctx, emitted } = makeCtx()
  const mod = await loadTemplateResponse()
  const m = replyMsg(
    wrap({
      interactiveResponseMessage: {
        nativeFlowResponseMessage: { paramsJson: JSON.stringify({ id: '.answer_مصر' }) },
      },
    })
  )
  await mod.all.call(ctx, m, {})
  assert.equal(emitted.length, 1, 'wrapped button reply must be recognized')
  assert.equal(emitted[0].messages[0].message.extendedTextMessage.text, '.answer_مصر')
})

test('a viewOnce-wrapped buttonsResponseMessage is re-emitted too', async () => {
  const { ctx, emitted } = makeCtx()
  const mod = await loadTemplateResponse()
  const m = replyMsg(wrap({ buttonsResponseMessage: { selectedButtonId: '.علم', selectedDisplayText: 'علم' } }))
  await mod.all.call(ctx, m, {})
  assert.equal(emitted.length, 1)
  assert.equal(emitted[0].messages[0].message.extendedTextMessage.text, '.علم')
})

test('a plain (top-level) reply still works', async () => {
  const { ctx, emitted } = makeCtx()
  const mod = await loadTemplateResponse()
  const m = replyMsg({
    interactiveResponseMessage: {
      nativeFlowResponseMessage: { paramsJson: JSON.stringify({ id: '.answer_فرنسا' }) },
    },
  })
  await mod.all.call(ctx, m, {})
  assert.equal(emitted.length, 1)
})

test('a wrapped reply for an unregistered command is ignored', async () => {
  const { ctx, emitted } = makeCtx()
  const mod = await loadTemplateResponse()
  const m = replyMsg(
    wrap({
      interactiveResponseMessage: {
        nativeFlowResponseMessage: { paramsJson: JSON.stringify({ id: '.امر_غير_مسجل' }) },
      },
    })
  )
  await mod.all.call(ctx, m, {})
  assert.equal(emitted.length, 0)
})

test('the proto shape of a wrapped response is readable end to end', () => {
  // نفس ما يصل فعلياً: نلفّ الردّ كما يفعله بلوجن الأزرار ثم نتحقق أن
  // المفتاح المطابق للزر موجود بعد التحليل البروتوبوفي.
  const parsed = proto.WebMessageInfo.fromObject({
    key: { remoteJid: 'g@g.us', fromMe: false, id: 'A' },
    message: wrap({
      interactiveResponseMessage: {
        nativeFlowResponseMessage: { paramsJson: JSON.stringify({ id: '.answer_مصر' }) },
      },
    }),
  })
  assert.ok(parsed.message.viewOnceMessage, 'client keeps the viewOnce wrapper')
  assert.ok(
    parsed.message.viewOnceMessage.message.interactiveResponseMessage,
    'and the interactive response is inside it'
  )
})
