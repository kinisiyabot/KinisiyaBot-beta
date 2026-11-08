import fs from 'fs';

// دالة استيراد صورة من ملف محلي
function getLocalImage(path) {
  try {
    return fs.readFileSync(path);
  } catch (error) {
    console.error(`فشل في قراءة الصورة من: ${path}`, error);
    return null;
  }
}

let handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender];
  let taguser = '@' + m.sender.split("@")[0];

  let groupMetadata = m.isGroup ? await conn.groupMetadata(m.chat) : null;

  
  let message = `*_:•⪼مـــرحبــــاً بـــكـ/ﻲ يـا ❪${taguser}❫ في قسم الالقاب*
*⊏─๋︩︪─๋︩︪─๋︩︪─๋︩︪─═͜⊐❪🍬❫⊏═─๋︩︪─๋︩︪─๋︩︪─๋︩︪─๋︩︪─⊐*
> *شرح القسم:•⪼ القسم يقدم لك اوامر المتعلقه بي اوامر تسجيل الالقاب*
*❍━━━══━━❪🌸❫━━══━━━❍*
> *｢❆┊قــــــســـــــم_الالقاب┊❆｣*
*❍━━━══━━❪🌸❫━━══━━━❍*
┊🍨┊:•⪼ ⌟تسجيل⌜ 
┊🍨┊:•⪼ ⌟الالقاب⌜ 
┊🍨┊:•⪼ ⌟لقبي⌜
┊🍨┊:•⪼ ⌟لقب⌜
┊🍨┊:•⪼ ⌟لقبه⌜
┊🍨┊:•⪼ ⌟تعريفي⌜
┊🍨┊:•⪼ ⌟حذف-التسجيل⌜
┊🍨┊:•⪼ ⌟لقب⌜
*❍━━━══━━❪🌸❫━━══━━━❍*
*┊❄️┊البوت:•⪼ＡｋａｉＮｉ　Ｂｏｔ*
*┊❄️┊⇦تـوقـيــــ؏⇇Eyad *`;

  const emojiReaction = '🕹️';

  try {
    await conn.sendMessage(m.chat, { react: { text: emojiReaction, key: m.key } });

    let imageBuffer = getLocalImage('./م2.jpg');
    if (!imageBuffer) return conn.sendMessage(m.chat, { text: 'تعذر تحميل الصورة من الملف.' });

    await conn.sendMessage(m.chat, {
      image: imageBuffer,
      caption: message,
      mentions: [m.sender]
    });
  } catch (error) {
    console.error("حدث خطأ أثناء إرسال الرسالة:", error);
    await conn.sendMessage(m.chat, { text: 'حدث خطأ أثناء إرسال الصورة.' });
  }
};

handler.command = /^(ق8)$/i;
handler.exp = 50;
handler.fail = null;

export default handler;