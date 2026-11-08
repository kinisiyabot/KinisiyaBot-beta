// • Feature : elevenlab
// • Developers : izana x radio
// • Channel : https://whatsapp.com/channel/0029VbB2Uwg11ulIMA9bfq2c
import fetch from "node-fetch";
import fs from "fs";
import path from "path";

// 🗣️ خريطة الأصوات (ذكور وإناث)
const voices = [
  { arName: "ليانا", desc: "صوت أنثوي واضح ومشرق" },
  { arName: "ميرال", desc: "صوت ناعم ودافئ" },
  { arName: "تاليا", desc: "صوت أنثوي مشرق وحيوي" },
  { arName: "رِنا", desc: "صوت لطيف ومهذب" },
  { arName: "سيرين", desc: "صوت ناعم ومتزن" },
  { arName: "فاي", desc: "صوت أنثوي حيوي" },
  { arName: "ياسمين", desc: "صوت راقي وأنيق" },
  { arName: "نوفا", desc: "صوت شاب ومفعم بالحيوية" },
  { arName: "آية", desc: "صوت دافئ وحنون" },
  { arName: "لينا", desc: "صوت بريطاني راقي" },
  { arName: "رودينا", desc: "صوت هادئ ومريح" },
  { arName: "جودي", desc: "صوت احترافي وواضح" },
  { arName: "سلمى", desc: "صوت ناعم ومعبر" },

  { arName: "ريان", desc: "صوت ذكوري متزن" },
  { arName: "جاد", desc: "صوت ذكوري قوي" },
  { arName: "باسل", desc: "صوت عميق وقوي" },
  { arName: "سامي", desc: "صوت وثائقي احترافي" },
  { arName: "رامي", desc: "صوت ذكوري واثق" },
  { arName: "كريم", desc: "صوت دافئ" },
  { arName: "نور", desc: "صوت ودي ولطيف" },
  { arName: "آدمو", desc: "صوت أمريكي متوسط" },
  { arName: "فهد", desc: "صوت ذكوري رسمي" },
  { arName: "دان", desc: "صوت بريطاني شاب" },
  { arName: "ليو", desc: "صوت أمريكي حيوي" },
  { arName: "تيم", desc: "صوت جريء وواثق" },
  { arName: "نزار", desc: "صوت مرح ومتفائل" },
  { arName: "عمر", desc: "صوت عميق ومؤثر" },
  { arName: "كافا", desc: "صوت رجولي هادئ" },
  { arName: "باهر", desc: "صوت ساحر وجذاب" },
  { arName: "هاني", desc: "صوت أمريكي قوي" },
  { arName: "جادسون", desc: "صوت أسترالي هادئ" },
  { arName: "سيف", desc: "صوت بريطاني محترف" },
  { arName: "راكان", desc: "صوت شاب وحيوي" },
  { arName: "مهند", desc: "صوت أمريكي قوي" },
  { arName: "كريمون", desc: "صوت أمريكي جنوبي" },
  { arName: "سندس", desc: "صوت شاب وديناميكي" },
  { arName: "تيمور", desc: "صوت أمريكي شاب" },

  { arName: "زيلان", desc: "صوت مميز من ElevenLabs" },
  { arName: "ناريس", desc: "صوت نسائي معبر" }
];

// مجلد مؤقت (تأكد موجود)
const TMP_DIR = path.join(process.cwd(), 'tmp');
if (!fs.existsSync(TMP_DIR)) {
  try { fs.mkdirSync(TMP_DIR, { recursive: true }); } catch (e) { /* ignore */ }
}

// 🎤 المعالج الرئيسي
const handler = async (m, { conn, text, command, usedPrefix }) => {
  const voiceObj = voices.find(v => v.arName === command);

  // عرض قائمة الأصوات
  if (command === "elevenlab" || !voiceObj || !text) {
    const females = voices.filter((_, i) => i < 13);
    const males = voices.filter((_, i) => i >= 13);
    
    const femaleList = females.map(v => `🎙️ *${v.arName}* - ${v.desc}`).join("\n");
    const maleList = males.map(v => `🎙️ *${v.arName}* - ${v.desc}`).join("\n");
    
    return m.reply(
      `🗣️ *قائمة الأصوات المتاحة:*\n\n` +
      `👩 *أصوات نسائية:*\n${femaleList}\n\n` +
      `👨 *أصوات رجالية:*\n${maleList}\n\n` +
      `📘 *مثال:* ${usedPrefix}زيلان مرحبًا أنا شادو بوت`
    );
  }

  const voiceName = voiceObj.arName;
  const filePath = path.join(TMP_DIR, `tts-${Date.now()}.mp3`);

  try {
    await m.reply("⏳ جاري توليد الصوت...");

    // Dark API
    const apiUrl = `https://apex-api-five.vercel.app/api/v1/ai/AI-elevenlabs?voice=${encodeURIComponent(voiceName)}&text=${encodeURIComponent(text)}`;
    const response = await fetch(apiUrl, { timeout: 60000 });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data || !data.status) {
      throw new Error(data?.message || 'خطأ من الـ API أثناء توليد الصوت');
    }

    // دعم حالتين: base64 أو رابط مباشر
    const payload = data.response || data.data || '';
    if (!payload) throw new Error('لا توجد بيانات صوتية في استجابة الـ API');

    // لو الـ API رجّع رابط مباشر للصوت -> نرسله مباشرة (أفضل أداء)
    if (typeof payload === 'string' && (payload.startsWith('http://') || payload.startsWith('https://'))) {
      // حاول إرسال من الرابط مباشرة
      try {
        await conn.sendMessage(m.chat, { audio: { url: payload }, mimetype: 'audio/mpeg' }, { quoted: m });
        return;
      } catch (e) {
        // لو فشل، نواصل محاولة كتابة الملف من الرابط (fallback)
      }
    }

    // نفترض base64 (قد يكون مع بادئة data:audio/..;base64,)
    let base64Audio = String(payload).replace(/^data:audio\/[a-z0-9.+-]+;base64,/, '').trim();
    if (!base64Audio) throw new Error('البيانات المستلمة ليست بصيغة Base64 صالحة');

    // كتابة الملف بشكل آمن (async)
    const audioBuffer = Buffer.from(base64Audio, 'base64');
    await fs.promises.writeFile(filePath, audioBuffer);

    // إرسال كـ stream لتقليل الذاكرة
    try {
      const stream = fs.createReadStream(filePath);
      await conn.sendMessage(m.chat, { audio: stream, mimetype: 'audio/mpeg', fileName: `${voiceObj.arName}.mp3` }, { quoted: m });
    } catch (sendErr) {
      // لو إرسال الستريم فشل، حاول إرسال كامل البافر (fallback)
      try {
        await conn.sendMessage(m.chat, { audio: fs.readFileSync(filePath), mimetype: 'audio/mpeg', fileName: `${voiceObj.arName}.mp3` }, { quoted: m });
      } catch (sendErr2) {
        throw new Error(`فشل إرسال الصوت: ${sendErr2.message || sendErr.message}`);
      }
    }
  } catch (error) {
    console.error('elevenlab-tts error:', error);
    try { await m.reply(`⚠️ فشل توليد أو إرسال الصوت.\n\n*الخطأ:* ${error.message}`); } catch(_) {}
  } finally {
    // تنظيف الملف المؤقت لو اتعمل
    try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch (_) {}
  }
};

handler.help = voices.map(v => `${v.arName} <نص>`).concat(["elevenlab - عرض جميع الأصوات"]);
handler.tags = ["voice-ai"];
handler.command = voices.map(v => v.arName).concat(["elevenlab"]);

export default handler;