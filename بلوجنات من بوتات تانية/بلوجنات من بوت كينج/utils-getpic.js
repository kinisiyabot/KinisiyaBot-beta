let handler = async (m, { conn }) => {
  let texto = await m.mentionedJid
  let who = texto.length > 0 ? texto[0] : (m.quoted ? await m.quoted.sender : false)

  if (!who) {
    return m.reply('🖼️ من فضلك اعمل *منشن* أو رد على الشخص اللي عايز تشوف صورته الشخصية.');
  }

  try {
    const img = await conn.profilePictureUrl(who, 'image').catch(() => null);

    if (!img) {
      return conn.sendMessage(
        m.chat,
        {
          text: `⚠️ تعذر الحصول على صورة بروفايل @${who.split('@')[0]}.`,
          mentions: [who],
        },
        { quoted: m }
      );
    }

    await conn.sendMessage(
      m.chat,
      {
        image: { url: img },
        mentions: [who],
      },
      { quoted: m }
    );
  } catch (error) {
    console.error(error);
    await m.reply('🚫 حدث خطأ أثناء جلب الصورة، حاول مرة أخرى.');
  }
};

handler.help = ['بروفايل'];
handler.tags = ['أدوات'];
handler.command = ['بروفايل'];

export default handler;