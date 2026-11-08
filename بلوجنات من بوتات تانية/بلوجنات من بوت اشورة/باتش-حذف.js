import fs from 'fs';
import path from 'path';
import { isElite, extractPureNumber } from '../lib/elite.js';

const handler = async (m, { conn }) => {
    const sender = extractPureNumber(m.sender); // تحويل JID إلى رقم صافي

    // التحقق إذا الرقم من النخبة
    if (!isElite(sender)) {
        return m.reply('🚫 هذا الأمر مخصص فقط لأعضاء النخبة.');
    }

    if (!text) return m.reply('⚠ اكتب رقم أو اسم الملف المراد حذفه.');

    const pluginsDir = path.join(process.cwd(), 'plugins');
    if (!fs.existsSync(pluginsDir)) return m.reply('⚠ مجلد plugins غير موجود.');

    const files = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js'));
    let fileToDelete;

    // تحديد الملف بالرقم أو الاسم
    if (/^\d+$/.test(text)) {
        const index = parseInt(text) - 1;
        if (index < 0 || index >= files.length) return m.reply('⚠ الرقم غير صالح.');
        fileToDelete = files[index];
    } else {
        fileToDelete = text.endsWith('.js') ? text : text + '.js';
        if (!files.includes(fileToDelete)) return m.reply('⚠ الملف غير موجود.');
    }

    const filePath = path.join(pluginsDir, fileToDelete);

    try {
        fs.unlinkSync(filePath);
        m.reply(`✅ تم حذف الملف: ${fileToDelete}`);
    } catch (e) {
        console.log(e);
        m.reply('⚠ حدث خطأ أثناء حذف الملف.');
    }
};

handler.command = ['باتش-حذف'];
handler.group = false;
export default handler;