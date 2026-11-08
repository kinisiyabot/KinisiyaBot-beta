let handler = async (m, { conn, usedPrefix, __dirname, text, isPrems }) => {
    // التحقق مما إذا كانت الرسالة مرسلة من البوت
    if (m.key.fromMe) {
        return; // إيقاف التنفيذ إذا كانت الرسالة مرسلة من البوت
    }

    const vn = 'media/وكلاك.mp3';
    conn.sendPresenceUpdate('recording', m.chat);
    conn.sendMessage(m.chat, {audio: {url: vn}, ptt: true, mimetype: 'audio/mpeg', fileName: `وكلاك.mp3`}, {quoted: m});
};

// دي كلمات المساعدة والأوسمة الخاصة بالأمر
handler.help = ['وكلاك']
handler.tags = ['notification']

// دي الكلمات اللي الكود هيتفاعل معاها
handler.customPrefix = /وكلاك|متغاظ|متغاظ مني|هتموت من غيظك|خليها تاكلك|موت متغاظ/i;
handler.command = new RegExp;

export default handler