const BOT_NAME = ' ◡̈⃝A͢ʙʏss 𝚋𝚘𝚝ꨄ︎ఌ'

const handler = async (m, { conn, usedPrefix, command, args, isROwner, isAdmin, isBotAdmin }) => {
    if (!m.isGroup) return
    if (!isROwner) return global.dfail('rowner', m, conn)

    const chat = global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {}
    if (chat.antiBot === undefined) chat.antiBot = false
    let isEnable = chat.antiBot

    // =========================
    // 📌 تفعيل / تعطيل
    // =========================
    if (args[0] === 'on' || args[0] === 'enable') {
        if (isEnable) return conn.reply(m.chat, `
*❍━━━══━━❪🫦❫━━══━━━❍*
┇🐍🍷║حماية البوت مفعّلة بالفعل.
*❍━━━══━━❪🫦❫━━══━━━❍*
`, m)
        isEnable = true
    } else if (args[0] === 'off' || args[0] === 'disable') {
        if (!isEnable) return conn.reply(m.chat, `
*❍━━━══━━❪🫦❫━━══━━━❍*
┇🐍🍷║حماية البوت متوقفة بالفعل.
*❍━━━══━━❪🫦❫━━══━━━❍*
`, m)
        isEnable = false
    } else {
        return conn.reply(m.chat, `
*❍━━━══━━❪طــريــقــة الــتــشــغــيــل❫━━══━━━❍*
┇🍷🔞║لتفعيل حماية البوت:
┇🐍📁║• تفعيل » *${usedPrefix}${command} enable*
┇🐍📂║• تعطيل » *${usedPrefix}${command} disable*
┇🐍⚙️║الحالة الحالية » *${isEnable ? '✓ مفعّــل' : '✗ مـعـطّــل'}*
╯✯≼══━━﹂🩸﹁━━══≽✯
`, m)
    }

    chat.antiBot = isEnable

    await conn.reply(m.chat, `
*❍━━━══━━❪تـــحـــديـــث❫━━══━━━❍*
┇🐍⚙️║تم *${isEnable ? 'تفعيل' : 'تعطيل'}* حماية البوت.
┇🐍📌║أي بوت يدخل المجموعة سيتم طرده تلقائياً.
*❍━━━══━━❪🫦❫━━══━━━❍*
`, m)
}

// =========================
// قبل أي رسالة لأي بوت
// =========================
export async function before(m, { conn, isBotAdmin }) {
    if (!m.isGroup) return
    const chat = global.db.data.chats[m.chat]
    if (!chat?.antiBot) return
    if (m.fromMe) return true

    // أي رسالة من بوت آخر
    if (m.id.startsWith('3EB0') && m.id.length === 22) {
        const delet = m.key.participant
        const bang = m.key.id

        if (isBotAdmin) {
            await conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: delet }})
            await conn.groupParticipantsUpdate(m.chat, [delet], 'remove')
            await conn.reply(m.chat, `*╮═≼『🔞┃${BOT_NAME} AntiBot┃🔞』≽═╭*\n*┇⌗╎تم طرد بوت تلقائياً: @${delet.split('@')[0]}*\n*❍━━━══━━❪🫦❫━━══━━━❍*`, m, { mentions: [delet] })
        } else {
            await conn.reply(m.chat, `*『🔞┃${BOT_NAME} AntiBot┃🔞』*\n*┇⌗╎تم اكتشاف بوت: @${delet.split('@')[0]}*\n*┇⌗╎لكن ليس لدي صلاحية لطرده*\n*❍━━━══━━❪🫦❫━━══━━━❍*`, m, { mentions: [delet] })
        }
    }
}

handler.command = ['abot']
handler.rowner = true
handler.botAdmin = true
handler.group = true

export default handler