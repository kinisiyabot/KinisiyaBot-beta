import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'

const CHANNEL = 'https://whatsapp.com/channel/0029Vb80wch30LKFioKenc2V'

const quick = (text, id) => ({
  name: 'quick_reply',
  buttonParamsJson: JSON.stringify({ display_text: text, id }),
})

const url = (text, link) => ({
  name: 'cta_url',
  buttonParamsJson: JSON.stringify({ display_text: text, url: link, merchant_url: link }),
})

async function send(conn, chat, body, footer, buttons, quoted) {
  const msg = generateWAMessageFromContent(
    chat,
    {
      viewOnceMessage: {
        message: {
          interactiveMessage: proto.Message.InteractiveMessage.fromObject({
            body: { text: body },
            footer: { text: footer },
            nativeFlowMessage: { buttons },
          }),
        },
      },
    },
    { userJid: conn.user.jid, quoted },
  )
  await conn.relayMessage(chat, msg.message, { messageId: msg.key.id })
}

let handler = async (m, { conn }) => {
  // المعرّفات هنا أوامر مسجّلة فعلاً (`.قسم_ai`، `.تنصيب`). المعرّفات السابقة
  // (`quick_test`, `quick_img`) لم تكن أوامر، فكانت الأزرار تُرسل ولا تفعل شيئاً.
  await send(
    conn,
    m.chat,
    '📜 هذا مثال على رسالة تفاعلية!',
    'أوامر 🐍',
    [quick('الذكاء الاصطناعي 🤖', '.قسم_ai'), quick('التنصيب ⚙️', '.تنصيب'), url('القناة 📢', CHANNEL)],
    m,
  )
}

handler.command = ['test', 'تست']
handler.tags = ['test']

export default handler
