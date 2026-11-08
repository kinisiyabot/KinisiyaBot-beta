import fetch from 'node-fetch'
let timeout = 60000
let poin = 4999
let handler = async (m, { conn, command, usedPrefix }) => {
    conn.tebakbendera = conn.tebakbendera ? conn.tebakbendera : {}
    let id = m.chat
    if (id in conn.tebakbendera) {
        conn.reply(m.chat, '*جاوب علي السؤال السابق اولا*', conn.tebakbendera[id][0])
        throw false
    }
    let src = await (await fetch('https://gist.githubusercontent.com/Kyutaka101/799d5646ceed992bf862026847473852/raw/dcbecff259b1d94615d7c48079ed1396ed42ef67/gistfile1.txt')).json()
    let json = src[Math.floor(Math.random() * src.length)]
    let caption = `
*╭──────❪🍬┊𝑺𝒖𝒏┊🍥❫──────╮*
*┆⏳ الوقت: 60.00 ثواني┇*
*┆💰 الجائزة: 500 نقاط┇*
*┆↩️ استخدم "انسحب" للانسحاب أو "تلميح" لطلب تلميح*
*╰──────❪🍬┊𝑺𝒖𝒏┊🍥❫──────╯*`.trim()
    conn.tebakbendera[id] = [
        await conn.sendFile(m.chat, json.img, '', caption, m),
        json, poin,
        setTimeout(() => {
            if (conn.tebakbendera[id]) conn.reply(m.chat, `*انتهي الوقت!*\n*الاجابه هيا* *${json.name}*`, conn.tebakbendera[id][0])
            delete conn.tebakbendera[id]
        }, timeout)
    ]
}
handler.help = ['علم']
handler.tags = ['game']
handler.command = /^guessflag|علم/i

export default handler