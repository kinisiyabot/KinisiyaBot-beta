import ws from 'ws';
import fs from 'fs';

const handler = async (m, { conn, groupMetadata }) => {
    const groupName = groupMetadata.subject;
    const groupCreator = groupMetadata.ownerJid 
      ? '@' + groupMetadata.ownerJid.split('@')[0] 
      : groupMetadata.owner 
        ? '@' + groupMetadata.owner.split('@')[0] 
        : 'غير معروف';
    const totalParticipants = groupMetadata.participants.length;

    let totalCoins = 0;
    let registeredUsersInGroup = 0;

    const chatId = m.chat;
    const chat = globalThis.db.data.chats[chatId] || {};
    const chatUsers = global.db.data.users || {};

    groupMetadata.participants.forEach(participant => {
        const user = chatUsers[participant.id];
        if (user) {
            registeredUsersInGroup++;
            totalCoins += user.chocolates || 0;
        }
    });

    const rawPrimary = typeof chat.primaryBot === 'string' ? chat.primaryBot : '';
    const botprimary = rawPrimary.endsWith('@s.whatsapp.net') 
        ? `@${rawPrimary.split('@')[0]}` 
        : 'عشوائي';

    const settings = {
        bot: chat.bannedGrupo ? '✘ متوقف' : '✓ شغال',
        antiLinks: chat.antilinks ? '✓ شغال' : '✘ متوقف',
        welcomes: chat.welcome ? '✓ شغال' : '✘ متوقف',
        alerts: chat.alerts ? '✓ شغال' : '✘ متوقف',
        gacha: chat.gacha ? '✓ شغال' : '✘ متوقف',
        rpg: chat.rpg ? '✓ شغال' : '✘ متوقف',
        nsfw: chat.nsfw ? '✓ شغال' : '✘ متوقف',
        adminMode: chat.adminonly ? '✓ شغال' : '✘ متوقف',
        botprimary: botprimary,
    };

    try {
      let message = `🍋‍🟩 *معلومات المجموعة:*\n\n`
      message += `𖹭 👑 *المالك:* ${groupCreator}\n`
      message += `𖹭 🤖 *البوت الأساسي:* ${settings.botprimary}\n`
      message += `𖹭 👥 *عدد الأعضاء:* ${totalParticipants}\n`
      message += `𖹭 🫂 *المسجلين:* ${registeredUsersInGroup}\n`
      message += `𖹭 🪙 *النقاط:* ${totalCoins.toLocaleString()} ${currency}\n\n`
      message += `⚙️ *الإعدادات:*\n`
      message += `🌿 البوت › *${settings.bot}*\n`
      message += `🌿 مضاد الروابط › *${settings.antiLinks}*\n`
      message += `🌿 الترحيب › *${settings.welcomes}*\n`
      message += `🌿 التنبيهات › *${settings.alerts}*\n`
      message += `🌿 وضع NSFW › *${settings.nsfw}*\n`
      message += `🌿 وضع المشرفين › *${settings.adminMode}*`

        const mentionOw = groupMetadata.ownerJid 
          ? groupMetadata.ownerJid 
          : groupMetadata.owner 
            ? groupMetadata.owner 
            : '';
        const mentions = [rawPrimary, mentionOw].filter(Boolean);

        await conn.reply(m.chat, message.trim(), m, { mentions });
    } catch (e) {
        await m.reply(`❌ حصل خطأ: ${e}`);
    }
};

handler.help = ['معلومات', 'المجموعة'];
handler.tags = ['المجموعة'];
handler.command = ['معلومات', 'المجموعة'];

export default handler;