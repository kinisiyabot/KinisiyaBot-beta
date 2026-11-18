// tests/decrypt-guard-store.test.js
// اختبار بمسار Baileys حقيقي (بلا mocks): useMultiFileAuthState +
// makeCacheableSignalKeyStore + addTransactionCapability، وهي بالضبط ما يبنيه
// index.js. الهدف: إثبات أن الحرس يبطل الجلسة في الذاكرة لا في القرص فقط.
//
// سبب هذا الملف: حذف ملف الجلسة من القرص وحده لا يكفي، لأن Baileys يخزّن
// الجلسة في NodeCache داخل الذاكرة (TTL 5 دقائق) ويظل يقرأها. هذا الاختبار
// يفشل لو عاد الحرس إلى الحذف من القرص فقط.

import assert from 'node:assert/strict'
import { test } from 'node:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { useMultiFileAuthState, makeCacheableSignalKeyStore } from '@whiskeysockets/baileys'
import { addTransactionCapability } from '@whiskeysockets/baileys/lib/Utils/auth-utils.js'
import { createDecryptGuard } from '../lib/decrypt-guard.js'

const NUM = '212675036009'
const OTHER = '212693863911'

// يبني مجلد جلسة حقيقياً على القرص ثم مخزن مفاتيح حقيقياً تماماً كما يفعل
// index.js: ملفات ← cacheable ← transaction capability.
async function makeRealStore(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kinisiya-guard-'))
  for (const [name, value] of Object.entries(files)) {
    fs.writeFileSync(path.join(dir, name), JSON.stringify(value))
  }
  const { state } = await useMultiFileAuthState(dir)
  const keys = addTransactionCapability(
    makeCacheableSignalKeyStore(state.keys),
    { trace() {}, warn() {}, debug() {} },
    { maxCommitRetries: 2, delayBetweenTriesMs: 5 }
  )
  return { dir, keys, cleanup: () => fs.rmSync(dir, { recursive: true, force: true }) }
}

test('real Baileys store: a corrupt session is served from the in-memory cache', async () => {
  const { dir, keys, cleanup } = await makeRealStore({
    [`session-${NUM}.0.json`]: { corrupt: true }
  })
  try {
    // أول قراءة تُخزّن الجلسة التالفة في كاش الذاكرة
    const first = await keys.get('session', [`${NUM}.0`])
    assert.deepEqual(first[`${NUM}.0`], { corrupt: true })

    // حذف الملف من القرص (ما كان يفعله الحرس القديم) لا يمسّ الكاش
    fs.unlinkSync(path.join(dir, `session-${NUM}.0.json`))
    const afterDiskDelete = await keys.get('session', [`${NUM}.0`])
    assert.deepEqual(
      afterDiskDelete[`${NUM}.0`],
      { corrupt: true },
      'حذف الملف من القرص وحده لا يكفي — الجلسة التالفة تبقى في الذاكرة'
    )
  } finally {
    cleanup()
  }
})

test('real Baileys store: guard invalidates memory and disk, keeps creds and other numbers', async () => {
  const { dir, keys, cleanup } = await makeRealStore({
    [`session-${NUM}.0.json`]: { corrupt: true },
    [`session-${NUM}.1.json`]: { corrupt: true },
    [`session-${OTHER}.0.json`]: { healthy: true },
    'creds.json': { me: { id: 'bot' }, noiseKey: {} }
  })
  try {
    // Baileys يقرأ الجلسات عند وصول رسالة ⇒ تعبئة الكاش
    await keys.get('session', [`${NUM}.0`, `${NUM}.1`, `${OTHER}.0`])

    const guard = createDecryptGuard({ dir, conn: { authState: { keys } }, log: () => {} })
    let result
    for (let i = 0; i < 6; i++) result = guard.observe('Bad MAC', `${NUM}@s.whatsapp.net`)
    await guard.flush()

    assert.equal(result.triggered, true)
    assert.deepEqual(result.addresses.sort(), [`${NUM}.0`, `${NUM}.1`])

    // الجلسة التالفة صارت غير صالحة في الذاكرة (Baileys يعتبر null/undefined غياباً)
    const after = await keys.get('session', [`${NUM}.0`, `${NUM}.1`, `${OTHER}.0`])
    assert.ok(!after[`${NUM}.0`], 'جلسة الجهاز 0 يجب أن تُبطَل في الذاكرة')
    assert.ok(!after[`${NUM}.1`], 'جلسة الجهاز 1 يجب أن تُبطَل في الذاكرة')
    // جلسة الرقم الآخر و creds لم تُمسّا
    assert.deepEqual(after[`${OTHER}.0`], { healthy: true })
    assert.equal(fs.existsSync(path.join(dir, 'creds.json')), true)

    // وعلى القرص: جلسات الرقم المذكور فقط اختفت
    const onDisk = fs.readdirSync(dir).sort()
    assert.deepEqual(onDisk, ['creds.json', `session-${OTHER}.0.json`])
  } finally {
    cleanup()
  }
})

test('real Baileys store: after invalidation Baileys refetches the session instead of reusing the broken one', async () => {
  const { dir, keys, cleanup } = await makeRealStore({
    [`session-${NUM}.0.json`]: { corrupt: true }
  })
  try {
    await keys.get('session', [`${NUM}.0`]) // تعبئة الكاش
    const guard = createDecryptGuard({ dir, conn: { authState: { keys } }, log: () => {} })
    for (let i = 0; i < 6; i++) guard.observe('Bad MAC', NUM)
    await guard.flush()

    // هذا هو منطق assertSessions في Baileys: غياب الجلسة ⇒ يطلبها من الخادم.
    const sessions = await keys.get('session', [`${NUM}.0`])
    const requiresFetch = !sessions[`${NUM}.0`]
    assert.equal(requiresFetch, true, 'Baileys يجب أن يعتبر الجلسة غائبة فيعيد طلبها')
  } finally {
    cleanup()
  }
})

test('guard without a live store still cleans disk and never throws', async () => {
  const { dir, cleanup } = await makeRealStore({
    [`session-${NUM}.0.json`]: { corrupt: true },
    'creds.json': { me: {} }
  })
  try {
    const guard = createDecryptGuard({ dir, log: () => {} }) // لا conn
    let result
    for (let i = 0; i < 6; i++) result = guard.observe('Bad MAC', NUM)
    await guard.flush()
    assert.equal(result.triggered, true)
    assert.deepEqual(fs.readdirSync(dir).sort(), ['creds.json'])
  } finally {
    cleanup()
  }
})
