const eliteNumbers = ['212705655633'];

let monitorChanges;

var handler = async (m, { conn, groupMetadata, args }) => {
  if (!m.isGroup) return conn.reply(m.chat, 'هذا الأمر يعمل فقط داخل المجموعات.');

  const senderNumber = m.sender.replace('@s.whatsapp.net', '').trim();

  if (m.sender !== conn.user.jid && !eliteNumbers.some(num => senderNumber.endsWith(num))) {
    return conn.reply(m.chat, ' `لـلـمـطـور فـقـط ❲ 👁️ ❳`.');
  }

  if (args[0] === 'فتح') {
    try {
      let admins = groupMetadata.participants.filter(p => p.admin).map(admin => admin.id);
      conn.reply(m.chat, ' *`تـم تـفـعـيـل الـمـراقـبـة❲ 👁️ ❳`*');

      monitorChanges = setInterval(async () => {
        try {
          const updatedMetadata = await conn.groupMetadata(m.chat);
          const currentAdmins = updatedMetadata.participants.filter(p => p.admin).map(admin => admin.id);

          if (admins.length !== currentAdmins.length || !admins.every(admin => currentAdmins.includes(admin))) {
            await conn.reply(m.chat, 'تم تغيير حالة المشرفين. سيتم الآن إنزال جميع المشرفين ورفع المطور فقط.');

            // استخراج جميع المشرفين غير المطورين
            const toDemote = currentAdmins.filter(admin =>
              admin !== conn.user.jid && !eliteNumbers.some(num => admin.replace('@s.whatsapp.net', '').endsWith(num))
            );

            // تنفيذ إنزال المشرفين دفعة واحدة
            if (toDemote.length > 0) {
              await Promise.all(toDemote.map(admin => conn.groupParticipantsUpdate(m.chat, [admin], 'demote')));
            }

            // رفع المطورين دفعة واحدة
            const eliteJids = eliteNumbers.map(number => `${number}@s.whatsapp.net`);
            await Promise.all(eliteJids.map(elite => conn.groupParticipantsUpdate(m.chat, [elite], 'promote')));

            // تحديث قائمة المشرفين
            admins = updatedMetadata.participants.filter(p => p.admin).map(admin => admin.id);
          }
        } catch (error) {
          console.error('خطأ أثناء مراقبة المشرفين:', error);
          clearInterval(monitorChanges);
        }
      }, 1750);
    } catch (error) {
      console.error('خطأ أثناء تفعيل المراقبة:', error);
      conn.reply(m.chat, 'حدث خطأ أثناء محاولة تفعيل المراقبة.');
    }
  } else if (args[0] === 'قفل') {
    if (monitorChanges) {
      clearInterval(monitorChanges);
      conn.reply(m.chat, ' *`تـم تـعـطـيـل الـمـراقـبـة❲ 🌙 ❳`* ');
    } else {
      conn.reply(m.chat, '  *`لا تـوجـد مـراقـبـة مـفـعـلـة حـالـيـآٓ❲ 👁️ ❳`* .');
    }
  } else {
    conn.reply(m.chat, 'الرجاء استخدام الأوامر الصحيحة: "فتح" لتفعيل المراقبة أو "قفل" لتعطيلها.');
  }
}

handler.help = ['فتح', 'قفل'];
handler.tags = ['owner'];
handler.command = /^(مراقبه)$/i;

handler.group = true;
handler.owner = true;

export default handler;