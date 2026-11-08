let handler = async (m, { conn, command, usedPrefix }) => {
  let resp
  try {
    if (global.conns.some((c) => c.user.jid === conn.user.jid)) {
      if (/ايقاف|توقف|stop/i.test(command)) {
        let i = global.conns.indexOf(conn)

        if (global.conn.user.jid != conn.user.jid && m.sender != global.conn.user.jid) {
          if (i < 0) return

          resp =
`*╮──────────────────⟢ـ*
*⧉┆⏸️ تـم إيـقـاف التنصيب مـؤقـتـاً*
*⧉┆↜ لـإعـادة الـتـشـغـيـل اسـتـخـدم ⬳*
*⧉┆↜ ˼ ${usedPrefix}تنصيب ˹*
*⧉┆↜ أو أدخـل الـتـوكـن مـرة أخـرى*
*╯──────────────────⟢ـ*`

          await conn.sendMessage(m.chat, { text: resp }, { quoted: m })

          conn.ev.removeAllListeners()
          conn.ws.close()
          conn.isInit = false
          global.conns.splice(i, 1)
          return
        }
      }
    } else {
      resp =
`*╮──────────────────⟢ـ*
*⧉┆❌ هـذا الأمـر خـاص بـالـتنصيب فـقـط*
*╯──────────────────⟢ـ*`

      return conn.sendMessage(m.chat, { text: resp }, { quoted: m })
    }
  } catch (e) {
    resp =
`*╮──────────────────⟢ـ*
*⧉┆⚠️ حـدث خـطـأ أثـنـاء إيـقـاف الـتنصيب*
*╯──────────────────⟢ـ*`

    console.log('خطأ أثناء إيقاف السب بوت:', e)
    return conn.sendMessage(m.chat, { text: resp }, { quoted: m })
  }
}

handler.command = /^(ايقاف_البوت|ايقاف|توقف|stop)$/i
handler.private = true

export default handler