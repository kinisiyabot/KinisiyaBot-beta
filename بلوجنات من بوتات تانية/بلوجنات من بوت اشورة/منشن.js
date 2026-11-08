import { isElite, extractPureNumber } from '../lib/elite.js';

const handler = async (m, { conn }) => {
    const sender = extractPureNumber(m.sender); // تحويل JID إلى رقم صافي

    // التحقق إذا الرقم من النخبة
    if (!isElite(sender)) {
        return m.reply('🚫 هذا الأمر مخصص فقط لأعضاء النخبة.');
        if (!m.isGroup) return m.reply('🚫 هذا الأمر يعمل فقط في الجروبات.');
    }

    try {
        const metadata = await conn.groupMetadata(m.key.remoteJid);
        const mentions = metadata.participants.map(p => p.id);

        // نص الرسالة مع منشن داخلي (رمز غير مرئي)
        const hiddenMention = mentions.map(() => '\u200E').join('');
        const textMsg = `ᯓ｜𝐁𝜣𝐓 ¦ 𝑨𝑺𝑯𝑼𝑹𝑨 ⍣⃝🫦 ${hiddenMention}`;

        await conn.sendMessage(
            m.key.remoteJid,
            {
                text: textMsg,
                mentions
            },
            { quoted: m }
        );

    } catch (err) {
        const errorDesign = `
╭─⚡| 𝑨𝑺𝑯𝑼𝑹𝑨'𝒔 𝑾𝑹𝑨𝑻𝑯 |⚡─╮
│
│ *« 𝐄𝐑𝐑𝐎𝐔𝐑 »* 
│ ${err.message || '𝐔𝐍𝐊𝐍𝐎𝐖𝐍 𝐃𝐄𝐌𝐎𝐍 𝐅𝐎𝐑𝐂𝐄'}
│
╰─────────────⚔️────────╯`;

        await conn.sendMessage(m.key.remoteJid, { text: errorDesign }, { quoted: m });
    }
};

handler.command = ['منشن'];
handler.group = true; // شغال في الجروبات فقط

export default handler;