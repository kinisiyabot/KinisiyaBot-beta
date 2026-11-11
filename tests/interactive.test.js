import assert from 'node:assert/strict'
import { test } from 'node:test'
import { proto } from '@whiskeysockets/baileys'
import { buildInteractiveMessage, serialize } from '../lib/simple.js'

serialize()

const buttons = [
  { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'yes', id: '.ok' }) }
]

test('buildInteractiveMessage maps content into a nativeFlow interactiveMessage', () => {
  const { interactiveMessage: im, imageSource } = buildInteractiveMessage({
    text: 'hello',
    title: 'T',
    subtitle: 'S',
    footer: 'F',
    interactiveButtons: buttons
  })
  assert.equal(im.body.text, 'hello')
  assert.equal(im.header.title, 'T')
  assert.equal(im.header.subtitle, 'S')
  assert.equal(im.footer.text, 'F')
  assert.equal(im.header.hasMediaAttachment, false)
  assert.equal(im.nativeFlowMessage.buttons.length, 1)
  assert.equal(imageSource, null)
})

test('buildInteractiveMessage prefers caption and detects media', () => {
  const a = buildInteractiveMessage({ caption: 'cap', interactiveButtons: buttons })
  assert.equal(a.interactiveMessage.body.text, 'cap')

  const b = buildInteractiveMessage({ image: { url: 'http://x/y.jpg' }, interactiveButtons: buttons })
  assert.deepEqual(b.imageSource, { url: 'http://x/y.jpg' })

  const c = buildInteractiveMessage({ product: { productImage: { url: 'http://x/p.jpg' } }, interactiveButtons: buttons })
  assert.deepEqual(c.imageSource, { url: 'http://x/p.jpg' })
})

test('incoming button/list replies resolve to m.text', () => {
  const M = proto.WebMessageInfo
  const mk = (message) => M.fromObject({ key: { remoteJid: '1@s.whatsapp.net', fromMe: false }, message })

  assert.equal(mk({ buttonsResponseMessage: { selectedButtonId: '.owner' } }).text, '.owner')
  assert.equal(mk({ listResponseMessage: { singleSelectReply: { selectedRowId: '.قسم_الكل' } } }).text, '.قسم_الكل')
  assert.equal(mk({ templateButtonReplyMessage: { selectedId: '.cmd' } }).text, '.cmd')
  assert.equal(
    mk({ interactiveResponseMessage: { nativeFlowResponseMessage: { paramsJson: JSON.stringify({ id: '.selfheal 3' }) } } }).text,
    '.selfheal 3'
  )
  assert.equal(mk({ conversation: 'مرحبا' }).text, 'مرحبا')
})

test('text getter unwraps viewOnce-wrapped button replies', () => {
  const M = proto.WebMessageInfo
  const wrapped = M.fromObject({
    key: { remoteJid: '1@s.whatsapp.net', fromMe: false },
    message: {
      viewOnceMessage: {
        message: {
          messageContextInfo: {},
          interactiveResponseMessage: {
            nativeFlowResponseMessage: { paramsJson: JSON.stringify({ id: '.menu' }) }
          }
        }
      }
    }
  })
  assert.equal(wrapped.text, '.menu')
})
