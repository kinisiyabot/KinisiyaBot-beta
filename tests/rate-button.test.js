import assert from 'node:assert/strict'
import { test } from 'node:test'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// زر التقييم (rate_1..rate_5) كان لا يعمل: المعالج القديم كان يقرأ حقولاً
// غير موجودة (m.type === 'interactive_response' و m.response). الآن يقرأ
// الردّ التفاعلي الحقيقي من m.message، ويعمل حتى لو كان ملفوفاً بـ viewOnce.
const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const load = () => import(`${join(root, 'plugins/تقيم.js')}?v=${Date.now()}`)

function makeM(message) {
  const state = { replied: null }
  const m = {
    chat: 'g@g.us',
    sender: '222@s.whatsapp.net',
    key: { id: 'A' },
    message,
    state,
    reply: async (t) => { state.replied = t },
    react: async () => {},
  }
  return m
}

const wrap = (message) => ({ viewOnceMessage: { message: { messageContextInfo: {}, ...message } } })
const flow = (id) => ({ interactiveResponseMessage: { nativeFlowResponseMessage: { paramsJson: JSON.stringify({ id }) } } })

test('rate button (plain) triggers the feedback reply', async () => {
  const mod = await load()
  const handler = mod.default
  const sent = []
  const conn = { sendMessage: async (jid, content) => { sent.push({ jid, content }) } }
  const m = makeM(flow('rate_5'))
  const handled = await handler.before.call({}, m, { conn })
  assert.equal(handled, true, 'before() must report the button was handled')
  assert.ok(m.state.replied, 'user must get a feedback reply')
  assert.equal(sent.length, 1, 'developer must be notified once')
})

test('rate button wrapped in viewOnce still triggers the feedback reply', async () => {
  const mod = await load()
  const handler = mod.default
  const sent = []
  const conn = { sendMessage: async (jid, content) => { sent.push({ jid, content }) } }
  const m = makeM(wrap(flow('rate_3')))
  const handled = await handler.before.call({}, m, { conn })
  assert.equal(handled, true)
  assert.ok(m.state.replied)
  assert.equal(sent.length, 1)
})

test('a non-rate button is not handled by تقيم', async () => {
  const mod = await load()
  const handler = mod.default
  const conn = { sendMessage: async () => {} }
  const m = makeM(flow('some_other_button'))
  assert.equal(await handler.before.call({}, m, { conn }), false)
  assert.ok(!m.state.replied)
})

test('a plain text message is not handled by تقيم', async () => {
  const mod = await load()
  const handler = mod.default
  const conn = { sendMessage: async () => {} }
  const m = makeM({ conversation: 'مرحبا' })
  assert.equal(await handler.before.call({}, m, { conn }), false)
})
