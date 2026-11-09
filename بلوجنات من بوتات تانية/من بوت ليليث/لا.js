.gps تتت|import * as pkg from '@whiskeysockets/baileys';
const { generateWAMessageFromContent, proto, prepareWAMessageMedia } = pkg;

function clockString(ms) {
    let h = Math.floor(ms / 3600000);
    let m = Math.floor((ms % 3600000) / 60000);
    let s = Math.floor((ms % 60000) / 1000);
    return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}

const handler = async (m, { conn, usedPrefix, __dirname, text, isPrems }) => {
    let d = new Date();
    d.setTime(d.getTime() + 3600000); // تعديل وقت الساعة بإضافة ساعة
    let locale = 'ar';
    let week = d.toLocaleDateString(locale, { weekday: 'long' });
    let date = d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
    let _uptime = process.uptime() * 1000;
    let uptime = clockString(_uptime);
    let user = global.db.data.users[m.sender] || {};
    let name = conn.getName(m.sender) || 'مستخدم';
    let { money = 0, joincount = 0, diamond = 0 } = user;
    let { exp = 0, limit = 0, level = 0, role = 'مستخدم' } = user;
    let rtotalreg = Object.values(global.db.data.users).filter(user => user.registered === true).length;
    let more = String.fromCharCode(8206);
    let readMore = more.repeat(850);
    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender;
    let taguser = '@' + m.sender.split("@s.whatsapp.net")[0];

    await conn.sendMessage(m.chat, { react: { text: '🌸', key: m.key } });

    // إرسال المقطع الصوتي أولاً
    await conn.sendMessage(m.chat, { 
        audio: { 
            url: 'https://files.catbox.moe/8q229v.opus' 
        }, 
        mimetype: 'audio/mpeg', 
        ptt: true 
    }, { quoted: m });

    // تجهيز الصورة والقائمة
    const images = [
        'https://files.catbox.moe/000sr5.jpg', 
        'https://files.catbox.moe/9t4w8z.jpg'
    ];

    const randomImage = images[Math.floor(Math.random() * images.length)];

    var messa = await prepareWAMessageMedia({ image: { url: randomImage } }, { upload: conn.waUploadToServer });

    // إرسال القائمة
    conn.relayMessage(m.chat, {
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    body: {
                        text: `> ╮━━━━━━━━━━━━━━╭
        ┃    【 𝑾𝑬𝑳𝑪𝑶𝑴𝑬 】    ┃
> ╯━━━━━━━━━━━━━━╰
> *┤ *مرحبا يا ${name}*
> *┤ 🤴🏻 المطور: Mahmoud Mahmed*
> *┤ #️⃣ ارقام المطور: https://wa.me/212702303505 & https://wa.me/212702303505*
> *┤ ✅ الاصدار: 1.2.0*
> *┤ 🎳 البادئة: •*
> *┤ 🧜🏽‍♂️ المستخدمين: ${rtotalreg}*  
> *┤────────────···* 
> *✧────[الـﻤـسـتـخـدم]────╮*
> *┤ 🎩 *الاسـم: ${name}*
> *┤ 🔃 المستوي: ${level}*
> *┤ 🏆 *الـرتبة: ${role}*
> *┤ 🎮 *الخبـرة: ${exp}* 
> *┤ 💎 *الألـماس: ${diamond}*
> *┤ 🎟️ *الرموز: 32*
> *┤ 🌟 *الـبـرﯾـمـيـوم: ${user.premiumTime > 0 ? 'مـمـيز✅' : (isPrems ? 'مـمـيز ✅' : 'عـادي ❌') || ''}* 
> *┤────────────···* 
> *✧────[ الـوقـت ]────╮*
> *┤ 📆 التاريخ: ${date}*
> *┤ 📅 اليوم: ${week}*
> *┤ 🚀 وقت النشاط: ${uptime}*
> *┤────────────···*`
                    },
                    footer: {
                        text: '✪┋𝐒𝐀𝐒𝐔𝐊𝐄-𝐁𝐎𝐓┋✪'
                    },
                    header: {
                        title: '',
                        hasMediaAttachment: true,
                        imageMessage: messa.imageMessage,
                    },
                    nativeFlowMessage: {
                        buttons: [
                            {
                                name: 'single_select',
buttonParamsJson: JSON.stringify({
    title: '『』اوامر البوت《',
    sections: [
        {
            title: '『』ساسكي-بوت《',
            highlight_label: '✪┋𝐒𝐀𝐒𝐔𝐊𝐄-𝐁𝐎𝐓┋✪',
            rows: [
                                        {

                                            title: 'ₛₐₛᵤₖₑ Bₒₜ',
                                            description: 'قسم لاعضاء'                id: '.ق1'
                                        }
                                    ]
                                },
                                {
                                    highlight_label: '2',
                                    rows: [
                                        {

                                            title: 'ₛₐₛᵤₖₑ Bₒₜ',
                                            description: 'قسم دين',
                                            id: '.ق2'
                                        }
                                    ]
                                },
                                {
                                    highlight_label: '3',
                                    rows: [
                                        {

                                            title: 'ₛₐₛᵤₖₑ Bₒₜ',
                                            description: 'قسم المطور',
                                            id: '.ق3'
                                        }
                                    ]
                                },
                                {
                                    highlight_label: '4',
                                    rows: [
                                        {

                                            title: 'ₛₐₛᵤₖₑ Bₒₜ',
                                            description: 'قسم تحميل',
                                            id: '.ق4'
                                        }
                                    ]
                                },
                                {
                                    highlight_label: '5',
                                    rows: [
                                        {

                                            title: 'ₛₐₛᵤₖₑ Bₒₜ',
                                            description: 'قسم الالعاب',
                                            id: '.ق5'
                                        }
                                    ]
                                },
                                {
                                    highlight_label: '6',
                                    rows: [
                                        {

                                            title: 'ₛₐₛᵤₖₑ Bₒₜ',
                                            description: 'قسم تحويلات',
                                            id: '.ق6'
                                        }
                                    ]
                                },
                                {
                                    highlight_label: '7',
                                    rows: [
                                        {

                                            title: 'ₛₐₛᵤₖₑ Bₒₜ',
                                            description: 'قسم ذكاء',
                                            id: '.ق7'
                                        }
                                    ]
                                },
                                {
                                    highlight_label: '8',
                                    rows: [
                                        {

                                            title: 'ₛₐₛᵤₖₑ Bₒₜ',
                                            description: 'قسم دعم',
                                            id: '.ق8'
                                        }
                                    ]
                                },
                                {
                                    highlight_label: '9',
                                    rows: [
                                        {

                                            title: 'ₛₐₛᵤₖₑ Bₒₜ',
                                            description: 'قسم اديت',
                                            id: '.ق9'
                                        }
                                    ]
                                },
                                {
                                    highlight_label: '10',
                                    rows: [
                                        {

                                            title: 'ₛₐₛᵤₖₑ Bₒₜ',
                                            description: 'قسم المشرفين',
                                            id: '.ق10'
                                        }
                                    ]
                                },
                                {
                                    highlight_label: '11',
                                    rows: [
                                        {

                                            title: 'ₛₐₛᵤₖₑ Bₒₜ',
                                            description: 'قسم البحث',
                                            id: '.ق11'
                                        }
                                    ]
                                },
                                {
                                highlight_label: '12',
                                    rows: [
                                        {

                                            title: 'ₛₐₛᵤₖₑ Bₒₜ',
                                            description: 'قسم صور',
                                            id: '.ق12'
                                        }
                                    ]
                                },
                                {
                                    highlight_label: '13',
                                    rows: [
                                        {

                                            title: 'ₛₐₛᵤₖₑ Bₒₜ',
                                            description: 'قسم الالقاب',
                                            id: '.ق13'
                                        }
                                    ]
                                }
                            ]
})
},
messageParamsJson: ''
                            },
                            {
    name: "cta_url",
    buttonParamsJson: JSON.stringify({
        display_text: "『』رقم ايزن《",
        url: "https://wa.me/212643304582",
        merchant_url: "https://wa.me/212643304582"
    })
},
{
    name: "cta_url",
    buttonParamsJson: JSON.stringify({
        display_text: "『』رقم ساسكي《",
        url: "https://wa.me/201229466261",
        merchant_url: "https://wa.me/201229466261"
    })
},
{
    name: "quick_reply",
    buttonParamsJson: JSON.stringify({
        display_text: "『』جروب البوت《",
        id: ".دعم"
    })
},
{
    name: "quick_reply",
    buttonParamsJson: JSON.stringify({
        display_text: "『』قيم البوت《",
        id: ".تقييم"
    })
},
{
    name: "cta_url",
    buttonParamsJson: JSON.stringify({
        display_text: "『』قنات-البوت《",
        url: "https://whatsapp.com/channel/0029Vb05ygMD8SDt2O2OBv0C",
        merchant_url: "https://whatsapp.com/channel/0029Vb05ygMD8SDt2O2OBv0C"
    })
}
                        ]
                    }
                }
            }
        }
    }, {});
}

handler.help = ['لا'];
handler.tags = ['لا'];
handler.command = ['لا'];

export default handler;
``