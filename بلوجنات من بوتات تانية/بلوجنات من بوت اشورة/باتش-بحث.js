import cp, { exec as _exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { isElite, extractPureNumber } from '../lib/elite.js'; // ملف النخبة

const exec = promisify(_exec).bind(cp);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const handler = async (m, { conn, text }) => {
    // التحقق من النخبة
    const senderNumber = extractPureNumber(m.sender);
    if (!isElite(senderNumber)) {
        return m.reply('🚫 هذا الأمر مخصص فقط لأعضاء النخبة.');
    }

    // التحقق من وجود نص للبحث
    if (!text) throw `✯≼══━━﹂⛩️﹁━━══≽✯\n\n*يرجى إدخال الكلمة التي ترغب في البحث عنها في الأكواد الموجودة*\n\n✯≼══━━﹂⛩️﹁━━══≽✯`;

    // تحديد مجلد البلوجينز
    const pluginDir = path.join(__dirname, '../plugins');
    const files = fs.readdirSync(pluginDir).filter(file => file.endsWith('.js'));

    let foundFiles = [];

    for (let file of files) {
        const filePath = path.join(pluginDir, file);
        const content = fs.readFileSync(filePath, 'utf-8');

        if (content.includes(text)) {
            foundFiles.push(filePath);
        }
    }

    if (foundFiles.length === 0) {
        return m.reply(`✯≼══━━﹂⛩️﹁━━══≽✯\n\n*لم يتم العثور على الكلمة* *"${text}"* *في أي ملف من الملفات الموجودة.*\n\n✯≼══━━﹂⛩️﹁━━══≽✯`);
    }

    for (let file of foundFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        const fileName = path.basename(file);

        // إرسال محتوى الملف كنص (يمكن تحديد طول القطعة المرسلة)
        await conn.sendMessage(m.chat, { text: content.slice(0, 2000) + (content.length > 2000 ? "\n\n[تم الاقتصاص]" : "") }, { quoted: m });
        // إرسال الملف نفسه كمستند
        await conn.sendMessage(m.chat, { document: fs.readFileSync(file), mimetype: 'application/javascript', fileName }, { quoted: m });
    }
};

handler.help = ['ابحث'].map(v => v + ' *<الكلمة>*');
handler.tags = ['elite'];
handler.command = /^(باتش-بحث|sp)$/i;
handler.owner = false; // ليس مقتصراً على المطور
export default handler;