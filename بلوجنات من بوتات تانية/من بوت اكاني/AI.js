import fetch from 'node-fetch';

let handler = async (message, { text, conn, usedPrefix, command }) => {
  try {
    if (!text && (!message.quoted || !message.quoted.text)) {
      return message.reply(
        `*مرحبًا أنا 𝐀𝐁𝐘𝐒𝐒-Ai \\n*مثال:* \n${usedPrefix + command} ما هي اسرار الحب؟\n\n> لا تنسى أن تذكرني في دعائك انا عبدالرحمن ❤️.`
      );
    }

    const queryText = text || message.quoted.text;
    const encodedText = encodeURIComponent(queryText);
    const apiUrl = `http://alakreb.vercel.app/api/ai/sisi?q=${encodedText}`;

    conn.sendPresenceUpdate("composing", message.chat);

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error("تعذر الاتصال بالخدمة. حاول مرة أخرى لاحقًا.");
    }

    const jsonResponse = await response.json();
    if (!jsonResponse || !jsonResponse.message) {
      throw new Error("لم أتمكن من الحصول على استجابة صالحة. حاول مرة أخرى.");
    }

    const result = jsonResponse.message;
    await message.reply(result);
  } catch (error) {
    console.error("Error:", error.message || error);
    await message.reply(`حدث خطأ ما: ${error.message || error}`);
  }
};

handler.help = ["بيبو"];
handler.tags = ["AI"];
handler.command = ["ابيس"];

export default handler;