import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url'; 
import { dirname } from 'path';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const handler = async (m, { conn, isOwner }) => {
    try {
        // السماح للمطورين فقط
        if (!isOwner) {
            return conn.sendMessage(m.chat, { text: "❌ هذا الأمر مخصص للمطور فقط." }, { quoted: m });
        }

        const botFolderPath = path.join(__dirname, '../');
        const zipFilePath = path.join(__dirname, '../bot_files.zip');

        await conn.sendMessage(m.chat, { text: `📂 جاري قراءة ملفات البوت...` }, { quoted: m });
        
        const files = fs.readdirSync(botFolderPath);
        
        if (files.length === 0) {
            await conn.sendMessage(m.chat, { text: `⚠️ لا توجد ملفات لضغطها.` }, { quoted: m });
            return;
        }

        await conn.sendMessage(m.chat, { text: `🔄 تم العثور على ${files.length} ملفات/مجلدات. جاري إنشاء ملف ZIP...` }, { quoted: m });

        const zipCommand = `zip -r "${zipFilePath}" . -x ".npm/*" "node_modules/*"`;

        exec(zipCommand, { cwd: botFolderPath }, async (error) => {
            if (error) {
                await conn.sendMessage(m.chat, { text: `❌ حدث خطأ أثناء إنشاء ملف ZIP: ${error.message}` }, { quoted: m });
                return;
            }

            if (!fs.existsSync(zipFilePath)) {
                await conn.sendMessage(m.chat, { text: `❌ لم يتم إنشاء ملف ZIP.` }, { quoted: m });
                return;
            }

            await conn.sendMessage(m.chat, {
                document: fs.readFileSync(zipFilePath),
                mimetype: 'application/zip',
                fileName: 'bot_files.zip'
            }, { quoted: m });

            fs.unlink(zipFilePath, () => {});
        });
    } catch (err) {
        await conn.sendMessage(m.chat, { text: `❌ فشل في معالجة ملفات البوت: ${err.message}` }, { quoted: m });
    }
};

handler.command = /^(س)$/i;

export default handler;