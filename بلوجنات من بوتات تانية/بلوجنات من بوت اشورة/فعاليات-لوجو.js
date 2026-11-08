import fetch from "node-fetch";
let timeout = 60000,
  poin = 100000;
const handler = async (m, {
  conn,
  command,
  usedPrefix
}) => {
  conn.tebaklogo = conn.tebaklogo ? conn.tebaklogo : {};
  let id = m.chat;
  if (id in conn.tebaklogo) return await conn.reply(m.chat, "اجب ع هذا السؤال اولا", conn.tebaklogo[id][0]), !1;
  let res = await fetch("https://raw.githubusercontent.com/zyad5yasser/bot-test/master/src/game/لوجو.json"),
    src = await res.json(),
    json = {
      hasil: src[Math.floor(Math.random() * src.length)]
    },
    caption = `*${command.toUpperCase()}*\nما هو اسم هذا الشعار\n\nالوقت *${(timeout / 100).toFixed(2)} ثانيه*\n\nالجائزه: ${poin} XP\n    `.trim();
  conn.tebaklogo[id] = [await conn.sendFile(m.chat, json.hasil.data.image, "", caption, m), json, poin, setTimeout(async () => {
    conn.tebaklogo[id] && await conn.reply(m.chat, `انتهي الوقت\nالاجابه هيا: *${json.hasil.data.jawaban}*`, conn.tebaklogo[id][0]),
      delete conn.tebaklogo[id];
  }, timeout)];
};
handler.help = ["tebaklogo"], handler.tags = ["game"], handler.command = /^tebaklogo|لوجوهات/i;
export default handler;
const buttons = [
  ["Hint", "/hlog"],
  ["Nyerah", "menyerah"]
];
