import fs from 'fs';
import path from 'path';

let handler = async (m, { conn, args }) => {
  const filePath = './zarf.json';
  const mediaPath = './media';
  if (!fs.existsSync(filePath)) return m.reply('⚠️ ملف zarf.json غير موجود.');
  if (!fs.existsSync(mediaPath)) fs.mkdirSync(mediaPath);

  let zarfData = JSON.parse(fs.readFileSync(filePath));

  if (!args[0] && !m.quoted) {
    return m.reply(
      `🛠️ الاستخدام: تعديل <خاصية> <القيمة الجديدة أو إرسال ملف>\n\n` +
      `📌 الخصائص: اسم، وصف، صوره، منشن، رساله، صوت`
    );
  }

  const property = args[0]?.toLowerCase();

  switch (property) {
    case 'صوره': {
      const mediaFile = path.join(mediaPath, 'zarf.jpg');

      if (m.quoted) {
        console.log("📸 DEBUG نوع الرسالة المردود عليها:", m.quoted.mtype, Object.keys(m.quoted.message || {}));

        if (/image/.test(m.quoted.mtype)) {
          const media = await conn.downloadMediaMessage(m.quoted);
          fs.writeFileSync(mediaFile, media);
          zarfData.groupProfile = mediaFile;
          m.reply(`✅ تم تحديث صورة الجروب.`);
        } else {
          m.reply("⚠️ الرسالة اللي رديت عليها مش صورة.");
        }
      } else {
        if (fs.existsSync(mediaFile)) {
          await conn.sendFile(m.chat, mediaFile, 'zarf.jpg', '✅ هذه هي الصورة الحالية.', m);
        } else {
          m.reply('❌ لا توجد صورة حالية. أرسل صورة مع الأمر لتحديثها.');
        }
      }
      break;
    }

    case 'صوت': {
      const mediaFile = path.join(mediaPath, 'zarf.mp3');

      if (m.quoted) {
        console.log("🎵 DEBUG نوع الرسالة المردود عليها:", m.quoted.mtype, Object.keys(m.quoted.message || {}));

        if (/audio/.test(m.quoted.mtype)) {
          const media = await conn.downloadMediaMessage(m.quoted);
          fs.writeFileSync(mediaFile, media);
          zarfData.sound = mediaFile;
          m.reply(`✅ تم تحديث الصوت.`);
        } else {
          m.reply("⚠️ الرسالة اللي رديت عليها مش صوت.");
        }
      } else {
        if (fs.existsSync(mediaFile)) {
          await conn.sendFile(m.chat, mediaFile, 'zarf.mp3', '✅ هذا هو الصوت الحالي.', m, true);
        } else {
          m.reply('❌ لا يوجد صوت حالي. أرسل صوت مع الأمر لتحديثه.');
        }
      }
      break;
    }

    default:
      return m.reply('❌ الخاصية غير معروفة. الخصائص: اسم، وصف، صوره، منشن، رساله، صوت');
  }

  fs.writeFileSync(filePath, JSON.stringify(zarfData, null, 2), 'utf-8');
};

handler.command = ['عدل'];
handler.tags = ['grupo'];
handler.help = ['عدل'];

export default handler;