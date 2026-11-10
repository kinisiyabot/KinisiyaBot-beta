import assert from 'node:assert/strict'
import { test, beforeEach } from 'node:test'
import {
  toNumber,
  bareJid,
  sameIdentity,
  matchesAny,
  learnIdentity,
  aliasesOf,
  clearIdentity
} from '../lib/identity.js'

// الخطأ 1: لا تتسرب الحالة المُتعلَّمة بين الاختبارات.
beforeEach(() => clearIdentity())

test('toNumber normalizes jids, device suffixes and plain numbers', () => {
  assert.equal(toNumber('212600000001@s.whatsapp.net'), '212600000001')
  assert.equal(toNumber('212600000001:12@s.whatsapp.net'), '212600000001')
  assert.equal(toNumber('212600000001'), '212600000001')
  assert.equal(toNumber('12345@lid'), '12345')
  assert.equal(toNumber(''), '')
  assert.equal(toNumber(null), '')
  assert.equal(toNumber(undefined), '')
})

test('bareJid strips device suffix but keeps the server', () => {
  assert.equal(bareJid('212600000001:12@s.whatsapp.net'), '212600000001@s.whatsapp.net')
  assert.equal(bareJid('12345@lid'), '12345@lid')
  assert.equal(bareJid(''), '')
  assert.equal(bareJid(undefined), '')
})

test('number -> LID resolves in both directions (الخطأ 2)', () => {
  learnIdentity('212600000001@s.whatsapp.net', '99887766@lid')
  // الرقم يعرف الـ LID
  assert.ok(sameIdentity('212600000001@s.whatsapp.net', '99887766@lid'))
  // والمعاكس: LID يعرف الرقم
  assert.ok(sameIdentity('99887766@lid', '212600000001@s.whatsapp.net'))
  // ومن خلال رقم آخر للجهاز
  assert.ok(sameIdentity('212600000001:5@s.whatsapp.net', '99887766@lid'))
  // حساب مختلف لا يطابق
  assert.ok(!sameIdentity('212600000002@s.whatsapp.net', '99887766@lid'))
})

test('learnIdentity links every identifier passed together (transitive)', () => {
  learnIdentity('111@s.whatsapp.net', '222@lid', '333@s.whatsapp.net')
  assert.ok(sameIdentity('222@lid', '333@s.whatsapp.net'))
  assert.deepEqual([...aliasesOf('111')].sort(), ['111', '222', '333'])
})

test('sameIdentity fails closed on unresolved identifiers', () => {
  assert.ok(!sameIdentity('', ''))
  assert.ok(!sameIdentity(undefined, '212600000001@s.whatsapp.net'))
  assert.ok(!sameIdentity('abc', 'abc'))
})

test('matchesAny works across aliases, and fails closed (الخطأ 3)', () => {
  const owners = ['212693863911@s.whatsapp.net']
  learnIdentity('212693863911@s.whatsapp.net', '555111222@lid')
  // الرقم يطابق، والـ LID يطابق نفس المالك
  assert.ok(matchesAny('212693863911@s.whatsapp.net', owners))
  assert.ok(matchesAny('555111222@lid', owners))
  assert.ok(!matchesAny('212600000099@s.whatsapp.net', owners))

  // قائمة خاوية -> false
  assert.equal(matchesAny('555111222@lid', []), false)
  // قائمة ليست مصفوفة -> false
  assert.equal(matchesAny('555111222@lid', null), false)
  // LID لم يُتعلَّم بعد لا يطابق أبداً (fail closed)
  assert.equal(matchesAny('999999999@lid', owners), false)
  // قيمة بلا أرقام -> false
  assert.equal(matchesAny('', owners), false)
  assert.equal(matchesAny(undefined, owners), false)
})

test('matchesAny supports owner tuples [number, name, isOwner]', () => {
  const owners = [['212693863911', 'OWNER', true]]
  assert.ok(matchesAny('212693863911@s.whatsapp.net', owners))
  assert.ok(!matchesAny('212600000099@s.whatsapp.net', owners))
})

test('learnIdentity ignores junk and returns only usable numbers', () => {
  assert.deepEqual(learnIdentity(null, '', 'abc', '212600000001@s.whatsapp.net'), ['212600000001'])
})
