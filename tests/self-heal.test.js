import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  createSelfHeal,
  isIgnored,
  fingerprint,
  matchYes,
  matchNo,
  guessPlugin,
  formatReport,
  PENDING_TTL
} from '../lib/self-heal.js'

function make(overrides = {}) {
  const sent = []
  const restarted = []
  let clock = 1_000_000
  const sh = createSelfHeal({
    now: () => clock,
    send: async (item) => sent.push(item),
    onRestart: (item) => restarted.push(item),
    log: () => {},
    ...overrides
  })
  return { sh, sent, restarted, tick: (ms) => (clock += ms), at: () => clock }
}

test('isIgnored filters connection noise and tiny strings', () => {
  assert.ok(isIgnored(''))
  assert.ok(isIgnored('hi'))
  assert.ok(isIgnored('Please scan this QR code'))
  assert.ok(isIgnored('Connection Closed'))
  assert.ok(isIgnored('Bad MAC'))
  assert.ok(isIgnored('stream errored, statusCode: 428'))
  assert.ok(!isIgnored('TypeError: cannot read properties of undefined (reading x)'))
})

test('fingerprint is stable across volatile identifiers', () => {
  const a = fingerprint('Error at 1700000000000 in session 12345678 at 12:00:01')
  const b = fingerprint('Error at 1800000000000 in session 87654321 at 13:22:59')
  assert.equal(a, b)
  assert.notEqual(a, fingerprint('a totally different failure'))
})

test('matchYes / matchNo recognise Arabic and English replies', () => {
  for (const y of ['نعم', 'أكيد', 'صلحه', 'تمام', 'yes', 'OK', 'Sure']) assert.ok(matchYes(y), y)
  for (const n of ['لا', 'تجاهل', 'بعدين', 'no', 'nope', 'later']) assert.ok(matchNo(n), n)
  assert.ok(!matchYes('لا'))
  assert.ok(!matchNo('نعم'))
})

test('guessPlugin pulls the plugin file out of a stack trace', () => {
  assert.equal(guessPlugin('at foo (file:///app/plugins/menu.js:12:3)'), 'menu.js')
  assert.equal(guessPlugin('no path here'), null)
})

test('observe notifies once and dedupes the same error', () => {
  const { sh, sent } = make()
  const item = sh.observe('TypeError: boom at plugins/x.js:1:1')
  assert.ok(item && item.id === 1)
  assert.equal(sent.length, 1)
  // نفس الخطأ (بأرقام مختلفة) خلال نافذة التكرار -> لا إبلاغ ثانٍ
  assert.equal(sh.observe('TypeError: boom at plugins/x.js:999:1'), null)
  assert.equal(sent.length, 1)
})

test('cooldown blocks a second distinct error within the window', () => {
  const { sh, sent, tick } = make()
  sh.observe('Error: first distinct failure')
  sh.observe('Error: second distinct failure') // خلال نفس اللحظة -> cooldown
  assert.equal(sent.length, 1)
  tick(60_001)
  sh.observe('Error: third distinct failure')
  assert.equal(sent.length, 2)
})

test('confirm within the 5-minute window triggers a restart', () => {
  const { sh, restarted, tick } = make()
  const item = sh.observe('RangeError: index out of bounds')
  tick(4 * 60 * 1000) // قبل انتهاء 5 دقائق
  const res = sh.confirm(item.id)
  assert.ok(res.ok)
  assert.equal(restarted.length, 1)
  assert.equal(restarted[0].id, item.id)
})

test('confirm after the 5-minute window is rejected (expired)', () => {
  const { sh, restarted, tick } = make()
  const item = sh.observe('RangeError: index out of bounds')
  assert.equal(item.expires - item.at, PENDING_TTL)
  tick(PENDING_TTL + 1)
  const res = sh.confirm(item.id)
  assert.equal(res.ok, false)
  assert.equal(res.reason, 'not-found')
  assert.equal(restarted.length, 0)
})

test('cancel marks the error handled and never restarts', () => {
  const { sh, restarted } = make()
  const item = sh.observe('SyntaxError: unexpected token')
  const res = sh.cancel(item.id)
  assert.ok(res.ok)
  assert.equal(sh.getPending(item.id), null)
  assert.equal(restarted.length, 0)
})

test('resolveOwnerReply parses buttons and explicit commands', () => {
  const { sh } = make()
  const item = sh.observe('Error: something broke')
  assert.deepEqual(sh.resolveOwnerReply(`.selfheal ${item.id}`), { action: 'yes', id: item.id })
  assert.deepEqual(sh.resolveOwnerReply(`.selfheal-no ${item.id}`), { action: 'no', id: item.id })
  assert.deepEqual(sh.resolveOwnerReply('نعم'), { action: 'yes', id: item.id })
  assert.deepEqual(sh.resolveOwnerReply('لا'), { action: 'no', id: item.id })
  assert.equal(sh.resolveOwnerReply('كلام عادي'), null)
  assert.equal(sh.resolveOwnerReply('نعم', false), null) // غير المالك
})

test('handleOwnerText confirms the latest pending error', () => {
  const { sh, restarted } = make()
  sh.observe('Error: one')
  const res = sh.handleOwnerText('نعم')
  assert.ok(res.ok)
  assert.equal(restarted.length, 1)
})

test('formatReport includes the id, place and the 5-minute notice', () => {
  const item = { id: 7, at: Date.now(), text: 'Error: x\n at plugins/z.js:1:1', meta: { type: 'uncaughtException' } }
  const out = formatReport(item)
  assert.ok(out.includes('#7'))
  assert.ok(out.includes('z.js'))
  assert.ok(out.includes('5 دقائق'))
})
