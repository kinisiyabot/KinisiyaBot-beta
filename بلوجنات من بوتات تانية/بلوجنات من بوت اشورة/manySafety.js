import fs from 'fs';
import path from 'path';
import { isElite, extractPureNumber } from '../lib/elite.js';

const dataDir = path.join(process.cwd(), 'data');
const monitorFile = path.join(dataDir, 'monitorState.json');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(monitorFile)) fs.writeFileSync(monitorFile, JSON.stringify({}));

const loadMonitorState = () => {
    try {
        return JSON.parse(fs.readFileSync(monitorFile));
    } catch (err) {
        console.error("خطأ في قراءة ملف المراقبة:", err);
        return {};
    }
};

const saveMonitorState = (data) => {
    try {
        fs.writeFileSync(monitorFile, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("خطأ في حفظ ملف المراقبة:", err);
    }
};

let handlerAttached = false;
const cooldowns = {};

const handler = async (m, { conn, text }) => {
    const sender = extractPureNumber(m.sender);

    // التحقق إذا الرقم من النخبة
    if (!isElite(sender)) {
        return m.reply('🚫 هذا الأمر مخصص فقط لأعضاء النخبة.');
    }

    // التحقق إذا الرسالة داخل جروب
    if (!m.isGroup) {
        return m.reply('🚫 هذا الأمر يعمل فقط في الجروبات.');
    }

    const groupId = m.chat;
    const state = loadMonitorState();

    if (state[groupId]) {
        delete state[groupId];
        saveMonitorState(state);
        return m.reply('❎ تم إلغاء مراقبة العقوبات.');
    }

    state[groupId] = true;
    saveMonitorState(state);
    await m.reply('✅ تم تفعيل مراقبة العقوبات.');

    if (handlerAttached) return;

    conn.ev.on('group-participants.update', async (update) => {
        const state = loadMonitorState();
        const groupId = update.id;

        if (!state[groupId]) return;
        if (!update.action || !['promote', 'demote'].includes(update.action)) return;

        if (cooldowns[groupId]) return;
        cooldowns[groupId] = true;
        setTimeout(() => delete cooldowns[groupId], 5000); // 5 ثواني كولداون

        try {
            // 🟡 تحديد الفاعل والمستهدفين
            const actor = update.author || update.actor || null;
            const actorJid = actor ? actor : null;
            const targets = update.participants || [];

            // 👮‍♂️ عقاب: الفاعل + المستهدف
            const toDemote = [actorJid, ...targets].filter(Boolean);

            if (toDemote.length > 0) {
                await conn.groupParticipantsUpdate(groupId, toDemote, 'demote').catch(console.error);

                await conn.sendMessage(groupId, {
                    text: `🚨 محاولة ${update.action === 'promote' ? 'ترقية' : 'إزالة'} غير مصرح بها!\n👤 الفاعل: ${actorJid ? '@' + actorJid.split('@')[0] : 'غير معروف'}\n🎯 المستهدف: ${targets.map(t => '@' + t.split('@')[0]).join(', ')}\n\n❌ تم سحب الإشراف من كليهما.`,
                    mentions: [actorJid, ...targets].filter(Boolean)
                });
            }

        } catch (err) {
            console.error("خطأ أثناء تنفيذ العقوبة:", err);
        }
    });

    handlerAttached = true;
};

handler.command = /^عقاب$/i;
handler.group = true;

export default handler;