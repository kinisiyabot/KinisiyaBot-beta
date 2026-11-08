let handler = async (m, { conn, participants }) => {

    if (!m.isGroup) throw '❗هذا الأمر يعمل فقط داخل المجموعات'

    if (participants.length < 3) throw '❗المجموعة تحتاج على الأقل 3 أشخاص لاستخدام هذا الأمر'

    let shuffled = participants.sort(() => 0.5 - Math.random())

    let [groom, bride, officiant] = shuffled.slice(0, 3).map(p => p.id)

    // احتمال مصير الزواج

    let outcome = Math.random()

    let message = ''

    if (outcome < 0.7) {

        message = `*💃 زفــاف 💃*\n*● • ━━── ─ ◞⋄◜ ─ ──━━ • ●*\n↧↧↧↧↧↧↧↧↧＝❀ ❀＝↧↧↧↧↧↧↧↧↧\n\n` +

                  `*❃ الـعـ🤵🏻ـريـس :〘@${groom.split('@')[0]}〙➥*\n\n` +

                  `*❃ الـعـ👰🏻‍♀️ـروسـة :〘@${bride.split('@')[0]}〙➥*\n\n` +

                  `*⚘الـمـ👳🏻ـأذون:〘@${officiant.split('@')[0]}〙➥*\n\n` +

                  `↧↧↧↧↧↧↧↧↧＝❀ ❀＝↧↧↧↧↧↧↧↧↧\n*● • ━━── ─ ◞⋄◜ ─ ──━━ • ●*\n*『𝑾𝑨𝑯𝑴╎🤖╎𝑩𝑶𝑻』*`

    } else if (outcome < 0.85) {

        message = `🧔 *المؤذون @${officiant.split('@')[0]} رفض يزوجهم!* 😔\n\n` +

                  `*💔 الزواج فشل بسبب ظروف غريبة... جربوا حظكم لاحقًا!*`

    } else {

        message = `⌛ *المؤذون @${officiant.split('@')[0]} تأخر!* 🕰\n\n` +

                  `*💔 الزواج ألغي تلقائيًا... شكلها مش من نصيبكم!*`

    }

    // إرسال الصورة ومعها الرسالة في نفس الوقت

    await conn.sendMessage(m.chat, {

        image: { url: 'https://files.catbox.moe/mq6htu.jpg' },

        caption: message,

        mentions: [groom, bride, officiant]

    }, { quoted: m })

}

handler.help = ["زواج"]

handler.tags = ['fun']

handler.command = /^(زواج)$/i

export default handler