import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let handler = async (m, { text, command, args, mentionedJidList }) => {
    try {
        let number, nickname;
        
        // الحالة 1: الرد على شخص + كتابة اللقب فقط
        if (m.quoted && args.length >= 1) {
            // الحصول على رقم الشخص الذي تم الرد عليه
            const quotedNumber = m.quoted.sender.split('@')[0];
            
            // إذا كان الرد على بوت أو نفسك
            if (!quotedNumber || quotedNumber === m.sender.split('@')[0]) {
                return m.reply('❌ لا يمكن حفظ لقب لنفسك أو للبوت بهذه الطريقة');
            }
            
            number = quotedNumber;
            nickname = args.join(' ');
            
            await m.reply(`⏳ جاري حفظ لقب للرقم: ${number}...`);
            
        } 
        // الحالة 2: كتابة الرقم واللقب معاً
        else if (args.length >= 2) {
            number = args[0];
            nickname = args.slice(1).join(' ');
            
            await m.reply(`⏳ جاري حفظ لقب للرقم: ${number}...`);
            
        } 
        // الحالة 3: ذكر شخص + كتابة اللقب
        else if (mentionedJidList && mentionedJidList.length > 0 && args.length >= 1) {
            const mentionedNumber = mentionedJidList[0].split('@')[0];
            number = mentionedNumber;
            
            // استخراج اللقب (إزالة @ أو أي إشارات)
            nickname = args.filter(arg => !arg.includes('@')).join(' ');
            
            if (!nickname) {
                return m.reply('❌ الرجاء كتابة اللقب بعد ذكر الشخص');
            }
            
            await m.reply(`⏳ جاري حفظ لقب للمستخدم المذكور...`);
        }
        else {
            return m.reply(
                `🎯 *طريقة الاستخدام:*\n\n` +
                `1. *الرد على شخص + اللقب:*\n` +
                `   رد على رسالة الشخص واكتب:\n   \`.لقب-حفظ راديو\`\n\n` +
                `2. *كتابة الرقم واللقب:*\n` +
                `   \`.لقب-حفظ 201500564191 راديو\`\n\n` +
                `3. *ذكر الشخص + اللقب:*\n` +
                `   \`.لقب-حفظ @الشخص راديو\``
            );
        }

        // التحقق من صيغة الرقم
        if (!/^\d+$/.test(number)) {
            return m.reply('❌ رقم غير صالح! الرجاء التأكد من الرقم');
        }

        // إذا كان اللقب طويلاً جداً
        if (nickname.length > 50) {
            return m.reply('❌ اللقب طويل جداً! الحد الأقصى 50 حرف');
        }

        const filePath = path.join(__dirname, '../nake-names/users.js');

        try {
            // إنشاء المجلد إذا لم يكن موجوداً
            const dirPath = path.dirname(filePath);
            await fs.mkdir(dirPath, { recursive: true });
            
            // قراءة الملف الحالي
            let usersData = {};
            try {
                const fileContent = await fs.readFile(filePath, 'utf8');
                
                if (fileContent.includes('export default')) {
                    const jsonMatch = fileContent.match(/export\s+default\s+(\{[\s\S]*\});?/);
                    if (jsonMatch) {
                        const jsonStr = jsonMatch[1];
                        try {
                            usersData = JSON.parse(jsonStr.replace(/'/g, '"'));
                        } catch {
                            usersData = eval(`(${jsonStr})`);
                        }
                    }
                } else if (fileContent.trim().startsWith('{')) {
                    try {
                        usersData = JSON.parse(fileContent);
                    } catch {
                        usersData = eval(`(${fileContent})`);
                    }
                }
            } catch (readError) {
                console.log('📁 إنشاء ملف جديد للمستخدمين...');
            }

            // حفظ البيانات مع التاريخ
            const timestamp = new Date().toISOString();
            usersData[number] = {
                nickname: nickname,
                savedBy: m.sender.split('@')[0],
                savedAt: timestamp,
                lastUpdated: timestamp
            };
            
            // كتابة البيانات
            const jsContent = `export default ${JSON.stringify(usersData, null, 2)};`;
            await fs.writeFile(filePath, jsContent, 'utf8');
            
            return m.reply(
                `✅ *تم حفظ اللقب بنجاح!*\n\n` +
                `📞 *الرقم:* \`${number}\`\n` +
                `🏷️ *اللقب:* ${nickname}\n` +
                `👤 *الحفظ بواسطة:* ${m.sender.split('@')[0]}\n` +
                `📅 *التاريخ:* ${new Date().toLocaleString('ar-EG')}\n\n` +
                `💾 تم الحفظ في قاعدة البيانات`
            );

        } catch (error) {
            console.error('❌ خطأ في حفظ الملف:', error);
            return m.reply('❌ حدث خطأ تقني. تأكد من صلاحيات المجلدات.');
        }

    } catch (error) {
        console.error('❌ خطأ في الأمر:', error);
        return m.reply('❌ حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
    }
};

handler.help = ["لقب-حفظ [اللقب] (بالرد)", "لقب-حفظ <الرقم> <اللقب>"];
handler.tags = ["tools", "nicknames"];
handler.command = /^(لقب-حفظ|حفظ-لقب|setnick)$/i;

export default handler;