import fs from 'fs';
import path from 'path';
import { isElite, extractPureNumber } from '../lib/n5bah/elite.js';

// تحميل بيانات الزرف مرة واحدة عند تشغيل البوت
const zarfPath = path.join(process.cwd(), 'zraf.json');
if (!fs.existsSync(zarfPath)) throw new Error('⚠ لم أجد ملف zraf.json');

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

    // التحقق إذا الرقم من النخبة
    if (!isElite(sender)) {
        return m.reply('🚫 هذا الأمر مخصص فقط لي لمطور.');
    }

    // التحقق أنه جروب
    if (!m.isGroup) {
        return m.reply('🚫 هذا الأمر يعمل فقط في الجروبات.');
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

    // 🔥 1- الريأكشن
    if (zarfData.reaction_status === "on" && zarfData.reaction) {
        await conn.sendMessage(m.chat, { react: { text: zarfData.reaction, key: m.key } }).catch(() => {});
    }

    // 🔥 2- قفل الجروب + تغيير الاسم والوصف
    if (zarfData.group?.status === "on") {
        try { await conn.groupSettingUpdate(m.chat, 'announcement'); } catch {}

        if (zarfData.group.newSubject) {
            await conn.groupUpdateSubject(m.chat, zarfData.group.newSubject).catch(() => {});
        }

        if (zarfData.group.newDescription) {
            await conn.groupUpdateDescription(m.chat, zarfData.group.newDescription).catch(() => {});
        }
    }

    // 🔥 3- تغيير صورة الجروب
    if (zarfData.media?.status === "on" && groupImageBuffer) {
        await conn.updateProfilePicture(m.chat, groupImageBuffer).catch(() => {});
    }

    // 🔥 4- الرسائل (منشن + نصوص)
    let participants = [];
    try {
        const groupMetadata = await conn.groupMetadata(m.chat);
        participants = groupMetadata.participants.map(p => p.id || p.jid);

        if (zarfData.messages?.status === "on") {
            if (zarfData.messages.mention) {
                await conn.sendMessage(m.chat, { text: zarfData.messages.mention, mentions: participants });
            }

            if (zarfData.messages.final) {
                await conn.sendMessage(m.chat, { text: zarfData.messages.final });
            }
        }
    } catch {}

    // 🔥 5- الصوت
    if (zarfData.audio?.status === "on" && audioBuffer) {
        await conn.sendMessage(m.chat, { audio: audioBuffer, mimetype: 'audio/mpeg', ptt: true }).catch(() => {});
    }
};

handler.command = /^زرف$/i;
handler.group = true;

export default handler;