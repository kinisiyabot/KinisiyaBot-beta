import baileys from 'baileys-pro';

// 1. التعريفات والروابط العامة للبوت
global.gt = '𝐊𝐈𝐍𝐈𝐒𝐈𝐘𝐀 𝐁𝐎𝐓';
global.gataMenu = 'https://telegra.ph/file/a1a6fff7242dc17877210c3974019c0f.jpg'; // صورة افتراضية

// روابط القنوات والمجموعات للاستخدام العشوائي
global.canal1 = 'https://whatsapp.com/channel/0029Vb80wch30LKFioKenc2V';
global.canal2 = 'https://whatsapp.com/channel/0029Vb80wch30LKFioKenc2V';
global.canal3 = 'https://whatsapp.com/channel/0029Vb80wch30LKFioKenc2V';
global.canal4 = 'https://whatsapp.com/channel/0029Vb80wch30LKFioKenc2V';
global.yt = 'https://youtube.com';
global.grupo1 = 'https://chat.whatsapp.com/HSuLqW2SjNt5U6aZR5trl9';
global.grupo2 = 'https://chat.whatsapp.com/HSuLqW2SjNt5U6aZR5trl9';

// 2. رسالة وهمية مقتبسة (fkontak) لتجميل الإشعارات
global.fkontak = {
    key: {
        participant: '0@s.whatsapp.net',
        remoteJid: 'status@broadcast'
    },
    message: {
        contactMessage: {
            displayName: '♡︎✿︎𝐊𝐈𝐍𝐈𝐒𝐈𝐘𝐀 𝐁𝐎𝐓ꨄ︎ఌ',
            vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;KINISIYA;;;\nFN:KINISIYA BOT\nitem1.TEL;waid=212693863911:212693863911\nitem1.X-ABLabel:مطور البوت\nEND:VCARD`
        }
    }
};

// 3. نصوص التنبيهات والتغييرات للـ Autodetect (قالب mid)
global.mid = {
    smsAutodetec1: (usuario, m) => `⛄┊≡ ◡̈⃝🧸↜ قام ${usuario} بتغيير اسم المجموعة إلى:\n*${m.messageStubParameters[0]}*`,
    smsAutodetec2: (usuario) => `⛄┊≡ ◡̈⃝🧸↜ قام ${usuario} بتغيير صورة المجموعة.`,
    smsAutodetec3: (usuario, m) => `⛄┊≡ ◡̈⃝🧸↜ قام ${usuario} بتغيير وصف المجموعة إلى:\n${m.messageStubParameters[0]}`,
    smsAutodetec4: (usuario) => `⛄┊≡ ◡̈⃝🧸↜ قام ${usuario} بتعديل إعدادات المجموعة (المشرفون فقط هم من يستطيعون التعديل).`,
    smsAutodetec5: (groupMetadata, usuario) => `⛄┊≡ ◡̈⃝🧸↜ قام ${usuario} بإعادة ضبط رابط الدعوة للمجموعة.`,
    smsAutodetec6: (m) => `⛄┊≡ ◡̈⃝🧸↜ تم فتح المجموعة لجميع الأعضاء لإرسال الرسائل.`,
    smsAutodetec7: (m, usuario) => `⛄┊≡ ◡̈⃝🧸↜ تم ترقية ${usuario} إلى مشرف في المجموعة.`,
    smsAutodetec8: (m, usuario) => `⛄┊≡ ◡̈⃝🧸↜ تم تنزيل ${usuario} من رتبة المشرف.`,
    smsAutodetec9: (usuario) => `⛄┊≡ ◡̈⃝🧸↜ قام ${usuario} بتغيير مدة الرسائل المؤقتة.`,
    smsAutodetec10: (usuario) => `⛄┊≡ ◡̈⃝🧸↜ قام ${usuario} بتعديل إعدادات الانضمام إلى المجموعة.`
};

// 4. نصوص اللغات العامة (lenguajeGB)
global.lenguajeGB = {
    smsAvisoIIG: () => `📢 *تنسيق وتنبيه جديد من KINISIYA BOT:*\n\n`
};

export default {
    gt: global.gt,
    fkontak: global.fkontak,
    mid: global.mid,
    lenguajeGB: global.lenguajeGB
};
