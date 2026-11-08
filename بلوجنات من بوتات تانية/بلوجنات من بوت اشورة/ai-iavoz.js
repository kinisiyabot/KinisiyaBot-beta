import fetch from 'node-fetch';

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

let handler = async (m, { conn, text, usedPrefix }) => {
  if (!text) return conn.reply(m.chat, `🎙️ *اكتب نصًا لتحويله إلى صوت!* \n\n📌 *مثال:* ${usedPrefix}صوت مرحبًا بك في البوت`, m);

  try {
    // إرسال حالة تسجيل
    await conn.sendPresenceUpdate('recording', m.chat);

    // طلب الصوت من API
    const res = await fetch(`https://myapiadonix.vercel.app/api/adonixvoz?q=${encodeURIComponent(text)}`);
    if (!res.ok) throw new Error('حدث خطأ أثناء جلب الصوت.');

    // تحويل الاستجابة إلى buffer
    const bufferAudio = await streamToBuffer(res.body);

    // إرسال الصوت بصيغة PTT (رسالة صوتية)
    await conn.sendMessage(m.chat, {
      audio: bufferAudio,
      mimetype: 'audio/mpeg',
      ptt: true
    }, { quoted: m });

  } catch (e) {
    console.error(e);
    await conn.reply(m.chat, '❌ *تعذر تحويل النص إلى صوت، حاول مرة أخرى لاحقًا.*', m);
  }
};

handler.command = ['قول', 'تكلم']; // أوامر إنجليزي + عربي
handler.help = ['تكلم'];
handler.tags = ['تكلم', 'قول'];

export default handler;