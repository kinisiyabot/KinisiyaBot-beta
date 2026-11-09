import assert from 'node:assert/strict'
import { test } from 'node:test'
import { toNumber, sameIdentity, matchesAny, learnIdentity } from '../lib/identity.js'

test('toNumber normalizes jids, device suffixes and plain numbers', () => {
  assert.equal(toNumber('212600000001@s.whatsapp.net'), '212600000001')
  assert.equal(toNumber('212600000001:12@s.whatsapp.net'), '212600000001')
  assert.equal(toNumber('212600000001'), '212600000001')
  assert.equal(toNumber('12345@lid'), '12345')
  assert.equal(toNumber(''), '')
  assert.equal(toNumber(undefined), '')
})

test('sameIdentity matches phone number and LID aliases', () => {
  learnIdentity('212600000001@s.whatsapp.net', '99887766@lid', '212600000001@s.whatsapp.net')
  assert.ok(sameIdentity('212600000001@s.whatsapp.net', '99887766@lid'))
  assert.ok(sameIdentity('212600000001:5@s.whatsapp.net', '212600000001'))
  assert.ok(!sameIdentity('212600000002@s.whatsapp.net', '99887766@lid'))
})

test('sameIdentity fails closed on unresolved identifiers', () => {
  assert.ok(!sameIdentity('', ''))
  assert.ok(!sameIdentity(undefined, '212600000001@s.whatsapp.net'))
  assert.ok(!sameIdentity('abc', 'abc'))
})

test('matchesAny works across aliases', () => {
  const owners = ['212693863911@s.whatsapp.net']
  learnIdentity('212693863911@s.whatsapp.net', '555111222@lid')
  assert.ok(matchesAny('212693863911@s.whatsapp.net', owners))
  assert.ok(matchesAny('555111222@lid', owners))
  assert.ok(!matchesAny('212600000099@s.whatsapp.net', owners))
})
