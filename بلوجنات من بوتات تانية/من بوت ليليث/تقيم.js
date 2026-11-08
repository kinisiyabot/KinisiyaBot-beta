import { prepareWAMessageMedia, generateWAMessageFromContent, getDevice } from '@whiskeysockets/baileys';

const handler = async (message, { conn, text, usedPrefix }) => { 
    const deviceType = await getDevice(message.key.id);

    if (deviceType !== "desktop" && deviceType !== "web") {
        const mediaMessage = await prepareWAMessageMedia({
            image: { url: "https://files.catbox.moe/kl1b44.jpg" }
        }, { upload: conn.waUploadToServer });

        const interactiveContent = {
            body: { text: '' },
            footer: { text: "يمكنك إستخدامه عبر الاختيار من الاسفل\n*─[𝓡𝓪𝓫𝓫𝓲𝓽 𝓼𝓲𝓷𝓹𝓪𝓲 ༆]*🌟✨" },
            header: {
                title: "مرحبا يا حب 👋 أتمنى أنك بخير ♥️\nالان يمكنك تقييم البوت لكي يتحسن اكثر",
                subtitle: "خـلــيك صـــادق فــي تــقــيــمـك يا حب ❤️🥹\n\n\n\n.",
                hasMediaAttachment: true,
                imageMessage: mediaMessage.imageMessage
            },
            nativeFlowMessage: {
                buttons: [
                    { name: "quick_reply", buttonParamsJson: "{\"display_text\":\"⭐\",\"id\":\".قيم 1\"}" },
                    { name: "quick_reply", buttonParamsJson: "{\"display_text\":\"⭐⭐\",\"id\":\".قيم 2\"}" },
                    { name: "quick_reply", buttonParamsJson: "{\"display_text\":\"⭐⭐⭐\",\"id\":\".قيم 3\"}" },
                    { name: "quick_reply", buttonParamsJson: "{\"display_text\":\"⭐⭐⭐⭐\",\"id\":\".قيم 4\"}" },
                    { name: "quick_reply", buttonParamsJson: "{\"display_text\":\"⭐⭐⭐⭐⭐\",\"id\":\".قيم 5\"}" }
                ],
                messageParamsJson: ''
            }
        };

        let waMessage = generateWAMessageFromContent(message.chat, {
            viewOnceMessage: { message: { interactiveMessage: interactiveContent } }
        }, {
            userJid: conn.user.jid,
            quoted: message
        });

        conn.relayMessage(message.chat, waMessage.message, { messageId: waMessage.key.id });
    } else {
        conn.sendFile(message.chat, "JoAnimi•Error.jpg", message);
    }
};

// دالة إرسال الرد بعد التقييم
const sendFeedbackResponse = async (stars, m, conn) => {
    let feedbackMessage = '';
    let developerContact = '212705655633@s.whatsapp.net'; // تأكد أن الرقم صحيح

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

    let developerMessage = `*❒═[تم استلام تقييم للبوت]═❒*\n\n*❒ التقييم: [ ${stars} نجوم ]*\n*❒ بواسطة: [ +${m.sender.split`@`[0]} ]*\n\n*❒ نأمل أن نكون عند حسن ظنك.*`;

    try {
        await conn.sendMessage(developerContact, { text: developerMessage }, { quoted: m });
    } catch (error) {
        console.error("❌ فشل إرسال التقييم للمطور:", error);
    }

    m.reply(feedbackMessage + `\n\n*رابط التواصل مع المطور:* wa.me/${developerContact.split('@')[0]}`);
};

handler.customPrefix = /.تقيم/i; 
handler.command = new RegExp();

export default handler;