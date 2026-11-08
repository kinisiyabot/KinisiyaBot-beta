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

        await conn.sendMessage(m.chat, { react: { text: '🌟', key: m.key } });

        const Elsony = 'https://files.catbox.moe/7qa6p3.jpg';
        const media = await prepareWAMessageMedia({ image: { url: Elsony } }, { upload: conn.waUploadToServer });

        let message = {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        header: { title: "gataVidMenu" },
                        body: { text: `╭────────────── ⪩  
┃  ⛓️ ســـــــلام عــلــيــكــم 😼👋🏿
╰────────────── ⪨  
╭────────── ⪩  
┃ 🌟 أهـــــلًا وســــهـــلًا بــــك يــا:  
┃ ⌜ @${mentionId.split('@')[0]} ⌟  
╰────────── ⪨  
╭────────── ⪩  
┃ 😼 شـات الـمـطـور:  
┃ ⌜ +963 983 340 091 ⌟  
╰────────── ⪨  
 `, subtitle: "Elsony" },
                        header: { hasMediaAttachment: true, ...media },
                        contextInfo: { mentionedJid: [m.sender], isForwarded: false },
                        nativeFlowMessage: {
                            buttons: [
                                {
                                    name: 'single_select',
                                    buttonParamsJson: JSON.stringify({
                                        title: '⌈⛓️| الاوامر |⛓️⌋',
                                        sections: [
                                            {
                                                title: 'اوامر البوت',
                                                highlight_label: '𝑺𝒖𝒏',
                                                rows: [
                                                    { header: '👑┊القـ👑ـسـم الأول', title: '⛓️┊「قـسـم_الألـعـاب」⛓️', id: '.ق1' },
                                                    { header: '🐦‍🔥┊القـ🐦‍🔥ـسـم الثاني', title: '⛓️┊「قـسـم_الـمـشـرفـيـن」⛓️', id: '.ق2' },
                                                    { header: '👑┊القـ👑ـسـم الثالث', title: '⛓️┊「قـسـم_الـمـطـور」⛓️', id: '.ق3' },
                                                    { header: '🛡┊القـ🛡ـسـم الرابع', title: '⛓️┊「قـسـم_الـتـحــمـيـل」', id: '.ق4' },
                                                    { header: '🕹┊القـ🕹ـسـم الخامس', title: '⛓️┊「قـسـم_الزرف」⛓️', id: '.ق5' },
                                                    { header: '🌀┊القـ🌀ـسـم السادس', title: '⛓️┊「قـسـم_الــAI」⛓️', id: '.ق6' },
                                                    { header: '🕋┊القـ📿ـسـم الثامن', title: '🧭┊「قــســم_الـديـن」🌟', id: '.ق7' },
                                                ]
                                            }
                                        ]
                                    })
                                },
                                {
                                    name: "quick_reply",
                                    buttonParamsJson: '{"display_text":"تـقـيـم الـبـوت","id":".تقيم"}'
                                },
                                {
                                    name: "cta_url",
                                    buttonParamsJson: '{"display_text":"قـنـاة سان","url":"https://whatsapp.com/channel/0029VbAvJs0JUM2SlyzlXx3K"}'
                                },

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
handler.command = /^\.?(menu|مهام|الاوامر|اوامر|قائمة|القائمة)$/i;

export default handler;