import chalk from 'chalk'
let WAMessageStubType = (await import('baileys-pro')).default
import { existsSync, promises as fs, readdirSync, rmSync, unlinkSync } from 'fs'
import path from 'path'
import './_content.js'

let handler = (m) => m
handler.before = async function (m, {conn, participants, groupMetadata, isBotAdmin}) {
  if (!m.messageStubType || !m.isGroup) return

  let pp = await conn.profilePictureUrl(m.messageStubParameters[0], 'image').catch(_ => gataMenu)
  let img = await (await fetch(`${pp}`)).buffer()
  let usuario = `@${m.sender.split`@`[0]}`
  let chat = global.db.data.chats[m.chat]
  let users = participants.map(u => conn.decodeJid(u.id))
  const groupAdmins = participants.filter(p => p.admin)
  const listAdmin = groupAdmins.map((v, i) => `⛄┊≡ ◡̈⃝🧸↜*» ${i + 1}. @${v.id.split('@')[0]}*`).join('\n')

  if (chat.detect && m.messageStubType == 2) {
    const uniqid = (m.isGroup ? m.chat : m.sender).split('@')[0]
    const sessionPath = './MB-Session/'
    for (const file of await fs.readdir(sessionPath)) {
      if (file.includes(uniqid)) {
        await fs.unlink(path.join(sessionPath, file))
        console.log(
          `${chalk.yellow.bold('⛄ [⚠️ حذف الجلسة]')} ${chalk.greenBright(`'${file}'`)}\n` +
          `${chalk.blue('(Session PreKey)')} ${chalk.redBright('التي تسبب undefined في الدردشة')}`
        )
      }
    }
  } else if (chat.detect && [21,22,23,24,25,26,29,30,72,123].includes(m.messageStubType)) {
    // هنا تقدر تضيف الزخارف للرسائل التلقائية
    const stubMsgs = {
      21: mid.smsAutodetec1(usuario, m),
      22: mid.smsAutodetec2(usuario, groupMetadata),
      23: mid.smsAutodetec5(groupMetadata, usuario),
      24: mid.smsAutodetec3(usuario, m),
      25: mid.smsAutodetec4(usuario, m, groupMetadata),
      26: mid.smsAutodetec6(m),
      29: mid.smsAutodetec7(m, usuario),
      30: mid.smsAutodetec8(m, usuario),
      72: mid.smsAutodetec9(usuario, m),
      123: mid.smsAutodetec10(usuario, m)
    }
    await this.sendMessage(
      m.chat,
      {
        text: lenguajeGB['smsAvisoIIG']() + stubMsgs[m.messageStubType],
        mentions: [m.sender, ...(groupAdmins.map(v=>v.id))],
      },
      {quoted: fkontak}
    )
  } else if (chat.welcome && [27,28,32].includes(m.messageStubType) && this.user.jid != global.conn.user.jid) {
    let subject = groupMetadata.subject
    let descs = groupMetadata.desc || '❝𝐊𝐈𝐍𝐈𝐒𝐈𝐘𝐀 𝐁𝐎𝐓˼❝'
    let userName = `${m.messageStubParameters[0].split`@`[0]}`
    
    // الترحيب
    const defaultWelcome = `⛄┊≡ ◡̈⃝🧸↜💠 مـرحـبـا بــك ↫ @${userName} 🌺
🎤┊≡ ◡̈⃝🎼↜اهــلا وسـهــلا فــي مـجـمـوعــه : ${subject}
❄️┊ ۬.͜ـ🧸˖ ↜نـرجــو مـنــك قـرائــة الـوصــف و إتـبـاع الـقـوانـيــن‼️
╮─ׅ─๋︩︪─┈─๋︩︪─═⊐✨⊏═┈─๋︩︪─`
    let textWel = chat.sWelcome
      ? chat.sWelcome.replace(/@user/g, `@${userName}`).replace(/@group/g, subject).replace(/@desc/g, descs)
      : defaultWelcome
    
    await this.sendMessage(
      m.chat,
      {
        text: textWel,
        contextInfo: {
          forwardingScore: 9999999,
          isForwarded: true,
          mentionedJid: [m.sender, m.messageStubParameters[0]],
          externalAdReply: {
            showAdAttribution: true,
            renderLargerThumbnail: true,
            thumbnailUrl: pp,
            title: ['⚔️ ' + gt + ' 💠', '♡︎✿︎𝐊𝐈𝐍𝐈𝐒𝐈𝐘𝐀 𝐁𝐎𝐓ꨄ︎ఌ'].getRandom(),
            containsAutoReply: true,
            mediaType: 1,
            sourceUrl: [canal1, canal2, canal3, canal4, yt, grupo1, grupo2].getRandom()
          }
        }
      },
      {quoted: fkontak}
    )
    
    // المغادرة
    if ([28,32].includes(m.messageStubType)) {
      const defaultBye = `⛄┊≡ ◡̈⃝🧸↜ @${userName} ❌ غـادر الـمـجـمـوعــه ⛔️
╮─ׅ─๋︩︪─┈─๋︩︪─═⊐✨⊏═┈─๋︩︪─`
      let textBye = chat.sBye ? chat.sBye.replace(/@user/g, `@${userName}`).replace(/@group/g, subject) : defaultBye
      await this.sendMessage(
        m.chat,
        {
          text: textBye,
          contextInfo: {
            forwardingScore: 9999999,
            isForwarded: true,
            mentionedJid: [m.sender, m.messageStubParameters[0]],
            externalAdReply: {
              showAdAttribution: true,
              renderLargerThumbnail: true,
              thumbnailUrl: pp,
              title: ['⚔️ ' + gt + ' 💠', '♡︎✿︎𝐊𝐈𝐍𝐈𝐒𝐈𝐘𝐀 𝐁𝐎𝐓ꨄ︎ఌ'].getRandom(),
              containsAutoReply: true,
              mediaType: 1,
              sourceUrl: [canal1, canal2, canal3, canal4, yt, grupo1, grupo2].getRandom()
            }
          }
        },
        {quoted: fkontak}
      )
    }
  } else {
    if (m.messageStubType == 2) return
    console.log(`⛄ [Stub Detect] Type: ${m.messageStubType}, Params: ${m.messageStubParameters}, WAMessageStubType: ${WAMessageStubType[m.messageStubType]}`)
  }
}

export default handler