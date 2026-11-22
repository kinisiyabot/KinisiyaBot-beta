// lib/interactive.js
// أزرار واتساب التفاعلية (interactiveMessage / nativeFlowMessage):
// تطبيع الغلاف + استخراج الردّ + بناء موحّد.
//
// المشكلة الأساسية: بعض البلوجنات تلفّ `interactiveMessage` داخل
// `viewOnceMessage` (أو `viewOnceMessageV2`). واتساب يعرض هذا النوع كرسالة
// «عرض لمرة واحدة»: الأزرار لا تُعرض كما يجب، وردّ الزر يعود ملفوفاً بالغلاف
// نفسه فلا يتعرّف عليه `_templateResponse` ولا يتحوّل إلى أمر نصي.
// `plugins/menu.js` يرسل `interactiveMessage` في المستوى الأعلى ويعمل بلا
// مشكلة، لذلك نُوحّد كل الإرسال على هذا الشكل.

// الأغلفة التي قد تُخفِي interactiveMessage بداخلها.
const WRAPPER_KEYS = [
  'viewOnceMessage',
  'viewOnceMessageV2',
  'viewOnceMessageV2Extension',
  'ephemeralMessage',
  'documentWithCaptionMessage',
]

// يفكّ الأغلفة المتداخلة ويعيد الرسالة الداخلية (بلا أغلفة).
export function unwrapMessage(message) {
  let msg = message
  for (let i = 0; i < 8; i++) {
    const key = WRAPPER_KEYS.find((k) => msg?.[k]?.message)
    if (!key) break
    msg = msg[key].message
  }
  return msg
}

// يستخرج interactiveMessage سواء كان في المستوى الأعلى أو ملفوفاً (بأي عدد
// من الأغلفة المتداخلة). يعيد { interactiveMessage, wrapper } حيث wrapper =
// مفتاح الغلاف الأعلى أو null.
export function findInteractiveMessage(message) {
  if (!message || typeof message !== 'object') return null
  if (message.interactiveMessage) return { interactiveMessage: message.interactiveMessage, wrapper: null }
  const wrapper = WRAPPER_KEYS.find((k) => message[k]?.message)
  if (!wrapper) return null
  const inner = unwrapMessage(message)
  if (inner && inner.interactiveMessage) return { interactiveMessage: inner.interactiveMessage, wrapper }
  return null
}

// يُضيف messageContextInfo الناقص إلى أي رسالة تحوي interactiveMessage.
//
// واتساب يحتاج `messageContextInfo.deviceListMetadata` مع
// `deviceListMetadataVersion: 2` لعرض أزرار الرسالة التفاعلية. بدونه تصل
// الرسالة كبطاقة بلا أزرار (أو لا تُعرض إطلاقاً) — وهذا ما كان يحدث: البلوجنات
// ترسل interactiveMessage بلا messageContextInfo، فتُسقط الأزرار.
// البوت القديم كان يضيفه دائماً، ولذلك كانت أزراره تعمل.
// لا نغيّر الغلاف (viewOnceMessage يبقى كما هو) — نضيف الحقل الناقص فقط.
export function ensureMessageContextInfo(message) {
  if (!message || typeof message !== 'object') return message
  if (!findInteractiveMessage(message)) return message
  const ctx = { deviceListMetadata: {}, deviceListMetadataVersion: 2 }
  // messageContextInfo يجب أن يجاور interactiveMessage في نفس المستوى، لذا
  // نضيفه عند أعمق غلاف (أو في المستوى الأعلى إن لم يوجد غلاف).
  const patch = (node) => {
    if (!node || typeof node !== 'object') return node
    const key = WRAPPER_KEYS.find((k) => node[k]?.message)
    if (key) {
      return { ...node, [key]: { ...node[key], message: patch(node[key].message) } }
    }
    if (node.messageContextInfo?.deviceListMetadataVersion) return node
    return { ...node, messageContextInfo: { ...ctx, ...(node.messageContextInfo || {}) } }
  }
  return patch(message)
}

