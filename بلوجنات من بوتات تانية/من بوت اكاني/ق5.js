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
let message = `*_:•⪼مـــرحبــــاً بـــكـ/ﻲ يـا ❪${taguser}❫ في قسم التحميل*
*⊏─๋︩︪─๋︩︪─๋︩︪─๋︩︪─═͜⊐❪🍬❫⊏═─๋︩︪─๋︩︪─๋︩︪─๋︩︪─๋︩︪─⊐*
> *شرح القسم:•⪼ القسم يقدم لك اوامر تحميل من جميع المواقع*
*❍━━━══━━❪🌸❫━━══━━━❍*
> *｢❆┊قــــــســـــــم_التحميل┊❆｣*
*❍━━━══━━❪🌸❫━━══━━━❍*
┊🍨┊:•⪼ ⌟كروم⌜ 
┊🍨┊:•⪼ ⌟شغل⌜ 
┊🍨┊:•⪼ ⌟يوتيوب⌜
┊🍨┊:•⪼ ⌟فيديو⌜
┊🍨┊:•⪼ ⌟ايديت⌜
┊🍨┊:•⪼ ⌟استوريهات⌜
┊🍨┊:•⪼ ｢تصميم｣
┊🍨┊:•⪼ ｢خلفيات｣
┊🍨┊:•⪼ ｢ايديت-مختلط｣
┊🍨┊:•⪼ ｢خلفيه｣
┊🍨┊:•⪼ ｢جيت｣
┊🍨┊:•⪼ ｢ميديا-فاير｣
┊🍨┊:•⪼ ｢تيك｣
*❍━━━══━━❪🌸❫━━══━━━❍*
_*⚕️┊شـرح اوامـر الاديـت↶*_
*╮━━━══━━❪🌸❫━━══━━━❍*
*┊↜ايديت⇇يجيب لك اديت عشوائي*
*┊↜استوريهات⇇يجيب لك اديت استوري*
*┊↜تيك⇇امر بحث تيك توك*
*┊↜تصميم⇇اديت عشوائي لي طلبك*
*┊↜ايديت-مختلط⇇مثل امر اديت*
*╯━━━══━━❪🌸❫━━══━━━❍*
*┊❄️┊البوت:•⪼ＡｋａｉＮｉ　Ｂｏｔ*
*┊❄️┊⇦تـوقـيــــ؏⇇Eyad *`;

  const emojiReaction = '🕹️';

  try {
    await conn.sendMessage(m.chat, { react: { text: emojiReaction, key: m.key } });

    let imageBuffer = getLocalImage('./م5.jpg');
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

handler.command = /^(ق5)$/i;
handler.exp = 50;
handler.fail = null;

export default handler;