let handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender];
  let name = conn.getName(m.sender) || 'مستخدم';
  let taguser = '@' + m.sender.split("@")[0];

  let currentTime = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

  let groupMetadata = m.isGroup ? await conn.groupMetadata(m.chat) : null;
  let groupName = groupMetadata ? groupMetadata.subject : 'غير معروف';
  let groupMembers = groupMetadata ? groupMetadata.participants.length : 'غير معروف';

  let message = `
╮••─๋︩︪──๋︩︪─═⊐‹﷽›⊏═─๋︩︪──๋︩︪─┈☇
╿↵ مرحــبـا ⌊${taguser}⌉
── • ◈ • ──
*⌝⛄┊قــســم🌟الـAI وتنصيب┊🌟⌞* 
╮─ׅ─๋︩︪─┈─๋︩︪─═⊐‹✨›⊏═┈ ─๋︩︪─ ∙ ∙ ⊰ـ
┤─ׅ─ׅ┈ ─๋︩︪──ׅ─ׅ┈ ─๋︩︪─☇ـ
┤┌─๋︩︪──ׅ─ׅ┈ ─๋︩︪─›
│┊ ۬.͜ـ🌟˖ ⟨وهم☇ 
│┊ ۬.͜ـ🌟˖ ⟨ليفاي☇
│┊ ۬.͜ـ🌟˖ ⟨سولو☇
│┊ ۬.͜ـ🌟˖ ⟨سونغ☇
│┊ ۬.͜ـ🌟˖ ⟨جوده☇
│┊ قسم تنصيب.. 
│┊ ۬.͜ـ⛓️˖ ⟨code☇
│┊ ۬.͜ـ⛓️˖ ⟨qr☇
│┊ ۬.͜ـ⛓️˖ ⟨تسجيل_الخروج☇
│┊ ۬.͜ـ⛓️˖ ⟨بوتات☇
│┊ ۬.͜ـ⛓️˖ ⟨تعيين_الاساسي☇
┤└─ׅ─ׅ┈ ─๋︩︪──ׅ─ׅ┈ ─๋︩︪☇ـ
╯─ׅ ─๋︩︪─┈ ─๋︩︪─═⊐‹♻️›⊏═┈ ─๋︩︪─ ∙ ∙ ⊰ـ  `;

  const emojiReaction = '🤖';

  try {
    await conn.sendMessage(m.chat, { react: { text: emojiReaction, key: m.key } });

    await conn.sendMessage(m.chat, { 
      image: { url: 'https://files.catbox.moe/7qa6p3.jpg' },
      caption: message,
      mentions: [m.sender]
    });
  } catch (error) {
    console.error("Error sending message:", error);
    await conn.sendMessage(m.chat, { text: 'حدث خطأ أثناء إرسال الصورة.' });
  }
};

handler.command = /^(ق6)$/i;
handler.exp = 50;
handler.fail = null;

export default handler;