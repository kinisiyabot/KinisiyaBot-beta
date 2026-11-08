import { isElite, extractPureNumber } from '../lib/elite.js';

const handler = async (m, { conn }) => {
    const sender = extractPureNumber(m.sender); // تحويل JID إلى رقم صافي

    // التحقق إذا الرقم من النخبة
    if (!isElite(sender)) {
        return m.reply('🚫 هذا الأمر مخصص فقط لأعضاء النخبة.');
        if (!m.isGroup) return m.reply('🚫 هذا الأمر يعمل فقط في الجروبات.');
    }

    try {
        const metadata = await conn.groupMetadata(m.chat);
        const participants = metadata.participants;

        console.log("📋 أعضاء الجروب:", participants.map(p => ({
            id: p.id,
            number: p.id.split('@')[0],
            admin: p.admin
        })));

        // ترقية أعضاء النخبة فقط الذين ليسوا أدمن بالفعل
        const toPromote = participants
            .filter(p => {
                const number = p.id.split('@')[0];
                const elite = isElite(number); // استخدم الدالة مباشرة
                const isAdmin = (p.admin === 'admin' || p.admin === 'superadmin');
                console.log(`👀 فحص العضو ${number} | نخبة: ${elite} | أدمن: ${isAdmin}`);
                return elite && !isAdmin;
            })
            .map(p => p.id);

        if (toPromote.length === 0) {
            return m.reply('⚠ لا يوجد أعضاء نخبة يمكن ترقيتهم.');
        }

        await conn.groupParticipantsUpdate(m.chat, toPromote, 'promote');
        m.reply(`✅ تم ترقية ${toPromote.length} عضو من النخبة إلى مشرفين.`);
    } catch (e) {
        console.error('خطأ في رفع النخبة:', e);
        m.reply('⚠ حدث خطأ أثناء محاولة رفع النخبة.');
    }
};

handler.command = ['ادمني'];
handler.group = true;

export default handler;