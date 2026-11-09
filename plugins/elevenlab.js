import fs from "fs";
import path from "path";

// 🗣️ خريطة الأصوات
const voices = [
  { arName: "ليانا", desc: "صوت أنثوي واضح ومشرق" },
  { arName: "ميرال", desc: "صوت ناعم ودافئ" },
  { arName: "تاليا", desc: "صوت أنثوي مشرق وحيوي" },
  { arName: "رِنا", desc: "صوت لطيف ومهذب" },
  { arName: "سيرين", desc: "صوت ناعم ومتزن" },
  { arName: "فاي", desc: "صوت أنثوي حيوي" },
  { arName: "ياسمين", desc: "صوت راقي وأنيق" },
  { arName: "نوفا", desc: "صوت شاب ومفعم بالحيوية" },
  { arName: "آية", desc: "صوت دافئ وحنون" },
  { arName: "لينا", desc: "صوت بريطاني راقي" },
  { arName: "رودينا", desc: "صوت هادئ ومريح" },
  { arName: "جودي", desc: "صوت احترافي وواضح" },
  { arName: "سلمى", desc: "صوت ناعم ومعبر" },
  { arName: "هاجر", desc: "صوت نسائي ناعم ورقيق واضح ومريح يشعرك بلحنان" },

  { arName: "ريان", desc: "صوت ذكوري متزن" },
  { arName: "جاد", desc: "صوت ذكوري قوي" },
  { arName: "باسل", desc: "صوت عميق وقوي" },
  { arName: "سامي", desc: "صوت وثائقي احترافي" },
  { arName: "رامي", desc: "صوت ذكوري واثق" },
  { arName: "كريم", desc: "صوت دافئ" },
  { arName: "نور", desc: "صوت ودي ولطيف" },
  { arName: "آدمو", desc: "صوت أمريكي متوسط" },
  { arName: "فهد", desc: "صوت ذكوري رسمي" },
  { arName: "دان", desc: "صوت بريطاني شاب" },
  { arName: "ليو", desc: "صوت أمريكي حيوي" },
  { arName: "تيم", desc: "صوت جريء وواثق" },
  { arName: "نزار", desc: "صوت مرح ومتفائل" },
  { arName: "عمر", desc: "صوت عميق ومؤثر" },
  { arName: "كافا", desc: "صوت رجولي هادئ" },
  { arName: "باهر", desc: "صوت ساحر وجذاب" },
  { arName: "هاني", desc: "صوت أمريكي قوي" },
  { arName: "جادسون", desc: "صوت أسترالي هادئ" },
  { arName: "سيف", desc: "صوت بريطاني محترف" },
  { arName: "راكان", desc: "صوت شاب وحيوي" },
  { arName: "مهند", desc: "صوت أمريكي قوي" },
  { arName: "كريمون", desc: "صوت أمريكي جنوبي" },
  { arName: "سندس", desc: "صوت شاب وديناميكي" },
  { arName: "تيمور", desc: "صوت أمريكي شاب" },
  { arName: "كينيسيا", desc: "صوت رجولي مفعم بلحيوية مستفز في كلامه و متهكم لدرجة مستفزة " },

  { arName: "زيلان", desc: "صوت مميز من ElevenLabs" },
  { arName: "ناريس", desc: "صوت نسائي معبر" },
];

// 🎤 هاندلر الأصوات المزخرفة
let handler = async (m, { conn, command, usedPrefix }) => {
  if (command === "اصوات" || command === "elevenlab") {
    const females = voices.filter((_, i) => i < 13);
    const males = voices.filter((_, i) => i >= 13);

    const femaleList = females.map(v => 
      `*❍━━━══━━❪🫦❫━━══━━━❍*\n*🎙️ ${v.arName}*\n*┇⬥ ${v.desc}*\n*❍━━━══━━❪🫦❫━━══━━━❍*`
    ).join("\n");

    const maleList = males.map(v => 
      `*❍━━━══━━❪🫦❫━━══━━━❍*\n*🐍 ${v.arName}*\n*┇⬥ ${v.desc}*\n*❍━━━══━━❪🫦❫━━══━━━❍*`
    ).join("\n");

    const message = 
`*❍━━━══━━❪𝑲𝑰𝑵𝑰𝑺𝑰𝒀𝑨❫━━══━━━❍*
*┇🐍👋 أهلاً بـ〘@${m.sender.split("@")[0]}〙*
*┇◞🍷بِسْمِ اللّٰه الرَّحْمٰنِ الرَّحِيم🍷◜*
*❍━━━══━━❪𝑲𝑰𝑵𝑰𝑺𝑰𝒀𝑨❫━━══━━━❍*

*❍━━━══━━❪🫦❫━━══━━━❍*
*┇👩‍🎤 أصوات نسائية:*\n${femaleList}\n
*┇👨‍🎤 أصوات رجالية:*\n${maleList}
*❍━━━══━━❪🫦❫━━══━━━❍*
⏤͟͞ू⃪ 𝐊𝐈𝐍𝐈𝐒𝐈𝐘𝐀 𝐁𝐎𝐓⃝ `;

    return await m.reply(message);
  }
};

handler.command = ["قسم_ai_audio"];
handler.tags = ["voice-ai"];
handler.help = ["اصوات - عرض جميع الأصوات"];

export default handler;