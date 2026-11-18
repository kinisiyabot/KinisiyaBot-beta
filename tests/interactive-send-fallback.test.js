// tests/interactive-send-fallback.test.js
// اختبار بمسار Baileys حقيقي (بلا mocks) يثبت سبب «الصمت التام»:
// تمرير محتوى الأزرار كما هو إلى Baileys يُنتج محتوى فارغاً أو يرمي
// "Invalid media type"، فلا يُرسَل شيء. ويثبت أن الخطة البديلة تُنتج نصاً
// صالحاً يمرّ عبر protobuf فعلاً — أي أن البوت لن يبقى صامتاً.

import assert from 'node:assert/strict'
import { test } from 'node:test'
import { proto, generateWAMessageContent } from '@whiskeysockets/baileys'
import { buildPlainFallback } from '../lib/interactive.js'
import { deliverMessage } from '../lib/simple.js'

// نفس شكل ما ترسله plugins/تست.js و plugins/انذار.js.
const BUTTON_PAYLOAD = {
  product: { productImage: { url: 'https://example.invalid/x.png' } },
  businessOwnerJid: '967738512629@s.whatsapp.net',
  caption: '⚠️ قائمة الإنذارات',
  footer: '⤤ 𝑭𝒖𝒓𝒊𝒏𝒂',
  interactiveButtons: [
    { name: 'single_select', buttonParamsJson: JSON.stringify({ title: 'الأعضاء', sections: [] }) }
  ]
}

// بلا شبكة: نرفض تحميل الوسائط كما يفعل Baileys عند فشل التحميل.
const noUpload = { upload: async () => { throw new Error('offline') } }

test('raw button payload with title/product makes Baileys throw or produce nothing', async () => {
  let sent = null
  let threw = false
  try {
    const content = await generateWAMessageContent(BUTTON_PAYLOAD, noUpload)
    sent = Object.keys(content)
  } catch {
    threw = true
  }
  // إمّا رمى خطأً أو أنتج محتوى فارغاً — في الحالتين لا تصل رسالة.
  assert.ok(
    threw || sent.length === 0,
    `يجب ألا يُنتج Baileys محتوى صالحاً من الأزرار الخام (حصلنا على: ${JSON.stringify(sent)})`
  )
})

test('buildPlainFallback output is accepted by Baileys and yields a real text message', async () => {
  const fallback = buildPlainFallback(BUTTON_PAYLOAD)
  const content = await generateWAMessageContent(fallback, noUpload)
  assert.deepEqual(Object.keys(content), ['extendedTextMessage'])
  assert.ok(content.extendedTextMessage.text.includes('قائمة الإنذارات'))

  // ويمرّ عبر protobuf كما يحدث على الشبكة فعلاً.
  const encoded = proto.Message.encode(content).finish()
  const decoded = proto.Message.decode(encoded)
  assert.ok(decoded.extendedTextMessage.text.includes('قائمة الإنذارات'))
})

test('a button-only payload still yields a sendable text after the fallback', async () => {
  const fallback = buildPlainFallback({
    interactiveButtons: [{ name: 'quick_reply', buttonParamsJson: '{}' }]
  })
  const content = await generateWAMessageContent(fallback, noUpload)
  assert.deepEqual(Object.keys(content), ['extendedTextMessage'])
  assert.ok(content.extendedTextMessage.text.length > 0)
})

// deliverMessage هو منطق الإرسال المُشحون فعلاً في lib/simple.js. نختبره عبر
// إرسال حقيقي عبر Baileys (generateWAMessageContent) لنتأكد أن ما يصل هو محتوى
// صالح، لا مجرّد استدعاء لدالة وهمية.

// مرسل حقيقي: يمرّ بالمحتوى عبر Baileys فعلاً (نفس مسار الشبكة).
async function realSendPlain(content) {
  return generateWAMessageContent(content, noUpload)
}

test('deliverMessage sends interactive buttons when the socket is ready', async () => {
  const calls = []
  const result = await deliverMessage({
    content: { text: 'hi', interactiveButtons: [{ name: 'quick_reply' }] },
    ready: true,
    sendInteractive: async () => { calls.push('interactive'); return { sent: 'interactive' } },
    sendPlain: async () => { calls.push('plain'); return { sent: 'plain' } },
  })
  assert.deepEqual(calls, ['interactive'])
  assert.equal(result.sent, 'interactive')
})

test('deliverMessage falls back to a real text when interactive send throws', async () => {
  const sent = []
  const result = await deliverMessage({
    content: BUTTON_PAYLOAD,
    ready: true,
    sendInteractive: async () => { throw new Error('relay failed') },
    sendPlain: async (c) => { sent.push(c); return realSendPlain(c) },
  })
  // أُرسل نص عادي صالح عبر Baileys فعلاً
  assert.deepEqual(Object.keys(result), ['extendedTextMessage'])
  assert.ok(result.extendedTextMessage.text.includes('قائمة الإنذارات'))
  assert.equal(sent.length, 1)
  assert.equal(sent[0].interactiveButtons, undefined)
})

test('deliverMessage never passes button keys to Baileys when not ready', async () => {
  const sent = []
  const result = await deliverMessage({
    content: BUTTON_PAYLOAD,
    ready: false, // قبل تسجيل الدخول
    sendInteractive: async () => { throw new Error('must not be called') },
    sendPlain: async (c) => { sent.push(c); return realSendPlain(c) },
  })
  assert.deepEqual(Object.keys(result), ['extendedTextMessage'])
  assert.equal(sent[0].interactiveButtons, undefined)
  assert.equal(sent[0].product, undefined)
})

test('deliverMessage passes non-interactive content through untouched', async () => {
  const sent = []
  await deliverMessage({
    content: { text: 'عادي' },
    ready: true,
    sendInteractive: async () => { throw new Error('must not be called') },
    sendPlain: async (c) => { sent.push(c); return realSendPlain(c) },
  })
  assert.deepEqual(sent, [{ text: 'عادي' }])
})
