import { prepareWAMessageMedia, generateWAMessageFromContent } from "@whiskeysockets/baileys";

const handler = async (m, { conn }) => {
    const coverImageUrl = 'https://files.catbox.moe/cxw15s.jpg'; // صورة الاشتراك

    const messa = await prepareWAMessageMedia(
        { image: { url: coverImageUrl } },
        { upload: conn.waUploadToServer }
    );

    const interactiveMessage = {
        body: { text: "✨ *𓆩 𝓡𝓪𝓫𝓫𝓲𝓽 𝓼𝓲𝓷𝓹𝓪𝓲 ༆ ⌯ اختر نوع الاشتراك الذي تريده ⌯ 💎* ✨" },
        footer: { text: "𝓡𝓪𝓫𝓫𝓲𝓽 𝓼𝓲𝓷𝓹𝓪𝓲 ༆" },
        header: {
            title: "╭───⟢❲ 💖 𝓡𝓪𝓫𝓫𝓲𝓽 𝓼𝓲𝓷𝓹𝓪𝓲 ༆ 💖 ❳╰───⟢",
            hasMediaAttachment: true,
            imageMessage: messa.imageMessage,
        },
        nativeFlowMessage: {
            buttons: [
                {
                    name: 'single_select',
                    buttonParamsJson: JSON.stringify({
                        title: "💎 القائمة الرئيسية",
                        sections: [
                            {
                                title: "🎀 هل تريد البوت في جروبك؟ 🎀",
                                rows: [
                                    {
                                        header: "🤖 𝐀𝐁𝐘𝐒𝐒_𝐁𝐎𝐓 في جروبك",
                                        title: "📌 إضافة البوت لجروبك",
                                        description: "🔹 السعر:\n🇪🇬 مصر: كرت بـ 18 جنيه\n🌍 باقي الدول: رقم وهمي\n💎 الاشتراك: دائم",
                                        id: ".اشتراك_جروب"
                                    }
                                ]
                            },
                            {
                                title: "🏰 هل تريد البوت لمملكتك؟ 🏰",
                                rows: [
                                    {
                                        header: "👑 𝐀𝐁𝐘𝐒𝐒_𝐁𝐎𝐓 لمملكتك",
                                        title: "🏆 اشتراك للممالك",
                                        description: "🔹 السعر:\n🇪🇬 مصر: 36 جنيه\n🌍 باقي الدول: رقمين وهميين",
                                        id: ".اشتراك_مملكة"
                                    }
                                ]
                            },
                            {
                                title: "💻 هل تريد السكربت الخاص بالبوت؟ 💻",
                                rows: [
                                    {
                                        header: "🛠️ سكربت 𝐀𝐁𝐘𝐒𝐒_𝐁𝐎𝐓",
                                        title: "🎯 شراء السكربت",
                                        description: "🔹 السعر:\n🇪🇬 مصر: 200 جنيه\n🌍 باقي الدول: 4 دولار",
                                        id: ".اشتراك_سكربت"
                                    }
                                ]
                            }
                        ]
                    })
                }
            ],
            messageParamsJson: ''
        }
    };

    let msg = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
            message: { interactiveMessage },
        },
    }, { userJid: conn.user.jid, quoted: m });

    conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
};

handler.command = /^(اشتراك|subscribe)$/i;

export default handler;