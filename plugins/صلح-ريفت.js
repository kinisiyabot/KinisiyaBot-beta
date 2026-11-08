import fs from 'fs/promises';
import path from 'path';

const handler = async (m, { conn, text }) => {
  const folder = './plugins';
  const targetFile = 'ريفت.js'; // اسم ملف ريفت
  const filePath = path.join(folder, targetFile);

  // السطر المكسور والسطر الصحيح
  const brokenLine = `if (!text) return m.replyif (!text) return m.reply(\`⚠️ Please enter anime name\\n\\nExample: \${usedPrefix}انمي-ريفت jujutsu kaisen\`)`;
  const fixedLine  = `if (!text) return m.reply(\`⚠️ Please enter anime name\\n\\nExample: \${usedPrefix}انمي-ريفت jujutsu kaisen\`)`;

  let content;
  try {
    content = await fs.readFile(filePath, 'utf8');
  } catch (e) {
    return m.reply(`❌ لم يتم العثور على الملف: ${targetFile}\n\nتأكد من اسم الملف وموقعه`);
  }

  if (!content.includes('m.replyif')) {
    return m.reply(`✅ الملف لا يحتاج إصلاح، لم يُعثر على الخطأ`);
  }

  const fixed = content.replace(
    /if \(!text\) return m\.replyif \(!text\) return m\.reply\(/g,
    'if (!text) return m.reply('
  );

  if (fixed === content) {
    return m.reply(`⚠️ لم يتم إجراء أي تغيير، تحقق من الكود يدوياً`);
  }

  await fs.writeFile(filePath, fixed, 'utf8');
  await m.reply(`✅ تم إصلاح ملف ${targetFile} بنجاح!\n\n🔧 تم تصحيح:\nm.replyif → m.reply\n\n♻️ أعد تشغيل البوت لتفعيل الإصلاح`);
};

handler.help = ['fixrift'];
handler.tags = ['tools'];
handler.command = ['اصلح-ريفت', 'fixrift'];
handler.owner = true;
export default handler;