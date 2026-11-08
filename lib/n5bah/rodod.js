export const responses = {
    isGroup: '⚠️ هذا الأمر خاص بالمجموعات فقط',
    notGroup: '⚠️ هذا الأمر يعمل في المحادثات الخاصة فقط',
    needAdmin: '🛡️ يرجى ترقية البوت إلى مشرف لتفعيل الميزات الكاملة',
    notAdmin: '⛔ هذا الأمر حصري للمشرفين فقط',
    botAdmin: '📛 البوت يحتاج صلاحيات المشرف لتنفيذ هذا الأمر',
    accessDenied: '🚫 هذا القسم متاح للإدارة العليا فقط',
    ownerOnly: '👑 هذا الأمر حصري لمالك البوت',
    premiumOnly: '💎 هذا المحتوى حصري للأعضاء المميزين',
    group: {
        closed: '🔐 تم إغلاق المجموعة بنجاح',
        opened: '🔓 تم فتح المجموعة بنجاح',
        link: '🌐 رابط المجموعة:\n{link}',
        noLink: '❌ تعذر إنشاء رابط الدعوة',
        memberKicked: '👢 تم طرد العضو بنجاح',
        memberAdded: '🤝 تمت إضافة العضو بنجاح',
        memberPromoted: '⭐ تم ترقية العضو إلى مشرف',
        memberDemoted: '📉 تم إزالة صلاحيات الإشراف',
        empty: '📭 لا يوجد أعضاء في المجموعة',
        full: '🈵 المجموعة وصلت للحد الأقصى من الأعضاء'
    },
    media: {
        noMedia: '🖼️ لم يتم العثور على وسائط',
        invalidMedia: '📛 نوع الملف غير مدعوم',
        tooLarge: '💾 حجم الملف يتجاوز الحد المسموح',
        downloadFailed: '⬇️ فشل في تحميل الملف',
        imageOnly: '🖼️ يرجى إرسال صورة',
        videoOnly: '🎬 يرجى إرسال فيديو',
        audioOnly: '🎵 يرجى إرسال ملف صوتي',
        stickerAdded: '✨ تم إضافة الملصق بنجاح',
        mediaSaved: '💾 تم حفظ الوسائط بنجاح'
    },
    message: {
        noQuoted: '↩️ يرجى الرد على الرسالة',
        deleted: '🗑️ تم حذف الرسالة بنجاح',
        edited: '✏️ تم تعديل الرسالة بنجاح',
        pinned: '📌 تم تثبيت الرسالة في الأعلى',
        unpinned: '📍 تم إلغاء التثبيت',
        copied: '📋 تم نسخ المحتوى بنجاح',
        forwarded: '📤 تم إعادة توجيه الرسالة'
    },
    processing: {
        changePic: '🔄 جاري تحديث الصورة...',
        general: '⚙️ جاري معالجة طلبك...',
        download: '📥 جاري تحميل البيانات...',
        upload: '📤 جاري رفع الملف...',
        convert: '🔄 جاري تحويل التنسيق...',
        analyzing: '🔍 جاري تحليل المحتوى...',
        generating: '🎨 جاري إنشاء المحتوى...'
    },
    success: {
        changePic: '✅ تم تحديث الصورة بنجاح',
        general: '✅ تم تنفيذ العملية بنجاح',
        download: '✅ تم التحميل بنجاح',
        upload: '✅ تم الرفع بنجاح',
        convert: '✅ تم التحويل بنجاح',
        saved: '💾 تم الحفظ بنجاح',
        sent: '📨 تم الإرسال بنجاح'
    },
    error: {
        general: (error) => `❌ خطأ في التنفيذ:\n${error}`,
        changePic: '❌ فشل في تحديث الصورة',
        mediaRequired: '📎 يرجى إرفاق الوسائط المطلوبة',
        network: '📡 فشل في الاتصال بالخادم',
        timeout: '⏰ انتهت مدة الانتظار',
        permission: '🔒 صلاحيات غير كافية',
        invalid: '🚫 بيانات غير صالحة',
        notFound: '🔍 المحتوى غير متوفر',
        server: '🖥️ خطأ في الخادم الداخلي',
        database: '🗄️ خطأ في قاعدة البيانات'
    },
    bot: {
        starting: '🚀 جاري تهيئة النظام...',
        ready: '✅ البوت يعمل بكفاءة',
        restarting: '🔄 جاري إعادة التشغيل...',
        updating: '🔄 جاري التحديث...',
        maintenance: '🔧 النظام قيد الصيانة',
        stats: '📊 إحصائيات البوت:\n👥 المستخدمون: {users}\n💬 المجموعات: {groups}\n⚡ وقت التشغيل: {uptime}'
    },
    user: {
        banned: '🚫 حسابك محظور من النظام',
        limited: '⚠️ وصلت للحد الأقصى للاستخدام',
        cooldown: '⏳ متاح بعد: {time}',
        registered: '✅ تم تفعيل حسابك بنجاح',
        notRegistered: '📝 يرجى التسجيل أولاً',
        profileUpdated: '👤 تم تحديث الملف الشخصي',
        premiumActive: '💫 حسابك المميز مفعل',
        sessionExpired: '🔐 انتهت الجلسة، يرجى إعادة الدخول'
    },
    system: {
        backup: '💾 تم إنشاء نسخة احتياطية',
        restored: '🔄 تم استعادة النسخة الاحتياطية',
        cleaned: '🧹 تم تنظيف النظام',
        optimized: '⚡ تم تحسين الأداء',
        logSaved: '📝 تم حفظ السجلات'
    },
    security: {
        verified: '✅ تم التحقق من الهوية',
        blocked: '🚫 تم حظر المستخدم',
        unblocked: '✅ تم إلغاء الحظر',
        reported: '📢 تم الإبلاغ عن المخالفة',
        filtered: '🛡️ تم تصفية المحتوى الضار'
    }
};

export const formatMessage = (template, ...args) => {
    if (typeof template === 'function') {
        return template(...args);
    }
    
    let result = template;
    args.forEach((arg, index) => {
        if (typeof arg === 'object') {
            Object.entries(arg).forEach(([key, value]) => {
                result = result.replace(new RegExp(`{${key}}`, 'g'), value);
            });
        } else {
            result = result.replace(new RegExp(`\\{${index}\\}`, 'g'), arg);
        }
    });
    
    return result;
};

export const messageUtils = {
    truncate: (text, maxLength = 100) => {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    },
    
    escape: (text) => {
        return text.replace(/[\\`*_{}[\]()#+-.!]/g, '\\$&');
    },
    
    formatTime: (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        const parts = [];
        if (hours > 0) parts.push(`${hours}س`);
        if (minutes > 0) parts.push(`${minutes}د`);
        if (secs > 0) parts.push(`${secs}ث`);
        
        return parts.join(' ') || '0ث';
    }
};

export const responseCategories = {
    INFO: 'info',
    SUCCESS: 'success',
    WARNING: 'warning',
    ERROR: 'error',
    PROCESSING: 'processing'
};

export const getResponse = (category, key, data = {}) => {
    const categoryMap = {
        info: responses,
        success: responses.success,
        warning: responses.user,
        error: responses.error,
        processing: responses.processing
    };
    
    const response = categoryMap[category]?.[key];
    return response ? formatMessage(response, data) : '❌ رد غير معروف';
};