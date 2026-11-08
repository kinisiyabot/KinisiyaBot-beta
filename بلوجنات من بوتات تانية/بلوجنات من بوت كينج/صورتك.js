import Jimp from 'jimp';

let handler = async (m, { conn, isOwner }) => {
  // السماح للمطورين فقط
  if (!isOwner) return conn.reply(m.chat, `⚠️ هذا الأمر مخصص للمطور فقط.`, m);

  if (!m.quoted) 
    return conn.reply(m.chat, `⚠️ من فضلك قم بالرد على صورة لتغيير صورة البوت الشخصية.`, m);

  try {
    const media = await m.quoted.download();
    if (!media) 
      return conn.reply(m.chat, `❌ لم أتمكن من الحصول على الصورة.`, m);

    const image = await Jimp.read(media);
    const buffer = await image.getBufferAsync(Jimp.MIME_JPEG);

    await conn.updateProfilePicture(conn.user.jid, buffer);
    return conn.reply(m.chat, `✅ تم تغيير صورة البوت الشخصية بنجاح ✔️`, m);
  } catch (e) {
    console.error(e);
    return conn.reply(m.chat, `❌ حدث خطأ أثناء محاولة تغيير صورة البوت:\n${e.message}`, m);
  }
};

handler.help = ['صورتك'];
handler.tags = ['owner'];
handler.command = ['صورتك', 'صورة_البوت'];

export default handler;