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
  connectionReady,
  PENDING_TTL
} from '../lib/self-heal.js'

function make(overrides = {}) {
  const sent = []
  const healed = []
  let clock = 1_000_000
  const sh = createSelfHeal({
    now: () => clock,
    send: async (item) => sent.push(item),
    onHeal: (item) => healed.push(item),
    log: () => {},
    ...overrides
  })
  return { sh, sent, healed, tick: (ms) => (clock += ms), at: () => clock }
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
  const item = sh.observe('TypeError: boom at plugins/x.js:1:1 session 12345678')
  assert.ok(item && item.id === 1)
  assert.equal(sent.length, 1)
  // نفس الخطأ (بمعرّف متغيّر) -> لا إبلاغ ثانٍ
  assert.equal(sh.observe('TypeError: boom at plugins/x.js:1:1 session 87654321'), null)
  assert.equal(sent.length, 1)
})

test('distinct errors each notify exactly once (no per-minute throttle)', () => {
  const { sh, sent, tick } = make()
  sh.observe('Error: first distinct failure')
  sh.observe('Error: second distinct failure') // خطأ مختلف -> إبلاغ فوري أيضاً
  assert.equal(sent.length, 2)
  tick(60_001)
  sh.observe('Error: third distinct failure')
  assert.equal(sent.length, 3)
  // نفس الخطأ مرة أخرى -> لا إبلاغ
  sh.observe('Error: third distinct failure')
  assert.equal(sent.length, 3)
})

test('confirm within the 5-minute window triggers a heal, not a restart', () => {
  const { sh, healed, tick } = make()
  const item = sh.observe('RangeError: index out of bounds')
  tick(4 * 60 * 1000) // قبل انتهاء 5 دقائق
  const res = sh.confirm(item.id)
  assert.ok(res.ok)
  assert.equal(healed.length, 1)
  assert.equal(healed[0].id, item.id)
})

test('confirm after the 5-minute window is rejected (expired)', () => {
  const { sh, healed, tick } = make()
  const item = sh.observe('RangeError: index out of bounds')
  assert.equal(item.expires - item.at, PENDING_TTL)
  tick(PENDING_TTL + 1)
  const res = sh.confirm(item.id)
  assert.equal(res.ok, false)
  assert.equal(res.reason, 'not-found')
  assert.equal(healed.length, 0)
})

test('cancel marks the error handled and never heals', () => {
  const { sh, healed } = make()
  const item = sh.observe('SyntaxError: unexpected token')
  const res = sh.cancel(item.id)
  assert.ok(res.ok)
  assert.equal(sh.getPending(item.id), null)
  assert.equal(healed.length, 0)
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
  const { sh, healed } = make()
  sh.observe('Error: one')
  const res = sh.handleOwnerText('نعم')
  assert.ok(res.ok)
  assert.equal(healed.length, 1)
})

test('formatReport includes the id, place and the 5-minute notice', () => {
  const item = { id: 7, at: Date.now(), text: 'Error: x\n at plugins/z.js:1:1', meta: { type: 'uncaughtException' } }
  const out = formatReport(item)
  assert.ok(out.includes('#7'))
  assert.ok(out.includes('z.js'))
  assert.ok(out.includes('5 دقائق'))
})

test('connectionReady is false until Baileys exposes creds.me (conn.user.id)', () => {
  assert.equal(connectionReady(null), false)
  assert.equal(connectionReady(undefined), false)
  assert.equal(connectionReady({}), false)
  assert.equal(connectionReady({ user: null }), false)
  // Baileys exposes user as a getter over authState.creds.me, undefined pre-login
  assert.equal(connectionReady({ user: undefined }), false)
  assert.equal(connectionReady({ user: {} }), false)
  assert.equal(connectionReady({ user: { id: '2126@s.whatsapp.net' } }), true)
})

test('self-heal defers owner reports until the connection is ready (no pre-login crash)', async () => {
  const { sendToOwners, flushSelfHeal } = await import('../lib/self-heal.js')
  const sent = []

  // pre-login: conn exists but creds.me is undefined -> must NOT attempt send
  global.owner = [['212600000000']]
  global.conn = {
    user: undefined,
    sendMessage: async (jid, content) => {
      // mimic Baileys relayMessage reading creds.me.id
      const me = global.conn.user
      if (!me || !me.id) throw new TypeError("Cannot read properties of undefined (reading 'id')")
      sent.push({ jid, content })
    }
  }

  const item = { id: 1, at: Date.now(), text: 'Error: boot failure', meta: {} }
  await sendToOwners(item)
  assert.equal(sent.length, 0, 'no send attempted before login')

  // after login: flush delivers the queued report
  global.conn.user = { id: '212600000000@s.whatsapp.net' }
  const n = await flushSelfHeal()
  assert.equal(n, 1, 'queued report flushed after login')
  assert.equal(sent.length, 1)
  assert.equal(sent[0].jid, '212600000000@s.whatsapp.net')
})
