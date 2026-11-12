import assert from 'node:assert/strict'
import { test } from 'node:test'
import { proto } from '@whiskeysockets/baileys'
import { serialize } from '../lib/simple.js'

serialize()

const M = proto.WebMessageInfo
const conn = { user: { jid: '999@s.whatsapp.net', id: '999@s.whatsapp.net' }, decodeJid: (j) => j }

function mk(id, fromMe, sender = '212693863911@s.whatsapp.net') {
  const m = M.fromObject({
    key: { remoteJid: '999@s.whatsapp.net', fromMe, id, participant: fromMe ? undefined : sender },
    message: { conversation: '.ping' }
  })
  m.conn = conn
  return m
}

// معرّفات واتساب الواردة تبدأ غالباً بـ 3EB0/BAE5 — يجب ألا تُصنَّف كرسائل بوت.
for (const prefix of ['3EB0', 'BAE5', 'B24E', '8SCO', 'NJX-', 'SUKI']) {
  test(`incoming message with id prefix ${prefix} is NOT isBaileys`, () => {
    assert.equal(mk(`${prefix}ABCDEF1234`, false).isBaileys, false)
  })
}

test('outgoing message (fromMe) with a bot id prefix IS isBaileys', () => {
  assert.equal(mk('3EB0ABCDEF1234', true).isBaileys, true)
})

test('ordinary incoming message is NOT isBaileys', () => {
  assert.equal(mk('TEST123456', false).isBaileys, false)
})
