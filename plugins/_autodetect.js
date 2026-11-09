import { WAMessageStubType } from '@whiskeysockets/baileys';

export async function before(m, { conn, participants, groupMetadata }) {
    if (!m.messageStubType ||!m.isGroup) return;

    const fkontak = {
        "key": { "participants": "0@s.whatsapp.net", "remoteJid": "status@broadcast", "fromMe": false, "id": "Halo" },
        "message": { "contactMessage": { "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` }},
        "participant": "0@s.whatsapp.net"
    };

    let chat = global.db.data.chats[m.chat];
    if (!chat) return;

    let usuario = `@${m.sender.split('@')[0]}`;
    let pp = await conn.profilePictureUrl(m.chat, 'image').catch(_ => null) || 'https://qu.ax/QGAVS.jpg';

    let nombre = `*❍━━━══━━❪🫦❫━━══━━━❍*\n*❍⇇تم تغير اسم المجموعه*\n*❍⇇بواسطت↜❪${usuario}❫*\n*❍⇇الاسم الجديد↶*\n❍⇇┊${m.messageStubParameters[0]}┊\n*❍━━━══━━❪🫦❫━━══━━━❍*`;
    let foto = `*❍━━━══━━❪🫦❫━━══━━━❍*\n*❍⇇تم تغير صوره المجموعه*\n*❍⇇بواسطت↜❪${usuario}❫*\n*❍━━━══━━❪🫦❫━━══━━━❍*`;
    let edit = `*❍━━━══━━❪🫦❫━━══━━━❍*\n*❍⇇تم تغير اعدادات المجموعه*\n*❍⇇بواسطت↜❪${usuario}❫*\n❍⇇${m.messageStubParameters[0] == 'on'? 'لادمن-فقط' : 'الجميع'} *من يمكنهم تحديث*\n*❍━━━══━━❪🫦❫━━══━━━❍*`;
    let newlink = `*❍━━━══━━❪🫦❫━━══━━━❍*\n*❍⇇تم تغير رابط المجموعه*\n*❍⇇بواسطت↜❪${usuario}❫*\n*❍━━━══━━❪🫦❫━━══━━━❍*`;
    let status = `*❍━━━══━━❪🫦❫━━══━━━❍*\n*❍⇇تم تغير اعدادات المجموعه*\n*❍⇇بواسطت↜❪${usuario}❫*\n❍⇇${m.messageStubParameters[0] == 'on'? 'لادمن-فقط' : 'الجميع'} *من يمكنهم تحديث*\n*❍━━━══━━❪🫦❫━━══━━━❍*`;
    let admingp = `*❍━━━══━━❪🫦❫━━══━━━❍*\n*❍⇇تم ترقيه↜❪@${m.messageStubParameters[0].split('@')[0]}❫*\n*❍⇇بواسطت↜❪${usuario}❫*\n*❍↜مبارك لك الترقيه🐤👏*\n*❍━━━══━━❪🫦❫━━══━━━❍*`;
    let noadmingp = `*❍━━━══━━❪🫦❫━━══━━━❍*\n*❍⇇تم اعفاء↜❪@${m.messageStubParameters[0].split('@')[0]}❫*\n*❍⇇بواسطت↜❪${usuario}❫*\n*❍↜للاسف تم اعفائك من رتبتك😔💔*\n*❍━━━══━━❪🫦❫━━══━━━❍*`;

    if (chat.detect && m.messageStubType == 21) {
        await conn.sendMessage(m.chat, { text: nombre, mentions: [m.sender] }, { quoted: fkontak });
    } else if (chat.detect && m.messageStubType == 22) {
        await conn.sendMessage(m.chat, { image: { url: pp }, caption: foto, mentions: [m.sender] }, { quoted: fkontak });
    } else if (chat.detect && m.messageStubType == 23) {
        await conn.sendMessage(m.chat, { text: newlink, mentions: [m.sender] }, { quoted: fkontak });
    } else if (chat.detect && m.messageStubType == 25) {
        await conn.sendMessage(m.chat, { text: edit, mentions: [m.sender] }, { quoted: fkontak });
    } else if (chat.detect && m.messageStubType == 26) {
        await conn.sendMessage(m.chat, { text: status, mentions: [m.sender] }, { quoted: fkontak });
    } else if (chat.detect && m.messageStubType == 29) {
        await conn.sendMessage(m.chat, { text: admingp, mentions: [m.sender, m.messageStubParameters[0]] }, { quoted: fkontak });
    } else if (chat.detect && m.messageStubType == 30) {
        await conn.sendMessage(m.chat, { text: noadmingp, mentions: [m.sender, m.messageStubParameters[0]] }, { quoted: fkontak });
    }
}