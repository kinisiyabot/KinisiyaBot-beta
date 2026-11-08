import { isElite, extractPureNumber } from '../lib/elite.js';
import '../config.js'; // فيه global.owner

let handler = async (m, { conn, text, args }) => {
    let who
    let users = global.db.data.users
    const sender = extractPureNumber(m.sender);

    // التحقق إذا الرقم من النخبة
    if (!isElite(sender)) {
        return m.reply('🚫 هذا الأمر مخصص فقط لأعضاء النخبة.');
    }

    // رقم المطور المحمي
    const devNumber = global.owner.map(o => o[0]);
    const devJid = `${devNumber}@s.whatsapp.net`

    // تحديد الهدف (منشن / اقتباس / إدخال يدوي)
    if (args[0]) {
        let number = args[0].replace(/[^0-9]/g, '') // تنظيف الرقم من أي رموز
        if (!number) throw '□ أدخل رقمًا صالحًا أو منشن'
        who = number + '@s.whatsapp.net'
    } else if (m.isGroup) {
        who = m.mentionedJid[0] 
           ? m.mentionedJid[0] 
           : m.quoted 
           ? m.quoted.sender 
           : null
    } else {
        who = m.chat
    }

    if (!who) throw `□ منشن الشخص أو أدخل رقمه`

    let userNumber = who.split('@')[0]

    // حماية المطور من الباند
    if (userNumber === devNumber) {
        return conn.reply(m.chat, `🚫 لا يمكن حظر المطور!`, m)
    }

    // تنفيذ الحظر
    users[who].banned = true
    conn.reply(m.chat, `🔒 @${userNumber} تم حظره ولن يستطيع استخدام الأوامر بعد الآن!`, m, { mentions: [who] })

    // إشعار المطور
    await conn.sendMessage(devJid, {
        text: `📢 تم حظر الرقم: +${userNumber} من قِبل ${m.sender.split('@')[0]}`,
    })
}

handler.help = ['بان @user', 'بان 201065826587']
handler.tags = ['owner']
handler.command = /^بان$/i
handler.rowner = false

export default handler