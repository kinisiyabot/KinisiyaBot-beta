let handler = async (m, { conn, text, usedPrefix, command, args }) => {
    let who
    let users = global.db.data.users

    // تعريف الرقم الممنوع والمطور
    const bannedTarget = '212621761627'
    const devJid = '212693863911@s.whatsapp.net'

    // إذا تم تحديد رقم يدويًا أو منشن أو اقتباس
    if (args[0]) {
        let number = args[0].replace(/[^0-9]/g, '') // تنظيف الرقم
        if (!number) throw '□ أدخل رقمًا صالحًا أو منشن'
        who = number + '@s.whatsapp.net'
    } else if (m.isGroup) {
        who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : null
    } else {
        who = m.chat
    }

    if (!who) throw `□ منشن الشخص أو أدخل رقمه`

    let userNumber = who.split('@')[0]

    // إذا الرقم الممنوع حاول يستخدم الأمر أو حد حاول يبنده
    if (userNumber === bannedTarget || m.sender.split('@')[0] === bannedTarget) {
        users[`${bannedTarget}@s.whatsapp.net`].banned = true

        await conn.sendMessage(devJid, {
            text: `✅ تم حظر الرقم المخصص تلقائيًا: +${bannedTarget}`,
        })

        return
    }

    users[who].banned = true
    conn.reply(m.chat, `@${userNumber} لن تستطيع استخدام الأوامر بعد الآن!`, m, { mentions: [who] })
}

handler.help = ['ban @user', 'ban 201234567890']
handler.tags = ['owner']
handler.command = /^بان$/i
handler.rowner = true

export default handler