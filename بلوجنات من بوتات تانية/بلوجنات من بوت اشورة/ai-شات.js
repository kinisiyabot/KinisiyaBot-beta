import cheerio from 'cheerio';
import fetch from "node-fetch";

let handler = async (m, { conn, args, usedPrefix, text, command }) => {
  if (!text)
    return m.reply(
      "- 「🚀」 *أدخل نصًا بعد الامر لاستخدام الرد بالذكاء الاصطناعي* *مثال* :\n ⟣ *.شات* افضل انمي حتی الان ⟣ \n*.بوت* اكتب رمز JS",
    );
  await m.reply(wait);
  try {
    // مثال على الاستخدام
    let result = await CleanDx(text);
    let translatedResult = await translateToArabic(result);
    await m.reply(translatedResult);
  } catch (e) {
    await m.reply("وقعت مشكلة :(");
  }
};
handler.help = ["dx"];
handler.tags = ["ai"];
handler.command = /^(شات)$/i;
export default handler;

/* سطر جديد */
async function CleanDx(your_qus) {
  let linkaiList = [];
  let linkaiId = generateRandomString(21);
  let Baseurl = "https://vipcleandx.xyz/";

  console.log(formatTime());
  linkaiList.push({
    content: your_qus,
    role: "user",
    nickname: "",
    time: formatTime(),
    isMe: true,
  });
  linkaiList.push({
    content: "جاري التفكير...",
    role: "assistant",
    nickname: "AI",
    time: formatTime(),
    isMe: false,
  });
  if (linkaiList.length > 10) {
    linkaiList = linkaiList.shift();
  }

  let response = await fetch(Baseurl + "v1/chat/gpt/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Forwarded-For": generateRandomIP(),
      Referer: Baseurl,
      accept: "application/json, text/plain, */*",
    },
    body: JSON.stringify({
      list: linkaiList,
      id: linkaiId,
      title: your_qus,
      prompt: "",
      temperature: 0.5,
      models: "0",
      continuous: true,
    }),
  });
  const data = await response.text();

  return data;
}

async function translateToArabic(text) {
  const response = await fetch(
    "https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ar&dt=t&q=" +
      encodeURIComponent(text),
  );
  const result = await response.json();
  return result[0][0][0];
}

function generateRandomString(length) {
  const characters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let randomString = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }
  return randomString;
}

function generateRandomIP() {
  const ipParts = [];
  for (let i = 0; i < 4; i++) {
    const randomPart = Math.floor(Math.random() * 256);
    ipParts.push(randomPart);
  }
  return ipParts.join(".");
}

function formatTime() {
  const currentDate = new Date();
  const hours = currentDate.getHours().toString().padStart(2, "0");
  const minutes = currentDate.getMinutes().toString().padStart(2, "0");
  const seconds = currentDate.getSeconds().toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}
