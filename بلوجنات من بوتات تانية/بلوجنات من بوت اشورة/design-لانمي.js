import uploadImage from '../lib/uploadImage.js'

let handler = async (m, { conn }) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || q.mediaType || ""
  if (!/image/g.test(mime)) throw '*رد عــلى صـوره*'

  m.reply('*جــاري تـحويــل الـصوره لانمي...*')    

  let data = await q.download?.()
  let image = await uploadImage(data)

  try {
    let anime = `https://api.lolhuman.xyz/api/imagetoanime?apikey=${lolkeysapi}&img=${image}`
    await conn.sendMessage(m.chat, { image: { url: anime }, caption: "✨ صورتك بانمي" }, { quoted: m })
  } catch (i) {
    try {
      let anime2 = `https://api.zahwazein.xyz/photoeditor/jadianime?url=${image}&apikey=${keysxxx}`
      await conn.sendMessage(m.chat, { image: { url: anime2 }, caption: "✨ صورتك بانمي" }, { quoted: m })
    } catch (a) {    
      try {    
        let anime3 = `https://api.caliph.biz.id/api/animeai?img=${image}&apikey=caliphkey`
        await conn.sendMessage(m.chat, { image: { url: anime3 }, caption: "✨ صورتك بانمي" }, { quoted: m })
      } catch (e) {
        throw '*❌ لم اســتطـيع تـحويــلهـا*'
      }
    }
  }
}

handler.help = ["toanime"]
handler.tags = ["tools"]
handler.diamond = true
handler.command = /^(لانمي|toanime)$/i

export default handler