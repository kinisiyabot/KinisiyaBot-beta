import fs from 'fs';
import path from 'path';

const handler = async (m, { conn, isOwner, text }) => {
    // السماح للمطورين فقط
    if (!isOwner) return m.reply('❌ هذا الأمر للمطور فقط.');

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
        console.error(e);
        m.reply('⚠ حدث خطأ أثناء حذف الملف.');
    }
};

handler.command = ['حذفف'];
handler.group = false;

export default handler;