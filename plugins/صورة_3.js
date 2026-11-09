import { prepareWAMessageMedia, generateWAMessageFromContent, getDevice } from '@whiskeysockets/baileys';
import { googleImage } from '@bochilteam/scraper';

const handler = async (m, { conn, text, usedPrefix }) => {
  const deviceType = await getDevice(m.key.id);
  
  // التأكد من وجود نص في الرسالة تحسباً لأي خطأ
  const inputText = (text || m.text || '').toString().trim();

  // قائمة الكلمات المحظورة
  const forbiddenWords = ['caca', "شاذ", "شذوذ", "polla", 'porno', "porn", 'gore', 'cum', "semen", "puta", "puto", 'culo', "putita", "putito", "pussy", 'hentai', "pene", "coño", "asesinato", 'zoofilia', "mia khalifa", "desnudo", "desnuda", 'cuca', 'chocha', "muertos", "pornhub", "xnxx", "xvideos", "teta", "vagina", "marsha may", "misha cross", "sexmex", 'furry', "furro", "furra", 'xxx', "rule34", "panocha", "pedofilia", "necrofilia", 'pinga', "horny", "ass", "nude", "nsfw", "femdom", "futanari", "erofeet", "sexo", "sex", "yuri", "ero", "ecchi", 'blowjob', "anal", "ahegao", "pija", "verga", "trasero", "violation", "violacion", "bdsm", 'cachonda', 'cp', "mia marin", "lana rhoades", "cepesito", "buceta", 'xxx'];

  // فحص الكلمات المحظورة
  if (forbiddenWords.some(word => inputText.toLowerCase().includes(word))) {
    return conn.reply(m.chat, " *استغفر ربك احسن* 😒", m);
  }

  // التأكد من إدخال كلمة البحث
  if (!text) {
    return conn.reply(m.chat, `⚠️ *يرجى إدخال كلمة للبحث عن الصور!*\n\n*مثال:* ${usedPrefix}صوره eren`, m);
  }

  if (deviceType !== "desktop" && deviceType !== "web") {
    const images = await googleImage(text);
    
    if (!images || images.length === 0) {
      return conn.reply(m.chat, "❌ لم يتم العثور على أي نتائج للبحث.", m);
    }

    const randomImage = images.getRandom();

    const mediaMessage = await prepareWAMessageMedia({
      'image': { 'url': randomImage }
    }, {
      'upload': conn.waUploadToServer
    });

    let messageText = `🔎 *نتائج البحث عن:* ${text}\n`;
    messageText += `───\n`;
    messageText += `⚠️ *تنبيه هام:* أنت المسؤول الكامل أمام الله ثم أمام نفسك عن أي شيء تقوم بالبحث عنه أو استخدامه.`;

    const interactiveContent = {
      'body': {
        'text': messageText.trim()
      },
      'footer': {
        'text': "𝐊𝐈𝐍𝐈𝐒𝐈𝐘𝐀 𝐁𝐎𝐓".trim()
      },
      'header': {
        'title': "*الـتـحـميل مـن مـوقـع صور جوجل 🪩*",
        'subtitle': '',
        'hasMediaAttachment': true,
        'imageMessage': mediaMessage.imageMessage
      },
      'nativeFlowMessage': {
        'buttons': [{
          'name': "quick_reply",
          'buttonParamsJson': JSON.stringify({
            'display_text': "صورة أخرى 🔄",
            'id': `.صوره ${text}`
          })
        }],
        'messageParamsJson': ''
      }
    };

    let waMessage = generateWAMessageFromContent(m.chat, {
      'viewOnceMessage': {
        'message': {
          'interactiveMessage': interactiveContent
        }
      }
    }, {
      'userJid': conn.user.jid,
      'quoted': m
    });

    await conn.relayMessage(m.chat, waMessage.message, {
      'messageId': waMessage.key.id
    });
  } else {
    await conn.sendFile(m.chat, "JoAnimi•Error.jpg", m);
  }
};

handler.help = ["صوره"];
handler.tags = ["search"];
handler.command = /^(image0|صوره)$/i;

export default handler;
