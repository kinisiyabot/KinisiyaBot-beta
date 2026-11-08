import cp, {exec as _exec} from 'child_process';
import {promisify} from 'util';

const exec = promisify(_exec).bind(cp);
const handler = async (m, {conn, isOwner, command, text, usedPrefix, args, isROwner}) => {
  
  if (!isROwner) return;
  if (global.conn.user.jid != conn.user.jid) return;

  // تحقق من وجود النص
  if (!text) {
    return m.reply("❌ يرجى إدخال الأمر المطلوب بعد الرمز `$`.");
  }

  m.reply("جاري تنفيذ الأمر... يرجى الانتظار."); // النص العربي البديل
  let o;
  try {
    o = await exec(command.trimStart() + ' ' + text.trimEnd());
  } catch (e) {
    o = e;
  } finally {
    const {stdout, stderr} = o;
    if (stdout.trim()) m.reply(stdout);
    if (stderr.trim()) m.reply(stderr);
  }
};
handler.customPrefix = /^[$]/;
handler.command = new RegExp;
export default handler;