function clockString(ms) {
    let h = Math.floor(ms / 3600000);
    let m = Math.floor((ms % 3600000) / 60000);
    let s = Math.floor((ms % 60000) / 1000);
    return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}

import pkg from '@whiskeysockets/baileys';
const { generateWAMessageFromContent, prepareWAMessageMedia } = pkg;

const handler = async (m, { conn }) => {
    try {
        let d = new Date(Date.now() + 3600000);
        let locale = 'ar';
        let uptime = clockString(process.uptime() * 1000);
        let user = global.db.data.users[m.sender] || {};
        let name = conn.getName(m.sender);
        let { role, level } = user;
        let mentionId = m.key.participant || m.key.remoteJid;
        let taguser = '@' + m.sender.split("@s.whatsapp.net")[0];

        await conn.sendMessage(m.chat, { react: { text: '🍡', key: m.key } });

        const Elsony = 'https://files.catbox.moe/busm02.jpg';
        const media = await prepareWAMessageMedia({ image: { url: Elsony } }, { upload: conn.waUploadToServer });

        let message = {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        header: { title: "gataVidMenu" },
                        body: { text: `*┊🌹┊⇇مـنـور يـا @${mentionId.split('@')[0]} اتـمـنـي ان انـكـ/ي تـسـمـتـ؏ـ/ـي بي وقتك*
*⊏─๋︩︪─๋︩︪─๋︩︪─๋︩︪─═͜⊐❪🍬❫⊏═─๋︩︪─๋︩︪─๋︩︪─๋︩︪─๋︩︪─⊐*
*↜مـعلـومـاتـك يـا مـز/ه🐤🍭↶*
*❍━━━══━━❪🌹❫━━══━━━❍*
*🍬┊⇇الـمـنـشـن↜❪@${mentionId.split('@')[0]}❫*
*🍭┊⇇الـرتـبـه↜❪${role}❫*
*🌸┊⇇الـمـسـتـوي↜❪${level}❫*
*⊏─๋︩︪─๋︩︪─๋︩︪─๋︩︪─═͜⊐❪🍬❫⊏═─๋︩︪─๋︩︪─๋︩︪─๋︩︪─๋︩︪─⊐*
*↜مـعـلـومـات مـطـوري😜🔞↶*
*❍━━━══━━❪🌹❫━━══━━━❍*
*🍷┊⇇الـقـب↶*
> *✧. 𝑳𝒊𝒍𝒊𝒉𝒕🐝*
*🧭┊⇇الـرقـم↶*
> https://wa.me/212705655633 
*⊏─๋︩︪─๋︩︪─๋︩︪─๋︩︪─═͜⊐❪🍬❫⊏═─๋︩︪─๋︩︪─๋︩︪─๋︩︪─๋︩︪─⊐*
*╮═━━━━━━✦✿✦━━━━━━═╭*   
*┊     ｢🌹┊التـنـبـيـهـات┊🌹｣     ┊*
*╯═━━━━━━✦✿✦━━━━━━═╰*
*❪1❫↜ممنوع سب البوت*
*❪2❫↜للشكوه او للاقتراح↶*
> *.ابلاغ*
*❪3❫↜ضغط علي الزر لي عرض الاوامر*
*❪4❫↜لا تنسي قبل اي امر↜❪.❫*
*❪5❫↜استخدم امر｢تسجيل/reg｣ لي تشغيل بعض الاوامر*
*❍━━━══━━❪🌹❫━━══━━━❍*`, subtitle: "Elsony" },
                        header: { hasMediaAttachment: true, ...media },
                        contextInfo: { mentionedJid: [m.sender], isForwarded: false },
                        nativeFlowMessage: {
                            buttons: [
                                {
                                    name: 'single_select',
                                    buttonParamsJson: JSON.stringify({
                                        title: '⌈🍭┊اوامر┊🍬⌋',
                                        sections: [
                                            {
                                                title: '❪🐣┊مـهـام_الـبـوت┊🍡❫',
                                                highlight_label: '𝓡𝓪𝓫𝓫𝓲𝓽 𝓼𝓲𝓷𝓹𝓪𝓲 ༆',
                                                rows: [
                                                    { header: '👑┊القـ👑ـسـم الأول', title: '🍫┊「 قسم_الألعاب 」🍥', id: '.ق1' },
                                                    { header: '👨🏻‍💻┊القـ👨🏻‍💻ـسـم الثاني', title: '🍬┊「 قسم_الصور 」🍨', id: '.ق2' },
                                                    { header: '🐦‍🔥┊القـ🐦‍🔥ـسـم الثالث', title: '🍨┊「 قسم_المشرفين 」🍨', id: '.ق3' },
                                                    { header: '👑┊القـ👑ـسـم الرابع', title: '🍨┊「 قسم_التحويلات 」🍬', id: '.ق4' },
                                                    { header: '🛡┊القـ🛡ـسـم الخامس', title: '🍬┊「 قسم_التحميل 」🍨', id: '.ق5' },
                                                    { header: '🕹┊القـ🕹ـسـم السادس', title: '🍬┊「 قسم_البنك 」🍨', id: '.ق6' },
                                                    { header: '🌀┊القـ🌀ـسـم السابع', title: '🍬┊「 قسم_AI 」🍨', id: '.ق7' },
                                                    { header: '🎧┊القـ🎧ـسـم الثامن', title: '🍬┊「 قسم_الألقاب 」🍨', id: '.ق8' },
                                                    { header: '🤖┊القـ🤖ـسـم التاسع', title: '🍬┊「 قسم_المرح 」🍨', id: '.ق9' },
                                                    { header: '👨🏻‍💻┊القـ👨🏻‍💻ـسـم العاشر', title: '🍬┊「 القوانين 」🍨', id: '.القواعد' }
                                                ]
                                            }
                                        ]
                                    })
                                },
                                {
                                    name: "quick_reply",
                                    buttonParamsJson: '{"display_text":"⌈🚀╎المطور╎🚀⌋","id":".المطور"}'
                                },
                                {
                                    name: "quick_reply",
                                    buttonParamsJson: '{"display_text":"⌈🌟╎تقييم╎🌟⌋","id":".تقيم"}'
                                },
                                {
                                    name: "cta_url",
                                    buttonParamsJson: '{"display_text":"⌈📲╎قـنـاة الـمـطـور╎📲⌋","url":"https://whatsapp.com/channel/0029Vb05ygMD8SDt2O2OBv0C"}'
                                },
                                {
                                    name: "cta_url",
                                    buttonParamsJson: '{"display_text":"⌈📩╎شات البوت╎📩⌋","url":"https://chat.whatsapp.com/Cu3GjK0JrP0HQJEzZCbdI8"}'
                                }
                            ]
                        }
                    }
                }
            }
        };

        await conn.relayMessage(m.chat, message, {});
    } catch (err) {
        console.error(err);
        await conn.sendMessage(m.chat, { text: '❌ حدث خطأ أثناء تنفيذ الأمر.' }, { quoted: m });
    }
};

handler.help = ['info'];
handler.tags = ['main'];
handler.command = ['menu', 'مهام', 'اوامر', 'الاوامر', 'قائمة', 'القائمة'];

export default handler;