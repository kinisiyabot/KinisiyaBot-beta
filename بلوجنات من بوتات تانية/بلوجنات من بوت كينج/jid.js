let handler = async (m, { conn }) => {

  // معرف الشات (القروب، القناة، أو الخاص)

  let chatJid = m.chat;

  // رسالة ترسل معرف الشات

  let message = `

┏━━━━━━━[ معرف الشات ]━━━━━━━┓

${chatJid}

┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

  `.trim();

  await conn.reply(m.chat, message, m);

}

handler.help = ['jid']

handler.tags = ['group']

handler.command = /^jid$/i

handler.group = false

export default handler