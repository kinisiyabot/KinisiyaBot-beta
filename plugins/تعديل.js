import fetch from "node-fetch";
import axios from "axios";
import crypto from "crypto";
import { readFileSync } from "fs";
import fs from "fs";
import path from "path";
import { basename } from "path";

// ============= ImgEditor Source =============
class ImgEditor {
  static base = "https://imgeditor.co/api";

  static async getUploadUrl(buffer) {
    try {
      const res = await fetch(`${this.base}/get-upload-url`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          fileName: "photo.jpg",
          contentType: "image/jpeg",
          fileSize: buffer.length
        })
      });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const data = await res.json();
      
      if (!data.uploadUrl || !data.publicUrl) {
        throw new Error("استجابة غير صحيحة من السيرفر");
      }
      
      return data;
    } catch (error) {
      throw new Error(`فشل الحصول على رابط الرفع: ${error.message}`);
    }
  }

  static async upload(uploadUrl, buffer) {
    try {
      const res = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "content-type": "image/jpeg" },
        body: buffer
      });
      
      if (!res.ok) throw new Error(`فشل الرفع: HTTP ${res.status}`);
    } catch (error) {
      throw new Error(`فشل رفع الصورة: ${error.message}`);
    }
  }

  static async generate(prompt, imageUrl) {
    try {
      const res = await fetch(`${this.base}/generate-image`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          prompt,
          styleId: "realistic",
          mode: "image",
          imageUrl,
          imageUrls: [imageUrl],
          numImages: 1,
          outputFormat: "png",
          model: "nano-banana"
        })
      });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      
      if (!data.taskId) throw new Error("لم يتم الحصول على معرف المهمة");
      
      return data;
    } catch (error) {
      throw new Error(`فشل بدء التوليد: ${error.message}`);
    }
  }

  static async check(taskId) {
    let attempts = 0;
    const maxAttempts = 60;
    
    while (attempts < maxAttempts) {
      try {
        await new Promise(r => setTimeout(r, 3000));
        const res = await fetch(`${this.base}/generate-image/status?taskId=${taskId}`);
        
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const json = await res.json();
        
        if (json.status === "completed" && json.imageUrl) {
          return json.imageUrl;
        }
        
        if (json.status === "failed") {
          throw new Error(`فشلت المهمة: ${json.error || 'سبب غير معروف'}`);
        }
        
        attempts++;
      } catch (error) {
        if (error.message.includes("فشلت المهمة")) throw error;
        attempts++;
        if (attempts >= maxAttempts) throw error;
      }
    }
    
    throw new Error("انتهت المهلة (تجاوز 3 دقائق)");
  }
}

