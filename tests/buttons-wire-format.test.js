import assert from 'node:assert/strict'
import { test } from 'node:test'
import { proto, generateWAMessageFromContent } from '@whiskeysockets/baileys'
import { ensureMessageContextInfo } from '../lib/interactive.js'

// يمرّر الرسالة على الشبكة كما يفعل relayMessage ثم يفكّها
const overTheWire = (message) => {
  const msg = generateWAMessageFromContent('212675036009@s.whatsapp.net', message, {
    userJid: '212693863911@s.whatsapp.net',
  })
  const patched = ensureMessageContextInfo(msg.message)
  return proto.Message.decode(proto.Message.encode(patched).finish())
}

const im = {
  body: { text: 'سؤال' },
  footer: { text: 'فوتر' },
  nativeFlowMessage: {
    buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'أ', id: '.answer_A' }) }],
    messageParamsJson: '',
  },
}

// سبب العطل: البلوجنات ترسل interactiveMessage داخل viewOnceMessage بلا
// messageContextInfo، فتصل بلا أزرار. البوت القديم كان يضيفه دائماً.
test('a wrapped plugin button message reaches the wire with messageContextInfo', () => {
  const dec = overTheWire({ viewOnceMessage: { message: { interactiveMessage: im } } })
  const inner = dec.viewOnceMessage?.message
  assert.ok(inner, 'the viewOnce wrapper is preserved')
  assert.equal(inner.messageContextInfo?.deviceListMetadataVersion, 2)
  // protobuf يعيد الحقل الفارغ بشكل افتراضي؛ المهم أن الحقل موجود
  assert.equal(typeof inner.messageContextInfo?.deviceListMetadata, 'object')
  assert.equal(inner.interactiveMessage.nativeFlowMessage.buttons.length, 1)
  assert.equal(JSON.parse(inner.interactiveMessage.nativeFlowMessage.buttons[0].buttonParamsJson).display_text, 'أ')
})

test('a top-level button message reaches the wire with messageContextInfo', () => {
  const dec = overTheWire({ interactiveMessage: im })
  assert.equal(dec.messageContextInfo?.deviceListMetadataVersion, 2)
  assert.equal(dec.interactiveMessage.nativeFlowMessage.buttons.length, 1)
})

test('nested wrappers keep their shape and gain the context at the inner level', () => {
  const dec = overTheWire({
    ephemeralMessage: { message: { viewOnceMessage: { message: { interactiveMessage: im } } } },
  })
  const inner = dec.ephemeralMessage?.message?.viewOnceMessage?.message
  assert.equal(inner?.messageContextInfo?.deviceListMetadataVersion, 2)
  assert.equal(inner?.interactiveMessage?.nativeFlowMessage?.buttons?.length, 1)
})

test('a real view-once photo is not given a context', () => {
  const dec = overTheWire({ viewOnceMessage: { message: { imageMessage: { url: 'https://x/y.jpg' } } } })
  assert.ok(!dec.viewOnceMessage?.message?.messageContextInfo)
})

test('plain text is untouched', () => {
  const dec = overTheWire({ conversation: 'مرحبا' })
  assert.ok(!dec.messageContextInfo, 'plain text must not gain a context')
  assert.equal(dec.conversation, 'مرحبا')
})

test('the menu shape (top-level, no header) still carries its buttons', () => {
  const dec = overTheWire({
    interactiveMessage: {
      body: { text: 'قائمة' },
      footer: { text: '' },
      nativeFlowMessage: {
        buttons: [{ name: 'single_select', buttonParamsJson: JSON.stringify({ title: 'الأقسام', sections: [] }) }],
        messageParamsJson: '',
      },
    },
  })
  assert.equal(dec.messageContextInfo?.deviceListMetadataVersion, 2)
  assert.equal(dec.interactiveMessage.nativeFlowMessage.buttons[0].name, 'single_select')
})
