import { isElite, extractPureNumber } from '../lib/elite.js';

const handler = async (m, { conn, text }) => {
    const sender = extractPureNumber(m.sender); // تحويل JID إلى رقم صافي

    // التحقق إذا الرقم من النخبة
    if (!isElite(sender)) {
        return m.reply('🚫 هذا الأمر مخصص فقط لأعضاء النخبة.');
    }

    try {
        const groupMetadata = await conn.groupMetadata(m.chat);
        const botNumber = conn.user.jid.split('@')[0];

        // تحديد أعضاء النخبة الموجودين فعلاً في المجموعة واللي مش مشرفين
        const toPromote = groupMetadata.participants
            .filter(p => {
                const number = p.id.split('@')[0];
                return eliteNumbers.includes(number) && !p.admin && number !== botNumber;
            })
            .map(p => p.id);

        if (toPromote.length === 0) {
            return m.reply('⚠️ لا يوجد أعضاء نخبة يمكن ترقيتهم.');
        }

        await conn.groupParticipantsUpdate(m.chat, toPromote, 'promote');
        await m.reply('✅ تم ترقية أعضاء النخبة إلى مشرفين.');

    } catch (err) {
        console.error('❌ خطأ في أمر ارفعه:', err);
        await m.reply(`❌ حدث خطأ أثناء تنفيذ الأمر:\n\n${err.message || err.toString()}`);
    }
};

handler.command = /^ارفعه$/i;
handler.group = true;

export default handler;