// واتساب يرفض أكثر من 3 أزرار في الرسالة الواحدة: الإرسال ينجح بلا خطأ لكن
// الأزرار الزائدة تُسقط ولا تُعرض إطلاقاً. هذا سبب «البوت يظن أنه أرسل ولا
// شيء يظهر». الحدّ الثاني: 10 صفوف للقائمة المنسدلة.
export const MAX_BUTTONS = 3
export const MAX_ROWS = 10

const parseParams = (button) => {
  try {
    const p = JSON.parse(button?.buttonParamsJson || '{}')
    return p && typeof p === 'object' ? p : {}
  } catch {
    return {}
  }
}

// يقلّص قائمة الأزرار إلى الحدّ الذي يقبله واتساب: يُبقي ما يدخل في 3 أزرار
// ويحوّل الفائض من أزرار quick_reply إلى صفوف في قائمة single_select، فلا
// يضيع أي خيار. الأزرار التي لا تحمل أمراً (روابط/نسخ) لا تصلح صفوفاً فتُسقَط.
export function normalizeButtons(buttons, { moreLabel = '📋 المزيد' } = {}) {
  if (!Array.isArray(buttons) || buttons.length <= MAX_BUTTONS) return buttons
  const lists = buttons.filter((b) => b?.name === 'single_select')
  const actions = buttons.filter((b) => b?.name !== 'single_select')
  // القائمة تأخذ زراً من الميزانية دائماً: إمّا قائمة موجودة أو واحدة ننشئها
  // للفائض. تجاهل ذلك يجعل القائمة المدمجة تُقصّ بـ slice فتُفقد كل الخيارات.
  const keepCount = MAX_BUTTONS - 1
  const keep = actions.slice(0, keepCount)
  const rows = actions
    .slice(keepCount)
    .filter((b) => b?.name === 'quick_reply')
    .map((b) => {
      const p = parseParams(b)
      return { title: p.display_text || p.id || '…', description: '', id: p.id || '' }
    })
    .filter((r) => r.id)
    .slice(0, MAX_ROWS)
  if (!rows.length) return [...keep, ...lists].slice(0, MAX_BUTTONS)
  const list = lists[0] || { name: 'single_select', buttonParamsJson: JSON.stringify({ title: moreLabel, sections: [] }) }
  const params = parseParams(list)
  const sections = Array.isArray(params.sections) ? [...params.sections] : []
  if (sections.length) {
    sections[0] = { ...sections[0], rows: [...(sections[0].rows || []), ...rows] }
  } else {
    sections.push({ title: moreLabel, rows })
  }
  const merged = {
    ...list,
    buttonParamsJson: JSON.stringify({ ...params, title: params.title || moreLabel, sections }),
  }
  return [...keep, merged].slice(0, MAX_BUTTONS)
}

// يطبّق تقليص الأزرار على رسالة تحوي interactiveMessage (في المستوى الأعلى أو
// داخل غلاف)، ويترك كل نوع آخر كما هو.
export function normalizeMessageButtons(message, opts) {
  if (!message || typeof message !== 'object') return message
  if (!findInteractiveMessage(message)) return message
  const patch = (node) => {
    if (!node || typeof node !== 'object') return node
    const key = WRAPPER_KEYS.find((k) => node[k]?.message)
    if (key) return { ...node, [key]: { ...node[key], message: patch(node[key].message) } }
    const nf = node.interactiveMessage?.nativeFlowMessage
    if (!nf || !Array.isArray(nf.buttons)) return node
    const buttons = normalizeButtons(nf.buttons, opts)
    if (buttons === nf.buttons) return node
    return { ...node, interactiveMessage: { ...node.interactiveMessage, nativeFlowMessage: { ...nf, buttons } } }
  }
  return patch(message)
}

// تجهيز رسالة تفاعلية للإرسال: تقليص الأزرار + إضافة messageContextInfo.
export function prepareInteractiveMessage(message, opts) {
  return ensureMessageContextInfo(normalizeMessageButtons(message, opts))
}

