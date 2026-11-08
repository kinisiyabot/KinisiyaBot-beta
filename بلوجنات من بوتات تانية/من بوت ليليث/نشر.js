let handler = async (m, { conn, isROwner, text }) => {
    const delay = time => new Promise(res => setTimeout(res, time));
    const maxRetries = 3; // أقصى عدد محاولات إعادة الإرسال
    const maxChats = 1000; // أقصى عدد شاتات للإرسال

    // الحصول على جميع الشاتات (الـ Private Chats والمجموعات)
    let chats = Object.entries(conn.chats).filter(([jid, chat]) => 
        (jid.endsWith('@g.us') || jid.endsWith('@s.whatsapp.net')) && chat.isChats && !chat.metadata?.read_only && !chat.metadata?.announce
    ).map(([jid, chat]) => ({ id: jid, name: chat.name || jid }));

    // تحديد عدد الشاتات التي سيتم إرسال الرسالة إليها
    let chatsToSend = chats.slice(0, maxChats);

    // الحصول على النص المرسل من الرسالة الأصلية أو النص المحدد
    let pesan = m.quoted && m.quoted.text ? m.quoted.text : text;
    if (!pesan) throw '*⚠️ أدخل النص الذي تريده*';

    let startTime = Date.now(); // بدء توقيت الإرسال
    let successfulGroups = [];
    let successfulPrivates = [];

    // إرسال الرسالة إلى الشاتات المحددة
    for (let { id, name } of chatsToSend) {
        await delay(500); // تأخير لمدة 500 مللي ثانية
        let sent = false;
        let attempts = 0;

        while (!sent && attempts < maxRetries) {
            try {
                await conn.sendMessage(id, {
                    text: '––––––『 *إذاعة* 』––––––\n\n' + pesan + '\n\n*💌  هذا بيان رسمي من مالك البوت تربو*'
                });

                // تحديد ما إذا كان الشات مجموعة أو خاص
                if (id.endsWith('@g.us')) {
                    successfulGroups.push(name); // إضافة اسم المجموعة إلى قائمة الناجحة
                } else {
                    successfulPrivates.push(name); // إضافة اسم الشات الخاص إلى قائمة الناجحة
                }

                sent = true; // تم الإرسال بنجاح
            } catch (error) {
                attempts++;
                console.error(`خطأ في إرسال الرسالة إلى ${name} (محاولة ${attempts} من ${maxRetries}):`, error);
                await delay(1000); // تأخير قبل إعادة المحاولة
            }
        }

        if (!sent) {
            console.error(`فشل إرسال الرسالة إلى ${name} بعد ${maxRetries} محاولات.`);
        }
    }

    let endTime = Date.now(); // نهاية توقيت الإرسال
    let time2 = ((endTime - startTime) / 1000).toFixed(2); // حساب الوقت بالثواني

    // إعداد عدد المجموعات والشاتات الخاصة
    let groupsCount = successfulGroups.length;
    let privatesCount = successfulPrivates.length;
    let totalCount = groupsCount + privatesCount; // المجموع الكلي

    // إعداد الرسالة النهائية
    let message = `*📑 الرسالة اتبعتت لـ ${totalCount} شاتات*\n\n`;
    message += `*عدد المجموعات التي تم إرسال الرسالة إليها: ${groupsCount}*\n`;
    message += `*عدد الشاتات الخاصة التي تم إرسال الرسالة إليها: ${privatesCount}*\n`;
    message += `*الوقت الكلي للإرسال: ${time2} ثواني*`;

    // رد على المستخدم بعد إرسال الرسائل
    await m.reply(message);
};

handler.help = ['broadcastall', 'bcall'].map(v => v + ' <teks>');
handler.tags = ['owner'];
handler.command = /^broadcast(all|group|gc|private)|نشر|بث|اذاعه|ذيع|انشردا|انشرها$/i;
handler.owner = true;

export default handler;