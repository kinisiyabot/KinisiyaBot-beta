let areJidsSameUser = await import(global.baileys);

let handler = async (m, { conn, text, participants, args, command }) => {
    let member = participants.map(u => u.id);
    let sum = !text ? member.length : text;
    let total = 0;
    let sider = [];

    for (let i = 0; i < sum; i++) {
        let users = m.isGroup ? participants.find(u => u.id == member[i]) : {};
        if ((typeof global.db.data.users[member[i]] == 'undefined' || global.db.data.users[member[i]].chat == 0) && !users.isAdmin && !users.isSuperAdmin) {
            if (typeof global.db.data.users[member[i]] !== 'undefined') {
                if (global.db.data.users[member[i]].whitelist == false) {
                    total++;
                    sider.push(member[i]);
                }
            } else {
                total++;
                sider.push(member[i]);
            }
        }
    }

    const delay = time => new Promise(res => setTimeout(res, time));

    switch (command) {
        case "الاشباح":
            if (total == 0) return conn.reply(m.chat, `⚠️ هذا الجروب نشط ولا يوجد به أشباح :D`, m);
            m.reply(`⚠️ مراجعة غير النشطين ⚠️\n\nجروب: ${await conn.getName(m.chat)}\nعدد الأعضاء: ${sum}\n\n[ 👻 قائمة الأشباح 👻 ]\n${sider.map(v => '  👉🏻 @' + v.replace(/@.+/, '')).join('\n')}\n\n*ملحوظة: قد لا تكون هذه النتيجة دقيقة بنسبة 100% حيث يبدأ الروبوت في حساب الرسائل منذ تفعيله في هذا الرقم*`, null, { mentions: sider });
            break;

        case "طرد_الاشباح":
            if (total == 0) return conn.reply(m.chat, `⚠️ هذا الجروب نشط ولا يوجد به أشباح :D`, m);
            await m.reply(`⚠️ سيتم طرد الأعضاء غير النشطين ⚠️\n\nجروب: ${await conn.getName(m.chat)}\nعدد الأعضاء: ${sum}\n\n[ 👻 الأشباح الذين سيتم طردهم 👻 ]\n${sider.map(v => '@' + v.replace(/@.+/, '')).join('\n')}\n\n*سيتم طرد الأعضاء المدرجين في القائمة، بدءًا من بعد 20 ثانية، وسيتم طرد عضو كل 10 ثواني*`, null, { mentions: sider });
            await delay(1 * 10000);
            let chat = global.db.data.chats[m.chat];
            chat.welcome = false;

            try {
                let users = m.mentionedJid.filter(u => !areJidsSameUser(u, conn.user.id));
                let kickedGhost = sider.map(v => v.id).filter(v => v !== conn.user.jid);
                for (let user of users) {
                    if (user.endsWith('@s.whatsapp.net') && !(participants.find(v => areJidsSameUser(v.id, user)) || { admin: true }).admin) {
                        let res = await conn.groupParticipantsUpdate(m.chat, [user], 'remove');
                        kickedGhost.concat(res);
                        await delay(1 * 10000);
                    }
                }
            } finally {
                chat.welcome = true;
            }
            break;
    }
}

handler.command = /^(طرد_الاشباح)$/i;
handler.group = handler.botAdmin = handler.admin = true;
handler.fail = null;
export default handler;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));