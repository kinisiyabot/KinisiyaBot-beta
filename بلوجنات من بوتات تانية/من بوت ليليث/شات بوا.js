import fetch from "node-fetch";

let handler = async (m, { conn }) => {
  if (m.key.fromMe) return; // منع البوت من الرد على نفسه

  let imageUrl = "https://files.catbox.moe/rldpy4.jpg"; // رابط الصورة المصغرة
  let chatLink = "https://chat.whatsapp.com/IGf0EGSqhEUJYIwCbWEY6r"; // رابط المجموعة

  try {
    // تحميل الصورة المصغرة
    let thumbnail = await (await fetch(imageUrl)).buffer();

    // **الردود المسجلة مع إضافة الصورة المصغرة ورابط الشات**
    let responses = {
      "احا": "خدها و شلحها😆",
      "كينيسيا": "عايز ايه يا زفت",
      "الحمدلله": "ادام الله حمدك",
      "بوت": "ارغي عايز ايه",
      "يب": "يعم استرجل وقول نعم 🐦❤",
      "يوريتشي": "مطوري و حبيبي😊",
      "باي": "غور ما بطيقه🗿",
      "هلا": "نعم عايز ايه🗿",
      "منور": "بنوري انا 🫠💔",
      "ملل": "لانك موجود🗿",
      "🤖": "انت بوت عشان ترسل الملصق ده 🐦",
      "بحبك بوت": "اسكت بدل ما انادي يوريتشي يفشخك",
      "بوت خرا": "بص يسطا لم نفسك بدل ما انسي اني محترم و امسح بيك بلاط الشات😒🗿"
    };

    let text = m.text.trim();
    if (responses[text]) {
      await conn.sendMessage(m.chat, { 
        image: thumbnail, // إرسال الصورة المصغرة كصورة
        caption: `*${responses[text]}*\n\n📌 رابط الشات:\n${chatLink}`, // النص واللينك
        quoted: m // اقتباس الرسالة الأصلية
      });
    }
  } catch (error) {
    console.error("خطأ في تحميل الصورة:", error);
  }
};

export default handler;