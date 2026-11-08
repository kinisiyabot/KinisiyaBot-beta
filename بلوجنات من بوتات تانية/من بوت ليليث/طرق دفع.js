const handler = async (m, { conn, command }) => {
    const paymentMethods = {
        "طرق_الدفع_مصر": "💰 *طرق الدفع في مصر:*\n- Vodafone Cash\n- PayPal\n- كريبتو USDT, BTC",
        "طرق_الدفع_السعودية": "💰 *طرق الدفع في السعودية:*\n- STC Pay\n- PayPal\n- كريبتو USDT, BTC",
        "طرق_الدفع_الامارات": "💰 *طرق الدفع في الإمارات:*\n- تحويل بنكي\n- PayPal\n- كريبتو USDT, BTC",
        "طرق_الدفع_الجزائر": "💰 *طرق الدفع في الجزائر:*\n- CCP\n- كريبتو USDT, BTC\n- PayPal",
        "طرق_الدفع_سوريا": "💰 *طرق الدفع في سوريا:*\n- MTN Cash\n- Syriatel Cash\n- PayPal",
        "طرق_الدفع_لبنان": "💰 *طرق الدفع في لبنان:*\n- OMT\n- Western Union\n- PayPal"
    };

    // إذا كان المستخدم يطلب طرق الدفع لدولة معينة
    if (paymentMethods[command]) {
        await conn.sendMessage(m.chat, { text: paymentMethods[command] }, { quoted: m });
        return;
    }

    // إرسال الرسالة التفاعلية
    await conn.relayMessage(m.chat, {
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    header: {
                        title: '*🤖 ╎ اشتراك في البوت ╎*'
                    },
                    body: {
                        text: `*⚡ البوت مدفوع! إليك تفاصيل الاشتراك:*\n\n` +
                              `💰 *الأسعار:*\n` +
                              `- **دخول البوت إلى مجموعة واحدة**: *1$*\n` +
                              `- **إضافة البوت إلى مملكتك الخاصة**: *3$*\n` +
                              `📌 *المقايضة مقبولة!*\n` +
                              `🎮 *نقبل أيضًا بشحن الألعاب (PUBG, Free Fire, وغيرها)*\n\n` +
                              `💳 *طرق الدفع:*\n` +
                              `- *PayPal*\n` +
                              `- *كريبتو USDT, BTC*\n` +
                              `- *Vodafone Cash (للدول المدعومة)*\n\n` +
                              `☎️ *للتواصل مع المطورين مباشرة:*\n` +
                              `- 🇱🇧 *لبنان:* +96171177373\n` +
                              `- 🇸🇾 *سوريا:* +963943703702\n\n` +
                              `🔹 *اختر دولتك لرؤية طرق الدفع المتاحة لك!*`
                    },
                    nativeFlowMessage: {
                        buttons: [
                            {
                                name: 'single_select',
                                buttonParamsJson: JSON.stringify({
                                    title: '🌍 اختر دولتك لرؤية طرق الدفع',
                                    sections: [
                                        {
                                            title: 'قائمة الدول',
                                            highlight_label: 'اختر دولتك لرؤية طرق الدفع المتاحة فيها',
                                            rows: [
                                                { title: '🇪🇬 مصر', description: 'Vodafone Cash, PayPal', id: '.طرق_الدفع_مصر' },
                                                { title: '🇸🇦 السعودية', description: 'STC Pay, PayPal, كريبتو', id: '.طرق_الدفع_السعودية' },
                                                { title: '🇦🇪 الإمارات', description: 'Bank Transfer, PayPal, كريبتو', id: '.طرق_الدفع_الامارات' },
                                                { title: '🇩🇿 الجزائر', description: 'CCP, كريبتو, PayPal', id: '.طرق_الدفع_الجزائر' },
                                                { title: '🇸🇾 سوريا', description: 'MTN Cash, Syriatel Cash, PayPal', id: '.طرق_الدفع_سوريا' },
                                                { title: '🇱🇧 لبنان', description: 'OMT, Western Union, PayPal', id: '.طرق_الدفع_لبنان' },
                                                { title: '🌍 دولة أخرى؟', description: 'تواصل معنا لمعرفة الخيارات المتاحة', id: '.اشتراك_تواصل' }
                                            ]
                                        }
                                    ]
                                }),
                                messageParamsJson: ''
                            }
                        ]
                    }
                }
            }
        }
    }, {});
};

handler.command = ['اشتراك', 'طرق_الدفع_مصر', 'طرق_الدفع_السعودية', 'طرق_الدفع_الامارات', 'طرق_الدفع_الجزائر', 'طرق_الدفع_سوريا', 'طرق_الدفع_لبنان'];

export default handler;