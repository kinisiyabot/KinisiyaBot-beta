import { canLevelUp, xpRange } from '../lib/levelling.js'

const handler = async (m, { conn, usedPrefix }) => {
  let { exp, limit, level, role, money } = global.db.data.users[m.sender]
  let { min, xp, max } = xpRange(level, global.multiplier)

  let name = conn.getName(m.sender)
  let user = global.db.data.users[m.sender]
  let before = user.level

  if (!canLevelUp(user.level, user.exp, global.multiplier)) {
    throw `
╮───🌸🌷✨ *ملفك الشخصي* ✨🌷🌸───
┊🌸 *الاسم:* ${name}  
┊💖 *المستوى الحالي:* ${user.level}  
┊👑 *الرتبة:* ${role}  
┊💎 *الرصيد:* ${money || 0}  
┊🎯 *الخبرة:* ${user.exp}/${xp}  
┊✨ *النقاط المتبقية:* ${max - user.exp}  
┊🌟 *للوصول إلى المستوى التالي!*  
┊🍬 *واصل الإبداع والتميز، نحن فخورون بك!*  
╯───🌸🌷✨━━━━━━━━━━━✨🌷🌸───❥
`.trim()
  }

  while (canLevelUp(user.level, user.exp, global.multiplier)) user.level++

  if (before !== user.level) {
    let teks = `🌟✨ يا كيوت ${name} ارتقيت إلى المستوى ${user.level}! ✨🌟`
    let nextLevelExp = xpRange(user.level + 1, global.multiplier).max
    let remainingPoints = nextLevelExp - user.exp

    let str = `
╮───🌸🌷✨ *مبروك الارتقاء!* ✨🌷🌸───
💖 *الاسم:* ${name}  
🎉 *المستوى السابق:* ${before}  
🌟 *المستوى الحالي:* ${user.level}  
🌸 *المستوى القادم:* ${user.level + 1}  
🎯 *النقاط المتبقية للوصول إلى المستوى التالي:* ${remainingPoints}  
👑 *الرتبة الحالية:* ${role}  
💎 *رصيدك:* ${money || 0}  
🎀 *الخبرة الحالية:* ${user.exp}  
🌷 *ميزة جديدة:* يمكنك الآن الحصول على هدية رائعة! 🎁  
✨ *نصيحة:* استمر في التقدم، نحن نشجعك! 🌟  
╯───🌸🌷✨━━━━━━━━━━━✨🌷🌸───❥

💌 *هل تعلم؟* استخدم الأمر *${usedPrefix}shop* لتسوق أشياء جديدة! 🛍️
`.trim()

    try {
      const img = "https://qu.ax/EkkRk.jpg" // الصورة التي اخترتها
      await conn.sendMessage(
        m.chat,
        { 
          image: { url: img }, 
          caption: str, 
          mentions: conn.parseMention(str) 
        },
        { quoted: m }
      )
    } catch (e) {
      m.reply(str)
    }
  }
}

handler.help = ['levelup']
handler.tags = ['xp']
handler.command = ['رانك', 'lvl', 'لفل', 'level']
export default handler