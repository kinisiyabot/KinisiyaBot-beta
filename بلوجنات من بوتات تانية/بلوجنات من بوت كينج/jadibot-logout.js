import fs from 'fs';
import path from 'path';
import { jidDecode } from '@whiskeysockets/baileys';

let handler = async (m, { conn }) => {
  const rawId = conn.user?.id || '';
  const decoded = jidDecode(rawId);
  const cleanId = decoded?.user || rawId.split('@')[0];

  const sessionTypes = ['session-sub'];
  const basePath = 'sessions';

  const sessionPath = sessionTypes
    .map(type => path.join(basePath, type, cleanId))
    .find(p => fs.existsSync(p));

  if (!sessionPath) {
    return m.reply('⚠️ هذا الأمر يعمل فقط من داخل جلسة *بوت فرعي*.');
  }

  try {
    await m.reply('🔒 جاري تسجيل الخروج من الجلسة...');

    await conn.logout();

    setTimeout(() => {
      if (fs.existsSync(sessionPath)) {
        fs.rmSync(sessionPath, { recursive: true, force: true });
        console.log(`✅ تم حذف جلسة ${cleanId} من ${sessionPath}`);
      }
    }, 2000);

    setTimeout(() => {
      m.reply('🕸 تم تسجيل الخروج وإغلاق الجلسة بنجاح.');
    }, 3000);
  } catch (err) {
    console.error(err);
    await m.reply('❌ حدث خطأ أثناء محاولة تسجيل الخروج.');
  }
};

handler.help = ['تسجيل-الخروج'];
handler.tags = ['البوت-الفرعي'];
handler.command = ['تسجيل-الخروج', 'خروج'];

export default handler;