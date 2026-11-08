import Jimp from 'jimp';

const colorOptions = [
  { name: 'أحمر', color: '#FF0000' },
  { name: 'أخضر', color: '#00FF00' },
  { name: 'أزرق', color: '#0000FF' },
  { name: 'أصفر', color: '#FFFF00' },
  { name: 'برتقالي', color: '#FFA500' },
  { name: 'بنفسجي', color: '#800080' },
  { name: 'رمادي', color: '#808080' },
];

const operations = [
  { name: 'تغيير الحجم', operation: (image) => image.resize(800, Jimp.AUTO) },
  { name: 'زيادة الحدة', operation: (image) => image.convolute([
      [0, -1, 0],
      [-1, 5, -1],
      [0, -1, 0],
    ])
  },
  { name: 'تحسين السطوع', operation: (image) => image.brightness(0.1) },
  { name: 'تحسين التباين', operation: (image) => image.contrast(0.3) },
  { name: 'تحويل إلى أبيض وأسود', operation: (image) => image.grayscale() },
  { name: 'تنعيم الصورة', operation: (image) => image.blur(5) },
  { name: 'تدوير الصورة', operation: (image) => image.rotate(90) },
  { name: 'تغيير الألوان', operation: null }, // نستخدم null الآن
  { name: 'تغيير الشفافية', operation: (image) => image.opacity(0.8) },
  { name: 'إضافة نص', operation: null }, // نستخدم null الآن
  { name: 'قص الصورة', operation: null }, // وظيفة القص ستستخدم لاحقًا
  { name: 'وضع إطار مشوش', operation: null }, // وظيفة جديدة
  { name: 'تحويل إلى بورتريه', operation: null }, // خيار بورتريه جديد
  { name: 'تحويل الصورة إلى HD', operation: (image) => image.resize(Jimp.AUTO, 1080) }, // خيار HD
  { name: 'ضبابية', operation: (image) => image.blur(10) }, // خيار ضبابية
  { name: 'كرتوني', operation: (image) => image.convolute([
      [-1, -1, -1],
      [-1, 9, -1],
      [-1, -1, -1],
    ]) // يحاكي تأثير الكرتون
  },
  { name: 'ظل', operation: (image) => {
      const shadow = image.clone().opacity(0.5).blur(5); // إنشاء ظل
      return image.composite(shadow, 10, 10); // إضافة ظل للصورة
    }
  },
  { name: 'زيتي', operation: (image) => image.color([{ apply: 'mix', params: ['#8B4513', 100] }]), }, // إضافة تأثير زيتي
  { name: 'HDR', operation: (image) => {
      return image.convolute([
          [0, -1, 0],
          [-1, 5, -1],
          [0, -1, 0],
        ]).contrast(0.3).brightness(0.1); // تطبيق تأثير HDR
    }
  },
  { name: 'فيلم', operation: (image) => {
      return image.color([{ apply: 'mix', params: ['#000000', 50] }]); // تطبيق تأثير فيلم
    }
  },
  { name: 'تشويش', operation: (image) => image.blur(3) }, // خيار تشويش
  { name: 'تعتيم', operation: (image) => image.opacity(0.5) }, // خيار تعتيم
];

