let handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender];
  let name = conn.getName(m.sender) || 'مستخدم';
  let taguser = '@' + m.sender.split("@")[0];

  let message = `*_:•⪼مـــرحبــــاً بـــكـ/ﻲ يـا ❪${taguser}❫ في قسم الصور_*
*❀✦═══ •『🍓』• ═══✦❀*
> *شرح القسم:•⪼ القسم يحتوي علي صور لي شخصيات الانمي المذكوره❪اي عندما تكتب(.ميكاسا)راح يجيب لك صور لي ميكاسا❫و اوامر تحميل صور و تتطقيمات*
*❆━━━━━⊱⎔⌟🍓⌜⎔⊱━━━━━❆*
> *｢❆┊قــــــســـــــم_الــصـور┊❆｣*
*❆━━━━━⊱⎔⌟🍓⌜⎔⊱━━━━━❆*
┊🌹┊:•⪼⌟هيناتا⌜ 
┊🌹┊:•⪼⌟ميكاسا⌜ 
┊🌹┊:•⪼ ⌟كابلز⌜
┊🌹┊:•⪼ ⌟تطقيم_بنات⌜
┊🌹┊:•⪼⌟ميكو⌜
┊🌹┊:•⪼⌟كورومي⌜
┊🌹┊:•⪼ ⌟كانيكي⌜
┊🌹┊:•⪼ ⌟ساكورا⌜
┊🌹┊:•⪼ ⌟صوره⌜
┊🌹┊:•⪼⌟هيستيا⌜
┊🌹┊:•⪼ ⌟كاوري⌜
*❆━━━━━⊱⎔⌟🍓⌜⎔⊱━━━━━❆*
> ❆ ❯ امر ❪.صوره❫ يحضر لك صوره من النت 
> مثال:•⪼.صوره الاستور يجيب لك صوره المطلوبه اي يجيب صوره الاستور 
> ❆ ❯ من الافضل كتابت الطلب بي الانجليزي و الانمي
*❆━━━━━⊱⎔⌟🍓⌜⎔⊱━━━━━❆*
*┊🍓┊البوت:•⪼𝓡𝓪𝓫𝓫𝓲𝓽 𝓼𝓲𝓷𝓹𝓪𝓲 ༆*
*𝓡𝓪𝓫𝓫𝓲𝓽┊🍓┊ 𝓼𝓲𝓷𝓹𝓪𝓲 ༆`;

  const emojiReaction = '📷';

  try {
    // إرسال الريأكشن
    await conn.sendMessage(m.chat, { react: { text: emojiReaction, key: m.key } });

    // إرسال الفيديو مع النص
    await await conn.sendMessage(m.chat, { 
  image: { 
    url: 'https://files.catbox.moe/busm02.jpg' 
  }, 
  caption: message, 
  mentions: [m.sender] 
});
  } catch (error) {
    console.error("Error sending message:", error);
    await conn.sendMessage(m.chat, { text: 'حدث خطأ أثناء إرسال الفيديو.' });
  }
};

handler.command = /^(ق2)$/i;
handler.exp = 50;
handler.fail = null;

export default handler;