import { execSync } from 'child_process'

var handler = async (m, { conn, text }) => {
  try {
    const stdout = execSync('git pull' + (m.fromMe && text ? ' ' + text : ''));
    let messager = stdout.toString();

    if (messager.includes('Ya estoy actualizada')) messager = '✅ البوت محدث بالفعل لآخر إصدار.';
    if (messager.includes('Actualizando')) messager = '🔄 جاري التحديث، برجاء الانتظار...\n\n' + stdout.toString();

    conn.reply(m.chat, messager, m);

  } catch {
    try {
      const status = execSync('git status --porcelain');

      if (status.length > 0) {
        const conflictedFiles = status.toString().split('\n').filter(line => line.trim() !== '').map(line => {
          if (line.includes('.npm/') || line.includes('.cache/') || line.includes('tmp/') || line.includes('datos.json') || line.includes('database.json') || line.includes('sessions/') || line.includes('npm-debug.log')) {
            return null;
          }
          return '*→ ' + line.slice(3) + '*';
        }).filter(Boolean);

        if (conflictedFiles.length > 0) {
          const errorMessage = `⚠️ لا يمكن تحديث البوت بسبب تعارض في الملفات.`;
          await conn.reply(m.chat, errorMessage, m);
        }
      }
    } catch (error) {
      console.error(error);
      let errorMessage2 = '🐼 حدث خطأ غير متوقع.';
      if (error.message) {
        errorMessage2 += '\n📛 رسالة الخطأ: ' + error.message;
      }
      await conn.reply(m.chat, errorMessage2, m);
    }
  }
}

handler.command = ['تحديث']
handler.owner = true

export default handler