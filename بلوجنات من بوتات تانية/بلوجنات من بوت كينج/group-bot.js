let handler = async (m, { conn, text, args }) => {

  if (!args[0]) {
    const estado = global.db.data.chats[m.chat]?.bannedGrupo ?? false;
    const estadoTexto = estado ? '✗ متوقف' : '✓ شغال';
    const info = `*🤖 حالة البوت في المجموعة*\n` +
                 `📌 *الحالة الحالية:* ${estadoTexto}\n\n` +
                 `🌱 يمكنك تغييره باستخدام:\n` +
                 `> ● _تشغيل ›_ *بوت تشغيل*\n` +
                 `> ● _إيقاف ›_ *بوت إيقاف*`;
    return m.reply(info);
  }

  try {
    const chat = global.db.data.chats[m.chat];
    const estado = chat.bannedGrupo ?? false;
    const accion = args[0].toLowerCase();

    if (accion === 'إيقاف') {
      if (estado) return m.reply('⚠️ البوت متوقف بالفعل في هذه المجموعة.');
      chat.bannedGrupo = true;
      return m.reply('🛑 تم *إيقاف* البوت في هذه المجموعة.');
    }

    if (accion === 'تشغيل') {
      if (!estado) return m.reply('⚠️ البوت يعمل بالفعل في هذه المجموعة.');
      chat.bannedGrupo = false;
      return m.reply('✅ تم *تشغيل* البوت في هذه المجموعة.');
    }

    return m.reply('🌿 استخدم: *بوت تشغيل* أو *بوت إيقاف* لتغيير الحالة.');
  } catch (e) {
    await m.reply('❌ حدث خطأ أثناء محاولة تغيير حالة البوت.');
  }
};

handler.tags = ['المجموعة'];
handler.help = ['البوت'];
handler.command = ['البوت'];
handler.admin = true;

export default handler;