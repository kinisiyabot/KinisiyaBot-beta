import { isElite, extractPureNumber } from '../lib/elite.js';

let handler = async (m, { conn, command, text }) => {
    const sender = extractPureNumber(m.sender);

    // التحقق إذا الرقم من النخبة
    if (!isElite(sender)) {
        return m.reply('🚫 هذا الأمر مخصص فقط لأعضاء النخبة.');
    }

  if (!text) return m.reply(`⚠️ الرجاء إدخال سبب الإجتماع.`)
  if (text.length < 10) return m.reply(`⚠️ السبب لازم يكون 10 أحرف على الأقل.`)

  let texto = `📢 المالك @${m.sender.split`@`[0]} بدأ إجتماع.\n🚨 يرجى دخول جروب الطاقم بأسرع وقت...\n\n*➪ السبب: ${text}*`
  m.reply(`✅ تم إرسال إشعار الإجتماع لجميع المالكين.`)

  let mentions = [m.sender]

  for (let [jid] of global.owner.filter(([number, _, isDeveloper]) => isDeveloper && number)) {
    let data = (await conn.onWhatsApp(jid))[0] || {}
    if (data.exists) {
      await conn.sendMessage(data.jid, { text: texto, mentions })
    }
  }
}

handler.tags = ['المالك']
handler.command = handler.help = ['اجتماع', 'meeting']

// هنا بقى الأمر خاص بالمالك وكمان بالرقم اللي ضفناه
handler.rowner = false

export default handler