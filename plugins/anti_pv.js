export async function before(m, { conn, isAdmin, isBotAdmin, isOwner, isROwner }) {
  if (m.isBaileys && m.fromMe) return true;
  if (m.isGroup) return false;
  if (!m.message) return true;

  const text = m.text ? m.text.toUpperCase() : '';
  if (text.includes('PIEDRA') || text.includes('PAPEL') || text.includes('TIJERA') || text.includes('SERBOT') || text.includes('JADIBOT')) {
    return true;
  }

  const chat = global.db?.data?.chats?.[m.chat];
  const bot = global.db?.data?.settings?.[this.user.jid] || {};

  // تفعيل حظر الخاص (Anti-Private)
  if (bot.antiPrivate && !isOwner && !isROwner) {
    const warningText = `*❍━━━══━━❪🫦❫━━══━━━❍*
*❪❗❫:•⪼ ممنوع الكلام في الخاص يا مز/ه لذلك سوف يتم حظرك*
*┊🫦┊:•⪼ للتواصل مع المطور⇇❪ https://wa.me/212693863911 ❫*
*❍━━━══━━❪🫦❫━━══━━━❍*
*┊🫦┊:•⪼ عايز تعمل بوت يبقى خاص بيك تواصل مع المطور والتكلفة الكلية⇇❪5دولار تحويل paypal❫*
*❍━━━══━━❪🫦❫━━══━━━❍*`;

    await m.reply(warningText, null, { mentions: [m.sender] });
    await this.updateBlockStatus(m.sender, 'block');
  }

  return false;
}
