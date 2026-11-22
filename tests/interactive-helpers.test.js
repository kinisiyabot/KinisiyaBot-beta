import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  unwrapMessage,
  findInteractiveMessage,
  ensureMessageContextInfo,
  readInteractiveReply,
  buildInteractiveContent,
  buildPlainFallback,
} from '../lib/interactive.js'

const im = {
  body: { text: 'Q' },
  footer: { text: 'F' },
  nativeFlowMessage: {
    buttons: [{ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'A', id: '.answer_A' }) }],
  },
}

test('findInteractiveMessage finds top-level and wrapped interactiveMessage', () => {
  assert.equal(findInteractiveMessage({ interactiveMessage: im }).wrapper, null)
  assert.equal(findInteractiveMessage({ viewOnceMessage: { message: { interactiveMessage: im } } }).wrapper, 'viewOnceMessage')
  assert.equal(findInteractiveMessage({ viewOnceMessageV2: { message: { interactiveMessage: im } } }).wrapper, 'viewOnceMessageV2')
  assert.equal(findInteractiveMessage({ conversation: 'hi' }), null)
})

test('ensureMessageContextInfo adds the context a wrapped interactive message needs', () => {
  const out = ensureMessageContextInfo({ viewOnceMessage: { message: { interactiveMessage: im } } })
  // الغلاف يبقى كما هو (البوت القديم كان يعمل به) — نضيف الحقل الناقص فقط
  assert.ok(out.viewOnceMessage, 'the viewOnce wrapper must be preserved')
  const ctx = out.viewOnceMessage.message.messageContextInfo
  assert.equal(ctx.deviceListMetadataVersion, 2)
  assert.deepEqual(ctx.deviceListMetadata, {})
  assert.deepEqual(out.viewOnceMessage.message.interactiveMessage, im)
})

test('ensureMessageContextInfo adds the context to a top-level interactive message', () => {
  const out = ensureMessageContextInfo({ interactiveMessage: im })
  assert.equal(out.messageContextInfo.deviceListMetadataVersion, 2)
  assert.deepEqual(out.interactiveMessage, im)
})

test('ensureMessageContextInfo does not touch non-interactive messages', () => {
  const photo = { viewOnceMessage: { message: { imageMessage: { url: 'x' } } } }
  assert.equal(ensureMessageContextInfo(photo), photo, 'a real view-once photo must not be rewritten')
  const plain = { conversation: 'hi' }
  assert.equal(ensureMessageContextInfo(plain), plain)
  assert.equal(ensureMessageContextInfo(null), null)
})

test('ensureMessageContextInfo keeps an existing messageContextInfo', () => {
  const existing = { messageContextInfo: { deviceListMetadataVersion: 2, deviceListMetadata: { a: 1 } }, interactiveMessage: im }
  assert.equal(ensureMessageContextInfo(existing), existing, 'already-complete messages are returned unchanged')
})

test('unwrapMessage strips nested wrappers only', () => {
  assert.deepEqual(unwrapMessage({ viewOnceMessage: { message: { conversation: 'x' } } }), { conversation: 'x' })
  assert.deepEqual(unwrapMessage({ conversation: 'x' }), { conversation: 'x' })
})

test('readInteractiveReply reads a plain native-flow response', () => {
  const r = readInteractiveReply({
    interactiveResponseMessage: { nativeFlowResponseMessage: { paramsJson: JSON.stringify({ id: '.answer_مصر' }) } },
  })
  assert.deepEqual(r, { id: '.answer_مصر', text: '', source: 'interactive' })
})

test('readInteractiveReply reads a viewOnce-wrapped native-flow response', () => {
  const r = readInteractiveReply({
    viewOnceMessage: {
      message: {
        messageContextInfo: {},
        interactiveResponseMessage: { nativeFlowResponseMessage: { paramsJson: JSON.stringify({ id: '.answer_مصر' }) } },
      },
    },
  })
  assert.deepEqual(r, { id: '.answer_مصر', text: '', source: 'interactive' })
})

test('readInteractiveReply reads buttons/list/template responses (plain + wrapped)', () => {
  assert.equal(readInteractiveReply({ buttonsResponseMessage: { selectedButtonId: '.علم' } }).id, '.علم')
  assert.equal(
    readInteractiveReply({ viewOnceMessage: { message: { buttonsResponseMessage: { selectedButtonId: '.علم' } } } }).id,
    '.علم'
  )
  assert.equal(
    readInteractiveReply({ listResponseMessage: { singleSelectReply: { selectedRowId: '.قسم_ai' } } }).id,
    '.قسم_ai'
  )
  assert.equal(readInteractiveReply({ templateButtonReplyMessage: { selectedId: '.cmd' } }).id, '.cmd')
})

test('readInteractiveReply accepts cmd/command keys and ignores non-buttons', () => {
  assert.equal(
    readInteractiveReply({ interactiveResponseMessage: { nativeFlowResponseMessage: { paramsJson: '{"cmd":".x"}' } } }).id,
    '.x'
  )
  assert.equal(readInteractiveReply({ conversation: 'hi' }), null)
  assert.equal(readInteractiveReply({ interactiveResponseMessage: {} }), null)
})

test('buildInteractiveContent produces the shape menu.js uses', () => {
  const c = buildInteractiveContent({ body: 'B', footer: 'F', buttons: im.nativeFlowMessage.buttons })
  assert.equal(c.body.text, 'B')
  assert.equal(c.footer.text, 'F')
  assert.equal(c.header.hasMediaAttachment, false)
  assert.equal(c.nativeFlowMessage.buttons.length, 1)
  assert.equal(c.nativeFlowMessage.messageParamsJson, '')
})

// سبب هذه الاختبارات: تمرير `interactiveButtons`/`title`/`subtitle`/`product`
// كما هي إلى Baileys يُنتج محتوى فارغاً أو يرمي "Invalid media type"، فلا يُرسَل
// شيء إطلاقاً (صمت تام). الخطة البديلة تضمن أن يصل نصّ صالح دائماً.

test('buildPlainFallback never emits button keys Baileys would reject', () => {
  const fb = buildPlainFallback({
    text: 'نصّ',
    title: 'عنوان',
    subtitle: 'وصف',
    footer: 'فوتر',
    interactiveButtons: [{ name: 'quick_reply' }],
    product: { productImage: { url: 'https://x/y.png' } },
  })
  assert.equal(typeof fb.text, 'string')
  assert.equal(fb.interactiveButtons, undefined)
  assert.equal(fb.title, undefined)
  assert.equal(fb.product, undefined)
  // العنوان والوصف والفوتر لا تُفقد، بل تُدمج في النصّ
  assert.ok(fb.text.includes('نصّ'))
  assert.ok(fb.text.includes('عنوان'))
  assert.ok(fb.text.includes('وصف'))
  assert.ok(fb.text.includes('فوتر'))
})

test('buildPlainFallback uses caption when there is no text and keeps mentions', () => {
  const fb = buildPlainFallback({ caption: 'تعليق', mentions: ['1@s.whatsapp.net'] })
  assert.ok(fb.text.includes('تعليق'))
  assert.deepEqual(fb.mentions, ['1@s.whatsapp.net'])
})

test('buildPlainFallback always yields a non-empty text (bot never goes silent)', () => {
  const fb = buildPlainFallback({ interactiveButtons: [{ name: 'quick_reply' }] })
  assert.ok(fb.text.length > 0)
  const empty = buildPlainFallback({})
  assert.ok(empty.text.length > 0)
})

