import assert from 'node:assert/strict'
import { test } from 'node:test'
import { proto } from '@whiskeysockets/baileys'
import { routeButtonReply, findPluginForCommand } from '../lib/button-router.js'
import { normalizeMessageButtons, MAX_BUTTONS, readInteractiveReply } from '../lib/interactive.js'

const reply = (fields) => ({ message: proto.Message.fromObject(fields) })
const withPlugins = (plugins) => {
  global.plugins = plugins
  global.prefix = ['.']
}

test('a quick_reply tap inside viewOnceMessage routes to its command with arguments', () => {
  withPlugins({ 'video.js': { command: /^(yt720|yt1080)$/i } })
  const m = reply({
    viewOnceMessage: {
      message: {
        interactiveResponseMessage: {
          nativeFlowResponseMessage: { name: 'quick_reply', paramsJson: JSON.stringify({ id: '.yt720 https://youtu.be/x' }) },
          body: { text: '720p' },
        },
      },
    },
  })
  const r = routeButtonReply(m, {})
  assert.equal(r.handled, true)
  assert.equal(r.plugin, 'video.js')
  assert.equal(r.command, 'yt720')
  assert.equal(r.id, '.yt720 https://youtu.be/x')
  assert.equal(r.source, 'interactive')
})

test('a list row without a prefix still routes (menu sections)', () => {
  withPlugins({ 'menu.js': { command: /^قسم_(ai|fun)$/i } })
  const r = routeButtonReply(reply({ listResponseMessage: { title: 'AI', singleSelectReply: { selectedRowId: 'قسم_ai' } } }), {})
  assert.equal(r.handled, true)
  assert.equal(r.plugin, 'menu.js')
  assert.equal(r.command, 'قسم_ai')
  assert.equal(r.normalized, '.قسم_ai')
})

test('a template button reply routes', () => {
  withPlugins({ 'video.js': { command: /^yt1080$/i } })
  const r = routeButtonReply(reply({ templateButtonReplyMessage: { selectedId: '.yt1080 u' } }), {})
  assert.equal(r.handled, true)
  assert.equal(r.command, 'yt1080')
})

test('an unknown button id is reported, not silently dropped', () => {
  withPlugins({ 'video.js': { command: /^yt720$/i } })
  const r = routeButtonReply(reply({ buttonsResponseMessage: { selectedButtonId: '.ghost' } }), {})
  assert.equal(r.handled, false)
  assert.equal(r.plugin, null)
  assert.equal(r.id, '.ghost')
})

test('a plugin that owns its buttons in before() is left alone (no double reply)', () => {
  withPlugins({ 'rate.js': { command: new RegExp(), before: async () => {} } })
  const r = routeButtonReply(reply({ buttonsResponseMessage: { selectedButtonId: 'rate_5' } }), {})
  assert.equal(r.handled, false)
  assert.equal(r.silent, true)
})

test('a match-all regex never claims a button command', () => {
  withPlugins({ 'rate.js': { command: new RegExp() } })
  assert.equal(findPluginForCommand('rate_5'), null)
  assert.equal(findPluginForCommand('anything'), null)
})

test('plain text and real view-once photos are never treated as taps', () => {
  withPlugins({ 'video.js': { command: /^yt720$/i } })
  assert.equal(routeButtonReply({ message: { conversation: 'مرحبا' } }, {}).handled, false)
  const photo = reply({ viewOnceMessage: { message: { imageMessage: { url: 'x' } } } })
  assert.equal(routeButtonReply(photo, {}).handled, false)
})

test('a button reply with no readable id asks the user to type the command', () => {
  withPlugins({ 'video.js': { command: /^yt720$/i } })
  const r = routeButtonReply(reply({ interactiveResponseMessage: { body: { text: 'x' } } }), {})
  assert.equal(r.unreadable, true)
})

test('a message with more than three buttons keeps them all and gains a bottom sheet', () => {
  const qr = (t, id) => ({ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: t, id }) })
  const nine = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'].map((x) => qr(x, `.c_${x}`))
  const msg = normalizeMessageButtons({
    interactiveMessage: { body: { text: 'x' }, nativeFlowMessage: { buttons: nine } },
  })
  const nf = msg.interactiveMessage.nativeFlowMessage
  assert.equal(nf.buttons.length, nine.length, 'no button may be dropped')
  assert.deepEqual(nf.buttons.map((b) => JSON.parse(b.buttonParamsJson).id), nine.map((b) => JSON.parse(b.buttonParamsJson).id))
  const sheet = JSON.parse(nf.messageParamsJson).bottom_sheet
  assert.equal(sheet.in_thread_buttons_limit, MAX_BUTTONS)
})

test('a message with three buttons or fewer is left untouched', () => {
  const two = {
    interactiveMessage: {
      body: { text: 'x' },
      nativeFlowMessage: {
        buttons: [
          { name: 'quick_reply', buttonParamsJson: '{"id":".a"}' },
          { name: 'cta_url', buttonParamsJson: '{}' },
        ],
      },
    },
  }
  assert.equal(normalizeMessageButtons(two), two)
})

test('an existing bottom sheet keeps its own labels', () => {
  const qr = (t, id) => ({ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: t, id }) })
  const buttons = ['a', 'b', 'c', 'd'].map((x) => qr(x, `.c_${x}`))
  const msg = normalizeMessageButtons({
    interactiveMessage: {
      nativeFlowMessage: {
        buttons,
        messageParamsJson: JSON.stringify({ bottom_sheet: { in_thread_buttons_limit: 1, list_title: 'قوائمي' } }),
      },
    },
  })
  const sheet = JSON.parse(msg.interactiveMessage.nativeFlowMessage.messageParamsJson).bottom_sheet
  assert.equal(sheet.list_title, 'قوائمي')
  assert.equal(sheet.in_thread_buttons_limit, 1)
})

test('readInteractiveReply decodes every supported reply shape', () => {
  const cases = [
    [{ buttonsResponseMessage: { selectedButtonId: '.a' } }, '.a'],
    [{ templateButtonReplyMessage: { selectedId: '.b' } }, '.b'],
    [{ listResponseMessage: { singleSelectReply: { selectedRowId: '.c' } } }, '.c'],
    [{ interactiveResponseMessage: { nativeFlowResponseMessage: { paramsJson: '{"id":".d"}' } } }, '.d'],
  ]
  for (const [msg, expected] of cases) {
    assert.equal(readInteractiveReply(proto.Message.fromObject(msg)).id, expected)
  }
})
