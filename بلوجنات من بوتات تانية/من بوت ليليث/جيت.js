import fetch from 'node-fetch';

const regex = /(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:]+)\/(.+)/i;

const handler = async (m, { args, usedPrefix, command }) => {
  if (!args[0]) 
    throw `❌ يرجى إدخال رابط المستودع.\nمثال: ${usedPrefix + command} https://github.com/BrunoSobrino/TheMystic-Bot-MD`;

  if (!regex.test(args[0])) 
    throw "⚠️ الرابط المدخل غير صحيح! تأكد من أنه رابط GitHub صالح.";

  let [_, user, repo] = args[0].match(regex) || [];
  repo = repo.replace(/.git$/, '');
  const url = `https://api.github.com/repos/${user}/${repo}/zipball`;

  try {
    const response = await fetch(url, { method: 'HEAD' });
    const filename = response.headers.get('content-disposition')?.match(/attachment; filename=(.*)/)?.[1];

    if (!filename) throw "❌ حدث خطأ أثناء جلب اسم الملف.";

    m.reply("⏳ يتم تحميل المستودع، الرجاء الانتظار...");
    conn.sendFile(m.chat, url, filename, null, m);
  } catch (error) {
    throw `❌ حدث خطأ أثناء تحميل المستودع:\n${error.message}`;
  }
};

handler.command = /gitclone|جيت|جيتهاب/i;
export default handler;