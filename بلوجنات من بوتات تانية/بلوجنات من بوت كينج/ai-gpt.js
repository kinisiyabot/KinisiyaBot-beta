import fetch from 'node-fetch';

let handler = async (m, { conn, args }) => {
  const text = args.join(' ').trim();

  if (!text) {
    return m.reply('🫟 اكتب *طلبًا* ليرد عليك *سولو*.');
  }

  const apiUrl = `${api.url}/ai/chatgpt?text=${encodeURIComponent(text)}&apikey=${api.key}`;

  try {
    const { key } = await conn.sendMessage(
      m.chat,
      { text: '🐼 يقوم *سولو* بمعالجة ردك...' },
      { quoted: m }
    );

    const res = await fetch(apiUrl);
    const json = await res.json();

    if (!json || !json.result) {
      return conn.reply(m.chat, '🫆 لم يتم الحصول على *إجابة* صالحة.');
    }

    const response = json.result.trim();
    await conn.sendMessage(m.chat, { text: response, edit: key });
  } catch (error) {
    console.error(error);
    await m.reply('⚠️ حدث خطأ أثناء معالجة طلبك..');
  }
};

handler.help = ['ia', 'chatgpt'];
handler.tags = ['ai'];
handler.command = ['ia', 'سولو'];

export default handler;