import fs from 'fs';
import path from 'path';

const handler = async (m, { conn, isOwner, text }) => {
    // السماح للمطورين فقط
    if (!isOwner) return m.reply('❌ هذا الأمر للمطور فقط.');

    if (!text) return m.reply('⚠ اكتب اسم الأمر الجديد بعد #اضافه.');
    if (!m.quoted || !m.quoted.text) return m.reply('⚠ يرجى الرد على رسالة تحتوي على كود JS.');

    const commandName = text.replace(/\s+/g, '_'); // اسم الملف الجديد
    const codeContent = m.quoted.text; // الكود اللي اترد عليه

    const pluginsDir = path.join(process.cwd(), 'plugins');
    if (!fs.existsSync(pluginsDir)) fs.mkdirSync(pluginsDir);

    const filePath = path.join(pluginsDir, `${commandName}.js`);

    try {
        // حفظ الكود كما هو
        fs.writeFileSync(filePath, codeContent, 'utf-8');
        m.reply(`✅ تم إنشاء الملف الجديد: ${commandName}.js\n📂 المسار: plugins/${commandName}.js`);
    } catch (e) {
        console.error(e);
        m.reply('⚠ حدث خطأ أثناء حفظ الملف.');
    }
};

handler.command = ['اضافه'];
handler.group = false;

export default handler;