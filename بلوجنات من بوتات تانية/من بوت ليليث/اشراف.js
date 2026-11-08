let antiAdminChange = {};

let handler = async (m, { conn, args, usedPrefix, command, isAdmin, isBotAdmin }) => {
  if (!m.isGroup) return m.reply('*هذا الأمر يعمل في المجموعات فقط!*');
  if (!isAdmin) return m.reply('*الأمر للمشرفين فقط!*');
  if (!isBotAdmin) return m.reply('*يجب أن أكون مشرفًا لتشغيل هذا الأمر!*');

  let chatId = m.chat;
  let state = args[0]?.toLowerCase();

  if (state === 'فتح') {
    antiAdminChange[chatId] = true;
    return m.reply('*✅ تم تفعيل مضاد الإشراف!*');
  } else if (state === 'غلق') {
    antiAdminChange[chatId] = false;
    return m.reply('*❌ تم إيقاف مضاد الإشراف.*');
  } else {
    return m.reply(`*استخدم:*\n\n - ${usedPrefix + command} فتح\n - ${usedPrefix + command} غلق`);
  }
};

handler.command = ['مضاد_الإشراف'];
handler.admin = true;
handler.group = true;
handler.botAdmin = true;

export default handler;

conn.ev.on('group-participants.update', async (update) => {
  let { id, participants, action } = update;
  if (!antiAdminChange[id] || action !== 'demote') return;

  try {
    let groupMetadata = await conn.groupMetadata(id);
    let adminsBefore = groupMetadata.participants.filter(p => p.admin).map(p => p.id);

    setTimeout(async () => {
      let newGroupMetadata = await conn.groupMetadata(id);
      let adminsAfter = newGroupMetadata.participants.filter(p => p.admin).map(p => p.id);
      
      let removedAdmins = adminsBefore.filter(admin => !adminsAfter.includes(admin));
      
      if (removedAdmins.length > 0) {
        for (let target of removedAdmins) {
          let executor = newGroupMetadata.participants.find(p => p.id !== target && p.admin === 'admin');
          
          if (executor && executor.id !== conn.user.jid) {
            await conn.sendMessage(id, { text: `🚨 المشرف @${executor.id.split('@')[0]} قام بسحب إشراف شخص آخر، سيتم طرده!`, mentions: [executor.id] });
            await conn.groupParticipantsUpdate(id, [executor.id], 'remove');
          }
        }
      }
    }, 3000);
  } catch (e) {
    console.error('خطأ في مراقبة الإشراف:', e);
  }
});