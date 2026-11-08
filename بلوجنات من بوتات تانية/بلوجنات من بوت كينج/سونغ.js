import fetch from "node-fetch";

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply("- 「⛓️」 هل تظن أنني أقرأ العقول؟ اكتب شيئًا بعد الأمر.\nمثال:\n⟣ .سونغ من ملك الظلال ⟣\n*.سونغ* اكتب طلبك بأسلوب سولو ليفلينج ");

  await m.reply("𝑻𝑯𝑬 𝑲𝑰𝑵𝑮 𝑶𝑭 𝑺𝑯𝑨𝑫𝑶𝑾𝑺 𝑾𝑰𝑳𝑳 𝑺𝑷𝑬𝑨𝑲...");

  try {
    let result = await CleanDx(text);
    await m.reply(`*╮━━━══━━❪⛓️❫━━══━━━❍*\n『 سونغ ⛓️ 』${result}\n*╯━━━══━━❪⛓️❫━━══━━━❍*`);
  } catch (e) {
    await m.reply("『⛓️』حتى سونغ ما فهمك... جرّب مرة أخرى.");
  }
};

handler.help = ["dx"];
handler.tags = ["ai"];
handler.command = /^(سونغ)$/i;

export default handler;

async function CleanDx(your_qus) {
  let Baseurl = "https://alakreb.vercel.app/api/ai/gpt?q=";
  
  // لوفي بأسلوبه المرح والحماسي
  let prompt = `أنت سونغ جين وو من انمي سولو ليفلينج انت ملك الظلال وهزمت كل من وقف في طريقك مهمتك جاوب علي الاسله بشخصيتك البارده ومطورك كينج: ${your_qus}`;

  let response = await fetch(Baseurl + encodeURIComponent(prompt));
  let data = await response.json();
  return data.message;
}