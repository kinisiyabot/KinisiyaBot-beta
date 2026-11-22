/**
 * معالج الأزرار المركزي.
 *
 * كل ضغط زر يصل كرسالة ردّ تفاعلي، لا كنص. هذا البلوجن يحوّله إلى نصّ أمر
 * ويُعيد إرساله عبر `messages.upsert` فيمرّ بنفس مسار handler.command تماماً.
 *
 * كان الإصدار السابق يتجاهل الأزرار التي معرّفها بلا بادئة (مثل `rate_5`)
 * والتي معرّفها ليس أمراً مسجّلاً، فيبدو الزر ميتاً بلا أي تفسير. الآن:
 *   - نغطّي الأشكال الأربعة (interactive / list / template / button).
 *   - نضيف البادئة الناقصة عند الحاجة.
 *   - نردّ برسالة واضحة إذا لم يوجد أمر مطابق، بدل الصمت.
 */
const { proto, generateWAMessage, areJidsSameUser } = await import('@whiskeysockets/baileys')
import { routeButtonReply, buildButtonUpsert } from '../lib/button-router.js'

export async function all(m, chatUpdate) {
  if (m.isBaileys || !m.message) return

  const route = routeButtonReply(m, { conn: this })
  if (route.silent) return
  if (!route.handled && !route.unreadable) return

  if (route.unreadable) {
    await m.reply('⚠️ وصلت ضغطة زر لكن بدون معرّف صالح. أرسل الأمر نصّاً.')
    return
  }

  if (!route.plugin) {
    // معرّف مقروء لكن لا بلوجن يطابقه: نُبلغ المستخدم بدل الصمت التام،
    // ويظهر السبب للمطوّر في اللوق.
    console.error(`[buttons] no plugin for id "${route.id}" → "${route.command}"`)
    await m.reply(`⚠️ هذا الزر لم يعد مرتبطاً بأمر (${route.id}).\nجرّب .قائمة`)
    return
  }

  // نُعيد المعرّف الأصلي كاملاً (مع الوسائط) لا الأمر المنقّى فقط.
  const msg = await buildButtonUpsert({
    m,
    conn: this,
    text: route.id.startsWith('.') ? route.id : route.normalized || route.id,
    proto,
    generateWAMessage,
    areJidsSameUser,
    chatUpdate,
  })

  this.ev.emit('messages.upsert', msg)
}
