import { prepareWAMessageMedia, generateWAMessageFromContent, getDevice } from '@whiskeysockets/baileys';
import { wallpaper } from '@bochilteam/scraper';

// دالة لتحسين الرسائل التفاعلية
const createInteractiveMessage = (title, body, imageUrl, footer) => {
  return {
    body: {
      text: body.trim(),
    },
    footer: {
      text: footer.trim(),
    },
    header: {
      title: title,
      subtitle: '',
      hasMediaAttachment: true,
      imageMessage: imageUrl,
    },
    nativeFlowMessage: {
      buttons: [{
        name: 'quick_reply',
        buttonParamsJson: JSON.stringify({
          display_text: 'جيب خلفيه تاني',
          id: `.wp0 ${body}`,
        }),
      }],
      messageParamsJson: '',
    },
  };
};

// المعالج الرئيسي
const handler = async (message, { conn, text, usedPrefix }) => {
  const deviceType = await getDevice(message.key.id);
  
  if (!text) {
    throw 'استخدم أمر خلفيات عن طريق 🔎\n*.خلفيه Arthur*';
  }

  if (deviceType !== 'desktop' && deviceType !== 'web') {
    const wallpaperUrl = await wallpaper(text);
    
    const media = await prepareWAMessageMedia({
      image: {
        url: wallpaperUrl.getRandom(),
      },
    }, {
      upload: conn.waUploadToServer,
    });

    const interactiveMessage = createInteractiveMessage(
      '* *تـحـميل الخلفيات من الإنترنت 🖼️*',
      `- الـخـلفـيه الـمـراد الــبحث عـنـها : ${text}`,
      media.imageMessage,
      `❯ ⏐ ${global.wm}`
    );

    const waMessage = generateWAMessageFromContent(message.chat, {
      viewOnceMessage: {
        message: {
          interactiveMessage,
        },
      },
    }, {
      userJid: conn.user.jid,
      quoted: message,
    });

    conn.relayMessage(message.chat, waMessage.message, {
      messageId: waMessage.key.id,
    });
  } else {
    conn.sendFile(message.chat, 'JoAnimi•Error.jpg', message);
  }
};

handler.help = ['خلفيه'];
handler.tags = ['For Test'];
handler.command = /^(wp0|خلفيه|خلفية|wallper)$/i;

export default handler;