import assert from 'node:assert/strict'
import { test } from 'node:test'
import { proto } from '@whiskeysockets/baileys'
import { routeButtonReply, findPluginForCommand } from '../lib/button-router.js'
import { normalizeButtons, MAX_BUTTONS, readInteractiveReply } from '../lib/interactive.js'

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

test('more than three buttons are folded into a list without losing options', () => {
  const qr = (t, id) => ({ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: t, id }) })
  const nine = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'].map((x) => qr(x, `.c_${x}`))
  const out = normalizeButtons(nine)
  assert.equal(out.length, MAX_BUTTONS)
  const rows = JSON.parse(out.find((b) => b.name === 'single_select').buttonParamsJson).sections[0].rows
  const kept = out.filter((b) => b.name === 'quick_reply').length
  assert.equal(rows.length + kept, nine.length)
  assert.deepEqual(rows.map((r) => r.id), ['.c_c', '.c_d', '.c_e', '.c_f', '.c_g', '.c_h', '.c_i'])
})

test('three buttons or fewer are left untouched', () => {
  const two = [
    { name: 'quick_reply', buttonParamsJson: '{}' },
    { name: 'cta_url', buttonParamsJson: '{}' },
  ]
  assert.equal(normalizeButtons(two), two)
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
