import { cpus as _cpus, totalmem, freemem } from 'os';
import util from 'util';
import { performance } from 'perf_hooks';
import { sizeFormatter } from 'human-readable';

let format = sizeFormatter({
  std: 'JEDEC',
  decimalPlaces: 2,
  keepTrailingZeroes: false,
  render: (literal, symbol) => `${literal} ${symbol}B`,
});

let handler = async (m, { conn, usedPrefix, command }) => {
  const chats = Object.entries(conn.chats).filter(([id, data]) => id && data.isChats);
  const groupsIn = chats.filter(([id]) => id.endsWith('@g.us')); 
  const privateChats = chats.filter(([id]) => !id.endsWith('@g.us'));

  const cpus = _cpus().map(cpu => {
    cpu.total = Object.keys(cpu.times).reduce((last, type) => last + cpu.times[type], 0);
    return cpu;
  });
  const cpu = cpus.reduce((last, cpu, _, { length }) => {
    last.total += cpu.total;
    last.speed += cpu.speed / length;
    last.times.user += cpu.times.user;
    last.times.nice += cpu.times.nice;
    last.times.sys += cpu.times.sys;
    last.times.idle += cpu.times.idle;
    last.times.irq += cpu.times.irq;
    return last;
  }, {
    speed: 0,
    total: 0,
    times: {
      user: 0,
      nice: 0,
      sys: 0,
      idle: 0,
      irq: 0
    }
  });

  let old = performance.now();
  await util.promisify(setTimeout)(2000); 
  let neww = performance.now();
  let elapsedTime = neww - old;

  let target = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender;

  if (!(target in global.db.data.users)) throw `المستخدم غير موجود في قاعدة البيانات`;

  let profilePic = await conn.profilePictureUrl(target, 'image').catch(_ => './logo.jpg');
  let user = global.db.data.users[target];

  let botname = "𝐀𝐁𝐘𝐒𝐒_𝐁𝐎𝐓";

  let infoMessage = `
╭────〈 ${botname} 〉───
│
│ 📱 استخدام البوت:
│ ┌── 💬 إجمالي الدردشات: ${chats.length}
│ │ └─ 🗨️ المجموعات: ${groupsIn.length}
│ │ └─ 📝 الدردشات الخاصة: ${privateChats.length}
│ ├── 🕒 وقت التنفيذ: ${elapsedTime.toFixed(2)} مللي ثانية
│ ├── 🖥️ استخدام وحدة المعالجة المركزية:
│ ├── ${cpu.times.sys.toFixed(2)} مللي ثانية (النظام)
│ ├── ${cpu.times.user.toFixed(2)} مللي ثانية (المستخدم)
│ └── 📊 ذاكرة RAM: إجمالي 
│ └── ${format(totalmem())}, المتاح ${format(freemem())}
│
│ 🤖 تفاصيل البوت:
│ ┌── 👤 المالك:𝑅𝐴𝐷𝐼𝑂 𝐷𝐸𝑀𝑂𝑁
│ ├── 🛠️ البادئة: ${usedPrefix}
│ ├── 🌐 المنصة: عشوائي
│ └── 🏷️ الوضع: عام
│
│ 🔗 روابط:
│ └── 🌐 [الصفحة الرئيسية]
│ └── https://rem-cham-md-web.vercel.app
│
│ 🔍 استخدام ذاكرة Node.js:
│ ${'```' + Object.keys(process.memoryUsage()).map((key, _, arr) => `${key.padEnd(Math.max(...arr.map(v => v.length)), ' ')}: ${format(process.memoryUsage()[key])}`).join('\n') + '```'}
│
╰────────────────────
`;

  conn.sendFile(m.chat, profilePic, 'perfil.jpg', infoMessage, m, false, { mentions: [target] });
  m.react('✅');
}

handler.help = ['معلومات'];
handler.tags = ['رئيسي'];
handler.command = ['معلومات', 'معلومات_بوت', 'info'];

export default handler;