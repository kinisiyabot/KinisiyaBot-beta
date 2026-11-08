import fs from 'fs';
import path from 'path';

// دالة لحذف الملف
let deleteFile = async (filename) => {
    let filePath = path.join('plugins', filename);
    
    try {
        // التحقق من وجود الملف
        await fs.promises.access(filePath, fs.constants.F_OK);
        
        // حذف الملف
        await fs.promises.unlink(filePath);
        console.log(`تم حذف الملف ${filename} بنجاح.`);
    } catch (err) {
        console.error(`فشل في حذف الملف ${filename}: ${err.message}`);
        throw err;
    }
};

// المعالج للأمر
let handler = async (m, { isROwner, usedPrefix, command, text }) => {
    if (!isROwner) return m.reply('❌ هذا الأمر متاح فقط للمطور!');
    
    if (!text) {
        return m.reply(`📌 يرجى تحديد اسم الملف المراد حذفه\nمثال:\n${usedPrefix + command} example.js`);
    }

    let filename = text.trim();
    
    // التأكد من أن اسم الملف ينتهي بـ .js
    if (!filename.endsWith('.js')) {
        filename += '.js';
    }

    try {
        await deleteFile(filename);
        m.reply(`✅ تم حذف الملف *${filename}* بنجاح`);
    } catch (e) {
        if (e.code === 'ENOENT') {
            m.reply(`❌ الملف *${filename}* غير موجود في مجلد plugins`);
        } else {
            console.error(e);
            m.reply(`❌ فشل في حذف الملف:\n${e.message}`);
        }
    }
};

// إعدادات المساعدة والتصنيف والأمر
handler.help = ['حذف كود <اسم الملف>'];
handler.tags = ['owner'];
handler.command = /^(حذف-كود|حذف كود|deleteplugin|delplugin)$/i;
handler.rowner = true;

export default handler;