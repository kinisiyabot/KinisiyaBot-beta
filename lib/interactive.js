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

// يرفع interactiveMessage من داخل أي غلاف إلى المستوى الأعلى. الرسائل التي لا
// تحوي interactiveMessage تُعاد كما هي (تعديل صفري لبقية الأنواع).
export function normalizeInteractiveMessage(message) {
  const found = findInteractiveMessage(message)
  if (!found || !found.wrapper) return message
  const rest = { ...message }
  for (const key of WRAPPER_KEYS) delete rest[key]
  return { ...rest, interactiveMessage: found.interactiveMessage }
}

// يستخرج ردّ الأزرار من رسالة واردة (يفكّ الأغلفة أولاً).
// يعيد { id, text } أو null.
export function readInteractiveReply(message) {
  const inner = unwrapMessage(message)
  if (!inner) return null
  let id = null
  let text = ''
  if (inner.buttonsResponseMessage) {
    id = inner.buttonsResponseMessage.selectedButtonId
    text = inner.buttonsResponseMessage.selectedDisplayText || ''
  } else if (inner.templateButtonReplyMessage) {
    id = inner.templateButtonReplyMessage.selectedId
    text = inner.templateButtonReplyMessage.selectedDisplayText || ''
  } else if (inner.listResponseMessage) {
    id = inner.listResponseMessage.singleSelectReply?.selectedRowId
    text = inner.listResponseMessage.title || ''
  } else if (inner.interactiveResponseMessage) {
    const paramsJson = inner.interactiveResponseMessage.nativeFlowResponseMessage?.paramsJson || '{}'
    try {
      const params = JSON.parse(paramsJson)
      id = params.id || params.cmd || params.command || null
    } catch {
      id = null
    }
    text = inner.interactiveResponseMessage.body?.text || ''
  }
  if (!id) return null
  return { id, text }
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
