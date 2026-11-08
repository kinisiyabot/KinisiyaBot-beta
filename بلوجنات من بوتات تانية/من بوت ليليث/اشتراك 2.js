import { generateWAMessageFromContent } from "@whiskeysockets/baileys";

const ownerJid = "212702303505@s.whatsapp.net"; // رقم المطور الأساسي
const botName = "𝓡𝓪𝓫𝓫𝓲𝓽 𝓼𝓲𝓷𝓹𝓪𝓲 ༆";

const subscriptions = {
    "جروب": {
        title: "🤖 𝓡𝓪𝓫𝓫𝓲𝓽 𝓼𝓲𝓷𝓹𝓪𝓲 ༆ في جروبك",
        description: "🔹 السعر:\nالمغرب🇲🇦: كرت بـ 10 درهم\n🌍 باقي الدول: رقم وهمي\n💎 الاشتراك: دائم"
    },
    "مملكة": {
        title: "🏆 اشتراك للممالك",
        description: "🔹 السعر:\n المغرب🇲🇦: 20 درهم\n🌍 باقي الدول: رقمين وهميين"
    },
    "سكربت": {
        title: "🛠️ سكربت 𝓡𝓪𝓫𝓫𝓲𝓽 𝓼𝓲𝓷𝓹𝓪𝓲 ༆",
        description: "🔹 السعر:\nالمغرب🇲🇦: 30 درهم\n🌍 باقي الدول: 4 دولار"
    }
};

// عرض الاشتراك مع زر "موافق"
const handler = async (m, { conn, command }) => {
    let type = command.replace("اشتراك_", "");
    if (!subscriptions[type]) return m.reply("❌ *نوع الاشتراك غير موجود!*");

    let { title, description } = subscriptions[type];
    let teksnya = `📌 *طلب اشتراك جديد*\n\n📌 *النوع:* ${title}\n📜 *التفاصيل:* \n${description}\n\n⚠️ *هل تريد تأكيد الاشتراك؟*`;

    const buttons = [
        {
            buttonId: `.تأكيد_${type}`,
            buttonText: { displayText: '✅ موافق' },
            type: 1
        },
        {
            buttonId: `.إلغاء_${type}`,
            buttonText: { displayText: '❌ إلغاء' },
            type: 1
        }
    ];

    const confirmMessage = {
        buttonsMessage: {
            contentText: teksnya,
            footerText: botName,
            buttons: buttons,
            headerType: 1
        }
    };

    let message = generateWAMessageFromContent(
        m.chat,
        { ephemeralMessage: { message: confirmMessage } },
        { userJid: conn.user.id }
    );

    await conn.relayMessage(m.chat, message.message, { messageId: message.key.id });
};

handler.command = /^(اشتراك_جروب|اشتراك_مملكة|اشتراك_سكربت)$/i;
export default handler;