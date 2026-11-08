import fetch from "node-fetch"
let handler = async (m, { conn }) => {

  let data = await (await fetch('https://raw.githubusercontent.com/Afghhjjkoo/GURU-BOT/main/lib/5%D8%AA%D8%B7%D9%82%D9%8A%D9%85.json')).json()
  let cita = data[Math.floor(Math.random() * data.length)]
  
  let cowi = await(await fetch(cita.cowo)).buffer()
  await conn.sendFile(m.chat, cowi, '', '*ولد*🧑', m)
  let ciwi = await(await fetch(cita.cewe)).buffer()
  await conn.sendFile(m.chat, ciwi, '', '*ولد*🧑🏻', m)
}
handler.help = ['kinisiya bot']
handler.tags = ['kinisiya bot']
handler.command = /^طقم-ولاد|تطقيم-اولاد$/i

export default handler