import fs from 'fs';
import axios from 'axios';

let handler = async (m, { conn }) => {
    // تحديد الـ JID وتعريف taguser بشكل صحيح
    let mentionJid = m.sender || m.key.participant || m.key.remoteJid;
    let mentionId = mentionJid.split('@')[0];
    let taguser = `@${mentionId}`;

    // قراءة ملف روابط الصور
    const linksFile = './media-links.txt';
    if (!fs.existsSync(linksFile)) return await m.reply('⚠️ ملف روابط الصور غير موجود.');
    
    const links = fs.readFileSync(linksFile, 'utf-8')
        .split('\n')
        .map(l => l.trim())
        .filter(Boolean);
    if (!links.length) return await m.reply('⚠️ ملف روابط الصور فارغ.');

    // اختيار صورة عشوائية
    const randomIndex = Math.floor(Math.random() * links.length);
    const imageUrl = links[randomIndex];

    // نص الرسالة مع المنشن باستخدام taguser
    let message = `*_:•⪼مـــرحبــــاً بـــكـ/ﻲ يـا ❪${taguser}❫ في قسم الادوات*
*⊏─๋︩︪─๋︩︪─๋︩︪─๋︩︪─═͜⊐❪🔞❫⊏═─๋︩︪─๋︩︪─๋︩︪─๋︩︪─๋︩︪─⊐*
> *شرح القسم:•⪼ القسم يقدم لك ادوات للمساعدة🫦*
*❍━━━══━━❪🔞❫━━══━━━❍*
> *｢❆┊قــــــســـــــم_الادوات ┊❆｣*
*❍━━━══━━❪🔞❫━━══━━━❍*
┊🫦┊:•⪼ ⌟لانمي⌜ 
┊🫦┊:•⪼ ⌟صورته⌜ 
┊🫦┊:•⪼ ⌟تعديل⌜
┊🫦┊:•⪼ ⌟اسكرين⌜
┊🫦┊:•⪼ ⌟حسابه⌜
┊🫦┊:•⪼ ⌟بريد⌜
┊🫦┊:•⪼ ⌟كات-بوكس⌜
*❆━━━━━⊱⎔⌟🔞⌜⎔⊱━━━━━❆*
*┊🍷┊البوت:•⪼𝐊𝐈𝐍𝐈𝐒𝐈𝐘𝐀 𝐁𝐎𝐓*

*⎔⋅• ━ ╼╃ ⌬〔🍁〕⌬ ╄╾ ━ •⋅⎔*

مـعـلـومـات مـطـوري لـمـز🔞🫦
*لـقـب 🕸️*
> 🍺༄𝐈𝐌 𝐘𝐄𝐑𝐈𝐓𝐂𝐇𝐈༆🍻
*رقـم الـمـطـور*
https://wa.me/212693863911
*⎔⋅• ━ ╼╃ ⌬〔🍁〕⌬ ╄╾ ━ •⋅⎔*`;

    try {
        // إرسال الصورة + الكابشن مع المنشن
        await conn.sendMessage(m.chat, {
            image: { url: imageUrl },
            caption: message,
            mentions: [mentionJid]
        }, { quoted: m });
    } catch (error) {
        console.error(error);
        await m.reply('❌ حدث خطأ أثناء الإرسال.');
    }
};

handler.command = /^(قسم_tools)$/i;
handler.exp = 50;
handler.fail = null;

export default handler;
