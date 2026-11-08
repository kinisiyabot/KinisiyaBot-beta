import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let handler = async (m, { text, command, args, mentionedJidList }) => {
    try {
        let number, targetUser;
        
        // الحالة 1: الرد على شخص
        if (m.quoted) {
            targetUser = m.quoted.sender;
            number = targetUser.split('@')[0];
            
            await m.reply(`🔍 جاري البحث عن لقب الرقم: ${number}...`);
        } 
        // الحالة 2: ذكر شخص
        else if (mentionedJidList && mentionedJidList.length > 0) {
            targetUser = mentionedJidList[0];
            number = targetUser.split('@')[0];
            
            await m.reply(`🔍 جاري البحث عن لقب المستخدم المذكور...`);
        }
        // الحالة 3: كتابة الرقم يدوياً
        else if (args.length >= 1) {
            number = args[0];
            
            if (!/^\d+$/.test(number)) {
                return m.reply('❌ الرجاء إدخال رقم صحيح');
            }
            
            await m.reply(`🔍 جاري البحث عن لقب الرقم: ${number}...`);
        }
        else {
            return m.reply(
                `🎯 *طريقة استخدام لقب-جلب:*\n\n` +
                `1. *الرد على شخص:*\n   \`.لقب-جلب\` (بالرد فقط)\n\n` +
                `2. *ذكر الشخص:*\n   \`.لقب-جلب @الشخص\`\n\n` +
                `3. *كتابة الرقم:*\n   \`.لقب-جلب 201500564191\`\n\n` +
                `💡 *ملاحظة:* يمكنك استخدام الأمر دون وسائط بالرد على الشخص مباشرة`
            );
        }

        const filePath = path.join(__dirname, '../nake-names/users.js');

        try {
            const fileContent = await fs.readFile(filePath, 'utf8');
            const jsonMatch = fileContent.match(/export\s+default\s+(\{[\s\S]*\});?/);
            
            if (!jsonMatch) {
                return m.reply('📭 قاعدة البيانات فارغة حالياً');
            }

            const jsonStr = jsonMatch[1];
            const usersData = eval(`(${jsonStr})`);
            const userData = usersData[number];
            
            if (userData && userData.nickname) {
                const date = new Date(userData.lastUpdated || userData.savedAt);
                const arabicDate = date.toLocaleString('ar-EG', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                return m.reply(
                    `🏷️ *تم العثور على اللقب!*\n\n` +
                    `📞 *الرقم:* \`${number}\`\n` +
                    `✨ *اللقب:* ${userData.nickname}\n` +
                    `👤 *حفظ بواسطة:* ${userData.savedBy}\n` +
                    `📅 *آخر تحديث:* ${arabicDate}\n\n` +
                    `🆔 *ID:* ${targetUser || 'غير معروف'}`
                );
            } else {
                return m.reply(`❌ *لم يتم العثور على لقب*\n\nالرقم: \`${number}\`\n💡 حاول حفظ لقب له أولاً`);
            }
        } catch (error) {
            console.error('❌ خطأ في القراءة:', error);
            return m.reply('📭 قاعدة البيانات غير موجودة بعد\n💡 استخدم `.لقب-حفظ` أولاً لحفظ بعض الألقاب');
        }

    } catch (error) {
        console.error('❌ خطأ في الأمر:', error);
        return m.reply('❌ حدث خطأ غير متوقع');
    }
};

handler.help = ["لقب-جلب (بالرد أو @أو رقم)"];
handler.tags = ["tools", "nicknames"];
handler.command = /^(لقب-جلب|جلب-لقب|getnick|nick)$/i;

export default handler;