import fs from 'fs';
import path from 'path';
import { isElite, extractPureNumber } from '../lib/elite.js';

const handler = async (m, { conn }) => {
    const sender = extractPureNumber(m.sender); // تحويل JID إلى رقم صافي

    // التحقق إذا الرقم من النخبة
    if (!isElite(sender)) {
        return m.reply('🚫 هذا الأمر مخصص فقط لأعضاء النخبة.');
    }

    if (!text) return m.reply('⚠ اكتب اسم الأمر الجديد بعد #اضافه.');
    if (!m.quoted || !m.quoted.text) return m.reply('⚠ يرجى الرد على رسالة تحتوي على كود JS.');

    const commandName = text.replace(/\s+/g, '_'); // اسم الملف الجديد
    const codeContent = m.quoted.text; // نص الرسالة المراد إضافتها

    const pluginsDir = path.join(process.cwd(), 'plugins');
    if (!fs.existsSync(pluginsDir)) fs.mkdirSync(pluginsDir);

    const filePath = path.join(pluginsDir, `${commandName}.js`);

    try {
        // هنا ببساطة نحفظ نفس نص الرسالة بدون أي تغييرات
        fs.writeFileSync(filePath, codeContent, 'utf-8');
        m.reply(`✅ تم إنشاء الملف الجديد: ${commandName}.js\nالمسار: plugins/${commandName}.js`);
    } catch (e) {
        console.log(e);
        m.reply('⚠ حدث خطأ أثناء حفظ الملف.');
    }
};

handler.command = ['باتش-اضافه'];
handler.group = false;
export default handler;