// ============= DreamFace Source =============
const DREAM_BASE = "https://tools.dreamfaceapp.com/dw-server";
const DREAM_MODELS = [
  {
    id: 1,
    name: "Seedream 4.5",
    nameAr: "سيدريم 4.5",
    desc: "إتقان أي نمط مع فهم استثنائي للأوامر والواقعية الفوتوغرافية",
    param: {
      model: "see-dream-45",
      template_id: "WEB-SEE_DREAM_45",
      releation_id: "ri05016",
      play_types: ["SEE_DREAM_45", "TEXT_TO_IMAGE"],
      output: { count: 2, width: 2560, height: 1920, resolution: "2K", ratio: "4:3" }
    }
  },
  {
    id: 2,
    name: "Nano Banana Pro",
    nameAr: "نانو بانانا برو",
    desc: "نموذج جوجل الرائد لإنشاء صور عالية الجودة",
    param: {
      model: "gemini3",
      template_id: "WEB-NANO_PRO",
      releation_id: "ri05015",
      play_types: ["NANO_PRO", "TEXT_TO_IMAGE"],
      output: { count: 1, width: 1280, height: 960, resolution: "1K", ratio: "4:3" }
    }
  },
  {
    id: 3,
    name: "Illustrious-SDXL",
    nameAr: "إليستريوس أنمي",
    desc: "نموذج متخصص في الأنمي، محسّن للرسوم والرسوم المتحركة",
    param: {
      model: "anime",
      template_id: "WEB-ANIME",
      releation_id: "ri05006",
      play_types: ["AIGC", "ANIME", "TEXT_TO_IMAGE"],
      output: { count: 1, width: 1280, height: 960, resolution: "1K", ratio: "4:3" }
    }
  },
  {
    id: 4,
    name: "Seedream 4.0",
    nameAr: "سيدريم 4.0",
    desc: "إخراج عالي الدقة من صور متعددة بقيمة استثنائية",
    param: {
      model: "see-dream",
      template_id: "WEB-SEE_DREAM",
      releation_id: "ri05004",
      play_types: ["SEE_DREAM", "TEXT_TO_IMAGE"],
      output: { count: 2, width: 1280, height: 960, resolution: "1K", ratio: "4:3" }
    }
  },
  {
    id: 5,
    name: "Nano Banana",
    nameAr: "نانو بانانا",
    desc: "أقوى نموذج صور AI من جوجل مع أقوى اتساق",
    param: {
      model: "gemini",
      template_id: "WEB-NANO_BANANA",
      releation_id: "ri05010",
      play_types: ["NANO", "TEXT_TO_IMAGE"],
      output: { count: 1, width: 1024, height: 1024, resolution: "1K", ratio: "1:1" }
    }
  },
  {
    id: 6,
    name: "Flux Kontext Pro",
    nameAr: "فلكس كونتكست برو",
    desc: "اتساق أقوى للصور في تحرير الصور",
    param: {
      model: "flux-kontext-pro",
      template_id: "WEB-BFL",
      releation_id: "ri05013",
      play_types: ["BFL", "TEXT_TO_IMAGE"],
      output: { count: 2, width: 1024, height: 1024, resolution: "1K", ratio: "1:1" }
    }
  }
];

const dreamHeaders = {
  'Content-Type': 'application/json',
  'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36',
  'Accept': 'application/json',
  'origin': 'https://tools.dreamfaceapp.com',
  'referer': 'https://tools.dreamfaceapp.com/tools/ai-image',
  'Cookie': 'i18n_redirected=en'
};

const rnd = n => crypto.randomBytes(n).toString('hex');
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function dreamPost(url, body, token, clientId) {
  try {
    const headers = { ...dreamHeaders };
    if (token) headers['token'] = token;
    if (clientId) headers['client-id'] = clientId;

    const res = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body)
    });
    
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    
    const j = await res.json();
    
    if (j.status_code !== 'THS12140000000') {
      throw new Error(j.status_msg || 'خطأ في API');
    }
    
    return j.data;
  } catch (error) {
    throw new Error(`DreamFace API: ${error.message}`);
  }
}

