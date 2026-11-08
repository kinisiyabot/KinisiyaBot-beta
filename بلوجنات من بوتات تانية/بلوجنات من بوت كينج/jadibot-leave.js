let handler = async (m, { conn, args }) => {
  const isSocketOwner = [
    conn.user.jid,
    ...(global.owner || []).map(n => n + '@s.whatsapp.net'),
  ].includes(m.sender);

  if (!isSocketOwner) {
    return m.reply('⚠️ هذا الأمر مخصص فقط لمالك البوت.');
  }

  const groupId = args[0] || m.chat;

  try {
    await conn.groupLeave(groupId);
    await m.reply('👋 تم مغادرة المجموعة بنجاح.');
  } catch (error) {
    console.error(error);
    m.reply('❌ لم أستطع مغادرة المجموعة، حاول مرة أخرى.');
  }
};

handler.help = ['مغادرة'];
handler.tags = ['إدارة-البوت'];
handler.command = ['مغادرة', 'اخرج'];

export default handler;