// • Feature : image2figure 
// • Developers : izana x radio
// • Channel : https://whatsapp.com/channel/0029VbB2Uwg11ulIMA9bfq2c
import axios from "axios";
import FormData from "form-data";

let handler = async (m, { text, usedPrefix, command, conn }) => {
  let imageUrl = null;

  // 🖼️ التحقق من وجود صورة مردود عليها
  const quotedMsg = m.quoted || m;
  const mime = quotedMsg?.mimetype || quotedMsg?.msg?.mimetype || "";

  if (mime && mime.startsWith("image/")) {
    // تحميل الصورة كـ buffer
    try {
      const media = await quotedMsg.download();
      
      // رفع الصورة إلى catbox
      imageUrl = await uploadToCatbox(media);
      
      if (!imageUrl) {
        return m.reply("❌ فشل رفع الصورة. حاول مرة أخرى.");
      }
    } catch (err) {
      console.error("Image download error:", err);
      return m.reply("❌ فشل في تحميل الصورة المردود عليها.");
    }
  } else if (text && text.match(/^https?:\/\/.+/i)) {
    // إذا تم إدخال رابط صورة مباشرة
    imageUrl = text.trim();
  } else {
    return m.reply(
      `❀⃘⃛͜𓉘᳟ี ⃞̸͢𑁃 ͟͟͞͞➳❥الاستخدام:\n\n*الطريقة 1:* رد على صورة\n${usedPrefix}${command}\n\n*الطريقة 2:* أرسل رابط الصورة\n${usedPrefix}${command} <رابط الصورة>\n\n📘 مثال:\n${usedPrefix}${command} https://i.postimg.cc/21zWjz2D/image.jpg`
    );
  }

  // إرسال رسالة انتظار
  await m.reply("⏳ جاري تحويل الصورة إلى مجسم ثلاثي الأبعاد... الرجاء الانتظار...");

  try {
    // 🚀 استدعاء API
    const apiUrl = `${global.API_BASE}/api/v1/ai/image2figure`;
    
    const res = await axios.get(apiUrl, {
      params: {
        image: imageUrl
      },
      headers: {
        "User-Agent": "Mozilla/5.0"
      },
      timeout: 90000 // 90 ثانية
    });

    // 🧩 التحقق من النتيجة
    if (!res.data || !res.data.status) {
      throw new Error(res.data?.message || "❌ فشل في إنشاء المجسم.");
    }

    const resultImageUrl = res.data.image;

    if (!resultImageUrl) {
      throw new Error("❌ لم يتم استلام رابط المجسم المولد.");
    }

    // 🎀 إرسال النتيجة
    const caption = 
`❀⃘⃛͜ ۪۪۪݃𓉘᳟ี ⃞̸͢𑁃 𓉝᳟ี ͟͟͞͞┄꯭๋━┄꫶︦╮
        ˚₊· ͟͟͞͞➳❥📦 Image to Figure
❀⃘⃛͜ 𓉘᳟ี ⃞̸͢𑁃 𓉝᳟ี ͟͟͞͞┄꯭๋━┄꫶︦┤
┊
├ׁ̟̇˚₊· ➳❥الحالة: ${res.data.message || '✅ تم إنشاء المجسم بنجاح'}
┊
├ׁ̟̇˚₊· ➳❥المصدر: ${res.data.source || 'PhotoEditorAI'}
┊
❀⃘⃛͜ 𓉘᳟ี ⃞̸͢𑁃 𓉝᳟ี ͟͟͞͞┄꯭๋━┄꫶︦╯`;

    // إرسال الصورة
    await conn.sendFile(m.chat, resultImageUrl, "image2figure.jpg", caption, m);

  } catch (err) {
    console.error("IMAGE2FIGURE ERROR:", err);
    
    let errorMsg = "❌ فشل في إنشاء المجسم.";
    
    if (err.response) {
      errorMsg += `\n\n⚠️ رمز الخطأ: ${err.response.status}`;
      if (err.response.data?.message) {
        errorMsg += `\n⚠️ ${err.response.data.message}`;
      }
    } else if (err.request) {
      errorMsg += "\n\n⚠️ لم يتم استلام رد من الخادم.";
    } else if (err.code === 'ECONNABORTED') {
      errorMsg += "\n\n⚠️ انتهت مهلة الاتصال. حاول مرة أخرى.";
    } else {
      errorMsg += `\n\n⚠️ ${err.message}`;
    }
    
    m.reply(errorMsg);
  }
};

// 📤 دالة رفع الصورة إلى Catbox
async function uploadToCatbox(buffer) {
  try {
    const form = new FormData();
    form.append("reqtype", "fileupload");
    form.append("fileToUpload", buffer, {
      filename: "image.jpg",
      contentType: "image/jpeg"
    });

    const response = await axios.post("https://catbox.moe/user/api.php", form, {
      headers: {
        ...form.getHeaders()
      },
      timeout: 30000
    });

    if (response.data && typeof response.data === "string" && response.data.startsWith("http")) {
      return response.data.trim();
    }
    
    return null;
  } catch (error) {
    console.error("Catbox upload error:", error);
    return null;
  }
}

handler.help = ["مجسم", "figure", "image2figure"];
handler.tags = ["ai", "image"];
handler.command = /^(مجسم|figure|image2figure|3d)$/i;

export default handler;