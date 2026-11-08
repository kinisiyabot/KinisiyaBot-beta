let handler = async (m, { conn, usedPrefix, __dirname, text, isPrems }) => {
    // التحقق مما إذا كانت الرسالة مرسلة من البوت
    if (m.key.fromMe) {
        return; // إيقاف التنفيذ إذا كانت الرسالة مرسلة من البوت
    }

    const vn = './media/انها المخدرات.mp3';
    conn.sendPresenceUpdate('recording', m.chat);
    conn.sendMessage(m.chat, {audio: {url: vn}, ptt: true, mimetype: 'audio/mpeg', fileName: `انها المخدرات.mp3`}, {quoted: m});
};

// دي كلمات المساعدة والأوسمة الخاصة بالأمر
handler.help = ['notification']
handler.tags = ['notification']

// دي الكلمات اللي الكود هيتفاعل معاها
handler.customPrefix = /انتا شارب|انتا شارب حاجة|انها المخدرات|هى المخدرات|انت شارب حاجة|يا ابني انتا شارب|انتا فايق|هي المخدرات|مبسوط|رايق|مضروب|شارب ايه|شارب حاجه|هو انتا شارب|هو انت شارب|دا شارب حاجة/i;
handler.command = new RegExp;

export default handler