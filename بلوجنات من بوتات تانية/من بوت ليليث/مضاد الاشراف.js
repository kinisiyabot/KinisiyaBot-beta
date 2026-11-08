let antiAdminChange = {}; // تخزين حالة الميزة لكل مجموعة

let handler = async (m, { conn, args, usedPrefix, command, isAdmin, isBotAdmin }) => {
  if (!m.isGroup) return m.reply('*هذا الأمر يعمل في المجموعات فقط!*');
  if (!isAdmin) return m.reply('*الأمر للمشرفين فقط!*');
  if (!isBotAdmin) return m.reply('*يجب أن أكون مشرفًا لتشغيل هذا الأمر!*');

  let chatId = m.chat;
  let state = args[0]?.toLowerCase();

  if (state === 'فتح') {
    antiAdminChange[chatId] = true;
    return m.reply('*✅ تم تفعيل مضاد الإشراف، سيتم طرد أي مشرف يسحب إشراف شخص آخر!*');
  } else if (state === 'غلق') {
    antiAdminChange[chatId] = false;
    return m.reply('*❌ تم إيقاف مضاد الإشراف، الآن يمكن تغيير المشرفين بحرية.*');
  } else {
    return m.reply(`*استخدم الأمر بالشكل التالي:*\n\n - ${usedPrefix + command} فتح (لتفعيل الحماية)\n - ${usedPrefix + command} غلق (لإيقاف الحماية)`);
  }
};

handler.help = ['حماية فتح/غلق'];
handler.tags = ['group'];
handler.command = ['حماية'];
handler.admin = true;
handler.group = true;
handler.botAdmin = true;

export default handler;

// ==================== مراقبة محاولات تغيير الإشراف ====================
conn.ev.on('group-participants.update', async (update) => {
  let { id, participants, action } = update;
  let botNumber = conn.user.jid; // رقم البوت
  let developerNumber = '212705655633@s.whatsapp.net'; // رقم المطور بصيغة JID

  if (!antiAdminChange[id]) return; // إذا كان النظام معطلاً في هذه المجموعة، لا تفعل شيئًا

  try {
    let groupMetadata = await conn.groupMetadata(id);
    let admins = groupMetadata.participants.filter(p => p.admin).map(p => p.id);

    if (action === 'demote') { // عند إزالة إشراف شخص ما
      for (let participant of participants) {
        let target = participant; // الشخص الذي تمت إزالة إشرافه

        // إيجاد المنفّذ الحقيقي من قائمة المشرفين
        let lastActions = await conn.fetchGroupMetadata(id);
        let executor = lastActions.participants.find(p => p.id !== target && p.admin === 'admin');

        if (executor && executor.id !== botNumber && executor.id !== developerNumber) {
          // طرد المشرف الذي قام بإزالة الإشراف
          conn.sendMessage(id, { text: `🚨 *تحذير!* المشرف @${executor.id.split('@')[0]} قام بسحب إشراف شخص آخر، سيتم طرده فورًا!`, mentions: [executor.id] });

          await conn.groupParticipantsUpdate(id, [executor.id], 'remove');
        }
      }
    }
  } catch (e) {
    console.log(`⚠️ خطأ في معالجة تغييرات الإشراف:`, e);
  }
});