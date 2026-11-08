// كائن لتخزين آخر هدف لكل مستخدم
const lastTarget = {};

let handler = async (m, { conn, text }) => {
  const usageMessage = '*`『 اعمل ريب ع الي عايز تبعبصو😹🐤 』`*';

  const who = m.mentionedJid?.[0] 
    || (m.quoted ? m.quoted.sender : text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : false);

  if (!who) return conn.reply(m.chat, usageMessage, m, { mentions: [m.sender] });

  // تجاهل إذا كان الهدف هو البوت نفسه
  if (who === conn.user.jid || m.sender === conn.user.jid) return;

  let user = who.split('@')[0];
  let sender = m.sender.split('@')[0];

  let cap;

  // تحقق مما إذا كان المستخدم كرر نفس الشخص
  if (lastTarget[sender] && lastTarget[sender] === user) {
    cap = `*@${sender} الواد طيزو ورمت ارحمو 🫦😭*`;
    // إعادة تعيين لتبدأ من البداية في المرة القادمة
    delete lastTarget[sender];
  } else {
    if (user === '212621761627') { // إضافة الأرقام الممنوعة هنا
      cap = `*@${sender} يبعبص نفسه*`;
    } else {
      cap = `*@${sender} يبعبص طيز @${user}*`;
    }
    // حفظ الهدف الحالي
    lastTarget[sender] = user;
  }

  await conn.sendMessage(
    m.chat,
    {
      image: { url: "https://files.catbox.moe/qt31nd.webp" },
      caption: cap,
      mentions: [m.sender, who]
    },
    { quoted: m }
  );
};

handler.command = ['بعبص'];
handler.owner = true;

export default handler;