import fetch from 'node-fetch';
import { format } from 'util';

let handler = async (m, { conn, args }) => {
  const argsText = args.join(' ').trim();

  if (!argsText) {
    return m.reply('🖇️ اكتب رابط عشان أقدر أجلب المحتوى.');
  }

  if (!/^https?:\/\//.test(argsText)) {
    return m.reply('⚠️ من فضلك أدخل رابط صحيح يبدأ بـ *https://* أو *http://*');
  }

  try {
    const response = await fetch(argsText);

    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 100 * 1024 * 1024 * 1024) {
      throw new Error(`🐼 *حجم المحتوى كبير جداً:* ${contentLength}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (!/text|json/.test(contentType)) {
      return conn.sendFile(m.chat, argsText, 'ملف', argsText, m);
    }

    let content = await response.text();
    try {
      content = format(JSON.parse(content));
    } catch {
      // لو المحتوى مش JSON بيظهر كنص عادي
    }

    const preview = content.length > 65536
      ? content.slice(0, 65536) + '\n\n📜 *النص طويل جداً، تم قطعه.*'
      : content;

    await m.reply(preview);
  } catch (error) {
    console.error(error);
    await m.reply('🚫 *فشل في جلب المحتوى.* تأكد من الرابط وحاول لاحقاً.');
  }
};

handler.help = ['جلب'];
handler.tags = ['أدوات'];
handler.command = ['جلب'];

export default handler;