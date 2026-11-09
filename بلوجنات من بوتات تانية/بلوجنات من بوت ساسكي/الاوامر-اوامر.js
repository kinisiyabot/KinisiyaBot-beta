function clockString(ms) {
    let h = Math.floor(ms / 3600000);
    let m = Math.floor(ms % 3600000 / 60000);
    let s = Math.floor(ms % 60000 / 1000);
    return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}

import * as pkg from '@whiskeysockets/baileys';
const { generateWAMessageFromContent, proto, prepareWAMessageMedia } = pkg;

const handler = async (m, {conn, usedPrefix, usedPrefix: _p, __dirname, text, isPrems}) => {
    let d = new Date(new Date + 3600000);
    let locale = 'ar';
    let week = d.toLocaleDateString(locale, { weekday: 'long' });
    let date = d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
    let _uptime = process.uptime() * 1000;
    let uptime = clockString(_uptime);
    let user = global.db.data.users[m.sender];
    let name = conn.getName(m.sender)
    let { money, joincount } = global.db.data.users[m.sender];
    let { exp, limit, level, role } = global.db.data.users[m.sender];
    let rtotalreg = Object.values(global.db.data.users).filter(user => user.registered == true).length;
    let more = String.fromCharCode(8206);
    let readMore = more.repeat(850);
    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
    let taguser = '@' + m.sender.split("@s.whatsapp.net")[0];
  await conn.sendMessage(m.chat, { react: { text: '🍡', key: m.key } })
  const sung = 'https://qu.ax/iUxMi.jpg'
  const mentionId = m.key.participant || m.key.remoteJid;
 
conn.relayMessage(m.chat, { viewOnceMessage: { message: { interactiveMessage: { header: { title: `harley`}, body: { text: `˼⚡˹↜ مـࢪحـبـا بـك/ي @${mentionId.split('@')[0]}
> ˼🪪˹↜ مــعــلــومــاتــك ↶
╮⋄━─━─━─═◞⬪※⬪◟═─━─━─━⋄╭ـ
┆⚡↜ بـريـمـيـوم↞⌊ ${user.premiumTime > 0 ? 'مــمـ🔱ـيز' : (isPrems ? 'مــمـ🔱ـيز' : 'عــ🍁ــادي') || ''} ⌉
┆⚜️↜ مـــســـتواك↞⌊ ${level} ⌉
┆💫↜ رتـبـتـك↞⌊ ${role} ⌉
┆🧰↜ الـخـبـرة↞⌊ ${exp} ⌉
┆💎↜ الـمـاس↞⌊ ${limit} ⌉
╯⋄━─━─━─═◞⬪⇊⬪◟═─━─━─━⋄╰ـ
> ˼🤖˹↜ الــبــوت↶
╮⋄━─━─━─═◞⬪※⬪◟═─━─━─━⋄╭ـ
┆⚙️ ↜اسـم الـبـوت↶﹝${global.gt}﹞
┆🪄 ↜الـمـطـور ↶﹝${global.owr}﹞
┆📌 ↜الـتـشـغـيـل ↶﹝${uptime}﹞
┆🔖 ↜الــمــســتـخـدمـيـن ↶﹝${rtotalreg}﹞
╯⋄━─━─━─═◞⬪※⬪◟═─━─━─━⋄╰ـ
> ${global.gt}`,subtitle: "Araab Zack",},header: { hasMediaAttachment: true,...(await prepareWAMessageMedia({ image : { url: sung } }, { upload: conn.waUploadToServer }, {quoted: m}))},
                    contextInfo: {
                        mentionedJid: [m.sender],
                        isForwarded: false,
                    },nativeFlowMessage: { buttons: [


                            {
                                name: 'single_select',
                                buttonParamsJson: JSON.stringify({
                                    title: '⌈📖╎الــقــوائـــم╎📖⌋',
                                    sections: [
                                        {
                                            title: 'اهـلا بـك ف، ي بـوت سـاسـكـي 👥',
                                            highlight_label: 'الـيـك الـقـوائـم',
                                            rows: [
                                                {
                                                    header: 'الــقـ♻️ـســم الـاول',
                                                    title: 'استدعاء_قسم_التحويلات #التحويلات',
                                                    description: '',
                                                    id: '.قسم-التحويلات'
                                                },
                                                {
                                                    header: 'الــقـ🔎ســم الــثــانــي',
                                                    title: 'استدعاء_قسم_البحث #البحث',
                                                    description: '',
                                                    id: '.قسم-البحث'
                                                },
                                                {
                                                    header: 'الــقـ🕋ـســم الــثــالــث',
                                                    title: 'استدعاء_قسم_الدين #الدين',
                                                    description: '',
                                                    id: '.قسم-الدين'
                                                },
                                                {
                                                    header: 'الــقـ👥ـســم الــرابــع',
                                                    title: 'استدعاء_قسم_المشرفين #المشرفين',
                                                    description: '',
                                                    id: '.قسم-المشرفين'
                                                },
                                                {
                                                    header: 'الــقـ🎙ـســم الــخــامــس',
                                                    title: 'استدعاء_قسم_الصوتيات #الصوتيات',
                                                    description: '',
                                                    id: '.قسم-الصوتيات'
                                                },
                                                {
                                                    header: 'الــقـ🕹ـســم الــســادس',
                                                    title: 'استدعاء_قسمب #قسم-المطور',
                                                    description: '',
                                                    id: '.قسم-المطور'
                                                }
                                            ]
                                        }
                                    ]
                                }),
                  messageParamsJson: ''
                     },
                     {
               name: "cta_url",
               buttonParamsJson: '{"display_text":"⌈💻╎قـنـاة الــبــوت╎💻⌋","url":"https://whatsapp.com/channel/0029Vb2JwCbDZ4LT5tWVfP2J","merchant_url":"https://whatsapp.com/channel/0029Vb2JwCbDZ4LT5tWVfP2J"}'
                            }
                        ]
                    }
                }
            }
        }
    }, {});
}

handler.help = ['info'];
handler.tags = ['main'];
handler.command = ['menu', 'مهام', 'اوامر','الاوامر','قائمة','القائمة']

export default handler;