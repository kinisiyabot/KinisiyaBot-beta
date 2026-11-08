import fs from "fs";
import path from "path";
import axios from "axios";

// 🗣️ خريطة الأصوات
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

let handler = async (m, { conn }) => {
    // تحديد جراف/معرف المرسل
    const senderJid = m.sender || m.key.participant || m.key.remoteJid;
    const senderNum = senderJid.split('@')[0];

    // قراءة ملف روابط الصور
    const linksFile = './media-links.txt';
    if (!fs.existsSync(linksFile)) return await m.reply('⚠️ ملف روابط الصور غير موجود.');
    const links = fs.readFileSync(linksFile, 'utf-8').split('\n').map(l => l.trim()).filter(Boolean);
    if (!links.length) return await m.reply('⚠️ ملف روابط الصور فارغ.');

    // اختيار صورة كبيرة وعشوائية
    const randomIndex = Math.floor(Math.random() * links.length);
    const imageUrl = links[randomIndex];

    // اختيار صورة مصغرة مختلفة
    let thumbUrl;
    if (links.length === 1) {
        thumbUrl = imageUrl;
    } else {
        let thumbIndex;
        do {
            thumbIndex = Math.floor(Math.random() * links.length);
        } while (thumbIndex === randomIndex);
        thumbUrl = links[thumbIndex];
    }

    // تحميل الصورة المصغرة بكفاءة
    let thumbnailBuffer = null;
    try {
        const resp = await axios.get(thumbUrl, { responseType: 'arraybuffer' });
        thumbnailBuffer = Buffer.from(resp.data);
    } catch {
        thumbnailBuffer = null;
    }

    // تقسيم الأصوات
    const females = voices.slice(0, 13).map(v => `*┇🎙️ ${v.arName}* - ${v.desc}`).join("\n");
    const males = voices.slice(13).map(v => `*┇🎙️ ${v.arName}* - ${v.desc}`).join("\n");

    // نص الرسالة المزخرفة
    const message = `*⎔⋅• ━ ╼╃ ⌬〔𝑲𝑰𝑵𝑰𝑺𝑰𝒀𝑨〕⌬ ╄╾ ━ •⋅⎔*
*┇🏮👋 أهلاً بـResolving @${senderNum}〙*
*╮═『🩸┃🗣️ أصوات البوت┃🔞』═╭*
*┇👩‍🎤 أصوات نسائية:*\n${females}\n
*┇👨‍🎤 أصوات رجالية:*\n${males}
*⎔⋅• ━ ╼╃ ⌬〔𝑲𝑰𝑵𝑰𝑺𝑰𝒀𝑨〕⌬ ╄╾ ━ •⋅⎔*
⏤͟͞ू⃪ 𝐊𝐈𝐍𝐈𝐒𝐈𝐘𝐀 𝐁𝐎𝐓⃝𖤐`.replace('Resolving ', '');

    // إرسال الرسالة مع الصورة والمنشن
    const contactInfo = {
        key: { fromMe: false, participant: senderJid, remoteJid: 'status@broadcast', id: 'Halo' },
        message: { 
            contactMessage: { 
                displayName: '@' + senderNum, 
                vcard: `BEGIN:VCARD\nVERSION:3.0\nTEL;waid=${senderNum}:${senderNum}\nEND:VCARD` 
            } 
        },
        participant: senderJid
    };

    await conn.sendMessage(m.chat, {
        image: { url: imageUrl },
        caption: message,
        mentions: [senderJid],
        contextInfo: {
            mentionedJid: [senderJid],
            externalAdReply: {
                title: '⏤͟͞ू⃪ 𝐊𝐈𝐍𝐈𝐒𝐈𝐘𝐀 𝐁𝐎𝐓𖤐',
                body: '@' + senderNum,
                thumbnail: thumbnailBuffer,
                mediaType: 1,
                mediaUrl: 'https://whatsapp.com/channel/0029Vb80wch30LKFioKenc2V',
                showAdAttribution: true,
                renderLargerThumbnail: false
            }
        }
    }, { quoted: contactInfo });
};

handler.command = /^(قسم_audio_ai)$/i;
handler.exp = 50;
handler.fail = null;

export default handler;
