let handler = async (m, { conn, text }) => {
    // التحقق من إدخال الوقت بالثواني
    if (!text) return m.reply("⚠️ يجب كتابة المدة بالثواني. مثال:\n\n.كونسول|5");
    let seconds = parseInt(text);
    if (isNaN(seconds) || seconds <= 0) return m.reply("⚠️ أدخل رقم صحيح للمدة بالثواني.");

    await m.reply(`⏳ سيتم عرض بيانات الكونسول لمدة ${seconds} ثانية.`);

    // حفظ النسخة الأصلية من console.log
    const originalLog = console.log;

    // إعادة تعريف console.log مؤقتًا ليرسل الرسائل للواتس
    console.log = (...args) => {
        // يطبع على الكونسول الأصلي
        originalLog(...args);

        try {
            // تحويل كل العناصر لنص
            let message = args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ');

            // إرسال الرسالة على الشات
            conn.sendMessage(m.chat, { text: `📟 Console: ${message}` });
        } catch (e) {
            originalLog("Error sending console:", e);
        }
    };

    // إيقاف الطباعة بعد انتهاء الوقت المحدد
    setTimeout(() => {
        console.log = originalLog;
        conn.sendMessage(m.chat, { text: `✅ توقفت بيانات الكونسول بعد ${seconds} ثانية.` });
    }, seconds * 1000);
};

handler.command = /^كونسول$/i;
handler.exp = 50;
handler.owner = 'true'; 
export default handler;