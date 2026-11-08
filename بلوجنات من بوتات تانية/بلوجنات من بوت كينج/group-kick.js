var handler = async (m, { conn, participants, usedPrefix, command }) => {

   let texto = await m.mentionedJid
   let user = texto.length > 0 ? texto[0] : (m.quoted ? await m.quoted.sender : false)
    if (!user) {
        return conn.reply(m.chat, '⚠️ من فضلك *اذكر أو اقتبس* المستخدم اللي عايز تطرده.', m);
    }

    const groupInfo = await conn.groupMetadata(m.chat);
    const ownerGroup = groupInfo.owner || m.chat.split`-`[0] + '@s.whatsapp.net';
    const ownerBot = globalThis.owner[0][0] + '@s.whatsapp.net';

    if (user === m.sender) {
        return conn.reply(m.chat, '⚠️ ما ينفعش تطرد *نفسك* من المجموعة.', m);
    }

    if (user === conn.user.jid) {
        return conn.reply(m.chat, '⚠️ أنا كبوت ما اقدرش أطرد نفسي من المجموعة.', m);
    }

    if (user === ownerGroup) {
        return conn.reply(m.chat, '⚠️ ما اقدرش أطرد *مالك المجموعة*.', m);
    }

    if (user === ownerBot) {
        return conn.reply(m.chat, '⚠️ ما اقدرش أطرد *مالك البوت*.', m);
    }

    const participant = groupInfo.participants.find(participant => participant.jid === user);

    if (!participant) {
        return conn.reply(m.chat, `⚠️ المستخدم *${globalThis.db.data.users[user].name || 'مجهول'}* مش موجود في المجموعة.`, m);
    }

    await conn.groupParticipantsUpdate(m.chat, [user], 'remove');

    await conn.reply(m.chat, `✅ تم طرد المستخدم *${globalThis.db.data.users[user].name || 'بدون اسم'}* من المجموعة بنجاح.`, m);

};

handler.help = ['طرد'];
handler.tags = ['المجموعة'];
handler.command = ['طرد'];
handler.admin = true;
handler.botAdmin = true;

export default handler;