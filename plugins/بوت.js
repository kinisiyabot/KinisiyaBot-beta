const handler = async (m, { conn }) => {
  const imageUrl = "https://files.catbox.moe/3z6udt.jpg";
  const link1 = "https://wa.me/212693863911";

  // 💫 الرسالة بصورة كبيرة بدون أزرار
  const adMessage = {
    text: `*◞💖‟⌝╎مرحبـاً اسـمـي كـيـنـيـسـيـا*
*┊˚₊·͟͟͞͞➳❥ مرحبا احبائي انا بوت متعدد المهام مطوري يوريتشي استعمل (.اوامر) لي طلب القائمه*`,
    contextInfo: {
      externalAdReply: {
        title: "𖥔ᰔᩚ︎𝐊𝐈𝐍𝐈𝐒𝐈𝐘𝐀 𝐁𝐎𝐓ꨄ︎ఌ⋆｡˚",
        body: "BY | ༄𝐘𝐄𝐑𝐈𝐓𝐂𝐇𝐈༆",
        thumbnailUrl: imageUrl,
        mediaType: 1,
        renderLargerThumbnail: true,
        mediaUrl: link1
      }
    }
  };

  await conn.sendMessage(m.chat, adMessage, { quoted: m });
};

handler.command = /^بوت$/i;

export default handler;