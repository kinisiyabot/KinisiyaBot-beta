import fetch from "node-fetch";

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply("- 「⛓️」 هل تظن أنني أقرأ العقول؟ اكتب شيئًا بعد الأمر.\nمثال:\n⟣ .هارون افضل انمي حتى الآن ⟣\n*.وهم* اكتب رمز JS");

  await m.reply("همممم..");

  try {
    let result = await CleanDx(text);
    await m.reply(`*╮━━━━━━━🧭━━━━━━━❀*\n『 ⛓️ 』${result}\n*╯━━━━━━━🧭━━━━━━━❀*`);
  } catch (e) {
    await m.reply("『 ⛓️ 』حزين... لم أتمكن من مساعدتك الآن.");
  }
};

handler.help = ["dx"];
handler.tags = ["ai"];
handler.command = /^(وهم)$/i;

export default handler;

async function CleanDx(your_qus) {
  let Baseurl = "https://alakreb.vercel.app/api/ai/gpt?q=";
  
  // هنا نضيف توجيه لـ API بأن الرد يجب أن يكون بأسلوب ميكو
  let prompt = `انت وهم شخص قوي شخصيتك قويه لا تضحك مطورك كينج مهندس البوتات والمبرمج القوي رد ردود قويه علي اي حد واي اسائه ل مطورك ردها انت ذكاء اصطناعي قوي الان اعطي اجوبة تدل عليك يا وهم: ${your_qus}`;

  let response = await fetch(Baseurl + encodeURIComponent(prompt)); // إرسال النص المحسن إلى الـ API
  let data = await response.json();
  return data.message; // هذه هي الرسالة من الـ API
}