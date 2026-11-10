import assert from 'node:assert/strict'
import { test } from 'node:test'
import { t, categoryTitle, categoryIds, normalizeLang, CATEGORIES, LANGUAGES } from '../lib/i18n.js'

test('normalizeLang accepts codes and native names', () => {
  assert.equal(normalizeLang('ar'), 'ar')
  assert.equal(normalizeLang('العربية'), 'ar')
  assert.equal(normalizeLang('en'), 'en')
  assert.equal(normalizeLang('English'), 'en')
  assert.equal(normalizeLang('es'), 'es')
  assert.equal(normalizeLang('español'), 'es')
  assert.equal(normalizeLang('fr'), null)
  assert.equal(normalizeLang(''), null)
})

test('normalizeLang is case- and whitespace-insensitive (الخطأ 8)', () => {
  assert.equal(normalizeLang('AR'), 'ar')
  assert.equal(normalizeLang('En'), 'en')
  assert.equal(normalizeLang('ES'), 'es')
  assert.equal(normalizeLang(' en '), 'en')
  assert.equal(normalizeLang('  العربية  '), 'ar')
  assert.equal(normalizeLang('  English '), 'en')
  assert.equal(normalizeLang(null), null)
  assert.equal(normalizeLang(undefined), null)
  assert.equal(normalizeLang('   '), null)
})

test('all three languages expose every category', () => {
  const ids = categoryIds()
  assert.ok(ids.length > 0)
  for (const id of ids) {
    for (const lang of ['ar', 'en', 'es']) {
      const title = categoryTitle(lang, id)
      assert.ok(title && title !== id, `${lang}/${id} missing title`)
    }
  }
})

test('categories are actually translated (not all identical)', () => {
  const ai = ['ar', 'en', 'es'].map(l => categoryTitle(l, 'ai'))
  assert.equal(new Set(ai).size, 3)
})

test('t interpolates the given values (not a hardcoded string) (الخطأ 7)', () => {
  // لا نثبّت النص الحرفي (إيموجي/زخرفة)؛ نتحقق من السلوك: القيمة تُدرَج فعلاً.
  const level5 = t('en', 'level', 5)
  assert.equal(typeof level5, 'string')
  assert.ok(level5.includes('5'), 'level must contain the interpolated value')
  assert.ok(t('en', 'level', 9).includes('9'))
  assert.notEqual(t('en', 'level', 5), t('en', 'level', 9))

  assert.ok(t('es', 'rank', 'Admin').includes('Admin'))
  assert.ok(t('ar', 'welcome', 'user').includes('@user'))

  // الترجمة نفسها تختلف بين اللغات
  assert.notEqual(t('en', 'level', 1), t('es', 'level', 1))
  assert.notEqual(t('en', 'level', 1), t('ar', 'level', 1))

  // مفتاح غير موجود يرجع المفتاح نفسه (بدون انهيار)
  assert.equal(t('en', 'nope'), 'nope')
  // لغة غير معروفة ترجع للافتراضي (بدون انهيار)
  assert.ok(t('xx', 'level', 3).includes('3'))
})

test('LANGUAGES exposes the three selectable options', () => {
  assert.deepEqual(Object.keys(LANGUAGES).sort(), ['ar', 'en', 'es'])
})

test('every language table has the same keys (no missing translation)', () => {
  const base = Object.keys(CATEGORIES.ar).sort()
  for (const lang of ['en', 'es']) {
    assert.deepEqual(Object.keys(CATEGORIES[lang]).sort(), base, `${lang} category keys differ`)
  }
})
