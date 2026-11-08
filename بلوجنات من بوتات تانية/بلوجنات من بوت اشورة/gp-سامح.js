let handler = async (m, { conn, args, groupMetadata }) => {
    let who
    if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false
    else who = m.chat
    if (!who) throw `✳️ من فضلك شاور أو اتكلم على حد معين`
    if (!(who in global.db.data.users)) throw `✳️ المستخدم ده مش موجود في قاعدة بياناتي :c`

    let warn = global.db.data.users[who].warn
    let adminName = conn.getName(m.sender) // اسم الأدمن اللي شال التحذير

    if (warn > 0) {
        global.db.data.users[who].warn -= 1
        
        // رسالة الخاصة مع الصورة
        await conn.sendMessage(
            who, 
            { 
                image: { url: 'https://files.catbox.moe/shbxab.png' }, 
                caption: `✳️ الأدمن ${adminName} شال تحذير منك، التحذيرات بتاعتك بقت *${warn - 1}*`
            }
        )

        // رسالة المجموعة مع الصورة
        await conn.sendMessage(
            m.chat,
            { 
                image: { url: 'https://files.catbox.moe/v3ndsp.png' },
                caption: `⚠️ *إزالة تحذير*
                
▢ التحذيرات: *-1*
▢ إجمالي التحذيرات: *${warn - 1}*

🛡️ الأدمن اللي شال التحذير: ${adminName}`
            }
        )

    } else if (warn == 0) {
        m.reply('✳️ المستخدم ده معندوش أي تحذيرات')
    }
}

handler.help = ['شيل_تحذير @user']
handler.tags = ['group']
handler.command = ['شيل_تحذير', 'الغى_تحذير', 'سامح', 'شيل_التنبيه','حذف_انذار', 'حذف_تحذير'] 
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler