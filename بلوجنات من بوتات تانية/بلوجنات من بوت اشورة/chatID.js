const handler = async (m, { conn }) => {
    try {
        const chatId = m.key.remoteJid; // ID الجروب أو الشخص
        await conn.sendMessage(m.key.remoteJid, {
            text: `📌 ID هذا الشات هو:\n${chatId}`
        }, { quoted: m });
    } catch (err) {
        console.error(err);
    }
};

handler.command = ['getid'];
handler.description = 'shaty';
handler.usage = '.getid';
handler.category = 'info';

export default handler;