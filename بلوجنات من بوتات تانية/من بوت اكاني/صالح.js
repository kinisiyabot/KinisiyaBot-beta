import fetch from 'node-fetch';

let handler = async (message, { text, conn, usedPrefix, command }) => {
  try {
    if (!text && (!message.quoted || !message.quoted.text)) {
      return message.reply(
        `*مرحبًا أنا Saleh-Ai خدمة اسلاميه.*\n\n- أنا خدمة مخصصة للرد على الأسئلة الدينية ومساعدتك في معرفة كل شيء عن الإسلام.\n\n*مثال:* \n${usedPrefix + command} ما هي أركان الإسلام؟\n\n> لا تنسى أن تذكرني في دعائك ❤️.`
      );
    }

    const queryText = text || message.quoted.text;
    const encodedText = encodeURIComponent(queryText);
    const apiUrl = `http://alakreb.vercel.app/api/islamic/saleh?q=${encodedText}`;

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

handler.help = ["صالح"];
handler.tags = ["AI"];
handler.command = ["صالح"];

export default handler;