import axios from 'axios'

const handler = async (m, { conn, usedPrefix, command }) => {
  const cristiano = (await axios.get(
    `https://raw.githubusercontent.com/BrunoSobrino/TheMystic-Bot-MD/master/src/JSON/CristianoRonaldo.json`
  )).data
  
  const ronaldo = cristiano[Math.floor(Math.random() * cristiano.length)]
  
  await conn.sendMessage(m.chat, { 
    image: { url: ronaldo }, 
    caption: `*Siiiuuuuuu* ⚽🔥` 
  }, { quoted: m })
}

handler.help = ['cristianoronaldo', 'cr7']
handler.tags = ['internet']
handler.command = /^(الدون|رونالدو)$/i

export default handler