// plugins/التصحيح-الذاتي.js
// 🛠️ الجهة المستقبِلة لموافقة المطور على نظام التصحيح الذاتي.
//
// لا يُسجِّل أمراً (command) — يعمل كـ all() للمالك فقط، ويتجاهل كل شيء إلا
// عندما يكون هناك خطأ معلّق. يقبل:
//   - ضغط زر "نعم / لا" (buttonsResponseMessage)
//   - الأمر الصريح: .selfheal <id>  أو  .selfheal-no <id>
//   - ردّ نصّي "نعم/لا" في الخاص (احتياطي)

import { selfHeal } from '../lib/self-heal.js'
import { matchesAny } from '../lib/identity.js'

const REPORT_MARK = 'خطأ جديد في البوت'

function extractInput(m) {
  const msg = m?.message || {}
  return (
    msg.buttonsResponseMessage?.selectedButtonId ||
    msg.templateButtonReplyMessage?.selectedId ||
    msg.listResponseMessage?.singleSelectReply?.selectedRowId ||
    m?.text ||
    ''
  )
}

export async function all(m) {
  if (!m || m.isBaileys) return
  if (!global.owner || !matchesAny(m.sender, global.owner)) return
  if (!selfHeal.listPending().length) return

  const raw = extractInput(m)
  if (!raw) return

  const parsed = selfHeal.resolveOwnerReply(raw, true)
  if (!parsed) return

  const explicit = /selfheal/i.test(raw)
  const quotedReport = !!m.quoted && String(m.quoted.text || '').includes(REPORT_MARK)
  const plainDm = !m.isGroup
  // لا نتفاعل مع "نعم/لا" العشوائية داخل المجموعات — فقط في الخاص أو بردّ مباشر.
  if (!explicit && !quotedReport && !plainDm) return

  if (parsed.action === 'no') {
    selfHeal.cancel(parsed.id)
    await m.reply('✅ *تم تجاهل الخطأ* — لن أُصلحه الآن.')
    return
  }

  await m.reply('🛠️ *جاري الإصلاح...* تم إعادة تحميل البلوجن المتسبب ⏳')
  selfHeal.confirm(parsed.id)
}

export default { all }
