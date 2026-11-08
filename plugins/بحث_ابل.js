import fetch from "node-fetch";

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`🌀 أدخل اسم أغنية أو ألبوم.\n\n🌱 مثال:\n> ${usedPrefix + command} Feel Special Twice`);
  }

  try {
    let res, json;

    try {
      // البحث في API 1
      res = await fetch(`https://api.delirius.store/search/applemusic?text=${encodeURIComponent(text)}`);
      json = await res.json();

      if (!Array.isArray(json) || json.length === 0) throw new Error("لا توجد نتائج في API 1");
    } catch (e) {
      // البحث في API 2 كبديل
      res = await fetch(`https://api.delirius.store/search/applemusicv2?query=${encodeURIComponent(text)}`);
      let alt = await res.json();

      if (!alt?.data || alt.data.length === 0) throw new Error("لا توجد نتائج في API 2");

      json = alt.data.map(v => ({
        title: v.title,
        type: "أغنية",
        artists: v.artist,
        url: v.url,
        image: v.image
      }));
    }

    let result = json.slice(0, 5); // تحديد أفضل 5 نتائج

    let textMsg = `🍏 *نتائج البحث في Apple Music* 🍄\n\n`;
    result.forEach((item, i) => {
      textMsg += `*${i + 1}.*\n> 👾 *العنوان:* ${item.title}
> 👤 *المغني / الفنان:* ${item.artists}
> 🌱 *النوع:* ${item.type || "غير معروف"}
> 🌐 *الرابط:* ${item.url}\n\n`;
    });

    await conn.sendMessage(m.chat, {
      image: { url: result[0].image },
      caption: textMsg
    }, { quoted: m });

  } catch (err) {
    console.error(err);
    m.reply("❌ حدث خطأ أثناء البحث في Apple Music.");
  }
};

handler.help = ["بحث_اغاني <اسم الأغنية>"];
handler.tags = ["البحث"];
handler.command = ['بحث_ابل'];
handler.register = true;
handler.group = true;

export default handler;