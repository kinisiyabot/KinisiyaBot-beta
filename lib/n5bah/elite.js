// lib/n5bah/elite.js
import { toNumber, learnIdentity, matchesAny } from '../identity.js'

// ✨ قائمة الأرقام المميزة (Elite Numbers)
// يمكن وضع رقم الهاتف أو الـ LID، كلاهما يعمل.
export const eliteNumbers = [
  '212693863911@s.whatsapp.net', // رقمك الأساسي
  '212675036009@s.whatsapp.net',
  '172048387182781@s.whatsapp.net',
  '91204351983769@s.whatsapp.net',
  '139389489442836@s.whatsapp.net',
  '165339782496337@s.whatsapp.net'
]

// 🔢 استخراج الرقم فقط بدون أي رموز
export function extractPureNumber(number) {
  return toNumber(number)
}

// 🎯 دالة تنسيق الرقم إلى شكل WhatsApp
export function formatEliteNumber(number) {
  const cleaned = extractPureNumber(number)
  return cleaned ? `${cleaned}@s.whatsapp.net` : ''
}

// 🧠 التحقق إذا كان الرقم من النخبة
// يقبل نصاً أو مصفوفة أرقام، ويطابق عبر aliases (رقم الهاتف <-> الـ LID).
// يفشل بأمان: رقم فارغ لا يطابق شيئاً أبداً.
export function isElite(number) {
  if (Array.isArray(number)) return number.some((n) => isElite(n))
  if (!toNumber(number)) return false
  return matchesAny(number, eliteNumbers)
}

// ➕ إضافة رقم جديد إلى النخبة
export async function addEliteNumber(number, alias) {
  const formatted = formatEliteNumber(number)
  if (!formatted) return
  if (alias) learnIdentity(number, alias)
  if (!eliteNumbers.includes(formatted)) {
    eliteNumbers.push(formatted)
    console.log(`✅ تمت إضافة ${formatted} إلى قائمة النخبة.`)
  }
}

// ℹ️ معلومات النخبة
export const eliteInfo = {
  name: 'Elite Bot'
}

// 🗺️ مفاتيح الدول العربية والأطوال المفترضة للأرقام
const countryCodes = {
  "السعودية": { code: "966", length: 9 },
  "مصر": { code: "20", length: 10 },
  "العراق": { code: "964", length: 10 },
  "اليمن": { code: "967", length: 9 },
  "سوريا": { code: "963", length: 9 },
  "الأردن": { code: "962", length: 9 },
  "فلسطين": { code: "970", length: 9 },
  "لبنان": { code: "961", length: 8 },
  "ليبيا": { code: "218", length: 9 },
  "تونس": { code: "216", length: 8 },
  "الجزائر": { code: "213", length: 9 },
  "المغرب": { code: "212", length: 9 },
  "السودان": { code: "249", length: 9 },
  "عمان": { code: "968", length: 8 },
  "الكويت": { code: "965", length: 8 },
  "قطر": { code: "974", length: 8 },
  "البحرين": { code: "973", length: 8 },
  "الإمارات": { code: "971", length: 9 },
  "موريتانيا": { code: "222", length: 8 },
  "جيبوتي": { code: "253", length: 8 },
  "الصومال": { code: "252", length: 8 },
  "جزر القمر": { code: "269", length: 7 }
}

// 🎲 دالة توليد الأرقام المطلوب استدعاؤها في إضافة "جيب-بنات.js"
export function generateNumbers(country, count = 300) {
  const countryInfo = countryCodes[country]
  if (!countryInfo) return []

  const { code, length } = countryInfo
  const numbers = new Set()

  while (numbers.size < count) {
    let randomNum = ''
    for (let i = 0; i < length; i++) {
      randomNum += Math.floor(Math.random() * 10)
    }
    numbers.add(`${code}${randomNum}`)
  }

  return Array.from(numbers)
}
