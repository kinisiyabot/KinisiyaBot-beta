import axios from "axios";
import FormData from "form-data";

let handler = async (m, { args, conn }) => {
  if (!args[0]) {
    return m.reply("❌ يرجى إدخال رابط فيديو TikTok.،،");
  }

  let url = args[0];
  try {
    let result = await Tiktok(url);
    if (!result || result.code !== 0 || !result.data) {
      return m.reply("❌ لم يتم العثور على الفيديو. تأكد من صحة الرابط.،،");
    }

    let { title, play, cover, author } = result.data;

    let message = `🩸 *TikTok Video*\n\n`;
    message += `📌 *العنوان:* ${title || "غير متوفر"}\n`;
    message += `👤 *المنشئ:* ${author?.nickname || "غير معروف"} (@${author?.unique_id || "unknown"})\n`;
    message += `🔗 *رابط الفيديو:* ${url}،،`;

    if (cover) {
      await conn.sendMessage(
        m.chat,
        { image: { url: cover }, caption: message },
        { quoted: m }
      );
    }

    if (play) {
      await conn.sendMessage(
        m.chat,
        { video: { url: play }, caption: "🎥 *الفيديو بدون علامة مائية*.،،" },
        { quoted: m }
      );
    }
  } catch (error) {
    console.error("TikTok API Error:", error);
    m.reply("❌ حدث خطأ أثناء جلب الفيديو.،،");
  }
};

handler.help = ["tiktok2"];
handler.tags = ["downloader"];
handler.command = ["تيك", "tiktok"];

export default handler;

const Tiktok = async (url) => {
  try {
    let form = new FormData();
    form.append("url", url);
    form.append("hd", "1");

    let { data } = await axios.post("https://www.tikwm.com/api/feed/search", form, {
      headers: {
        ...form.getHeaders(),
        "Accept": "application/json, text/javascript, */*; q=0.01",
        "X-Requested-With": "XMLHttpRequest",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        "Referer": "https://www.tikwm.com/"
      },
      timeout: 10000
    });

    if (data && data.code === 0) {
      // إرجاع الرابط الكامل في حال كان مسار نسبي
      if (data.data && data.data.play && !data.data.play.startsWith("http")) {
        data.data.play = "https://www.tikwm.com" + data.data.play;
      }
      return data;
    }

    throw new Error("فشل TikWM الأصلي");
  } catch (error) {
    // API احتياطي مباشر في حال فشل السيرفر الأول
    try {
      let res = await axios.get(`https://www.tikwm.com/api/feed/search${encodeURIComponent(url)}`);
      if (res.data && res.data.data) {
        return {
          code: 0,
          data: {
            title: res.data.data.title,
            play: res.data.data.play || res.data.data.hdplay,
            cover: res.data.data.origin_cover,
            author: {
              nickname: res.data.data.author?.nickname || "",
              unique_id: res.data.data.author?.unique_id || ""
            }
          }
        };
      }
    } catch (e) {}

    throw new Error(`Tiktok API Error: ${error.message}`);
  }
};
