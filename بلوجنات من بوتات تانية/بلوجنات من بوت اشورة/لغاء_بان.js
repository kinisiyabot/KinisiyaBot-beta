let handler = async (m, { conn, args }) => {
    let who

    // تحديد الهدف (منشن / اقتباس / إدخال يدوي)
    if (args[0]) {
        let number = args[0].replace(/[^0-9]/g, '')
        if (!number) throw '□ أدخل رقمًا صحيحًا أو منشن'
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

    if (!who) throw `❒ منشن الشخص أو أدخل رقمه لفك البان`

    let user = global.db.data.users[who]
    if (!user) throw `❒ المستخدم غير موجود في قاعدة البيانات`

    // رقم المطور (محمي من التغيير)
    const devNumber = '201119193086'
    if (who.split('@')[0] === devNumber) {
        return conn.reply(m.chat, `🚫 لا يمكن إلغاء البان عن المطور لأنه محمي أساسًا!`, m)
    }

    // تنفيذ فك البان
    user.banned = false

    conn.reply(m.chat, `✅ تم إلغاء البان عن @${who.split('@')[0]} ويمكنه استخدام الأوامر الآن!`, m, { mentions: [who] })
}

handler.help = ['unban @user', 'unban 201119193086']
handler.tags = ['owner']
handler.command = /^(فكban|الغاء_البان|بانفك|رفع-البان)$/i
handler.rowner = true

export default handler