let handler = async (m, { conn, text, usedPrefix, command }) => {
    let stars = parseInt(text); // تحويل النص إلى رقم للحصول على عدد النجوم
    let feedbackMessage = '';
    let developerContact = '2010 05502208@s.whatsapp.net'; // رقم المطور للتواصل

    // إعداد الرد بناءً على عدد النجوم
    switch (stars) {
        case 1:
            feedbackMessage = '*❒═[تقييم بنجمة واحدة]═❒*\n\n*❒ أوووه يا حب، تقييم نجمة بس؟ قولنا إيه اللي مضايقك ونحسنه! 🙁*';
            break;
        case 2:
            feedbackMessage = '*❒═[تقييم بنجمتين]═❒*\n\n*❒ مش بطال بس نقدر نعمل أحسن من كده، قول لنا نغير إيه! 😅*';
            break;
        case 3:
            feedbackMessage = '*❒═[تقييم بثلاث نجوم]═❒*\n\n*❒ تقييم لطيف، مبسوط إنك معانا، بس عايزين نوصل للكمال يا حب 🌟*';
            break;
        case 4:
            feedbackMessage = '*❒═[تقييم بأربع نجوم]═❒*\n\n*❒ تقييم جامد يا نجم! بنوعدك دايمًا نبقى على مستوى توقعاتك 💪*';
            break;
        case 5:
            feedbackMessage = '*❒═[تقييم بخمس نجوم]═❒*\n\n*❒ الله عليك يا أسطورة! شكراً على دعمك، انت كده بتخلينا نطير من الفرحة! 🚀❤️*';
            break;
        default:
            feedbackMessage = '*❒═[تقييم غير صالح]═❒*\n\n*❒ من فضلك اختار عدد النجوم من 1 لحد 5 يا حب 😅*';
            break;
    }

    // رسالة للمطور تحتوي على التقييم واسم المستخدم
    let developerMessage = `*❒═[تم استلام تقييم للبوت]═❒*\n\n*❒ التقييم: [ ${stars} نجوم ]*\n*❒ بواسطة: [ +${m.sender.split`@`[0]} ]*\n\n*❒ نأمل أن نكون عند حسن ظنك.*`;

    // إرسال رسالة للمطور
    conn.reply(developerContact, developerMessage, null, { contextInfo: { mentionedJid: [m.sender] } });

    // رد البوت للمستخدم
    m.reply(feedbackMessage + `\n\n*رابط التواصل مع المطور:* wa.me/${developerContact.split('@')[0]}`);
};


handler.command = /^(قيم)$/i;
export default handler;