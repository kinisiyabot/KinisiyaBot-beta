let handler = async (m, { conn, text, args, usedPrefix, command, participants }) => {
  // جلب الشخص سواء من الرد أو المنشن
  let who = m.mentionedJid?.[0] || (m.quoted && m.quoted.sender);

  // إذا ما تم تحديد الشخص
  if (!who) return conn.reply(m.chat, 
    `⊏─๋︩︪─๋︩︪─๋︩︪─๋︩︪─═͜⊐❪⚡❫⊏═─๋︩︪─๋︩︪─๋︩︪─๋︩︪─๋︩︪─⊐\n\n⚠️ *يرجى تحديد شخص باستخدام منشن أو بالرد على رسالته لتنفيذ* ${command}!\n\n⊏─๋︩︪─๋︩︪─๋︩︪─๋︩︪─═͜⊐❪⚡❫⊏═─๋︩︪─๋︩︪─๋︩︪─๋︩︪─๋︩︪─⊐`, 
    m
  );

  let user = db.data.users[who];
  if (!user) return conn.reply(m.chat, `❌ المستخدم غير موجود في قاعدة البيانات.`, m);
  if (user.warn == undefined) user.warn = 0;

  if (command == 'انذار') {
    user.warn += 1;

    if (user.warn >= 5) {
      await conn.reply(m.chat, 
        `⊏─๋︩︪─๋︩︪─๋︩︪─๋︩︪─═͜⊐❪⚡❫⊏═─๋︩︪─๋︩︪─๋︩︪─๋︩︪─๋︩︪─⊐\n\n❌ *${await conn.getName(who)} تم طرده لأن إنذاراته وصلت 5/5!*\n\n✦┇𝐌𝐈𝐊𝐄𝐘 |♕| 𝐁𝐎𝐓┇✦\n\n⊏─๋︩︪─๋︩︪─๋︩︪─๋︩︪─═͜⊐❪⚡❫⊏═─๋︩︪─๋︩︪─๋︩︪─๋︩︪─๋︩︪─⊐`, 
        m
      );
      await conn.groupParticipantsUpdate(m.chat, [who], 'remove');
      user.warn = 0;
    } else {
      await conn.reply(m.chat, 
        `⊏─๋︩︪─๋︩︪─๋︩︪─๋︩︪─═͜⊐❪⚡❫⊏═─๋︩︪─๋︩︪─๋︩︪─๋︩︪─๋︩︪─⊐\n\n⚠️🚨 *تم إنذار* 『 ${await conn.getName(who)} 』•> *${user.warn}/5*\n\n✦┇𝐌𝐈𝐊𝐄𝐘 |♕| 𝐁𝐎𝐓┇✦\n\n⊏─๋︩︪─๋︩︪─๋︩︪─๋︩︪─═͜⊐❪⚡❫⊏═─๋︩︪─๋︩︪─๋︩︪─๋︩︪─๋︩︪─⊐`, 
        m
      );
    }
  } else if (command == 'الغاء-الانذار') {
    if (user.warn > 0) user.warn -= 1;
    await conn.reply(m.chat, 
      `⊏─๋︩︪─๋︩︪─๋︩︪─๋︩︪─═͜⊐❪⚡❫⊏═─๋︩︪─๋︩︪─๋︩︪─๋︩︪─๋︩︪─⊐\n\n✅✨ *تم تقليل إنذارات* 『 ${await conn.getName(who)} 』•> *${user.warn}/5*\n\n✦┇𝐌𝐈𝐊𝐄𝐘 |♕| 𝐁𝐎𝐓┇✦\n\n⊏─๋︩︪─๋︩︪─๋︩︪─๋︩︪─═͜⊐❪⚡❫⊏═─๋︩︪─๋︩︪─๋︩︪─๋︩︪─๋︩︪─⊐`, 
      m
    );
  }
};

handler.help = ['انذار', 'الغاء-الانذار'];
handler.tags = ['owner'];
handler.command = /^(انذار|الغاء-الانذار)$/i;
handler.admin = true;
handler.group = true;

export default handler;