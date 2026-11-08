import { prepareWAMessageMedia, generateWAMessageFromContent, getDevice } from 'baileys-pro';

const handler = async (message, { conn, text, usedPrefix }) => { 
    const deviceType = await getDevice(message.key.id);

    if (deviceType !== "desktop" && deviceType !== "web") {
        const mediaMessage = await prepareWAMessageMedia({
            image: { url: "https://i.postimg.cc/13nH9HwR" }
        }, { upload: conn.waUploadToServer });

        const interactiveContent = {
            body: { text: '' },
            footer: { text: "يمكنك إستخدامه عبر الاختيار من الاسفل\n*─[༄𝐈𝐌 𝐘𝐄𝐑𝐈𝐓𝐂𝐇𝐈༆]*🌟✨" },
            header: {
                title: "مرحبا يا حب 👋 أتمنى أنك بخير ♥️\nالان يمكنك تقييم البوت لكي يتحسن اكثر",
                subtitle: "خـلــيك صـــادق فــي تــقــيــمـك يا حب ❤️🥹\n\n\n\n.",
                hasMediaAttachment: true,
                imageMessage: mediaMessage.imageMessage
            },
            nativeFlowMessage: {
                buttons: [
                    { name: "quick_reply", buttonParamsJson: "{\"display_text\":\"⭐\",\"id\":\"rate_1\"}" },
                    { name: "quick_reply", buttonParamsJson: "{\"display_text\":\"⭐⭐\",\"id\":\"rate_2\"}" },
                    { name: "quick_reply", buttonParamsJson: "{\"display_text\":\"⭐⭐⭐\",\"id\":\"rate_3\"}" },
                    { name: "quick_reply", buttonParamsJson: "{\"display_text\":\"⭐⭐⭐⭐\",\"id\":\"rate_4\"}" },
                    { name: "quick_reply", buttonParamsJson: "{\"display_text\":\"⭐⭐⭐⭐⭐\",\"id\":\"rate_5\"}" }
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

        await conn.relayMessage(message.chat, waMessage.message, { messageId: waMessage.key.id });
    } else {
        await conn.sendFile(message.chat, "JoAnimi•Error.jpg", message);
    }
};

handler.before = async (m, { conn }) => {
    if (m.type === 'interactive_response') {
        let buttonId = '';
        try {
            const response = JSON.parse(m.response);
            buttonId = response.id || response.buttonId;
        } catch {
            buttonId = m.response?.id || '';
        }
        
        if (buttonId && buttonId.startsWith('rate_')) {
            const stars = parseInt(buttonId.split('_')[1]);
            const developerContact = '212693863911@s.whatsapp.net';
            
            let feedbackMessage = '';
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

            let developerMessage = `*❒═[تم استلام تقييم للبوت]═❒*\n\n*❒ التقييم: [ ${stars} نجوم ]*\n*❒ بواسطة: [ +${m.sender.split('@')[0]} ]*\n\n*❒ نأمل أن نكون عند حسن ظنك.*`;

            try {
                await conn.sendMessage(developerContact, { text: developerMessage }, { quoted: m });
            } catch (error) {
                console.error("❌ فشل إرسال التقييم للمطور:", error);
            }

            await m.reply(feedbackMessage + `\n\n*رابط التواصل مع المطور:* wa.me/${developerContact.split('@')[0]}`);
            return true;
        }
    }
    return false;
};

handler.customPrefix = /^(تقيم|تقييم|قيم)$/i; 
handler.command = new RegExp();

export default handler;
