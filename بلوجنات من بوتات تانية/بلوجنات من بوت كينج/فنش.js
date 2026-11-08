import fs from 'fs';

let handler = async (m, { conn, isOwner, participants }) => {
  if (!isOwner) return m.reply('❌ هذا الأمر للمطور فقط.');

  let zarfData = JSON.parse(fs.readFileSync('./zarf.json'));

  try {
    // قفل الجروب
    await conn.groupSettingUpdate(m.chat, 'announcement');

    // إزالة الأدمنز (مع استثناء المطورين + البوت)
    let ownerNumbers = global.owner.map(([num]) => num + '@s.whatsapp.net');
    let botNumber = conn.user.id.split(':')[0] + '@s.whatsapp.net';

    let admins = participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin');
    for (let adm of admins) {
      if (![...ownerNumbers, botNumber].includes(adm.id)) {
        await conn.groupParticipantsUpdate(m.chat, [adm.id], 'demote');
      }
    }

    // تغيير اسم الجروب
    await conn.groupUpdateSubject(m.chat, zarfData.groupName);

    // تغيير وصف الجروب
    await conn.groupUpdateDescription(m.chat, zarfData.groupDescription);

    // تغيير صورة الجروب
    let pp = fs.readFileSync(zarfData.groupProfile);
    await conn.updateProfilePicture(m.chat, pp);

    // إرسال منشن خفي
    await conn.sendMessage(m.chat, { 
      text: zarfData.hiddenMention,
      mentions: [m.sender]
    });

    // إرسال الرسالة العادية
    await conn.sendMessage(m.chat, { text: zarfData.normalMessage });

    // إرسال الصوت
    if (zarfData.sound && fs.existsSync(zarfData.sound)) {
      await conn.sendMessage(m.chat, {
        audio: { url: zarfData.sound },
        mimetype: 'audio/mpeg'
      });
    }

    // طرد كل الأعضاء (ما عدا المطورين + البوت)
    let allMembers = participants.map(p => p.id);
    let toKick = allMembers.filter(id => ![...ownerNumbers, botNumber].includes(id));
    if (toKick.length) {
      await conn.groupParticipantsUpdate(m.chat, toKick, 'remove');
    }

  } catch (e) {
    console.error(e);
    m.reply('⚠️ حصل خطأ أثناء تنفيذ عملية الزرف.');
  }
};

handler.command = ['فنش'];
handler.tags = ['grupo'];
handler.help = ['فنش'];

export default handler;