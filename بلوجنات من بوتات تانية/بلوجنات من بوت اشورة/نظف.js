import { promises as fs } from 'fs';
import path from 'path';
import { isElite, extractPureNumber } from '../const/elite.js';

const handler = async (m, { conn }) => {
    const sender = extractPureNumber(m.sender); // تحويل JID إلى رقم صافي

    // التحقق إذا الرقم من النخبة
    if (!isElite(sender)) {
        return m.reply('🚫 هذا الأمر مخصص فقط لأعضاء النخبة.');
    }

    // حذف النسخ الاحتياطية (.bak)
    const baseDir = path.resolve('./');
    let deletedCount = 0;

    async function cleanDirectory(dir) {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                if (['node_modules', '.git', '𝐊𝐈𝐍𝐈𝐒𝐈𝐘𝐀-𝐁𝐎𝐓'].includes(entry.name)) continue;
                await cleanDirectory(fullPath);
            } else if (entry.isFile() && entry.name.endsWith('.bak')) {
                const originalName = entry.name.replace(/\.bak$/, '');
                const originalPath = path.join(dir, originalName);

                try {
                    await fs.access(originalPath);
                    await fs.unlink(fullPath);
                    deletedCount++;
                } catch {
                    // نتجاهل لو الملف الأصلي مش موجود
                }
            }
        }
    }

    await cleanDirectory(baseDir);

    const resultText = deletedCount
        ? `🧹 تم حذف ${deletedCount} نسخة احتياطية (.bak).`
        : '✅ لا توجد نسخ احتياطية لحذفها.';

    // إرسال الرد مباشرة
    await m.reply(resultText);
};

handler.command = /^نظف$/i;

export default handler;