const handler = async (m, { conn, text }) => {
  try {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || q.mediaType || "";

    // التحقق من أن الملف هو صورة
    if (!mime.startsWith("image")) return conn.reply(m.chat, 'يرجى تحديد صورة.', m);

    // تحميل الصورة
    let img = await q.download?.();
    if (!img) return conn.reply(m.chat, '⚠️ لم يتمكن البوت من تحميل الصورة.', m);

    // إذا لم يتم إدخال النص، عرض قائمة الوظائف
    if (!text) {
      let operationsList = operations.map((op, index) => `${index + 1}. ${op.name}`).join('\n');
      return conn.reply(m.chat, `يرجى اختيار رقم الوظيفة:\n\n${operationsList}`, m);
    }

    // تحليل المدخل
    const inputArray = text.split(' ');
    const operationNumber = parseInt(inputArray[0]) - 1; // نأخذ الرقم الأول
    const secondInput = inputArray.slice(1).join(' '); // نأخذ النص المدخل (إذا كان موجودًا)

    // التحقق من صحة الرقم المدخل
    if (isNaN(operationNumber) || operationNumber < 0 || operationNumber >= operations.length) {
      return conn.reply(m.chat, 'يرجى اختيار رقم وظيفة صحيح من القائمة.', m);
    }

    // عرض رسالة معالجة الصورة
    conn.reply(m.chat, '`♻️ جاري معالجة الصورة باستخدام الوظيفة...`', m);

    // قراءة الصورة باستخدام Jimp
    const image = await Jimp.read(img);

    // إذا كانت الوظيفة المختارة هي "تحويل إلى بورتريه"
    if (operations[operationNumber].name === 'تحويل إلى بورتريه') {
      const portraitWidth = image.bitmap.height * (9 / 16); // حساب عرض الصورة بناءً على الارتفاع
      await image.resize(portraitWidth, image.bitmap.height); // تغيير حجم الصورة
      await image.crop(0, 0, portraitWidth, image.bitmap.height); // قص الصورة
    }

    // إذا كانت الوظيفة المختارة هي "تغيير الألوان"
    if (operations[operationNumber].name === 'تغيير الألوان') {
      if (secondInput) {
        const colorIndex = parseInt(secondInput) - 1; // نحصل على رقم اللون
        if (colorIndex < 0 || colorIndex >= colorOptions.length) {
          return conn.reply(m.chat, 'يرجى اختيار رقم لون صحيح.', m);
        }
        const selectedColor = colorOptions[colorIndex].color;
        image.color([{ apply: 'mix', params: [selectedColor, 100] }]); // تطبيق اللون
      } else {
        // عرض قائمة الألوان
        const colorList = colorOptions.map((col, index) => `${index + 1}. ${col.name}`).join('\n');
        return conn.reply(m.chat, `اختر اللون من القائمة:\n\n${colorList}`, m);
      }
    }

    // إذا كانت الوظيفة "إضافة نص"
    if (operations[operationNumber].name === 'إضافة نص') {
      if (!secondInput) {
        return conn.reply(m.chat, 'يرجى إدخال النص المطلوب إضافته بعد رقم الوظيفة.', m);
      }
      const font = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE); // حجم الخط أكبر
      const textWidth = Jimp.measureText(font, secondInput);
      const textHeight = Jimp.measureTextHeight(font, secondInput);

      // وضع النص في أسفل منتصف الصورة
      image.print(font, (image.bitmap.width / 2) - (textWidth / 2), image.bitmap.height - textHeight - 10, secondInput); // إضافة النص في أسفل منتصف الصورة
    }

    // إذا كانت الوظيفة "وضع إطار مشوش"
    if (operations[operationNumber].name === 'وضع إطار مشوش') {
      const blurredImage = image.clone().blur(10); // إنشاء صورة مشوشة
      const blurredWidth = image.bitmap.width * 2; // عرض الصورة المشوشة ضعف عرض الصورة الأصلية
      const blurredHeight = image.bitmap.height * 2; // ارتفاع الصورة المشوشة ضعف ارتفاع الصورة الأصلية
      blurredImage.resize(blurredWidth, blurredHeight); // تغيير حجم الصورة المشوشة

      // وضع الصورة الأصلية في منتصف الصورة المشوشة
      blurredImage.composite(image, (blurredWidth - image.bitmap.width) / 2, (blurredHeight - image.bitmap.height) / 2); // دمج الصورة الأصلية فوق الصورة المشوشة
      await blurredImage.getBufferAsync(Jimp.MIME_JPEG); // الحصول على Buffer للصورة
    }

    // إذا كانت الوظيفة "قص الصورة"
    if (operations[operationNumber].name === 'قص الصورة') {
      const width = image.bitmap.width;
      const height = image.bitmap.height;

      // حساب أبعاد القص بالنسبة 1:2
      const cropWidth = height / 2;
      const cropHeight = height;

      const x = (width / 2) - (cropWidth / 2); // تحديد موضع x لقص الصورة
      const y = (height / 2) - (cropHeight / 2); // تحديد موضع y لقص الصورة

      image.crop(x, y, cropWidth, cropHeight); // قص الصورة
    }

    // تنفيذ العملية المطلوبة إذا كانت موجودة
    const operationFunction = operations[operationNumber].operation;
    if (operationFunction && typeof operationFunction === 'function') {
      await operationFunction(image);
    }

    // حفظ الصورة إلى Buffer
    const processedImageBuffer = await image.getBufferAsync(Jimp.MIME_JPEG);

    // إرسال الصورة المعدلة إلى المستخدم
    await conn.sendFile(m.chat, processedImageBuffer, 'enhanced_image.jpg', `✅ تم تطبيق وظيفة "${operations[operationNumber].name}" بنجاح!`, m);
  } catch (error) {
    console.error(error);
    conn.reply(m.chat, `⚠️ حدث خطأ أثناء معالجة الصورة: ${error.message}`, m);
  }
};

handler.help = ["hd"];
handler.tags = ["tools"];
handler.command = ["تحسين"];
export default handler;