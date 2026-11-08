import { isElite, extractPureNumber } from '../lib/elite.js';

const handler = async (m, { conn }) => {
  const chats = Object.entries(global.db.data.chats).filter(chat => chat[1].isBanned);
  const users = Object.entries(global.db.data.users).filter(user => user[1].banned);
  
    const sender = extractPureNumber(m.sender);

    // التحقق إذا الرقم من النخبة
    if (!isElite(sender)) {
        return m.reply('🚫 هذا الأمر مخصص فقط لأعضاء النخبة.');
    }

  const caption = `
┌〔 المستخدمين - المحظورين 〕
├ المجموع : ${users.length} ${users.length > 0 ? '\n' + users.map(([jid]) => `
├ ${isOwner ? '@' + jid.split`@`[0] : jid}`.trim()).join('\n') : '├'}
└────

┌〔 المحادثات - المحظورة 〕
├ المجموع : ${chats.length} ${chats.length > 0 ? '\n' + chats.map(([jid]) => `
├ ${isOwner ? '@' + jid.split`@`[0] : jid}`.trim()).join('\n') : '├'}
└────
`.trim();

  m.reply(caption, null, { mentions: conn.parseMention(caption) });
};

handler.command = ['بانات', 'banlist', 'listban'];
handler.rowner = false;

export default handler;