import assert from 'node:assert/strict'
import { test } from 'node:test'
import { proto } from '@whiskeysockets/baileys'
import { serialize, protoType } from '../lib/simple.js'

// تهيئة الحد الأدنى من الـ globals التي يتوقّعها الهاندلر (بدون config.js/شبكة).
global.opts = {}
global.prefix = new RegExp('^[#!./-]')
global.owner = [['212693863911', 'OWNER', true]]
global.prems = []
global.loadDatabase = async () => {}
global.db = { data: { users: {}, chats: {}, settings: {}, stats: {} } }
global.plugins = {}

protoType()
serialize()

const pingHandler = (await import('../plugins/ping.js')).default
global.plugins['ping.js'] = pingHandler

const sent = []
const conn = {
  user: { jid: '999@s.whatsapp.net', id: '999@s.whatsapp.net' },
  chats: {},
  sendMessage: async (jid, content) => { sent.push({ jid, content }); return { key: { id: 'x' } } },
  reply: async (jid, text) => { sent.push({ jid, text }); return { key: { id: 'x' } } },
  decodeJid: (j) => j,
  getName: async () => 'Tester',
  groupMetadata: async () => ({ participants: [] }),
  logger: { info() {}, warn() {}, error() {}, debug() {} },
  pushMessage: async () => {}
}
global.conn = conn

const { handler } = await import('../handler.js')

function makeMsg(text, id, sender = '212693863911@s.whatsapp.net') {
  return proto.WebMessageInfo.fromObject({
    key: { remoteJid: sender, fromMe: false, id },
    message: { conversation: text },
    pushName: 'Tester'
  })
}

async function run(text, id) {
  sent.length = 0
  await handler.call(conn, { messages: [makeMsg(text, id)], type: 'notify' })
  await new Promise((r) => setTimeout(r, 300))
  return sent.length
}

// الأمر يجب أن يُنفَّذ حتى عندما يكون معرّف الرسالة بالشكل الحقيقي لواتساب (3EB0/BAE5).
for (const id of ['3EB0ABCDEF1234', 'BAE5ABCDEF1234', 'B24EABCDEF1234', 'TEST123456']) {
  test(`.ping is dispatched for message id ${id}`, async () => {
    assert.ok((await run('.ping', id)) >= 1, 'expected the ping plugin to reply')
  })
}

test('a non-command message is ignored', async () => {
  assert.equal(await run('hello there', '3EB0ABCDEF1234'), 0)
})

// رسالة تعذّر فك تشفيرها (Bad MAC) تصل كـ CIPHERTEXT بلا محتوى: يجب تخطيها
// فقط بلا رد وبلا رمي استثناء، مع الإبقاء على بقية البوت يعمل.
global.sessions = 'tests/.no-such-session-dir'

function makeStub(id, params = ['Bad MAC']) {
  return proto.WebMessageInfo.fromObject({
    key: { remoteJid: '212693863911@s.whatsapp.net', fromMe: false, id },
    messageStubType: 2, // proto.WebMessageInfo.StubType.CIPHERTEXT
    messageStubParameters: params,
    pushName: 'Tester'
  })
}

test('an undecryptable (CIPHERTEXT / Bad MAC) message is skipped without replying', async () => {
  sent.length = 0
  await assert.doesNotReject(
    handler.call(conn, { messages: [makeStub('3EB0DEADBEEF')], type: 'notify' })
  )
  await new Promise((r) => setTimeout(r, 100))
  assert.equal(sent.length, 0)
})

test('a CIPHERTEXT stub with no parameters is also skipped safely', async () => {
  sent.length = 0
  await assert.doesNotReject(
    handler.call(conn, { messages: [makeStub('3EB0CAFEBABE', [])], type: 'notify' })
  )
  await new Promise((r) => setTimeout(r, 100))
  assert.equal(sent.length, 0)
})
