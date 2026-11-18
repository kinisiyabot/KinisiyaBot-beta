import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  unwrapMessage,
  findInteractiveMessage,
  normalizeInteractiveMessage,
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

test('normalizeInteractiveMessage lifts wrapped interactiveMessage to top level', () => {
  const out = normalizeInteractiveMessage({ viewOnceMessage: { message: { interactiveMessage: im } } })
  assert.deepEqual(out.interactiveMessage, im)
  assert.equal(out.viewOnceMessage, undefined)
})

test('normalizeInteractiveMessage unwraps nested wrappers', () => {
  const out = normalizeInteractiveMessage({
    ephemeralMessage: { message: { viewOnceMessage: { message: { interactiveMessage: im } } } },
  })
  assert.ok(out.interactiveMessage)
  assert.equal(out.ephemeralMessage, undefined)
  assert.equal(out.viewOnceMessage, undefined)
})

test('normalizeInteractiveMessage leaves non-interactive messages untouched', () => {
  const photo = { viewOnceMessage: { message: { imageMessage: { url: 'x' } } } }
  assert.equal(normalizeInteractiveMessage(photo), photo, 'a real view-once photo must not be rewritten')
  const plain = { conversation: 'hi' }
  assert.equal(normalizeInteractiveMessage(plain), plain)
  assert.equal(normalizeInteractiveMessage(null), null)
})

test('unwrapMessage strips nested wrappers only', () => {
  assert.deepEqual(unwrapMessage({ viewOnceMessage: { message: { conversation: 'x' } } }), { conversation: 'x' })
  assert.deepEqual(unwrapMessage({ conversation: 'x' }), { conversation: 'x' })
})

test('readInteractiveReply reads a plain native-flow response', () => {
  const r = readInteractiveReply({
    interactiveResponseMessage: { nativeFlowResponseMessage: { paramsJson: JSON.stringify({ id: '.answer_مصر' }) } },
  })
  assert.deepEqual(r, { id: '.answer_مصر', text: '' })
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
  assert.deepEqual(r, { id: '.answer_مصر', text: '' })
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