async function generateDreamImage(prompt, modelConfig) {
  try {
    const email = `df_${rnd(5)}@illubd.com`;
    const userId = rnd(16);
    const clientId = rnd(16);

    const login = await dreamPost(`${DREAM_BASE}/user/login`, {
      password: 'dancow000',
      user_id: userId,
      third_id: email,
      third_platform: 'EMAIL',
      register_source: 'seo',
      platform_type: 'MOBILE',
      tenant_name: 'dream_face'
    }, null, clientId);

    if (!login.token || !login.account_id) {
      throw new Error("فشل تسجيل الدخول");
    }

    await dreamPost(`${DREAM_BASE}/user/save_user_login`, {
      device_system: 'PC-Mobile',
      user_id: userId,
      account_id: login.account_id,
      app_version: '4.7.1',
      platform_type: 'MOBILE',
      tenant_name: 'dream_face'
    }, login.token, clientId);

    await sleep(1000);

    const { param } = modelConfig;
    
    await dreamPost(`${DREAM_BASE}/task/v2/submit`, {
      ext_info: {
        sing_title: prompt.slice(0, 50),
        model: param.model
      },
      media: {
        texts: [{ text: prompt }],
        images: [], audios: [], videos: []
      },
      output: param.output,
      template: {
        releation_id: param.releation_id,
        template_id: param.template_id,
        play_types: param.play_types
      },
      user: {
        user_id: userId,
        account_id: login.account_id,
        app_version: '4.7.1'
      },
      work_type: 'AI_IMAGE',
      create_work_session: true,
      platform_type: 'MOBILE',
      tenant_name: 'dream_face'
    }, login.token, clientId);

    for (let i = 0; i < 60; i++) {
      const ws = await dreamPost(`${DREAM_BASE}/work_session/list`, {
        user_id: userId,
        account_id: login.account_id,
        page: 1, size: 5,
        session_type: 'AI_IMAGE',
        platform_type: 'MOBILE',
        tenant_name: 'dream_face'
      }, login.token, clientId);

      const s = ws.list?.[0];
      
      if (s?.session_status === 200 && s?.work_details?.[0]?.image_urls?.length) {
        return s.work_details[0].image_urls;
      }
      
      if (s?.session_status < 0 && s?.session_status !== -1) { 
         throw new Error(`تم رفض المهمة (حالة: ${s.session_status})`);
      }

      await sleep(3000);
    }
    
    throw new Error('انتهت مهلة التوليد (3 دقائق)');
  } catch (error) {
    throw new Error(`DreamFace: ${error.message}`);
  }
}

// ============= Image-Editor.org Source =============
const EDITOR_BASE = 'https://image-editor.org';
const BYPASS_API = 'https://cloudflarebypass.hostrta.win/turnstile?url=https://image-editor.org/editor/&sitekey=0x4AAAAAACE-XLGoQUckKKm_';

async function getTurnstileToken() {
  try {
    const response = await axios.get(BYPASS_API, { timeout: 120000 });
    const data = response.data;
    if (data?.status === true) {
      return data.data?.token || data.token || null;
    }
    return null;
  } catch (error) {
    console.error("Turnstile error:", error.message);
    return null;
  }
}

