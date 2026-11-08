import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let handler = async (m, { text, command, args }) => {
    try {
        const filePath = path.join(__dirname, '../nake-names/users.js');
        
        await m.reply("📋 جاري جلب جميع الألقاب...");

        try {
            const fileContent = await fs.readFile(filePath, 'utf8');
            const jsonMatch = fileContent.match(/export\s+default\s+(\{[\s\S]*\});?/);
            
            if (!jsonMatch) {
                return m.reply('📭 لا توجد ألقاب محفوظة بعد');
            }

            const jsonStr = jsonMatch[1];
            const usersData = eval(`(${jsonStr})`);
            const total = Object.keys(usersData).length;
            
            if (total === 0) {
                return m.reply('📭 لا توجد ألقاب محفوظة');
            }
            
            // إنشاء قائمة بالألقاب
            let nicknamesList = "📜 *قائمة جميع الألقاب:*\n\n";
            let counter = 1;
            
            for (const [number, data] of Object.entries(usersData)) {
                const date = new Date(data.lastUpdated || data.savedAt);
                const shortDate = date.toLocaleDateString('ar-EG');
                
                nicknamesList += `${counter}. 📞 \`${number}\`\n   🏷️ ${data.nickname}\n   👤 ${data.savedBy} | 📅 ${shortDate}\n\n`;
                counter++;
                
                // تقسيم الرسالة إذا كانت طويلة
                if (nicknamesList.length > 1500) {
                    await m.reply(nicknamesList);
                    nicknamesList = "";
                }
            }
            
            if (nicknamesList.trim()) {
                await m.reply(`${nicknamesList}\n📊 *المجموع:* ${total} لقب`);
            }

        } catch (error) {
            console.error('❌ خطأ في القراءة:', error);
            
            if (error.code === 'ENOENT') {
                return m.reply('📭 قاعدة البيانات غير موجودة\n💡 استخدم `.لقب-حفظ` أولاً');
            }
            
            return m.reply('❌ حدث خطأ في قراءة البيانات');
        }

    } catch (error) {
        console.error('❌ خطأ في الأمر:', error);
        return m.reply('❌ حدث خطأ غير متوقع');
    }
};

handler.help = ["لقب-الكل (عرض جميع الألقاب)"];
handler.tags = ["tools", "nicknames"];
handler.command = /^(لقب-الكل|الكل-لقب|allnick|nickall)$/i;

export default handler;