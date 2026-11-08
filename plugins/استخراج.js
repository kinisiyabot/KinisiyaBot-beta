import axios from "axios";
import fs from "fs";
import path from "path";
import { fileTypeFromBuffer } from "file-type";

// تأكد من وجود فولدر tmp
if (!fs.existsSync("./tmp")) fs.mkdirSync("./tmp");

let handler = async (m, { conn, text }) => {
  if (!text) return conn.sendMessage(m.chat, { text: "❌ اكتب رابط الملف بعد الأمر" }, { quoted: m });

  let url = text.trim();
  if (!url.startsWith("http")) return conn.sendMessage(m.chat, { text: "❌ الرابط غير صالح" }, { quoted: m });

  try {
    await conn.sendMessage(m.chat, { text: "⏳ جاري التحميل..." }, { quoted: m });

    // تحميل الملف
    let res = await axios.get(url, { responseType: "arraybuffer" });
    let buffer = Buffer.from(res.data);

    // تحديد نوع الملف
    let type = await fileTypeFromBuffer(buffer);
    if (!type) return conn.sendMessage(m.chat, { text: "❌ لم أستطع تحديد نوع الملف" }, { quoted: m });

    let ext = type.ext;
    let mime = type.mime;
    let filePath = path.join("./tmp", `extract_${Date.now()}.${ext}`);
    fs.writeFileSync(filePath, buffer);

    // إرسال الملف حسب نوعه
    if (mime.startsWith("audio")) {
      await conn.sendMessage(m.chat, { audio: fs.readFileSync(filePath), mimetype: mime, ptt: false }, { quoted: m });
    } else if (mime.startsWith("video")) {
      await conn.sendMessage(m.chat, { video: fs.readFileSync(filePath), mimetype: mime }, { quoted: m });
    } else {
      await conn.sendMessage(m.chat, { document: fs.readFileSync(filePath), mimetype: mime, fileName: `file.${ext}` }, { quoted: m });
    }

    fs.unlinkSync(filePath);

  } catch (e) {
    console.error(e);
    await conn.sendMessage(m.chat, { text: "❌ حدث خطأ أثناء استخراج الملف" }, { quoted: m });
  }
};

handler.command = ["استخراج"];
export default handler;