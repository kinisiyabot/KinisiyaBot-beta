import axios from "axios";

let handler = async (m, { conn }) => {
  try {
    let name = m.pushName || "المستخدم";

    let prompt = `
حلل ذوقي الموسيقي بناءً على شخصيتي كشخص اسمه ${name}.
اكتب وصف قصير لذوقي الموسيقي.
ثم اقترح 6 أغاني مناسبة (عربي وأجنبي).
اكتب الرد بالعربية وبأسلوب لطيف.
`;

    let url = `${global.API_BASE}/api/v1/ai/gemini?prompt=${encodeURIComponent(prompt)}`;

    let { data } = await axios.get(url);

    let result =
`🎧 *تحليل ذوقك الموسيقي* 🩸
━━━━━━━━━━━━━━━
${data.result || data.response || data.answer}
━━━━━━━━━━━━━━━
🎼 *MIKU AI*`;

    await conn.sendMessage(m.chat, { text: result }, { quoted: m });

  } catch (e) {
    console.error(e);
    m.reply("❌ حصل خطأ وأنا بحلل ذوقك، جرّب تاني.");
  }
};

handler.command = ['زوقي','ذوقي'];
handler.help = ['زوقي'];
handler.tags = ['ai','music'];

export default handler;