import { createHash } from 'crypto';
import { canLevelUp, xpRange } from '../lib/levelling.js';
import fetch from 'node-fetch';
import fs from 'fs';
const { levelling } = '../lib/levelling.js';
import moment from 'moment-timezone';
import { promises } from 'fs';
import { join } from 'path';
const time = moment.tz('Egypt').format('HH');
let wib = moment.tz('Egypt').format('HH:mm:ss');

let handler = async (m, { conn, usedPrefix, usedPrefix: _p, __dirname, text, isPrems }) => {
    let d = new Date(new Date + 3600000);
    let locale = 'ar';
    let week = d.toLocaleDateString(locale, { weekday: 'long' });
    let date = d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
    let _uptime = process.uptime() * 1000;
    let uptime = clockString(_uptime);
    let who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender;
    if (!(who in global.db.data.users)) throw `✳️ The user is not found in my database`;
    let videoUrl = 'https://telegra.ph/file/b9c7242b2ea534c9fea51.jpg';
    const user = global.db.data.users[m.sender];
    const { money, joincount } = global.db.data.users[m.sender];
    const { exp, limit, level, role } = global.db.data.users[m.sender];
    let { min, xp, max } = xpRange(user.level, global.multiplier);
    let username = conn.getName(who);
    let math = max - xp;
    let sn = createHash('md5').update(who).digest('hex');
    let totalreg = Object.keys(global.db.data.users).length;
    let rtotalreg = Object.values(global.db.data.users).filter(user => user.registered == true).length;
    let more = String.fromCharCode(8206);
    let readMore = more.repeat(900);
    const taguser = '@' + m.sender.split('@s.whatsapp.net')[0];
    let str = ` 
> *◉═ • ❁ اهلاً وسهلاً في 𝐋𝐀𝐂𝐊 ❁ • ═◉*
> *_يا هلا بيك_* ➳『 ${taguser} 』
> *📍↵ قوانين دخول بوت 𝐋𝐀𝐂𝐊 جروبك ↯*
> *┓━━━━━━━━━━━━━━━━┣*
> *┃📌↵‏(1)↜ 𝐋𝐀𝐂𝐊 مش هيخش*
> *┃جروب فيه أقل من 50 عضو.*
> *┃ركز واحسبهم كويس  . . .*
> *┫━━━━━━━━━━━━━━━━┣*
> *┃📌↵‏(2)↜ مفيش حاجة اسمها*
> *┃ تنافس بوتات.*
> *┃لو لقيت بوت غير 𝐋𝐀𝐂𝐊، اعتبره برا*
> *┫━━━━━━━━━━━━━━━━┣*
> *┃📌↵‏(3)↜ استخدام البوت بعقل.*
> *┫━━━━━━━━━━━━━━━━┣*
> *┃📌↵‏(4)↜ البوت مش للمنشن*
> *┃الجماعي وخلاص.*
> *┃لو ده هدفك، يبقى خلي 𝐋𝐀𝐂𝐊 بعيد*
> *┫━━━━━━━━━━━━━━━━┣*
> *┃📌↵‏(5)↜ لو حصل حاجة جديدة*
> *┃أو تحديث مهم، الكل يلتزم بيه 
> *┃فورا عشان الجو يبقى رايق*
> *┫━━━━━━━━━━━━━━━━┣*
> *┃📌↵‏(6)↜ 𝐋𝐀𝐂𝐊 مش بيحب الدوشة،*
> *┃ فممنوع أي إعلانات أو سبام.*
> *┃خلينا في المهم ونرتاح *
> *┫━━━━━━━━━━━━━━━━┣*
> *┃📌↵‏(7)↜ ممنوع تنزل حاجات*
> *┃ خارجة أو كلام مالوش لازمة.*
> *┃احترم نفسك ونحافظ على الروقان*
> *┫━━━━━━━━━━━━━━━━┣*
> *┃📌↵‏(8)↜ أي شكوى أو استفسار*
> *┃ يبقى مع المطور.*
> *┃ابعتله في الخاص او ارسل(.ابلاغ) للبوت*
> *┫━━━━━━━━━━━━━━━━┣*
> _*٭.  ❞ 𝐋𝐀𝐂𝐊 بوت ❝ .٭*_
 `.trim();

    conn.sendButton(m.chat, str, 'BY 𝑪𝑹𝑶𝑪𝑶♡𝐋𝐀𝐂𝐊', videoUrl,[[``,``]], null,[[`المطور`,`https://wa.me/201120645094`],[`القناه`,`رابط`]], m);
};

handler.help = ['مطور'];
handler.tags = ['البوت'];
handler.command = ['الشروط'];

export default handler;

function clockString(ms) {
    let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000);
    let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60;
    let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60;
    return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':');
}

function ucapan() {
    const time = moment.tz('Egypt').format('HH');
    let res = "بداية يوم سعيده ☀️";
    if (time >= 4) res = "صباح الخير 🌄";
    if (time >= 10) res = "مساء الخير ☀️";
    if (time >= 15) res = "مساء الخير 🌇";
    if (time >= 18) res = "مساء الخير 🌙";
    return res;
                         }