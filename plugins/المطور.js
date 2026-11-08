import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  let vcard = `BEGIN:VCARD
VERSION:3.0
FN:🍺༄𝐈𝐌 𝐘𝐄𝐑𝐈𝐓𝐂𝐇𝐈༆🍻
ORG:🍺༄𝐈𝐌 𝐘𝐄𝐑𝐈𝐓𝐂𝐇𝐈༆🍻
TITLE:Metatron Executioner of Michael
EMAIL;type=INTERNET:fahd.mohmd.1333.9@gmail.com
TEL;type=CELL;waid=212693863911:+212693863911
ADR;type=WORK:;;2-chōme-7-5 Fuchūchō;Izumi;Osaka;594-0071;Japan
URL;type=WORK:https://t.me/yertchi_kunusua
X-WA-BIZ-NAME:🍺༄𝐈𝐌 𝐘𝐄𝐑𝐈𝐓𝐂𝐇𝐈༆🍻
X-WA-BIZ-DESCRIPTION:In case someone hurts you, be patient and make hatred gather inside you
X-WA-BIZ-HOURS:Mo-Su 00:00-23:59
END:VCARD`

  let qkontak = {
    key: { fromMe: false, participant: "0@s.whatsapp.net", remoteJid: "status@broadcast" },
    message: { contactMessage: { displayName: "🍺༄𝐈𝐌 𝐘𝐄𝐑𝐈𝐓𝐂𝐇𝐈༆🍻", vcard } }
  }

  // 🔹 نحول الرابط لصورة Buffer
  let thumbUrl = 'https://files.catbox.moe/1q7oqx.webp'
  let thumb = await (await fetch(thumbUrl)).buffer().catch(() => null)

  await conn.sendMessage(
    m.chat,
    {
      contacts: {
        displayName: '🍺༄𝐈𝐌 𝐘𝐄𝐑𝐈𝐓𝐂𝐇𝐈༆🍻',
        contacts: [{ vcard }]
      },
      contextInfo: {
        externalAdReply: {
          title: '𝐊𝐈𝐍𝐈𝐒𝐈𝐘𝐀 𝐁𝐎𝐓',
          body: '⏤͟͞ू⃪ 𝑲𝑰𝑵𝑰𝑺𝑰𝒀𝑨⃝𖤐',
          thumbnail: thumb,
          mediaType: 1,
          renderLargerThumbnail: true,
          showAdAttribution: true,
          sourceUrl: 'https://t.me/yertchi_kunusua'
        }
      }
    },
    { quoted: qkontak }
  )
}

handler.help = ['owner']
handler.tags = ['info']
handler.command = /^(owner|creator|المطورين|المطور|مطور|مطورك|مطوري|creador)$/i

export default handler