// يستخرج ردّ الأزرار من رسالة واردة (يفكّ الأغلفة أولاً).
// يعيد { id, text, source } أو null. source يوضّح نوع الردّ: interactive /
// list / template / button، لتشخيص سبب عدم استجابة أي زر.
export function readInteractiveReply(message) {
  const inner = unwrapMessage(message)
  if (!inner) return null
  let id = null
  let text = ''
  let source = null
  if (inner.buttonsResponseMessage) {
    id = inner.buttonsResponseMessage.selectedButtonId
    text = inner.buttonsResponseMessage.selectedDisplayText || ''
    source = 'button'
  } else if (inner.templateButtonReplyMessage) {
    id = inner.templateButtonReplyMessage.selectedId
    text = inner.templateButtonReplyMessage.selectedDisplayText || ''
    source = 'template'
  } else if (inner.listResponseMessage) {
    id = inner.listResponseMessage.singleSelectReply?.selectedRowId
    text = inner.listResponseMessage.title || ''
    source = 'list'
  } else if (inner.interactiveResponseMessage) {
    const paramsJson = inner.interactiveResponseMessage.nativeFlowResponseMessage?.paramsJson || '{}'
    try {
      const params = JSON.parse(paramsJson)
      id = params.id || params.cmd || params.command || null
    } catch {
      id = null
    }
    text = inner.interactiveResponseMessage.body?.text || ''
    source = 'interactive'
  }
  if (!id) return null
  return { id, text, source }
}

// هل هذه الرسالة ردّ زرّ أصلاً (بغض النظر عن صلاحية معرّفه)؟ يلزم لتمييز
// «ضغط زر بمعرّف غير معروف» عن «رسالة عادية»، فنردّ بتنبيه بدل الصمت التام.
export function isButtonReply(message) {
  const inner = unwrapMessage(message)
  if (!inner) return false
  return !!(
    inner.buttonsResponseMessage ||
    inner.templateButtonReplyMessage ||
    inner.listResponseMessage ||
    inner.interactiveResponseMessage
  )
}

// يطبّع معرّف الزر إلى نصّ أمر قابل للتنفيذ.
// بعض الأزرار ترسل معرّفاً بلا بادئة (مثل `rate_5` أو `menu_ar`)، فلا يطابق
// أي بلوجن ويبدو الزر ميتاً. نضيف البادئة الافتراضية عند غيابها.
export function normalizeButtonCommand(id, prefix = '.') {
  if (typeof id !== 'string') return null
  const trimmed = id.trim()
  if (!trimmed) return null
  if (trimmed.startsWith(prefix)) return trimmed
  if (/^[a-z]+_/i.test(trimmed)) return trimmed
  return `${prefix}${trimmed}`
}

// يبني interactiveMessage موحّداً (نفس شكل menu.js العامل) صالحاً لـ
// proto.Message.InteractiveMessage.fromObject.
export function buildInteractiveContent({ body, footer, header, buttons, messageParamsJson } = {}) {
  return {
    body: { text: body ?? '' },
    footer: { text: footer ?? '' },
    header: { title: '', subtitle: '', hasMediaAttachment: false, ...(header || {}) },
    nativeFlowMessage: {
      buttons: buttons || [],
      messageParamsJson: messageParamsJson ?? '',
    },
  }
}

// يبني رسالة نصية عادية صالحة من نفس محتوى الأزرار، لتُستخدم كخطة بديلة عند
// تعذّر إرسال الأزرار. ضروري لأن Baileys لا يفهم مفاتيح مثل `interactiveButtons`
// و`title`/`subtitle`/`product`: تمريرها كما هي يُنتج محتوى فارغاً أو يرمي
// "Invalid media type"، فلا يُرسَل شيء إطلاقاً (صمت تام) — وهو أحد سببَي المشكلة.
// نُبقي النصّ والعنوان والوصف والفوتر حتى لا يفقد المستخدم المعلومة، ونُسقط
// المفاتيح التي يرفضها Baileys.
export function buildPlainFallback(content = {}) {
  const text = content.text || content.caption || ''
  const extras = [content.title, content.subtitle, content.footer]
    .filter((s) => typeof s === 'string' && s.trim())
  const parts = [text, ...extras].filter((s) => typeof s === 'string' && s.trim())
  const out = { text: parts.join('\n\n') || '⚠️ تعذّر عرض الأزرار.' }
  if (content.mentions) out.mentions = content.mentions
  return out
}
