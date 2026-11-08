let handler = async (m, { conn, text }) => {
    let user = global.db.data.users[m.sender];
    let name = conn.getName(m.sender);
    let taguser = '@' + m.sender.split("@s.whatsapp.net")[0];
    let message = `لسه ما حد ضاف استماره جرب الاستماره التانيه`;
    

    conn.sendFile(m.chat, 'https://telegra.ph/file/02651f9c930babf8b2fc6.jpg', 'image.jpg', message, m);
};

handler.customPrefix = /^(11|استماره2|الاستماره2)$/i;
handler.command = new RegExp;

export default handler;
