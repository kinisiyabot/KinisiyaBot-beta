import { randomBytes } from 'crypto';
import { isElite, extractPureNumber } from '../const/elite.js';

let handler = async (m, { conn, text }) => {
    // التحقق من النخبة
    const senderNumber = extractPureNumber(m.sender);
    if (!isElite(senderNumber)) 
        return m.reply('🚫 هذا الأمر مخصص فقط لأعضاء النخبة.');

    // التحقق من وجود نص أو رد
    if (!text && !m.quoted)
        return m.reply('🚫 الرجاء كتابة نص للبث أو الرد على رسالة.');

    // جمع كل الجروبات الفعلية التي البوت موجود فيها
    let chats = Object.keys(conn.chats)
        .filter(id => id.endsWith('g.us'));

    if (!chats.length)
        return m.reply('🚫 لا توجد جروبات صالحة للبث.');

    // الرسالة المراد إرسالها
    let msgObj = text ? m : await m.getQuotedObj();

    // إعلام المستخدم
    await conn.reply(m.chat, `⏳ جاري البث إلى *${chats.length}* جروب...`, m);

    let success = 0;
    let failed = 0;

    // إرسال الرسالة لكل جروب
    for (let id of chats) {
        try {
            // استخدام copyNForward بشكل آمن لجميع أنواع الرسائل
            await conn.copyNForward(id, msgObj, true);
            success++;
        } catch (e) {
            console.log(`❌ فشل الإرسال إلى ${id}: ${e.message}`);
            failed++;
        }
        await new Promise(r => setTimeout(r, 1000)); // تأخير لتجنب الحظر
    }

    // تقرير بعد البث
    await m.reply(`✅ تم إرسال الرسالة!\n📤 تم الإرسال: ${success}\n❌ فشل: ${failed}`);
}

// إعدادات الأمر
handler.help = ['broadcast'];
handler.tags = ['elite'];
handler.command = /^(نشر|broadcast)$/i;
handler.owner = false; // غير مقتصر على المطور
export default handler;

// دالة توليد معرف عشوائي
const randomID = length => randomBytes(Math.ceil(length * 0.5)).toString('hex').slice(0, length);