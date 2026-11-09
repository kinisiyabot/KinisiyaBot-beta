// • Developers : Song
// • Channel : https://whatsapp.com/channel/0029Vb80wch30LKFioKenc2V
// for esm: https://t.me/yertchi_kunusua

import fetch from "node-fetch";
import { generateWAMessageFromContent, prepareWAMessageMedia } from "@whiskeysockets/baileys";

const API_BASE = "https://apex-api-five.vercel.app/api/v1";
const IMAGE_URL = "https://i.postimg.cc/w1hX9VmR/upload-1765388016764.jpg";
const MAX_FILE_SIZE = 250 * 1024 * 1024; // 250 MB

// ================= دالة البحث =================
export async function searchTraidMode(query) {
  try {
    const searchUrl = `${API_BASE}/search/mod?q=${encodeURIComponent(query)}`;
    const response = await fetch(searchUrl, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Linux; Android 14)",
        "Accept": "application/json",
      },
      timeout: 15000,
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

    const data = await response.json();

    if (!data.status || !data.results || data.results.length === 0) return [];

    return data.results;
  } catch (error) {
    throw new Error(`فشل البحث: ${error.message}`);
  }
}

// ================= دالة استخراج رابط التحميل المباشر =================
export async function getDirectDownloadLink(pageUrl) {
  try {
    const linkUrl = `${API_BASE}/download/mods/link?url=${encodeURIComponent(pageUrl)}`;
    const response = await fetch(linkUrl, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Linux; Android 14)",
        "Accept": "application/json",
      },
      timeout: 15000,
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

    const data = await response.json();

    if (!data.status || !data.data || !data.data.url) {
      throw new Error("لم يتم العثور على رابط التحميل");
    }

    return data.data;
  } catch (error) {
    throw new Error(`فشل استخراج الرابط: ${error.message}`);
  }
}

