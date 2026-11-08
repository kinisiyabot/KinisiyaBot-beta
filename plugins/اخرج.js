let handler = async (m, { conn, text, command }) => {
let id = text ? text : m.chat  
await conn.reply(id, '*┊🐍┊:•⪼ بـاي يـشـويـة زنـوج كـلمـو كينيسيا//يوريتشي عـشـان يـرجـعـنـي تـانـي بـخـرج انـا*') 
await conn.groupLeave(id)}
handler.command = /^(اخرج|اطلع|غادر|خروج)$/i
handler.group = true
handler.rowner = true
export default handler