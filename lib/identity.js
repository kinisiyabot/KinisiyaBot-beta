// lib/identity.js
// Unified WhatsApp identity resolution.
//
// WhatsApp exposes the same account under two different identifiers:
//   - the phone-number JID: 212693863911@s.whatsapp.net
//   - the privacy LID:      172048387182781@lid
// A message can arrive addressed by either one (and sometimes with a device
// suffix, e.g. "212693863911:4@s.whatsapp.net"). Comparing raw JID strings is
// therefore unreliable: a number the bot "cannot see" (only the LID is known)
// stops matching the owner/elite lists.
//
// This module keeps an alias map (PN <-> LID) learned from group metadata and
// message keys, and answers "is this the same account?" for both forms.
// Every check fails closed: an identifier with no digits never matches.

const NON_DIGITS = /[^0-9]/g

export function toNumber(value) {
  if (value === null || value === undefined) return ''
  let str = String(value)
  const at = str.indexOf('@')
  if (at !== -1) str = str.slice(0, at)
  const colon = str.indexOf(':')
  if (colon !== -1) str = str.slice(0, colon)
  return str.replace(NON_DIGITS, '')
}

// "212693863911:4@s.whatsapp.net" -> "212693863911@s.whatsapp.net"
export function bareJid(jid) {
  if (!jid || typeof jid !== 'string') return ''
  const at = jid.indexOf('@')
  if (at === -1) return jid.split(':')[0]
  const user = jid.slice(0, at).split(':')[0]
  const server = jid.slice(at + 1).replace(/:\d+$/, '')
  return `${user}@${server}`
}

const IDENTITY_FIELDS = [
  'id', 'jid', 'lid', 'pn', 'user',
  'participant', 'participantPn', 'participantLid',
  'senderPn', 'senderLid', 'phoneNumber', 'phone_number'
]

const ALIASES = new Map() // number -> Set<number> (all numbers for the same account)

function bucket(number) {
  if (!ALIASES.has(number)) ALIASES.set(number, new Set([number]))
  return ALIASES.get(number)
}

function link(a, b) {
  const na = toNumber(a)
  const nb = toNumber(b)
  if (!na || !nb) return
  const setA = bucket(na)
  const setB = bucket(nb)
  if (setA === setB) return
  const merged = new Set([...setA, ...setB])
  for (const n of merged) ALIASES.set(n, merged)
}

// Learn that the given identifiers belong to the same account. Accepts raw
// JIDs, plain numbers, participant/key objects, or arrays of them.
export function learnIdentity(...values) {
  const numbers = []
  const collect = (value) => {
    if (value === null || value === undefined) return
    if (Array.isArray(value)) {
      for (const item of value) collect(item)
      return
    }
    if (typeof value === 'object') {
      for (const field of IDENTITY_FIELDS) {
        if (value[field] !== undefined && value[field] !== null) {
          const n = toNumber(value[field])
          if (n) numbers.push(n)
        }
      }
      return
    }
    const n = toNumber(value)
    if (n) numbers.push(n)
  }
  for (const value of values) collect(value)
  for (let i = 1; i < numbers.length; i++) link(numbers[0], numbers[i])
  return numbers
}

export function aliasesOf(value) {
  const n = toNumber(value)
  if (!n) return new Set()
  return ALIASES.get(n) || new Set([n])
}

// يمسح كل الخرائط المُتعلَّمة. للاستخدام في الاختبارات وعند إعادة الاتصال.
export function clearIdentity() {
  ALIASES.clear()
}

// True only when both sides resolve to at least one common number.
export function sameIdentity(a, b) {
  const setA = aliasesOf(a)
  const setB = aliasesOf(b)
  if (!setA.size || !setB.size) return false
  for (const n of setA) if (setB.has(n)) return true
  return false
}

// Does `value` match any entry of a list of numbers/JIDs/owner tuples?
export function matchesAny(value, list) {
  if (!toNumber(value) || !Array.isArray(list)) return false
  return list.some((entry) => {
    const raw = Array.isArray(entry) ? entry[0] : entry
    return toNumber(raw) && sameIdentity(raw, value)
  })
}
