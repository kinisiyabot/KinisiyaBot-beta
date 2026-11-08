import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let handler = async (m, { text, command, args, mentionedJidList }) => {
    try {
        let number, targetUser, nicknameBeforeDelete;
        
        // الحالة 1: الرد على شخص
        if (m.quoted) {
            targetUser = m.quoted.sender;
            number = targetUser.split('@')[0];
        } 
        // الحالة 2: ذكر شخص
        else if (mentionedJidList && mentionedJidList.length > 0) {
            targetUser = mentionedJidList[0];
            number = targetUser.split('@')[0];
        }
        // الحالة 3: كتابة الرقم يدوياً
        else if (args.length >= 1) {
            number = args[0];
            
            if (!/^\d+$/.test(number)) {
                return m.reply('❌ الرجاء إدخال رقم صحيح');
            }
        }
        else {
            return m.reply(
                `🗑️ *طريقة استخدام لقب-مسح:*\n\n` +
                `1. *الرد على شخص:*\n   \`.لقب-مسح\` (بالرد فقط)\n\n` +
                `2. *ذكر الشخص:*\n   \`.لقب-مسح @الشخص\`\n\n` +
                `3. *كتابة الرقم:*\n   \`.لقب-مسح 201500564191\`\n\n` +
                `⚠️ *تحذير:* هذا الأمر يحذف اللقب نهائياً!`
            );
        }

        // التحقق من صلاحيات الحذف (اختياري)
        const senderNumber = m.sender.split('@')[0];
        const isAdmin = true; // يمكنك إضافة منطق للتحقق من الأدمن هنا
        
        if (!isAdmin && number === senderNumber) {
            return m.reply('❌ لا يمكنك حذف لقب شخص آخر إلا إذا كنت مشرفاً');
        }

        const filePath = path.join(__dirname, '../nake-names/users.js');

        await m.reply(`⏳ جاري البحث عن اللقب لحذفه...`);

        try {
            const fileContent = await fs.readFile(filePath, 'utf8');
            const jsonMatch = fileContent.match(/export\s+default\s+(\{[\s\S]*\});?/);
            
            if (!jsonMatch) {
                return m.reply('📭 لا توجد ألقاب محفوظة بعد');
            }

            const jsonStr = jsonMatch[1];
            const usersData = eval(`(${jsonStr})`);
            
            if (!usersData[number]) {
                return m.reply(`❌ لا يوجد لقب محفوظ للرقم: \`${number}\``);
            }
            
            // حفظ اللقب قبل الحذف للعرض
            nicknameBeforeDelete = usersData[number].nickname;
            
            // حذف العنصر
            delete usersData[number];
            
            // إذا أصبحت البيانات فارغة، احذف الملف
            if (Object.keys(usersData).length === 0) {
                await fs.unlink(filePath);
                return m.reply(
                    `✅ *تم حذف اللقب بنجاح!*\n\n` +
                    `📞 *الرقم:* \`${number}\`\n` +
                    `🗑️ *اللقب المحذوف:* ${nicknameBeforeDelete}\n\n` +
                    `📭 *ملاحظة:* تم حذف الملف لأن قاعدة البيانات أصبحت فارغة`
                );
            }
            
            // كتابة البيانات المحدثة
            const jsContent = `export default ${JSON.stringify(usersData, null, 2)};`;
            await fs.writeFile(filePath, jsContent, 'utf8');
            
            return m.reply(
                `✅ *تم حذف اللقب بنجاح!*\n\n` +
                `📞 *الرقم:* \`${number}\`\n` +
                `🗑️ *اللقب المحذوف:* ${nicknameBeforeDelete}\n` +
                `👤 *الحذف بواسطة:* ${senderNumber}\n` +
                `📅 *التاريخ:* ${new Date().toLocaleString('ar-EG')}\n\n` +
                `💾 بقي ${Object.keys(usersData).length} لقب في القاعدة`
            );

        } catch (error) {
            console.error('❌ خطأ في الحذف:', error);
            
            if (error.code === 'ENOENT') {
                return m.reply('📭 قاعدة البيانات غير موجودة');
            }
            
            return m.reply('❌ حدث خطأ أثناء الحذف');
        }

    } catch (error) {
        console.error('❌ خطأ في الأمر:', error);
        return m.reply('❌ حدث خطأ غير متوقع');
    }
};

handler.help = ["لقب-مسح (بالرد أو @أو رقم)"];
handler.tags = ["tools", "nicknames"];
handler.command = /^(لقب-مسح|مسح-لقب|delnick|removenick)$/i;

export default handler;