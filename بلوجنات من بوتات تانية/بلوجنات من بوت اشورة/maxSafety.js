import fs from 'fs';
import path from 'path';
import { isElite, extractPureNumber } from '../lib/elite.js';

const dataDir = path.join(process.cwd(), 'data');
const protectionFile = path.join(dataDir, 'protection.json');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(protectionFile)) fs.writeFileSync(protectionFile, JSON.stringify({}));

const loadProtection = () => {
    try {
        return JSON.parse(fs.readFileSync(protectionFile));
    } catch (err) {
        console.error("خطأ في قراءة ملف الحماية:", err);
        return {};
    }
};

const saveProtection = (data) => {
    try {
        fs.writeFileSync(protectionFile, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("خطأ في حفظ ملف الحماية:", err);
    }
};

let handlerAttached = false;
const cooldowns = {};

const handler = async (m, { conn }) => {
    const sender = extractPureNumber(m.sender);

    // التحقق إذا الرقم من النخبة
    if (!isElite(sender)) {
        return m.reply('🚫 هذا الأمر مخصص فقط لأعضاء النخبة.');
    }

    if (!m.isGroup) {
        return m.reply('🚫 هذا الأمر يعمل فقط في الجروبات.');
    }

    const groupId = m.chat;
    const state = loadProtection();

    if (state[groupId]) {
        delete state[groupId];
        saveProtection(state);
        return m.reply('❎ تم إيقاف الحماية في هذا الجروب.');
    }

    state[groupId] = true;
    saveProtection(state);
    await m.reply('✅ تم تفعيل الحماية في هذا الجروب.');

    if (handlerAttached) return;

    // 🛡️ مراقبة التغييرات
    conn.ev.on('group-participants.update', async (update) => {
        const state = loadProtection();
        const groupId = update.id;

        if (!state[groupId]) return;
        if (!update.action || !['promote', 'demote', 'remove'].includes(update.action)) return;

        if (cooldowns[groupId]) return;
        cooldowns[groupId] = true;
        setTimeout(() => delete cooldowns[groupId], 5000); // 5 ثواني كولداون

        try {
            const actor = update.author || update.actor || null;
            const actorJid = actor ? actor : null;
            const targets = update.participants || [];

            const metadata = await conn.groupMetadata(groupId);
            const participants = metadata.participants;

            // لو محاولة طرد نخبة → رجعه
            if (update.action === 'remove') {
                for (let t of targets) {
                    const num = extractPureNumber(t);
                    if (isElite(num)) {
                        await conn.groupParticipantsUpdate(groupId, [t], 'add');
                    }
                }
            }

            // ⛔ نزل كل المشرفين (أي حد مش نخبة)
            const admins = participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin');
            if (admins.length > 0) {
                await conn.groupParticipantsUpdate(groupId, admins.map(a => a.id), 'demote').catch(console.error);
            }

            // ⬆️ رقي كل النخبة
            const toPromote = participants
                .filter(p => {
                    const number = extractPureNumber(p.id);
                    return isElite(number); // أي نخبة لازم تبقى Admin
                })
                .map(p => p.id);

            if (toPromote.length > 0) {
                await conn.groupParticipantsUpdate(groupId, toPromote, 'promote').catch(console.error);
            }

            await conn.sendMessage(groupId, {
                text: `📜 محاولة ${update.action === 'promote' ? 'ترقية' : update.action === 'demote' ? 'إزالة مشرف' : 'طرد'} غير مصرح بها!\n👤 الفاعل: ${actorJid ? '@' + actorJid.split('@')[0] : 'غير معروف'}\n\n✅ تم تنزيل كل المشرفين وترقية النخبة فقط.`,
                mentions: [actorJid, ...targets].filter(Boolean)
            });

        } catch (err) {
            console.error("خطأ أثناء تنفيذ الحماية:", err);
        }
    });

    handlerAttached = true;
};

handler.command = /^حماية$/i;
handler.group = true;

export default handler;