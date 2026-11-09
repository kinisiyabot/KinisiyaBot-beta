import fs from "fs";
import axios from "axios";
import * as baileys from "@whiskeysockets/baileys";
const { prepareWAMessageMedia, generateWAMessageFromContent, proto } = baileys;

const IMG_PATH = "./media/a1a6fff7242dc17877210c3974019c0f.jpg"; // صورة ثابتة للباقة
const DEV = "212693863911@s.whatsapp.net"; // رقم المطور

// 🖼️ تجهيز الصورة للواتس من ملف محلي أو رابط
async function createImageMessage(conn, path) {
    try {
        let image;
        if (fs.existsSync(path)) {
            image = fs.readFileSync(path);
        } else {
            return null;
        }
        const media = await prepareWAMessageMedia({ image }, { upload: conn.waUploadToServer });
        return media.imageMessage || null;
    } catch {
        return null;
    }
}

// إرسال باقات البوت مع Carousel
async function sendPackages(conn, m) {
    const imgMessage = await createImageMessage(conn, IMG_PATH);

    // الباقات المزخرفة
    const packages = [
        {
            name: "الباقة الأولى",
            desc: `🔞┊≡ ◡̈⃝🫦↜الباقة الأولى  
🎤┊≡ ◡̈⃝🎼↜عدد الأوامر: 100  
❄️┊ ۬.͜ـ🫦˖ ⟨السعر المغربي: 30 درهم | خارج لمغرب: 3 دولار☇  
╮─ׅ─๋︩︪─┈─๋︩︪─═⊐‹✨›⊏═┈─๋︩︪─ ∙ ∙ ⊰ـ  
┤─ׅ─ׅ┈─๋︩︪──ׅ─ׅ┈─๋︩︪─☇ـ  
┤┌  
│┊طرق الدفع:  
│┊- باي بال (فقط دول خارج لمغرب)  
│┊- اورونج كاش
│┊- شحن العاب
┤└─ׅ─ׅ┈─๋︩︪──ׅ─ׅ┈─๋︩︪☇ـ  
⚠️ ملاحظة: يتم الدفع حسب بلدك الطبيعي`,
            id: "الأولى"
        },
        {
            name: "الباقة الثانية",
            desc: `🔞┊≡ ◡̈⃝🫦↜الباقة الثانية  
🎤┊≡ ◡̈⃝🎼↜عدد الأوامر: 500  
❄️┊ ۬.͜ـ🫦 ˖ ⟨السعر المغربي: 60 درهم | خارج المغرب: 6 دولار☇  
╮─ׅ─๋︩︪─┈─๋︩︪─═⊐‹✨›⊏═┈─๋︩︪─ ∙ ∙ ⊰ـ  
┤─ׅ─ׅ┈─๋︩︪──ׅ─ׅ┈─๋︩︪─☇ـ  
┤┌  
││┊طرق الدفع:  
│┊- باي بال (فقط دول خارج لمغرب)  
│┊- اورونج كاش
│┊- شحن العاب
┤└─ׅ─ׅ┈─๋︩︪──ׅ─ׅ┈─๋︩︪☇ـ  
⚠️ ملاحظة: يتم الدفع حسب بلدك الطبيعي`,
            id: "الثانية"
        },
        {
            name: "الباقة الكبيرة",
            desc: `🔞┊≡ ◡̈⃝🫦↜الباقة الكبيرة  
🎤┊≡ ◡̈⃝🎼↜عدد الأوامر: 1000  
❄️┊ ۬.͜ـ🫦˖ ⟨السعر المغربي: 150 درهم | خارج المغرب: 15 دولار☇  
╮─ׅ─๋︩︪─┈─๋︩︪─═⊐‹✨›⊏═┈─๋︩︪─ ∙ ∙ ⊰ـ  
┤─ׅ─ׅ┈─๋︩︪──ׅ─ׅ┈─๋︩︪─☇ـ  
┤┌  
││┊طرق الدفع:  
│┊- باي بال (فقط دول خارج لمغرب)  
│┊- اورونج كاش
│┊- شحن العاب
┤└─ׅ─ׅ┈─๋︩︪──ׅ─ׅ┈─๋︩︪☇ـ  
⚠️ ملاحظة: يتم الدفع حسب بلدك الطبيعي`,
            id: "الكبيرة"
        }
    ];

    const cards = packages.map(pkg => ({
        body: proto.Message.InteractiveMessage.Body.fromObject({ text: `🪴 *${pkg.name}*\n${pkg.desc}` }),
        footer: proto.Message.InteractiveMessage.Footer.fromObject({ text: "طلب البوت فورينا" }),
        header: proto.Message.InteractiveMessage.Header.fromObject({ hasMediaAttachment: !!imgMessage, imageMessage: imgMessage }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
            buttons: [{
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                    display_text: "شراء الآن",
                    id: `.طلب_${pkg.id}`
                })
            }]
        })
    }));

    const carouselMessage = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
            message: {
                interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                    body: proto.Message.InteractiveMessage.Body.create({ text: "✨ باقات طلب البوت فورينا ✨" }),
                    carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({ cards })
                })
            }
        }
    }, {});

    await conn.relayMessage(m.chat, carouselMessage.message, { messageId: carouselMessage.key?.id });
    await m.react("✅");
}

// التعامل مع طلب الباقات → إرسال للمطور
async function handleOrder(conn, m, pkgName) {
    let groupLink = "غير متوفر";
    if (m.isGroup) {
        try {
            groupLink = "https://chat.whatsapp.com/" + await conn.groupInviteCode(m.chat);
        } catch {
            groupLink = "مجموعة خاصة / لم أستطع إحضار الرابط";
        }
    }

    const text = `📩 *تم استلام طلب باقة جديد:*

📱 الرقم: ${m.sender.split("@")[0]}
👤 المنشن: @${m.sender.split("@")[0]}
🔗 رابط المجموعة: ${groupLink}
🎁 الباقة المطلوبة: *${pkgName}*`;

    await conn.sendMessage(DEV, { text, mentions: [m.sender] });
    await conn.sendMessage(m.chat, { text: `✅ تم إرسال طلب الشراء للمطور بنجاح!\nتواصل مع المطور لتأكيد الطلب.` }, { quoted: m });
}

// المعالج الرئيسي
let handler = async (m, { conn, command }) => {
    if (command === "شرا" || command === "طلب البوت") {
        return sendPackages(conn, m);
    }

    if (command.startsWith("طلب_")) {
        const pkg = command.replace("طلب_", "");
        return handleOrder(conn, m, pkg);
    }
};

handler.command = ["شرا", "طلب البوت", "طلب_الأولى", "طلب_الثانية", "طلب_الكبيرة"];
handler.tags = ["info"];
handler.group = false; // جعلته يعمل بالخاص والمجموعات

export default handler;
