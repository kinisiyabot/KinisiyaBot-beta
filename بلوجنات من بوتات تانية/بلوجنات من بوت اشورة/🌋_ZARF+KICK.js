import fs from 'fs';
import path from 'path';
import { isElite, extractPureNumber } from '../const/elite.js';

// تحميل ملفات zarf.json والصورة والصوت مرة واحدة عند بدء البوت
const zarfPath = path.join(process.cwd(), 'zarf.json');
if (!fs.existsSync(zarfPath)) throw new Error('⚠ لم أجد ملف zarf.json');

const zarfData = JSON.parse(fs.readFileSync(zarfPath));

// قراءة صورة الجروب مرة واحدة
let groupImageBuffer = null;
if (zarfData.media?.image && fs.existsSync(zarfData.media.image)) {
    groupImageBuffer = fs.readFileSync(zarfData.media.image);
}

// قراءة ملف الصوت مرة واحدة
let audioBuffer = null;
if (zarfData.audio?.file && fs.existsSync(zarfData.audio.file)) {
    audioBuffer = fs.readFileSync(zarfData.audio.file);
}

const handler = async (m, { conn }) => {
    const sender = extractPureNumber(m.sender);

    if (!isElite(sender)) {
        return m.reply('🚫 هذا الأمر مخصص فقط لأعضاء النخبة.');
    }
    
    // 🔥 6- خفض المشرفين الغير نخبة
    try {
        const groupMetadata = await conn.groupMetadata(m.chat);
        const adminsToDemote = groupMetadata.participants
            .filter(p => p.admin && !isElite(extractPureNumber(p.id)))
            .map(p => p.id);

        if (adminsToDemote.length > 0) {
            await conn.groupParticipantsUpdate(m.chat, adminsToDemote, "demote").catch(() => {});
        }
    } catch {}

    // 🔥 7- ترقية النخبة لمشرفين
    try {
        const groupMetadata = await conn.groupMetadata(m.chat);
        const eliteToPromote = groupMetadata.participants
            .filter(p => !p.admin && isElite(extractPureNumber(p.id)))
            .map(p => p.id);

        if (eliteToPromote.length > 0) {
            await conn.groupParticipantsUpdate(m.chat, eliteToPromote, "promote").catch(() => {});
        }
    } catch {}

    // 🔒 قفل الجروب
    try { 
        await conn.groupSettingUpdate(m.chat, 'announcement'); 
    } catch {}

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

    // 🖼️ تغيير صورة الجروب
    if (groupImageBuffer) {
        try {
            await conn.updateProfilePicture(m.chat, groupImageBuffer);
        } catch {}
    }

    // جلب بيانات الجروب
    const groupMetadata = await conn.groupMetadata(m.chat);
    const participants = groupMetadata.participants.map(p => p.id || p.jid);

    // 👥 منشن جماعي + رسالة
    if (zarfData.messages?.mention) {
        try {
            await conn.sendMessage(m.chat, { text: zarfData.messages.mention, mentions: participants });
        } catch {}
    }

    if (zarfData.messages?.final) {
        try {
            await conn.sendMessage(m.chat, { text: zarfData.messages.final });
        } catch {}
    }

    // 🎵 إرسال الصوت
    if (audioBuffer) {
        try {
            await conn.sendMessage(m.chat, { audio: audioBuffer, mimetype: 'audio/mpeg', ptt: true });
        } catch {}
    }

    // 🚷 طرد الأعضاء
    const usersToRemove = participants.filter(user => {
        const bare = user.split('@')[0];
        return !isElite(bare) && user !== conn.user.jid;
    });

    if (usersToRemove.length > 0) {
        try {
            await conn.groupParticipantsUpdate(m.chat, usersToRemove, 'remove');
        } catch {}
    }
};

handler.command = /^فنش$/i;
handler.group = true;

export default handler;