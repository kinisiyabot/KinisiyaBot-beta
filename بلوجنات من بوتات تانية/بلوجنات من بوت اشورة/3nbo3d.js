import { isElite, extractPureNumber } from "../const/elite.js";
import { jidDecode } from "@soymaycol/maybailyes";

const decode = jid => (jidDecode(jid)?.user || jid.split('@')[0]) + '@s.whatsapp.net';

const handler = async (m, { conn: sock }) => {
    const sender = extractPureNumber(m.sender); // تحويل JID إلى رقم صافي

    // التحقق إذا الرقم من النخبة
    if (!isElite(sender)) {
        return m.reply('🚫 هذا الأمر مخصص فقط لأعضاء النخبة.');
    }

    const chatId = m.key.remoteJid;
    const senderJid = decode(m.key.participant || m.participant || chatId);

    const text = m.message?.conversation || m.message?.extendedTextMessage?.text || '';
    const input = text.trim().split(' ').slice(1); // بعد كلمة "ب"
    const indexOrCommand = input[0];
    const commandText = input.slice(1).join(' ');

    const allChats = await sock.groupFetchAllParticipating();
    const groups = Object.values(allChats);

    // ✅ لو كتب فقط "ب" أو "ب عرض"
    if (!indexOrCommand || indexOrCommand === 'عرض') {
        let list = '📋 *قائمة المجموعات:*\n\n';
        let i = 1;

        for (const group of groups) {
            try {
                const metadata = await sock.groupMetadata(group.id);
                const memberCount = metadata.participants?.length || 0;

                let inviteCode;
                try {
                    inviteCode = await sock.groupInviteCode(group.id);
                } catch {
                    inviteCode = "غير متاح";
                }

                list += `╭━━ ⦿ *${i} - ${metadata.subject || 'بدون عنوان'}*\n`;
                list += `┃👥 *الأعضاء:* ${memberCount}\n`;
                list += `┃🔗 *الرابط:*\n┃ ${inviteCode ? `https://chat.whatsapp.com/${inviteCode}` : "غير متاح"}\n`;
                list += `╰━━━━━━━━━━━━━━━\n\n`;
                i++;
            } catch (err) {
                list += `*${i}*. ${group.subject || 'غير معروف'} (حدث خطأ في جلب البيانات)\n\n`;
                i++;
            }
        }

        list += `🔹 لاستخدام الأمر:\nب [رقم] [أمر]\nمثال: ب 3 .اوامر`;

        return sock.sendMessage(chatId, { text: list }, { quoted: m });
    }

    // ✅ تنفيذ أمر داخل مجموعة برقمها
    const index = parseInt(indexOrCommand);
    if (isNaN(index) || !commandText) {
        return sock.sendMessage(chatId, {
            text: `⚠️ الاستخدام:\nب [رقم] [أمر]\nمثال: ب 2 .منشن`
        }, { quoted: m });
    }

    const group = groups[index - 1];
    if (!group) {
        return sock.sendMessage(chatId, {
            text: `❌ لا يوجد مجموعة بهذا الرقم: ${index}`
        }, { quoted: m });
    }

    // نقل الرد والمحتوى الكامل للرسالة للأمر الآخر
    const contextInfo = m.message?.extendedTextMessage?.contextInfo || {};

    const fakeMsg = {
        key: {
            remoteJid: group.id,
            participant: senderJid,
            fromMe: false,
            id: m.key.id
        },
        message: {
            extendedTextMessage: {
                text: commandText,
                contextInfo: {
                    ...contextInfo,
                    participant: senderJid,
                    mentionedJid: [senderJid]
                }
            }
        },
        messageTimestamp: m.messageTimestamp || Date.now(),
        pushName: m.pushName || "النخبة"
    };

    // استخراج الأمر وتنفيذه
    const allPlugins = getPlugins();
    const cmdName = commandText.trim().split(' ')[0].replace('.', '').toLowerCase();
    const cmdArgs = commandText.trim().split(/\s+/).slice(1);

    const plugin = Object.values(allPlugins).find(p => {
        if (!p.command) return false;
        const commands = Array.isArray(p.command) ? p.command : [p.command];
        return commands.some(c => c.replace(/^\./, '').toLowerCase() === cmdName);
    });

    if (!plugin) {
        return await sock.sendMessage(chatId, {
            text: `❌ لم يتم العثور على الأمر: ${cmdName}`
        }, { quoted: m });
    }

    const executeFn = plugin.execute || plugin.handler;
    if (!executeFn) {
        return await sock.sendMessage(chatId, {
            text: `❌ هذا الأمر لا يدعم التنفيذ عن بُعد.`
        }, { quoted: m });
    }

    try {
        await executeFn(sock, fakeMsg, cmdArgs);
        await sock.sendMessage(chatId, {
            text: `✅ تم تنفيذ الأمر *${cmdName}* داخل المجموعة *${group.subject}*`
        }, { quoted: m });
    } catch (err) {
        console.error('⛔ خطأ أثناء تنفيذ الأمر:', err);
        await sock.sendMessage(chatId, {
            text: `❌ حدث خطأ أثناء تنفيذ الأمر داخل المجموعة المحددة.`
        }, { quoted: m });
    }
};

handler.command = ['ب'];
handler.group = false;
handler.category = 'tools';
handler.description = 'عرض المجموعات أو تنفيذ أمر في مجموعة أخرى';

export default handler;