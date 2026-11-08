import fs from 'fs';

let linkRegex = /https:\/\/chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i;

let handler = async (m, { conn, text, isOwner }) => {
    if (!isOwner) return m.reply('❌ هذا الأمر للمطور فقط.');

    if (!text) return m.reply(`⚠️ لازم تبعت رابط دعوة علشان *${botname}* يدخل الجروب.`);

    let [_, code] = text.match(linkRegex) || [];
    if (!code) return m.reply(`❌ رابط الدعوة غير صحيح.`);

    try {
        await conn.groupAcceptInvite(code)
            .then(() => m.reply(`✅ دخلت الجروب بنجاح.`))
            .catch(() => m.reply(`⚠️ حصل خطأ وأنا بحاول أدخل الجروب.`));
    } catch (e) {
        console.error(e);
        m.reply('⚠️ حصل خطأ أثناء محاولة دخول الجروب.');
    }
};

handler.help = ['خش'];
handler.tags = ['المالك', 'ادوات'];
handler.command = ['خش', 'انضم', 'ادخل'];

export default handler;