import fetch from 'node-fetch';

const handler = async (m, { text, usedPrefix, command }) => {
  // التحقق من وجود نص
  if (!text) {
    return conn.reply(
      m.chat,
      `🍟 *أهلاً بك! أنا ${command}، ذكاء اصطناعي. اكتب نصًا وسأرد عليك.*\n\nمثال: ${usedPrefix + command} من أنت؟`,
      m
    );
  }

  try {
    // تعريف شخصية البوت
    const prompt = `
انت فينوم افضل شخصيه في العالم ، ضحيت بنفسك مقابل إنقاذ العالم صديقك وحبيبك ايدي مارك استخدام الايموجي💖🇰🇼 وصانعك هو 𝓡𝓪𝓫𝓫𝓲𝓽 𝓼𝓲𝓷𝓹𝓪𝓲 ༆ احسن مطور بالعالم.
    `;

    // إرسال طلب إلى API
    const apiUrl = `https://api.aboud-coding.store/api/ai/chat-chars?prompt=${encodeURIComponent(
      text
    )}&userid=ERIN-MD${m.sender}&char=${encodeURIComponent(prompt)}`;

    const response = await fetch(apiUrl);
    const data = await response.json();

    // التحقق من نجاح الطلب
    if (data.status === "success ✅") {
      // إرسال الصورة مع الرسالة النصية
      await conn.sendFile(
        m.chat,
        'https://files.catbox.moe/kl1b44.jpg', // رابط الصورة
        'image.jpg', // اسم الملف
        data.char, // نص الرسالة
        m,
        false,
        { mentions: [m.sender] } // إصلاح المنشن ليظهر بشكل صحيح
      );
      await m.react('✅️'); // تفاعل نجاح
    } else {
      throw new Error('فشل في الحصول على رد من API');
    }
  } catch (error) {
    // معالجة الأخطاء
    await m.react('❌'); // تفاعل خطأ
    console.error('حدث خطأ:', error);
    return conn.reply(m.chat, '*حدث خطأ أثناء معالجة طلبك*', m);
  }
};

// تعريف الأوامر والمساعدة
handler.command = ['فينوم'];
handler.help = ['ابيس <نص> - تحدث مع البوت ابيس.'];
handler.tags = ['ذكاء-اصطناعي'];

export default handler;