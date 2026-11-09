// إعدادات مركزية. يمكن تجاوزها عبر متغيرات البيئة دون تعديل الكود.
//
// API_BASE: عنوان الخدمة الخارجية التي تعتمد عليها بلوجنات التنزيل والذكاء
// الاصطناعي. الافتراضي هو نفس العنوان القديم، لكن يمكن تشغيل البوت على خدمة
// بديلة بمجرد ضبط المتغير:  API_BASE=https://my-api.example.com npm start
export const API_BASE = (process.env.API_BASE || 'https://apex-api-five.vercel.app')
  .trim()
  .replace(/\/+$/, '')

// متاح كـ global لأن كثيراً من البلوجنات تستخدمه داخل قوالب نصية.
global.API_BASE = API_BASE
