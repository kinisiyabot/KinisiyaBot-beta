import fs from 'fs';
import path from 'path';

import { isElite, extractPureNumber } from '../lib/elite.js';

const handler = async (m, { conn, text }) => {
    const sender = extractPureNumber(m.sender); // تحويل JID إلى رقم صافي

    // التحقق إذا الرقم من النخبة
    if (!isElite(sender)) {
        return m.reply('🚫 هذا الأمر مخصص فقط لأعضاء النخبة.');
    }
    
    const pluginsDir = path.join(process.cwd(), 'plugins');
    if (!fs.existsSync(pluginsDir)) return m.reply('⚠ مجلد plugins غير موجود.');

    const files = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js'));

    if (!text) {
        // عرض كل أسماء الملفات
        let listText = '📂 قائمة ملفات الأوامر:\n\n';
        files.forEach((file, index) => {
            listText += `#${index + 1} - ${file}\n`;
        });
        return m.reply(listText);
    }

    // إذا تم إدخال اسم أو رقم الملف
    let fileToSend;
    if (/^\d+$/.test(text)) {
        const index = parseInt(text) - 1;
        if (index < 0 || index >= files.length) return m.reply('⚠ الرقم غير صالح.');
        fileToSend = files[index];
    } else {
        if (!files.includes(text.endsWith('.js') ? text : text + '.js'))
            return m.reply('⚠ هذا الملف غير موجود.');
        fileToSend = text.endsWith('.js') ? text : text + '.js';
    }

    const filePath = path.join(pluginsDir, fileToSend);
    try {
        await conn.sendMessage(m.chat, { 
            document: fs.readFileSync(filePath),
            fileName: fileToSend,
            mimetype: 'application/javascript'
        });
    } catch (e) {
        console.log(e);
        m.reply('⚠ حدث خطأ أثناء إرسال الملف.');
    }
};

handler.command = ['باتش'];
handler.group = false;
export default handler;