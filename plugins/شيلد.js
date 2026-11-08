import system, { processAiRequest, isProtectedUser } from '../system.js'

let handler = async (m, { conn, args, usedPrefix, command, isROwner }) => {
  // 1. التحقق من صلاحية المطور
  if (!isROwner) {
    return global.dfail('rowner', m, conn)
  }

  let chat = global.db.data.chats[m.chat]
  if (typeof chat !== 'object') global.db.data.chats[m.chat] = {}
  if (!('shield' in chat)) chat.shield = false

  let type = (args[0] || '').toLowerCase()

  // 2. معالجة خيار التفعيل والتعطيل
  if (type === 'on' || type === 'تشغيل' || type === 'تفعيل') {
    if (chat.shield) return m.reply('🛡️ *نظام الشيلد مفعل بالفعل في هذه المجموعة.*،،')
    chat.shield = true
    return m.reply('🛡️ *تم تفعيل نظام الشيلد (الذكاء الاصطناعي لحماية الحظر والتفاعل الذكي).*،،')
  } 

  if (type === 'off' || type === 'ايقاف' || type === 'تعطيل') {
    if (!chat.shield) return m.reply('🛡️ *نظام الشيلد معطل بالفعل.*،،')
    chat.shield = false
    return m.reply('🛡️ *تم إيقاف نظام الشيلد.*،،')
  }

  // 3. إرسال واجهة الأزرار التفاعلية
  let status = chat.shield ? 'مفعل ✅' : 'معطل ❌'
  let caption = `🛡️ *نظام حماية وتفاعل الشيلد الذكي (KINISIYA)*\n\n`
  caption += `📌 *الحالة الحالية في المجموعة:* ${status}\n\n`
  caption += `💡 *اختر الإجراء المناسب للتحكم بالشيلد:*،،`

  let buttons = [
    {
      buttonId: `${usedPrefix}${command} تشغيل`,
      buttonText: { displayText: '🛡️ تفعيل الشيلد' },
      type: 1
    },
    {
      buttonId: `${usedPrefix}${command} ايقاف`,
      buttonText: { displayText: '⚙️ تعطيل الشيلد' },
      type: 1
    }
  ]

  let buttonMessage = {
    text: caption,
    footer: 'KINISIYA BOT • OWNER ONLY',
    buttons: buttons,
    headerType: 1
  }

  return conn.sendMessage(m.chat, buttonMessage, { quoted: m })
}

// ⭐ التفاعل والمراقبة التلقائية قبل معالجة الأوامر العادية
handler.before = async function (m, { conn, isAdmin, isBotAdmin }) {
  if (!m.chat || !m.text) return
  
  let chat = global.db.data.chats[m.chat]
  if (!chat || !chat.shield) return

  // التجاهل إذا كانت الرسالة صادرة من البوت نفسه أو أجهزة Baileys
  if (m.fromMe || m.isBaileys) return

  const botJid = conn.decodeJid ? conn.decodeJid(conn.user.jid) : conn.user.jid

  // إصلاح خطأ m.mentionedJid والتأكد من تحويله لمصفوفة آمنة
  const mentionedJid = Array.isArray(m.mentionedJid) 
    ? m.mentionedJid.map(v => conn.decodeJid ? conn.decodeJid(v) : v)
    : []

  const isMentioned = mentionedJid.includes(botJid)
  
  // فحص الرد على رسالة البوت (Quoted Message)
  const quotedSender = m.quoted ? (conn.decodeJid ? conn.decodeJid(m.quoted.sender) : m.quoted.sender) : null
  const isQuotedBot = quotedSender === botJid

  // فحص ذكر اسم البوت صراحة في النص (مثل: كينيسيا، kinisiya، بوت)
  const isNameCalled = /(كينيسيا|kinisiya|بوت|البوت)/gi.test(m.text)

  // يتفاعل البوت إذا تم عمل تاغ له، أو الرد عليه، أو ذكر اسمه داخل المجموعة
  if (isMentioned || isQuotedBot || isNameCalled) {
    try {
      await conn.sendPresenceUpdate('composing', m.chat)

      // فحص ما إذا كان صاحب الرسالة من الأشخاص المحميين (المطور أو النخبة)
      const protectedUser = await isProtectedUser(m.sender)

      // معالجة النص عبر الذكاء الاصطناعي المربوط بـ system.js
      let reply = await processAiRequest(m.text, m.sender, {
        botName: 'KINISIYA',
        mode: 'default'
      })

      if (reply) {
        await m.reply(reply)
      }

      // آلية القتل والطرد التلقائي عند الاستفزاز الشديد
      const attackTriggers = /(اطردني|احظرني|يا غبي|بوت زبل|خرا|كل زق|تفو|زبي)/gi
      if (attackTriggers.test(m.text) && isBotAdmin && !protectedUser && !isAdmin) {
        await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
      }
    } catch (err) {
      console.error('Error in Shield handler:', err)
    }
  }
}

handler.help = ['shield', 'شيلد']
handler.tags = ['ai', 'owner']
handler.command = ['شيلد', 'shield']
handler.rowner = true

export default handler
