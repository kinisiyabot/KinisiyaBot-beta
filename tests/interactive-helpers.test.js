import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  unwrapMessage,
  findInteractiveMessage,
  normalizeInteractiveMessage,
  readInteractiveReply,
  buildInteractiveContent,
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
