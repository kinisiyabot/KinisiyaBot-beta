import { generateWAMessageFromContent } from "@whiskeysockets/baileys";

const ownerJid = "201065826587@s.whatsapp.net"; // رقم المطور الأساسي
const botName = "𝑾𝑨𝑯𝑴 𝑩𝑶𝑻";

const subscriptions = {
    "جروب": {
        title: "🤖 𝑾𝑨𝑯𝑴 𝑩𝑶𝑻 في جروبك",
        description: "🔹 السعر:\n🇪🇬 مصر: كرت بـ 18 جنيه\n🌍 باقي الدول: رقم وهمي\n💎 الاشتراك: دائم"
    },
    "مملكة": {
        title: "🏆 اشتراك للممالك",
        description: "🔹 السعر:\n🇪🇬 مصر: 36 جنيه\n🌍 باقي الدول: رقمين وهميين"
    },
    "سكربت": {
        title: "🛠️ سكربت 𝑾𝑨𝑯𝑴 𝑩𝑶𝑻",
        description: "🔹 السعر:\n🇪🇬 مصر: 200 جنيه\n🌍 باقي الدول: 4 دولار"
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