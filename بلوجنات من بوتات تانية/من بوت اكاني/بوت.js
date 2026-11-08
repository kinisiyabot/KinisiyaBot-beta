import { prepareWAMessageMedia, generateWAMessageFromContent } from "@whiskeysockets/baileys";
import fs from "fs";

const handler = async (m, { conn }) => {
    const imageBuffer = fs.readFileSync("./م6.jpg"); // الصورة في نفس مجلد السكربت
    const devId = "201005502208@s.whatsapp.net"; // رقم المطور الجديد
    const channelLink = "https://whatsapp.com/channel/0029Vb8z64I0wak1S4EBQp1K";

    // تجهيز الصورة
    const media = await prepareWAMessageMedia(
        { image: imageBuffer },
        { upload: conn.waUploadToServer }
    );

    // إنشاء الرسالة التفاعلية
    const interactiveMessage = {
        body: { text: "مـرحـبـا اسـمـي اكايني مـطـوري EYAD، اسـتـخـدم امـر (.اوامـر) لطلب القائمة" },
        footer: { text: "ＡｋａｉＮｉ　Ｂｏｔ" },
        header: { 
            title: "❪🌸┇ＡｋａｉＮｉ　Ｂｏｔ┇🍷❫", 
            hasMediaAttachment: true, 
            imageMessage: media.imageMessage 
        },
        nativeFlowMessage: {
            buttons: [
                {
                    name: "quick_reply",
                    buttonParamsJson: JSON.stringify({
                        display_text: "｢🍷┊لـلـمـطـور┊🍷｣",
                        id:".مطور" 
                    })
                },
                {
                    name: "cta_url",
                    buttonParamsJson: JSON.stringify({
                        display_text: "｢🍷┊القناة┊🍷｣",
                        url: channelLink
                    })
                },
                {
                    name: "quick_reply",
                    buttonParamsJson: JSON.stringify({
                        display_text: "⌈🚀╎اوامر╎🚀⌋",
                        id: ".اوامر"
                    })
                }
            ]
        }
    };

    // إرسال الرسالة
    const msg = generateWAMessageFromContent(
        m.chat,
        { viewOnceMessage: { message: { interactiveMessage } } },
        { userJid: conn.user.jid, quoted: m }
    );

    conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
};

handler.command = /^بوت$/i;

export default handler;