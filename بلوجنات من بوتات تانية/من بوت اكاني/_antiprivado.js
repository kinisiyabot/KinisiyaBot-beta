export async function before(m, {conn, isAdmin, isBotAdmin, isOwner, isROwner}) {
  if (m.isBaileys && m.fromMe) return !0;
  if (m.isGroup) return !1;
  if (!m.message) return !0;
  if (m.text.includes('PIEDRA') || m.text.includes('PAPEL') || m.text.includes('TIJERA') || m.text.includes('serbot') || m.text.includes('jadibot')) return !0;
  const chat = global.db.data.chats[m.chat];
  const bot = global.db.data.settings[this.user.jid] || {};
  if (bot.antiPrivate && !isOwner && !isROwner) {
    await m.reply(`*✯≼══⌬┋⊰🐦‍🔥⊱┋⌬══≽✯*\n*❪❗❫:•⪼ ممنوع الكلام في الخاص لذالك سوف يتم حظرك\n*┊🌸┊:•⪼ للتواصل مع المطور⇇❪ https://wa.me/201063808608 ❫\n*✯≼══⌬┋⊰🐦‍🔥⊱┋⌬══≽✯*\n*┊🌸┊:•⪼عايز تعمل بوت يبقي خاص بيك تواصل مع المطور و التكلفه  الكليه⇇❪100جنيه مصري❫\n*✯≼══⌬┋⊰🐦‍🔥⊱┋⌬══≽✯*`, false, {mentions: [m.sender]});
    await this.updateBlockStatus(m.chat, 'block');
  }
  return !1;
}