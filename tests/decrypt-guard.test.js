import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  createDecryptGuard,
  isDecryptError,
  extractNumber,
  sessionFileName,
  numberFromSessionFile,
  sessionFilesForNumber,
  DEFAULT_THRESHOLD
} from '../lib/decrypt-guard.js'

const SAMPLE = [
  'creds.json',
  'app-state-sync-key-AAAA.json',
  'pre-key-1.json',
  'session-212693863911.0.json',
  'session-212693863911.4.json',
  'session-212675036009.1.json',
  'session-21269386391.0.json' // رقم مختلف (أقصر) — يجب ألا يُطابق
]

// fs وهمي في الذاكرة: يقرأ أسماء الملفات ويحذفها فعلاً (دون لمس القرص).
function makeFs(initial) {
  const files = new Set(initial)
  return {
    files,
    readdirSync: () => [...files],
    unlinkSync: (p) => {
      const name = String(p).split('/').pop()
      if (!files.has(name)) throw new Error('ENOENT')
      files.delete(name)
    }
  }
}

function makeGuard(initial = SAMPLE, overrides = {}) {
  const fakeFs = makeFs(initial)
  const logs = []
  const guard = createDecryptGuard({
    dir: '/fake/session',
    fs: fakeFs,
    path: { join: (dir, file) => `${dir}/${file}` },
    log: (m) => logs.push(String(m)),
    ...overrides
  })
  return { guard, fakeFs, logs }
}

test('isDecryptError matches Bad MAC, Arabic MAC, and session errors', () => {
  assert.ok(isDecryptError('Bad MAC'))
  assert.ok(isDecryptError('Error: Bad MAC'))
  assert.ok(isDecryptError('عنوان MAC غير صالح'))
  assert.ok(isDecryptError('فشل فك تشفير الرسالة باستخدام أي جلسة معروفة'))
  assert.ok(isDecryptError('Failed to decrypt message with any known session...'))
  assert.ok(isDecryptError('Session error:Error: Bad MAC'))
  assert.ok(isDecryptError('No matching sessions found for message'))
  assert.ok(!isDecryptError('TypeError: x is not a function'))
  assert.ok(!isDecryptError(''))
})

test('extractNumber strips JID, device suffix and LID form', () => {
  assert.equal(extractNumber('212693863911@s.whatsapp.net'), '212693863911')
  assert.equal(extractNumber('212693863911:4@s.whatsapp.net'), '212693863911')
  assert.equal(extractNumber('212693863911.4'), '212693863911')
  assert.equal(extractNumber('172048387182781@lid'), '172048387182781')
  assert.equal(extractNumber(''), '')
  assert.equal(extractNumber(null), '')
})

test('sessionFileName and numberFromSessionFile round-trip', () => {
  assert.equal(sessionFileName('212693863911.4'), 'session-212693863911.4.json')
  assert.equal(numberFromSessionFile('session-212693863911.4.json'), '212693863911')
  assert.equal(numberFromSessionFile('session-212693863911.json'), '212693863911')
  assert.equal(numberFromSessionFile('creds.json'), null)
  assert.equal(numberFromSessionFile('pre-key-1.json'), null)
})

test('sessionFilesForNumber matches the exact number only', () => {
  assert.deepEqual(
    sessionFilesForNumber(SAMPLE, '212693863911'),
    ['session-212693863911.0.json', 'session-212693863911.4.json']
  )
  assert.deepEqual(sessionFilesForNumber(SAMPLE, '212675036009'), ['session-212675036009.1.json'])
  // الرقم الأقصر لا يجب أن يُطابق الرقم الأطول ولا العكس
  assert.deepEqual(sessionFilesForNumber(SAMPLE, '21269386391'), ['session-21269386391.0.json'])
  assert.deepEqual(sessionFilesForNumber(SAMPLE, ''), [])
})

test('below the threshold nothing is deleted', () => {
  const { guard, fakeFs } = makeGuard()
  for (let i = 1; i <= DEFAULT_THRESHOLD; i++) {
    const r = guard.note('Bad MAC', '212693863911@s.whatsapp.net')
    assert.equal(r.triggered, false)
    assert.equal(r.count, i)
  }
  assert.equal(fakeFs.files.has('session-212693863911.0.json'), true)
  assert.equal(guard.stats().cleaned, 0)
})

test('exceeding the threshold deletes only that phone session, never creds', () => {
  const { guard, fakeFs, logs } = makeGuard()
  for (let i = 0; i < DEFAULT_THRESHOLD; i++) guard.note('Bad MAC', '212693863911')
  const r = guard.note('Bad MAC', '212693863911')
  assert.equal(r.triggered, true)
  assert.equal(r.count, DEFAULT_THRESHOLD + 1)
  assert.deepEqual(r.cleaned.sort(), ['session-212693863911.0.json', 'session-212693863911.4.json'])
  // جلسة البوت والرقم الآخر وبقية الملفات باقية
  assert.equal(fakeFs.files.has('creds.json'), true)
  assert.equal(fakeFs.files.has('session-212675036009.1.json'), true)
  assert.equal(fakeFs.files.has('session-21269386391.0.json'), true)
  assert.ok(logs.some((l) => l.includes('session-212693863911.0.json')))
})

test('counter resets after cleanup so a single hiccup never deletes again', () => {
  const { guard } = makeGuard()
  for (let i = 0; i <= DEFAULT_THRESHOLD; i++) guard.note('Bad MAC', '212693863911')
  assert.equal(guard.countFor('212693863911'), 0)
  const again = guard.note('Bad MAC', '212693863911')
  assert.equal(again.triggered, false)
})

test('per-number counters are independent', () => {
  const { guard } = makeGuard()
  for (let i = 0; i < DEFAULT_THRESHOLD; i++) guard.note('Bad MAC', '212693863911')
  guard.note('Bad MAC', '212675036009')
  assert.equal(guard.countFor('212693863911'), DEFAULT_THRESHOLD)
  assert.equal(guard.countFor('212675036009'), 1)
  assert.equal(guard.note('Bad MAC', '212675036009').triggered, false)
})

test('note without a number is a safe no-op (never throws)', () => {
  const { guard, fakeFs } = makeGuard()
  const r = guard.note('Bad MAC', '')
  assert.deepEqual(r, { number: '', count: 0, cleaned: [], triggered: false })
  assert.equal(fakeFs.files.size, SAMPLE.length)
})

test('observe ignores non-decrypt errors entirely', () => {
  const { guard, fakeFs } = makeGuard()
  assert.equal(guard.observe('TypeError: boom', '212693863911'), null)
  assert.equal(guard.stats().numbers, 0)
  assert.equal(fakeFs.files.size, SAMPLE.length)
})

test('cleanup survives an unreadable session dir (no throw)', () => {
  const guard = createDecryptGuard({
    dir: '/nope',
    fs: {
      readdirSync: () => {
        throw new Error('ENOENT')
      },
      unlinkSync: () => {}
    },
    path: { join: (a, b) => `${a}/${b}` },
    log: () => {}
  })
  assert.doesNotThrow(() => guard.cleanupNumber('212693863911'))
  assert.deepEqual(guard.cleanupNumber('212693863911'), [])
})