async function editorGenerate(prompt, imageBuffer) {
  try {
    const fileName = `photo_${Date.now()}.jpg`;
    const fileType = 'image/jpeg';
    
    const presign = await axios.post(`${EDITOR_BASE}/api/upload/presigned`, 
      { filename: fileName, contentType: fileType },
      { 
        headers: { 
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0'
        }, 
        timeout: 60000 
      }
    );
    
    if (!presign.data.uploadUrl || !presign.data.publicUrl) {
      throw new Error("فشل الحصول على رابط الرفع");
    }
    
    await axios.put(presign.data.uploadUrl, imageBuffer, {
      headers: { 'Content-Type': fileType },
      timeout: 120000
    });
    
    const turnstileToken = await getTurnstileToken();
    const userUUID = crypto.randomBytes(16).toString('hex');
    
    const task = await axios.post(`${EDITOR_BASE}/api/edit`, {
      prompt,
      image_urls: [presign.data.publicUrl],
      image_size: '1:1',
      turnstileToken,
      uploadIds: [presign.data.uploadId],
      userUUID,
      imageHash: 'ffff0df03fc8000000007fe07ff07ff07fa038007fe07fe000000000ffffffff'
    }, { 
      headers: { 
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0'
      }, 
      timeout: 120000 
    });
    
    const taskId = task.data?.data?.taskId || task.data?.taskId;
    
    if (!taskId) throw new Error("لم يتم الحصول على معرف المهمة");
    
    for (let i = 0; i < 60; i++) {
      await sleep(3000);
      
      const status = await axios.get(`${EDITOR_BASE}/api/task/${taskId}`, { 
        timeout: 30000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      
      const data = status.data?.data || status.data;
      
      if (data?.status === 'completed' || data?.status === 'succeeded') {
        const imageUrl = data.output_url || data.imageUrl;
        if (!imageUrl) throw new Error("لم يتم العثور على رابط الصورة");
        return imageUrl;
      }
      
      if (data?.status === 'failed') {
        throw new Error(`فشلت المهمة: ${data.error || 'سبب غير معروف'}`);
      }
    }
    
    throw new Error('انتهت المهلة (3 دقائق)');
  } catch (error) {
    throw new Error(`Image-Editor: ${error.message}`);
  }
}

// ============= Main Handler =============
let handler = async (m, { conn, text, usedPrefix, command }) => {
  // عرض قائمة المصادر والنماذج
  if (!text) {
    let menu = `✨ *محرر الصور بالذكاء الاصطناعي* ✨

📌 *الاستخدام:*
${usedPrefix + command} <المصدر> <الوصف>

🎨 *المصادر المتاحة:*

*1️⃣ ImgEditor* (تحرير سريع)
   ${usedPrefix + command} 1 حولها لأنمي

*2️⃣ DreamFace* (نماذج متعددة - بدون صورة)
   ${usedPrefix + command} 2 <رقم> <الوصف>
   
   *النماذج المتاحة:*
${DREAM_MODELS.map(m => `   ${m.id}. ${m.nameAr} ${m.id === 1 ? '🔥' : ''}\n      _${m.desc}_`).join('\n\n')}

*3️⃣ Image-Editor.org* (جودة عالية)
   ${usedPrefix + command} 3 اجعلها واقعية

📝 *أمثلة:*
• ${usedPrefix + command} 1 حولها لكرتون (مع صورة)
• ${usedPrefix + command} 2 1 قطة لطيفة في الفضاء (بدون صورة)
• ${usedPrefix + command} 3 غير لون بشرته للأسود (مع صورة)

⚠️ *ملاحظة:* 
- المصدر 1 و 3 يحتاجان صورة
- المصدر 2 (DreamFace) ينشئ صور جديدة بدون صورة أصلية`;
    
    return m.reply(menu);
  }

  let [source, ...args] = text.trim().split(' ');
  source = parseInt(source);

  if (![1, 2, 3].includes(source)) {
    return m.reply("❌ المصدر غير صحيح! استخدم: 1 (ImgEditor) أو 2 (DreamFace) أو 3 (Image-Editor)");
  }

  // DreamFace لا يحتاج صورة
  let buffer = null;
  let needsImage = source !== 2;

  if (needsImage) {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || "";
    
    if (!/image/.test(mime)) {
      return m.reply("❌ رد على صورة أو أرسل صورة مع الأمر!");
    }

    const wait = await conn.sendMessage(m.chat, { 
      text: "⏳ جاري تحميل الصورة..." 
    }, { quoted: m });

    try {
      buffer = await q.download();
      if (!buffer || buffer.length === 0) throw new Error("الصورة فارغة");
      
      await conn.sendMessage(m.chat, { 
        edit: wait.key, 
        text: `✅ تم تحميل الصورة (${(buffer.length / 1024).toFixed(2)} KB)` 
      });
      
      await sleep(1000);
    } catch (error) {
      return conn.sendMessage(m.chat, { 
        edit: wait.key, 
        text: `❌ فشل تحميل الصورة: ${error.message}` 
      });
    }
  }

  const wait = await conn.sendMessage(m.chat, { 
    text: "🔄 جاري المعالجة..." 
  }, { quoted: m });

  try {
    // المصدر 1: ImgEditor
    if (source === 1) {
      const prompt = args.join(' ');
      if (!prompt) {
        return conn.sendMessage(m.chat, { 
          edit: wait.key, 
          text: "❌ أين الوصف؟ مثال: .edit 1 حولها لأنمي" 
        });
      }

      await conn.sendMessage(m.chat, { edit: wait.key, text: "📤 جاري رفع الصورة..." });
      
      const up = await ImgEditor.getUploadUrl(buffer);
      await ImgEditor.upload(up.uploadUrl, buffer);

      await conn.sendMessage(m.chat, { 
        edit: wait.key, 
        text: "🤖 جاري المعالجة بالذكاء الاصطناعي...\n⏱ الوقت المتوقع: 20-60 ثانية" 
      });

      const task = await ImgEditor.generate(prompt, up.publicUrl);
      const resultUrl = await ImgEditor.check(task.taskId);

      await conn.sendMessage(m.chat, {
        image: { url: resultUrl },
        caption: `✅ *تم بنجاح!*\n📝 الوصف: ${prompt}\n🔧 المصدر: ImgEditor`
      }, { quoted: m });
      
      await conn.sendMessage(m.chat, { delete: wait.key });
    }
    
    // المصدر 2: DreamFace
    else if (source === 2) {
      let [modelNum, ...promptArr] = args;
      const prompt = promptArr.join(' ');
      
      if (!modelNum || !prompt) {
        return conn.sendMessage(m.chat, {
          edit: wait.key,
          text: `❌ الصيغة: ${usedPrefix + command} 2 <رقم النموذج> <الوصف>\n\n` +
                DREAM_MODELS.map(m => `${m.id}. ${m.nameAr}`).join('\n')
        });
      }

      const model = DREAM_MODELS.find(m => m.id == modelNum);
      if (!model) {
        return conn.sendMessage(m.chat, {
          edit: wait.key,
          text: "❌ رقم النموذج غير صحيح! اختر من 1 إلى 6"
        });
      }

      await conn.sendMessage(m.chat, { 
        edit: wait.key, 
        text: `🎨 جاري التوليد باستخدام *${model.nameAr}*...\n${model.desc}\n⏱ الوقت المتوقع: 30-90 ثانية` 
      });

      const imgs = await generateDreamImage(prompt, model);
      
      for (const url of imgs) {
        await conn.sendMessage(m.chat, { 
          image: { url }, 
          caption: `✅ *تم!*\n🎨 النموذج: ${model.nameAr}\n📝 الوصف: ${prompt}` 
        }, { quoted: m });
      }
      
      await conn.sendMessage(m.chat, { delete: wait.key });
    }
    
    // المصدر 3: Image-Editor.org
    else if (source === 3) {
      const prompt = args.join(' ');
      if (!prompt) {
        return conn.sendMessage(m.chat, { 
          edit: wait.key, 
          text: "❌ أين الوصف؟ مثال: .edit 3 اجعلها واقعية" 
        });
      }

      await conn.sendMessage(m.chat, { 
        edit: wait.key, 
        text: "🔄 جاري التحرير بجودة عالية...\n⏱ الوقت المتوقع: 40-120 ثانية" 
      });

      const resultUrl = await editorGenerate(prompt, buffer);

      await conn.sendMessage(m.chat, {
        image: { url: resultUrl },
        caption: `✅ *تم بنجاح!*\n📝 الوصف: ${prompt}\n🔧 المصدر: Image-Editor.org`
      }, { quoted: m });
      
      await conn.sendMessage(m.chat, { delete: wait.key });
    }

  } catch (e) {
    console.error("Error details:", e);
    
    let errorMsg = `❌ فشلت المعالجة!\n\n`;
    
    if (e.message.includes("HTTP")) {
      errorMsg += `📋 الخطأ: مشكلة في الاتصال بالسيرفر\n`;
    } else if (e.message.includes("timeout") || e.message.includes("المهلة")) {
      errorMsg += `📋 الخطأ: انتهت المهلة - السيرفر بطيء\n`;
    } else if (e.message.includes("رفض") || e.message.includes("failed")) {
      errorMsg += `📋 الخطأ: تم رفض الطلب من السيرفر\n`;
    } else {
      errorMsg += `📋 الخطأ: ${e.message}\n`;
    }
    
    errorMsg += `\n💡 *الحلول:*\n`;
    errorMsg += `• جرب مصدر آخر\n`;
    errorMsg += `• تأكد من وضوح الوصف\n`;
    errorMsg += `• حاول مرة أخرى بعد دقيقة`;
    
    await conn.sendMessage(m.chat, { 
      edit: wait.key, 
      text: errorMsg
    });
  }
};

handler.help = ["edit <المصدر> <الوصف>"];
handler.tags = ["ai"];
handler.command = /^(edit|aiimg|تعديل|صورة)$/i;

export default handler;