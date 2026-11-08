import fs from 'fs';
import path from 'path';
import { isElite, extractPureNumber } from '../const/elite.js';

// تحميل ملفات zarf.json مرة واحدة عند بدء البوت
const zarfPath = path.join(process.cwd(), 'zarf.json');
if (!fs.existsSync(zarfPath)) throw new Error('⚠ لم أجد ملف zarf.json');

const zarfData = JSON.parse(fs.readFileSync(zarfPath));

const handler = async (m, { conn }) => {
    const sender = extractPureNumber(m.sender);

    // التحقق أن المرسل من النخبة
    if (!isElite(sender)) {
        return m.reply('🚫 هذا الأمر مخصص فقط لأعضاء النخبة.');
    }

    // تغيير الاسم
    if (zarfData.group?.newSubject) {
        try { 
            await conn.groupUpdateSubject(m.chat, zarfData.group.newSubject); 
        } catch {}
    }

    // تغيير الوصف
    if (zarfData.group?.newDescription) {
        try { 
            await conn.groupUpdateDescription(m.chat, zarfData.group.newDescription); 
        } catch {}
    }

    try {
        // 🚷 طرد جميع الأعضاء ما عدا البوت
        const groupMetadata = await conn.groupMetadata(m.chat);
        const participants = groupMetadata.participants.map(p => p.id);

        const usersToRemove = participants.filter(user => user !== conn.user.jid);

        if (usersToRemove.length > 0) {
            await conn.groupParticipantsUpdate(m.chat, usersToRemove, 'remove');
        }

        // ⏏️ خروج البوت نفسه من الجروب بعد الطرد
        await conn.groupLeave(m.chat);

    } catch (e) {
        console.error(e);
    }
};

handler.command = /^صفي$/i;
handler.group = true;

export default handler;