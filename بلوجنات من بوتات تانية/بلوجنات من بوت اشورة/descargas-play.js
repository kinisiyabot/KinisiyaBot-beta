/* Creditos a SoyMaycol | MaycolAIUltraMD
Github: SoySapo6 | MIT License - No quitar creditos */

import yts from "yt-search";

const limit = 100;

const handler = async (m, { conn, text, command }) => {
  if (!text) return m.reply(`╭─❍「 ✦ 𝑪𝑹𝑶𝑪𝑶 <3 ✦ 」
│
├─ التعويذة تحتاج إلى سحر
│
> أدخل اسم أو عنوان URL لفيديو YouTube.
├─ تحقق من التعويذات المتاحة مع:
│   ⇝ .اوامر
╰─✦`);

  await m.react("🕛");

  try {
    const res = await yts(text);
    if (!res || !res.videos || res.videos.length === 0) {
      return m.reply("❌ لم يتم العثور على نتائج لبحثك..");
    }

    const video = res.videos[0];
    const title = video.title || "Sin título";
    const authorName = video.author?.name || "Desconocido";
    const durationTimestamp = video.timestamp || "Desconocida";
    const views = video.views || "Desconocidas";
    const url = video.url || "";
    const thumbnail = video.thumbnail || "";

    const isDirectDownload = ["شغل", "شغل7", "شغل3", "شغل2", "شغل5", "شغل6", "شغل4"].includes(command);

    if (isDirectDownload) {
      await m.reply(`╭─❍「 ✦ 𝑪𝑹𝑶𝑪𝑶 <3 ✦ 」
│
├─ 「❀」${title}
│
├─ ✧ قناة: ${authorName}
├─ ✧ مدة: ${durationTimestamp}
├─ ✧ مشاهدات: ${views}
│
├─ ⏳ جاري معالجة التنزيل...
╰─✦`);

      if (["شغل", "شغل7", "شغل3"].includes(command)) {
        await downloadAudio(conn, m, url, title);
      } else if (["شغل2", "شغل5", "شغل6", "شغل4"].includes(command)) {
        await downloadVideo(conn, m, url, title);
      }
    } else {
      const buttons = [
        { buttonId: `.ytmp3 ${url}`, buttonText: { displayText: "♪ Descargar Audio ♪" }, type: 1 },
        { buttonId: `.ytmp4 ${url}`, buttonText: { displayText: "♣ Descargar Video ♣" }, type: 1 },
      ];

      const processingMessage = `╭─❍「 ✦ 𝑪𝑹𝑶𝑪𝑶 <3 ✦ 」
│
├─ 「❀」${title}
│
├─ ✧ قناة: ${authorName}
├─ ✧ مدة: ${durationTimestamp}
├─ ✧ المشاهدات: ${views}
│
├─ حد تتسيق التنزيل:
╰─✦`;

      try {
        if (thumbnail) {
          await conn.sendMessage(m.chat, {
            image: { url: thumbnail },
            caption: processingMessage,
            buttons,
            headerType: 4,
          }, { quoted: m });
        } else {
          await conn.sendMessage(m.chat, {
            text: processingMessage,
            buttons,
            headerType: 1,
          }, { quoted: m });
        }
      } catch {
        await m.reply(processingMessage + "\n\n*Responde:*\n• `1` para audio\n• `2` para video");
      }
    }
  } catch (error) {
    console.error("❌ Error general:", error);
    await m.reply(`╭─❍「 ✦ 𝑪𝑹𝑶𝑪𝑶 <3 ✦ 」
│
├─ فشلت التعويذة
├─ خطاء: ${error.message}
╰─✦`);
    await m.react("❌");
  }
};

const downloadAudio = async (conn, m, url, title) => {
  try {
    const cleanTitle = cleanName(title) + ".mp3";
    await conn.sendMessage(m.chat, {
      audio: { url: `http://173.208.200.227:3084/api/ytaudio?url=${encodeURIComponent(url)}` },
      mimetype: "audio/mpeg",
      fileName: cleanTitle,
    }, { quoted: m });
    await m.react("✅");
  } catch (error) {
    console.error("❌ Error descargando audio:", error);
    await m.reply(`❌ Error descargando audio: ${error.message}`);
    await m.react("❌");
  }
};

const downloadVideo = async (conn, m, url, title) => {
  try {
    const cleanTitle = cleanName(title) + ".mp4";
    await conn.sendMessage(m.chat, {
      video: { url: `http://173.208.200.227:3084/api/ytvideo?url=${encodeURIComponent(url)}` },
      mimetype: "video/mp4",
      fileName: cleanTitle,
    }, { quoted: m });
    await m.react("✅");
  } catch (error) {
    console.error("❌ Error descargando video:", error);
    await m.reply(`❌ Error descargando video: ${error.message}`);
    await m.react("❌");
  }
};

function cleanName(name) {
  return name.replace(/[^\w\s\-_.]/gi, "").substring(0, 50);
}

handler.command = handler.help = ["شغل", "شغل7", "شغل3", "شغل5", "شغل5", "شغل6", "شغل4", "yt"];
handler.tags = ["descargas"];

export default handler;
