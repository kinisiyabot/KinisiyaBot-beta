import fs from 'fs';
import axios from 'axios';

let handler = async (m, { conn }) => {
    // الحصول على معرف المنشن مع تعريف taguser
    let mentionJid = m.sender || m.key.participant || m.key.remoteJid;
    let mentionId = mentionJid.split('@')[0];
    let taguser = `@${mentionId}`;

    // قراءة ملف روابط الصور
    const linksFile = './media-links.txt';
    if (!fs.existsSync(linksFile)) return await m.reply('⚠️ ملف روابط الصور غير موجود.');
    const links = fs.readFileSync(linksFile, 'utf-8').split('\n').filter(Boolean);
    if (!links.length) return await m.reply('⚠️ ملف روابط الصور فارغ.');

    // اختيار صورة كبيرة وعشوائية
    const randomIndex = Math.floor(Math.random() * links.length);
    const imageUrl = links[randomIndex];

    // اختيار صورة مصغرة مختلفة
    let thumbUrl;
    if (links.length === 1) {
        thumbUrl = imageUrl;
    } else {
        let thumbIndex;
        do {
            thumbIndex = Math.floor(Math.random() * links.length);
        } while (thumbIndex === randomIndex);
        thumbUrl = links[thumbIndex];
    }

    // تحميل الصورة المصغرة إلى Buffer
    let thumbnailBuffer = null;
    try {
        const resp = await axios.get(thumbUrl, { responseType: 'arraybuffer' });
        thumbnailBuffer = Buffer.from(resp.data);
    } catch {
        thumbnailBuffer = null;
    }

    // vCard للاقتباس
    const vcard = `
BEGIN:VCARD
VERSION:3.0
TEL;waid=${mentionId}:${mentionId}
END:VCARD
`.trim();

    const contactInfo = {
        key: { fromMe: false, participant: m.sender, remoteJid: 'status@broadcast', id: 'Halo' },
        message: { contactMessage: { displayName: taguser, vcard } },
        participant: m.sender
    };

    // الرسالة المزخرفة
    let message = `*_:•⪼مـــرحبــــاً بـــكـ/ﻲ يـا ❪${taguser}❫ في قسم الالعاب انـرتـ/ـي يـا مـز/ه*
*❀✦═══ •『🔞』• ═══✦❀*
> *شرح القسم:•⪼ القسم قسم يقدم العاب مسليه و اسئله دينيه*
*❆━━━━━⊱⎔⌟🔞⌜⎔⊱━━━━━❆*
> *｢❆┊قــــــســـــــم_الالـعـاب┊❆｣*
*❆━━━━━⊱⎔⌟🔞⌜⎔⊱━━━━━❆*
┊🫦┊:•⪼ ⌟علم⌜ 
┊🫦┊:•⪼ ⌟سؤال⌜ 
┊🫦┊:•⪼ ⌟دين⌜
┊🫦┊:•⪼ ⌟احزر⌜
┊🫦┊:•⪼ ⌟عين⌜
┊🫦┊:•⪼ ⌟فكك⌜
┊🫦┊:•⪼ ⌟كت⌜
┊🫦┊:•⪼ ⌟عاصمه⌜
┊🫦┊:•⪼ ⌟ايموجي⌜
┊🫦┊:•⪼ ⌟تاريخ⌜
*❆━━━━━⊱⎔⌟🔞⌜⎔⊱━━━━━❆*
*┊🍷┊البوت:•⪼𝐊𝐈𝐍𝐈𝐒𝐈𝐘𝐀 𝐁𝐎𝐓*

*⎔⋅• ━ ╼╃ ⌬〔🍁〕⌬ ╄╾ ━ •⋅⎔*

مـعـلـومـات مـطـوري لـمـز🔞🫦
*لـقـب 🕸️*
> 🍺༄𝐈𝐌 𝐘𝐄𝐑𝐈𝐓𝐂𝐇𝐈༆🍻
*رقـم الـمـطـور*
https://wa.me/212693863911
*⎔⋅• ━ ╼╃ ⌬〔🍁〕⌬ ╄╾ ━ •⋅⎔*`;

    const emojiReaction = '⬇️';

    try {
        // إرسال الريأكشن
        await conn.sendMessage(m.chat, { react: { text: emojiReaction, key: m.key } });

        // إرسال الصورة الكبيرة مع الرسالة المنشن
        await conn.sendMessage(m.chat, {
            image: { url: imageUrl },
            caption: message,
            mentions: [m.sender],
            contextInfo: {
                mentionedJid: [m.sender],
                externalAdReply: {
                    title: ' ◡̈⃝𝑲𝑰𝑵𝑰𝑺𝑰𝒀𝑨 𝐁𝐎𝐓ఌ',
                    body: taguser,
                    thumbnail: thumbnailBuffer,
                    mediaType: 1,
                    sourceUrl: 'https://whatsapp.com/channel/0029Vb80wch30LKFioKenc2V',
                    renderLargerThumbnail: false
                }
            }
        }, { quoted: contactInfo });

    } catch (error) {
        console.error("Error sending message:", error);
        await conn.sendMessage(m.chat, { text: '❌ حدث خطأ أثناء إرسال الصورة.' });
    }
};

handler.command = /^(قسم_game)$/i;
handler.exp = 50;

export default handler;
