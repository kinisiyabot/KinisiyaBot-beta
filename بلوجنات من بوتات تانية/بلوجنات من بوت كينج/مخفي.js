import { generateWAMessageFromContent } from '@whiskeysockets/baileys'
import * as fs from 'fs'

var handler = async (m, { conn, text, participants, isOwner }) => {
  try { 
    // السماح للمطورين فقط
    if (!isOwner) {
      return m.reply('⚠️ هذا الأمر مخصص للمطور فقط.')
    }

    let users = participants.map(u => conn.decodeJid(u.id))
    let more = String.fromCharCode(8206)
    let masss = more.repeat(850)

    if (!m.quoted && !text) {
      await conn.relayMessage(m.chat, { 
        extendedTextMessage: { 
          text: `${masss}\n`, 
          contextInfo: { mentionedJid: users } 
        } 
      }, {})
      return
    }

    if (m.quoted) {
      let q = m.quoted
      let c = await m.getQuotedObj()
      let msg = conn.cMod(
        m.chat, 
        generateWAMessageFromContent(
          m.chat, 
          { [q.mtype]: c.message[q.mtype] }, 
          { quoted: null, userJid: conn.user.id }
        ), 
        text || q.text, 
        conn.user.jid, 
        { mentions: users }
      )
      await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
      return
    }

    if (text) {
      await conn.relayMessage(m.chat, { 
        extendedTextMessage: { 
          text: `${masss}\n${text}\n`, 
          contextInfo: { mentionedJid: users } 
        } 
      }, {})
      return
    }

  } catch (e) {  
    console.error(e)
    let users = participants.map(u => conn.decodeJid(u.id))
    let more = String.fromCharCode(8206)
    let masss = more.repeat(850)
    await conn.relayMessage(m.chat, { 
      extendedTextMessage: { 
        text: `${masss}\n`, 
        contextInfo: { mentionedJid: users } 
      } 
    }, {})
  }
}

handler.command = /^(hidetag|مخفي|notify)$/i
handler.group = true

export default handler