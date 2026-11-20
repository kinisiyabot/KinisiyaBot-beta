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
