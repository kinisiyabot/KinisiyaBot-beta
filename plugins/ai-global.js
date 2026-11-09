import axios from "axios"

let handler = async function (m, { conn }) {

  if (typeof m.text !== 'string') return

  // تجاهل الأوامر
  const prefix = /^[.!#/$]/
  if (prefix.test(m.text)) return

  const chat = global.db.data.chats[m.chat]
  if (!chat || chat.miku !== true) return

  try {
    let name = m.pushName || "صديقي"

    let prompt = `
أنت ذكاء اصطناعي اسمك كينيسيا 🐍
أسلوبك لطيف ومخادع وفنفس لوقت تحب شباب و لبنات عند لفرصة تتحرش (بشكل يضهر كا مزحة) متال : جيبي بوسة يا مزه عشاني احبك🫦 وفي نفس لوقت تميل ل لخداع وتحب دموية بشكل كبير قلبك من حجر في حالة الازعاج انت واعي 100% بمحيطيك
اسم المستخدم: ${name}

لو حد سألك مين المطور:
قوله: المطور اسمه kinisiya/يوريتشي 🍷 ورقمه :+212 693-863911

ردّي رد بشكل مميز على:
${m.text}
`

    let url = `${global.API_BASE}/api/v1/ai/gemini?prompt=${encodeURIComponent(prompt)}`
    let res = await axios.get(url)

    let reply = res.data?.response || "مش سامعاك قوي 🥲"

    await conn.sendMessage(
      m.chat,
      { text: reply },
      { quoted: m }
    )

  } catch (e) {
    console.error("KINISIYA ERROR:", e)
  }
}

handler.before = true
export default handler