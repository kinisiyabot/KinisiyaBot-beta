// Code developed by Song

import fs from 'fs'

let handler = async (m, { conn, usedPrefix }, args, command) => {
  let who = m.mentionedJid && m.mentionedJid[0]
    ? m.mentionedJid[0]
    : m.fromMe
    ? conn.user.jid
    : m.sender

  let uniqid = `${who.split`@`[0]}`

  try {
    if (global.conns.push(conn))
      await conn.sendMessage(
        m.chat,
        {
          text:
            usedPrefix +
            'serbot' +
            ' ' +
            Buffer.from(
              fs.readFileSync('./Session/' + uniqid + '/creds.json'),
              'utf-8'
            ).toString('base64')
        },
        { quoted: m }
      )
  } catch (e) {
    await conn.reply(
      m.chat,
`*╮──────────────────⟢ـ*
*⧉┆✦ Code developed by Song🪵*
*╯──────────────────⟢ـ*

*╮──────────────────⟢ـ*
*⧉┆↜ To convert to a kinisiya-Bot 🪵*
*⧉┆↜ Use the command ⬳*
*⧉┆↜ ˼ ${usedPrefix}kinisiyabot ˹*
*╯──────────────────⟢ـ*

*╮──────────────────⟢ـ*
*⧉┆⚠️ In case of a login problem*
*⧉┆↜ Delete the session from your devices*
*⧉┆↜ Then use ⬳*
*⧉┆↜ ˼ ${usedPrefix}eliminarjb ˹*
*╯──────────────────⟢ـ*`,
      m
    )
    if (m.fromMe) return
  }
}

handler.command = /^(التوكن)$/i
handler.group = true   // ← يعمل في الجروبات
// لا يوجد handler.private

export default handler