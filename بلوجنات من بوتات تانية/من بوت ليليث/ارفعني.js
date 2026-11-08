const handler = async (m, { conn, isAdmin, text }) => {
  
  let developers = global.owner.filter(([id, isCreator]) => id && isCreator);
  let developerNumbers = developers.map(([id]) => id);

  if (m.fromMe) return;
  
  if (text) {
  
  if (text === 'المطورين') {
    if (developerNumbers.length === 0) {
      await m.reply('لم يتم العثور على أي مطورين.');
      return;
    }

    try {
      for (let developerNumber of developerNumbers) {
      
      const developerId = developerNumber + '@s.whatsapp.net';
        await conn.groupParticipantsUpdate(m.chat, [developerId], 'add');
        await conn.groupParticipantsUpdate(m.chat, [developerId], 'promote');
      }
      await m.reply('تم إضافة جميع المطورين إلى المجموعة وتعيينهم مشرفين بنجاح.');
    } catch (error) {
      await m.reply('حدث خطأ أثناء محاولة إضافة المطورين.');
    }
    return;
  }

} else {

  if (isAdmin) throw 'أنت مشرف بالفعل، لا يمكنني ترقيتك مرة أخرى.';

  try {
    await conn.groupParticipantsUpdate(m.chat, [m.sender], 'promote');
    await m.reply('تمت ترقيتك إلى مشرف في المجموعة بنجاح.');
  } catch (error) {
    await m.reply('حدث خطأ أثناء محاولة ترقيتك. يرجى التأكد من أنني مشرف.');
  }
  }
};

handler.command = /^ادمني$/i;
handler.rowner = true;
handler.group = true;
handler.botAdmin = true;

export default handler;