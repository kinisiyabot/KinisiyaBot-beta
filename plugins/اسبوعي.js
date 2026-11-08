import db from '../lib/database.js'

const free = 5000
const prem = 20000
const weekTime = 7 * 24 * 60 * 60 * 1000 // 7 أيام

let handler = async (m, { conn, isPrems }) => {
  let user = global.db.data.users[m.sender]
  let time = user.lastclaim + weekTime
  if (new Date - user.lastclaim < weekTime) throw `🎁 *أنت جمعت الهدية الأسبوعية بالفعل*\n\n🕚 ادخل بعد *${clockString(time - new Date())}*`
  
  user.exp += isPrems ? prem : free
  m.reply(`
🎁 *هدية أسبوعية*

▢ *لقد حصلت على:*
🆙 *XP* : +${isPrems ? prem : free}`)
  
  user.lastclaim = new Date * 1
}

handler.help = ['weekly']
handler.tags = ['econ']
handler.command = ['اسبوعي']

export default handler

function clockString(ms) {
  let ye = isNaN(ms) ? '--' : Math.floor(ms / 31104000000) % 10
  let mo = isNaN(ms) ? '--' : Math.floor(ms / 2592000000) % 12
  let d = isNaN(ms) ? '--' : Math.floor(ms / 86400000) % 30
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000) % 24
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60

  h = (h < 10) ? "0" + h : h
  m = (m < 10) ? "0" + m : m
  s = (s < 10) ? "0" + s : s

  return h + " ساعات " + m + " دقائق"
}