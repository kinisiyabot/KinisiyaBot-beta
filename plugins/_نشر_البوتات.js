let handler = async (m, { conn, usedPrefix, text }) => {
  if (conn.user.jid !== global.conn.user.jid) throw false

  let users = [
    ...new Set(
      global.conns
        .filter(c => c.user && c.state !== 'close')
        .map(c => c.user.jid)
    )
  ]

  if (!users.length)
    return m.reply('❌ لا يوجد بوتات فرعية متصلة حالياً')

  let cc = text
    ? m
    : m.quoted
    ? await m.getQuotedObj()
    : null

  let teks = text || (cc && cc.text)

  if (!teks)
    return m.reply(`❌ اكتب نص النشر أو قم بالرد على رسالة`)

  let content = conn.cMod(
    m.chat,
    cc || m,
    /نشر|بث/i.test(teks)
      ? teks
      : `${teks}`
  )

  for (let id of users) {
    await delay(1500)
    await conn.copyNForward(id, content, true)
  }

  await conn.reply(
    m.chat,
`*〔 ✅ تــم نــشــر الــرســالــة بــنــجــاح 〕*
*〔 📡 عــدد الــبــوتــات: ${users.length} 〕*

${users
  .map(v => `🤖 wa.me/${v.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(usedPrefix)}حالة`)
  .join('\n')}

*〔 ⏱️ اســتــغــرق الــنــشــر حــوالــي ${users.length * 1.5} ثــانــيــة 〕*`
  , m)
}

handler.command = ['نشر_البوتات']
handler.owner = true

export default handler

const delay = time => new Promise(res => setTimeout(res, time))