// plugins/eliteCommand.js
import { isElite, addEliteNumber, removeEliteNumber, listElite, isOwner, extractPureNumber } from '../lib/elite.js';

const handler = async (m, { conn }) => {
    const senderJid = m.key.participant || m.participant || m.key.remoteJid;
    const senderNumber = extractPureNumber(senderJid);
    
    const sender = extractPureNumber(m.sender);

    // التحقق إذا الرقم من النخبة
    if (!isElite(sender)) {
        return m.reply('🚫 هذا الأمر مخصص فقط لأعضاء النخبة.');
    }

    const text = m.message?.conversation || m.message?.extendedTextMessage?.text || '';
    const parts = text.trim().split(/\s+/);
    const action = parts[1];

    if (!action || !['اضف', 'ازل', 'عرض'].includes(action)) {
        return conn.sendMessage(m.key.remoteJid, { text: '❌ استخدم: .نخبة اضف/ازل/عرض مع منشن أو رقم.' }, { quoted: m });
    }

    let targetNumber;

    // رقم مباشر
    if (parts[2] && /^\d{5,}$/.test(parts[2])) {
        targetNumber = extractPureNumber(parts[2]);
    }

    // أو من منشن / رد
    if (!targetNumber) {
        const targetJid = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
                          m.message?.extendedTextMessage?.contextInfo?.participant;
        if (!targetJid && action !== 'عرض') {
            return conn.sendMessage(m.key.remoteJid, { text: '❌ يجب منشن أو الرد على الشخص المستهدف أو إدخال رقم صحيح.' }, { quoted: m });
        }
        targetNumber = extractPureNumber(targetJid);
    }

    if (action === 'اضف') {
        if (isElite(targetNumber)) {
            return conn.sendMessage(m.key.remoteJid, { text: `⚠️ الرقم ${targetNumber} موجود بالفعل في النخبة.` }, { quoted: m });
        }
        addEliteNumber(targetNumber);
        return conn.sendMessage(m.key.remoteJid, { text: `✅ تم إضافة الرقم ${targetNumber} إلى النخبة.` }, { quoted: m });
    }

    if (action === 'ازل') {
        if (!isElite(targetNumber)) {
            return conn.sendMessage(m.key.remoteJid, { text: `⚠️ الرقم ${targetNumber} غير موجود في النخبة.` }, { quoted: m });
        }
        removeEliteNumber(targetNumber);
        return conn.sendMessage(m.key.remoteJid, { text: `✅ تم إزالة الرقم ${targetNumber} من النخبة.` }, { quoted: m });
    }

    if (action === 'عرض') {
        const list = listElite().map((n, i) => `${i + 1}. ${n}`).join('\n');
        return conn.sendMessage(m.key.remoteJid, { text: `قائمة النخبة:\n\n${list || 'لا يوجد أرقام بعد.'}` }, { quoted: m });
    }
};

handler.command = /^نخبة$/i;
handler.group = true;
handler.rowner = false; // فقط المطور الرئيسي
handler.botAdmin = false;

export default handler;