import fs from 'fs';
import axios from 'axios';

let handler = async (m, { conn }) => {
    // تحديد رقم المعرّف والمنشن بشكل صحيح
    const senderJid = m.sender || m.key.participant || m.key.remoteJid;
    const senderNum = senderJid.split('@')[0];
    const mentionId = m.key.participant || m.key.remoteJid;
    const taguser = '@' + senderNum;

    // قراءة ملف روابط الصور
    const linksFile = './media-links.txt';
    if (!fs.existsSync(linksFile)) return await m.reply('⚠️ ملف روابط الصور غير موجود.');
    const links = fs.readFileSync(linksFile, 'utf-8').split('\n').map(l => l.trim()).filter(Boolean);
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

    // vCard
    const vcard = `
BEGIN:VCARD
VERSION:3.0
TEL;waid=${senderNum}:${senderNum}
END:VCARD
`.trim();

    const contactInfo = {
        key: { fromMe: false, participant: senderJid, remoteJid: 'status@broadcast', id: 'Halo' },
        message: { contactMessage: { displayName: taguser, vcard } },
        participant: senderJid
    };

    // الرسالة المزخرفة
    let message = `*_:•⪼مـــرحبــــاً بـــكـ/ﻲ يـا ❪${taguser}❫ في قسم الصور_*
*❀✦═══ •『🔞』• ═══✦❀*
> *شرح القسم:•⪼ القسم يحتوي علي صور لي شخصيات الانمي المذكوره❪اي عندما تكتب(.ميكاسا)راح يجيب لك صور لي ميكاسا❫و اوامر تحميل صور و تتطقيمات*
*❆━━━━━⊱⎔⌟🔞⌜⎔⊱━━━━━❆*
> *｢❆┊قــــــســـــــم_الــصـور┊❆｣*
*❆━━━━━⊱⎔⌟🔞⌜⎔⊱━━━━━❆*
┊🫦┊:•⪼ ⌟هيناتا⌜
┊🫦┊:•⪼ ⌟ميكاسا⌜
┊🫦┊:•⪼ ⌟كابلز⌜
┊🫦┊:•⪼ ⌟تطقيم_بنات⌜
┊🫦┊:•⪼ ⌟ميكو⌜
┊🫦┊:•⪼ ⌟كرومي⌜
┊🫦┊:•⪼ ⌟كانيكي⌜
┊🫦┊:•⪼ ⌟ساكورا⌜
┊🫦┊:•⪼ ⌟هيستيا⌜
┊🫦┊:•⪼ ⌟دينجي⌜
┊🫦┊:•⪼ ⌟نيزوكو⌜
┊🫦┊:•⪼ ⌟تانجيرو⌜
┊🫦┊:•⪼ ⌟ايميليا⌜
┊🫦┊:•⪼ ⌟ريمن⌜
┊🫦┊:•⪼ ⌟ايتاتشي⌜
┊🫦┊:•⪼ ⌟ساسكي⌜
┊🫦┊:•⪼ ⌟ناروتو⌜
┊🫦┊:•⪼ ⌟زورو⌜
┊🫦┊:•⪼ ⌟لوفي⌜
┊🫦┊:•⪼ ⌟باور⌜
┊🫦┊:•⪼ ⌟ماكيما⌜
┊🫦┊:•⪼ ⌟كيرا⌜
┊🫦┊:•⪼ ⌟ايتادوري⌜
┊🫦┊:•⪼ ⌟ايرين⌜
┊🫦┊:•⪼ ⌟ليفاي⌜
┊🫦┊:•⪼ ⌟سوكونا⌜
┊🫦┊:•⪼ ⌟انيا⌜
┊🫦┊:•⪼ ⌟غوجو⌜
┊🫦┊:•⪼ ⌟اليا⌜
*❆━━━━━⊱⎔⌟🔞⌜⎔⊱━━━━━❆*
> ❆ ❯ امر ❪.صوره❫ يحضر لك صوره من النت 
> مثال:•⪼.صوره الاستور يجيب لك صوره المطلوبه اي يجيب صوره الاستور 
> ❆ ❯ من الافضل كتابت الطلب بي الانجليزي و الانمي
*❆━━━━━⊱⎔⌟🔞⌜⎔⊱━━━━━❆*
*┊🍷┊البوت:•⪼𝐊𝐈𝐍𝐈𝐒𝐈𝐘𝐀 𝐁𝐎𝐓*

*⎔⋅• ━ ╼╃ ⌬〔🍁〕⌬ ╄╾ ━ •⋅⎔*

مـعـلـومـات مـطـوري لـمـز🔞🫦
*لـقـب 🕸️*
> 🍺༄𝐈𝐌 𝐘𝐄𝐑𝐈𝐓𝐂𝐇𝐈༆🍻
*رقـم الـمـطـور*
https://w.me/212693863911
*⎔⋅• ━ ╼╃ ⌬〔🍁〕⌬ ╄╾ ━ •⋅⎔*`;

    const emojiReaction = '🌄';

    try {
        // إرسال التفاعل (الريأكشن)
        await conn.sendMessage(m.chat, { react: { text: emojiReaction, key: m.key } });

        // إرسال الرسالة الكاملة
        await conn.sendMessage(m.chat, {
            image: { url: imageUrl },
            caption: message,
            mentions: [senderJid],
            contextInfo: {
                mentionedJid: [senderJid],
                externalAdReply: {
                    title: ' ◡̈⃝𝐊𝐈𝐍𝐈𝐒𝐈𝐘𝐀 𝐁𝐎𝐓ఌ',
                    body: '@' + mentionId.split('@')[0],
                    thumbnail: thumbnailBuffer,
                    mediaType: 1,
                    mediaUrl: 'https://whatsapp.com/channel/0029Vb80wch30LKFioKenc2V',
                    showAdAttribution: true,
                    renderLargerThumbnail: false
                }
            }
        }, { quoted: contactInfo });

    } catch (error) {
        console.error("Error sending message:", error);
        await conn.sendMessage(m.chat, { text: '❌ حدث خطأ أثناء إرسال الصورة.' });
    }
};

handler.command = /^(قسم_images)$/i;
handler.exp = 50;
handler.fail = null;

export default handler;