// ================= دالة التحميل والإرسال =================
export async function downloadAndSend(conn, m, fileInfo) {
  try {
    await m.reply(`⏬ جاري التحميل من الخادم...`);

    const fileUrl = `${API_BASE}/download/mods/file?url=${encodeURIComponent(fileInfo.url)}`;
    const response = await fetch(fileUrl, {
      method: "GET",
      headers: { "User-Agent": "Mozilla/5.0 (Linux; Android 14)" },
      timeout: 300000,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const contentLength = response.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > MAX_FILE_SIZE) {
      const sizeMB = (parseInt(contentLength) / (1024 * 1024)).toFixed(2);
      return await m.reply(
        `⚠️ الملف كبير جداً للإرسال (حد البوت: 250 MB)\n📦 الحجم: ${sizeMB} MB\n🔗 ${fileInfo.url}`
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const actualSize = buffer.length;

    if (actualSize > MAX_FILE_SIZE) {
      const mb = (actualSize / (1024 * 1024)).toFixed(2);
      return await m.reply(
        `⚠️ الملف بعد التحميل حجمه ${mb} MB — أكبر من الحد المسموح (250 MB).\n🔗 ${fileInfo.url}`
      );
    }

    let filename = fileInfo.filename || "file.apk";
    const contentDisposition = response.headers.get("content-disposition");

    if (contentDisposition && contentDisposition.includes("filename=")) {
      const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (match && match[1]) filename = match[1].replace(/['"]/g, "");
    }

    filename = filename.replace(/[🥇⚡🔥✅]/g, "").trim();
    if (!filename.endsWith(".apk")) filename = filename.split(".apk")[0] + ".apk";

    await conn.sendMessage(
      m.chat,
      {
        document: buffer,
        fileName: filename,
        mimetype: "application/vnd.android.package-archive",
        caption: `✅ تم التحميل بنجاح!\n📦 اسم الملف: ${filename}\n📊 الحجم: ${(actualSize / (1024 * 1024)).toFixed(2)} MB\n🔗 المصدر: TraidMode`,
      },
      { quoted: m }
    );
  } catch (error) {
    throw new Error(`فشل تحميل الملف: ${error.message}`);
  }
}

// ================= الـ Handler الرئيسي =================
export const handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (command === "مود") {
      if (!text) return m.reply(`⚠️ الرجاء كتابة اسم التطبيق بعد الأمر\nمثال: ${usedPrefix}مود subway surfers`);

      await m.reply(`🔍 جاري البحث عن: *${text}* ...`);
      const results = await searchTraidMode(text);

      if (!results || results.length === 0) return m.reply("❌ لم يتم العثور على نتائج.");

      global.traidResults = results;

      const rows = results.map((r, idx) => ({
        header: `نتيجة رقم: [${idx + 1}]`,
        title: r.title,
        description: r.description ? r.description.substring(0, 80) + "..." : "اضغط للتحميل",
        id: `${usedPrefix}اختيار-مود ${idx + 1}`,
      }));

      const caption = `🔍 نتائج البحث عن: ${text}\n📊 عدد النتائج: ${results.length}\n\n⬇️ اختر نتيجة لبدء التحميل:`;

      const mediaMessage = await prepareWAMessageMedia({ image: { url: IMAGE_URL } }, { upload: conn.waUploadToServer });

      const msg = generateWAMessageFromContent(
        m.chat,
        {
          viewOnceMessage: {
            message: {
              interactiveMessage: {
                body: { text: caption },
                footer: { text: "TraidMode Bot - Powered by Dark API" },
                header: { hasMediaAttachment: true, imageMessage: mediaMessage.imageMessage },
                nativeFlowMessage: {
                  buttons: [
                    {
                      name: "single_select",
                      buttonParamsJson: JSON.stringify({
                        title: "「 نتائج TraidMode 」",
                        sections: [{ title: "نتائج البحث", highlight_label: "TraidMode Bot", rows }],
                      }),
                    },
                  ],
                },
              },
            },
          },
        },
        { userJid: conn.user.jid, quoted: m }
      );

      await conn.relayMessage(m.chat, msg.message, { messageId: msg.key?.id || msg.messageId });
      return;
    }

    if (command === "اختيار-مود") {
      if (!text) return m.reply("⚠️ الرجاء إدخال رقم النتيجة. مثال: اختيار-مود 1");

      const choice = parseInt(text);
      if (isNaN(choice)) return m.reply("❌ الرجاء إدخال رقم صحيح.");
      if (!global.traidResults || choice < 1 || choice > global.traidResults.length) return m.reply("❌ لم يتم العثور على النتيجة المحددة. قم بالبحث مرة أخرى.");

      const selected = global.traidResults[choice - 1];
      await m.reply(`🔎 تم اختيار: *${selected.title}*\n🔄 جاري استخراج رابط التحميل...`);

      const directLink = await getDirectDownloadLink(selected.url);
      if (!directLink || !directLink.url) return m.reply("❌ تعذّر استخراج رابط التحميل المباشر.");

      await m.reply(`✅ تم استخراج الرابط:\n📦 ${directLink.filename || "ملف"}\n🔗 ${directLink.url}\n\n⏳ جاري التحميل والإرسال...`);

      await downloadAndSend(conn, m, directLink);
      return;
    }

    if (["تحميل-مود", "تنزيل-مود", "dl-mod"].includes(command)) {
      if (!text) return m.reply(`⚠️ الرجاء إدخال رابط التحميل المباشر\nمثال: ${usedPrefix}${command} https://app.happymodii.com/file.apk`);

      let fileUrl = text.trim();
      if (!fileUrl.startsWith("http://") && !fileUrl.startsWith("https://")) return m.reply("❌ الرجاء إدخال رابط صحيح يبدأ بـ http:// أو https://");

      await downloadAndSend(conn, m, { url: fileUrl, filename: null });
      return;
    }
  } catch (e) {
    console.error("خطأ في TraidMode handler:", e);
    return m.reply(`❌ حدث خطأ:\n• ${e.message || "خطأ غير معروف"}`);
  }
};

handler.help = [
  "مود <اسم التطبيق> - بحث في TraidMode",
  "اختيار-مود <رقم> - اختيار من نتائج البحث",
  "تحميل-مود <رابط> - تحميل من رابط مباشر",
];
handler.tags = ["downloader", "tools"];
handler.command = ["مود", "اختيار-مود", "تحميل-مود", "تنزيل-مود", "dl-mod"];
handler.register = false;