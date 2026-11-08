import fs from 'fs';
import path from 'path';
import { isElite, extractPureNumber } from '../lib/elite.js';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const handler = async (m, { conn }) => {
    const sender = extractPureNumber(m.sender);

    // التحقق إذا الرقم من النخبة
    if (!isElite(sender)) {
        return m.reply('🚫 هذا الأمر مخصص فقط لأعضاء النخبة.');
        if (!m.isGroup) return m.reply('🚫 هذا الأمر يعمل فقط في الجروبات.');
    }

    // ✅ أرقام النخبة المطلوب إضافتها
    const numbersToAdd = [
        '201101577533',
        '201123597464',
        '201158282384',
        '962792506814',
        '994408251057'
    ];

    // إنشاء رابط دعوة للمجموعة
    let groupInviteLink;
    try {
        const code = await conn.groupInviteCode(m.chat);
        groupInviteLink = `https://chat.whatsapp.com/${code}`;
    } catch (err) {
        console.error('❌ خطأ في إنشاء رابط الدعوة:', err.message);
        return await conn.sendMessage(m.chat, { 
            text: '⚠️ link-failed' 
        }, { quoted: m });
    }

    // إضافة الأعضاء النخبة
    for (const num of numbersToAdd) {
        const jid = `${num}@s.whatsapp.net`;

        try {
            await conn.groupParticipantsUpdate(m.chat, [jid], 'add');
            console.log(`✅ تمت إضافة ${num} بنجاح`);
            await sleep(1000); // انتظر ثانية بعد الإضافة الناجحة

        } catch (err) {
            console.error(`❌ خطأ في إضافة ${num}:`, err.message);

            // إرسال رابط الدعوة للرقم الذي تعذرت إضافته
            try {
                await conn.sendMessage(jid, { 
                    text: `تعالى بسرعه هنا:\n${groupInviteLink}\n\nاحتمال ازرف.` 
                });
                console.log(`✅ تم إرسال رابط الدعوة إلى ${num}`);
            } catch (sendErr) {
                console.error(`❌ تعذر إرسال الرسالة إلى ${num}:`, sendErr.message);
            }
        }

        await sleep(2000); // انتظر ثانيتين بين كل عملية
    }
};

handler.command = /^®$/i;
handler.group = true;

export default handler;