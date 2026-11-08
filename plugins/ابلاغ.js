import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPORT_ADMIN = "212693863911"; // معلش لا تغيرو دي عشان لو في مشكل يجولي عشان اصححه،،

let handler = async (m, { conn, text, args }) => {
    try {
        // التحقق من وجود النص
        if (!text || args.length === 0) {
            return m.reply(
                `📝 *طريقة استخدام الأمر:*\n\n` +
                `\`.ابلاغ <المشكلة>\`\n\n` +
                `📌 *أمثلة:*\n` +
                `\`.ابلاغ هناك خطأ في البوت\`\n` +
                `\`.ابلاغ المستخدم فلان يسب\`\n` +
                `\`.ابلاغ مشكلة في الأمر كذا\`\n\n` +
                `⚠️ *ملاحظة:* سيتم إرسال البلاغ مباشرة إلى المطور`
            );
        }

        const problem = text;
        const reporterNumber = m.sender.split('@')[0];
        const reporterName = m.pushName || "مستخدم مجهول";
        const chatName = m.chat.endsWith('@g.us') ? await getGroupName(conn, m.chat) : "محادثة خاصة";
        
        await m.reply("📨 جاري إرسال البلاغ...");

        // نص البلاغ المفصل
        const reportMessage = `
🚨 *بلاغ جديد*
━━━━━━━━━━━━━━━━━━━━

📋 *معلومات المرسل:*
👤 *الاسم:* ${reporterName}
📞 *الرقم:* ${reporterNumber}
💬 *المحادثة:* ${chatName}
🆔 *معرف المحادثة:* ${m.chat}

━━━━━━━━━━━━━━━━━━━━
📝 *البلاغ:*
${problem}
━━━━━━━━━━━━━━━━━━━━
📅 *التاريخ:* ${new Date().toLocaleString('ar-EG')}
🕐 *الوقت:* ${new Date().toLocaleTimeString('ar-EG')}
`;

        try {
            // إرسال البلاغ إلى المطور
            await conn.sendMessage(
                `${REPORT_ADMIN}@s.whatsapp.net`,
                { text: reportMessage }
            );

            // حفظ البلاغ في ملف (اختياري)
            await saveReportToFile({
                reporterNumber,
                reporterName,
                chatId: m.chat,
                chatName,
                problem,
                timestamp: new Date().toISOString()
            });

            // رد للمستخدم
            await m.reply(
                `✅ *تم إرسال البلاغ بنجاح!*\n\n` +
                `📋 *رقم تتبع البلاغ:* #REP${Date.now().toString().slice(-6)}\n` +
                `👤 *تم الإرسال إلى:* ${REPORT_ADMIN}\n` +
                `📅 *التاريخ:* ${new Date().toLocaleString('ar-EG')}\n\n` +
                `💬 *ملاحظة:* سيتم مراجعة البلاغ في أقرب وقت ممكن`
            );

        } catch (sendError) {
            console.error('❌ خطأ في إرسال البلاغ:', sendError);
            
            // حفظ البلاغ في ملف حتى لو فشل الإرسال
            await saveReportToFile({
                reporterNumber,
                reporterName,
                chatId: m.chat,
                chatName,
                problem,
                timestamp: new Date().toISOString(),
                error: sendError.message
            });
            
            await m.reply(
                `⚠️ *تم حفظ البلاغ محلياً*\n\n` +
                `❌ تعذر إرسال البلاغ مباشرة\n` +
                `📋 تم حفظه في قاعدة البيانات\n` +
                `🔧 سيتم مراجعته لاحقاً`
            );
        }

    } catch (error) {
        console.error('❌ خطأ في أمر البلاغ:', error);
        await m.reply('❌ حدث خطأ أثناء معالجة البلاغ. يرجى المحاولة مرة أخرى.');
    }
};

// دالة للحصول على اسم المجموعة
async function getGroupName(conn, groupId) {
    try {
        const metadata = await conn.groupMetadata(groupId);
        return metadata.subject || "مجموعة بدون اسم";
    } catch (error) {
        return "مجموعة (غير معروف)";
    }
}

// دالة لحفظ البلاغ في ملف
async function saveReportToFile(reportData) {
    try {
        const reportsDir = path.join(__dirname, '../reports');
        const reportsFile = path.join(reportsDir, 'reports.json');
        
        // إنشاء المجلد إذا لم يكن موجوداً
        await fs.mkdir(reportsDir, { recursive: true });
        
        // قراءة الملف الحالي
        let reports = [];
        try {
            const fileContent = await fs.readFile(reportsFile, 'utf8');
            reports = JSON.parse(fileContent);
        } catch (readError) {
            // الملف غير موجود، نبدأ بمصفوفة فارغة
            reports = [];
        }
        
        // إضافة البلاغ الجديد مع ID
        reportData.id = `REP${Date.now()}`;
        reportData.status = "pending"; // pending, reviewed, resolved
        reports.push(reportData);
        
        // حفظ الملف
        await fs.writeFile(reportsFile, JSON.stringify(reports, null, 2), 'utf8');
        
        console.log(`✅ تم حفظ البلاغ: ${reportData.id}`);
        
    } catch (error) {
        console.error('❌ خطأ في حفظ البلاغ:', error);
    }
}

handler.help = ["ابلاغ <المشكلة>"];
handler.tags = ["tools", "report"];
handler.command = /^(ابلاغ|report|بلاغ)$/i;

export default handler;