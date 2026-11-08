import { isElite } from '../lib/elite.js';
import { jidDecode } from '@soymaycol/maybailyes';
import fs from 'fs';
import path from 'path';

const timers = new Map();
const activeTimers = new Map();

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

const handler = async (m, { conn }) => {
  try {
    const groupJid = m.key.remoteJid;
    const senderJid = m.key.participant || m.participant || m.key.remoteJid;
    const decoded = jidDecode(senderJid);
    const senderNumber = decoded?.user || senderJid.split('@')[0];

    const lockImagePath = path.join(process.cwd(), 'image.jpeg');  
    const unlockImagePath = path.join(process.cwd(), 'image.jpeg');  
    const imagePath = fs.readFileSync(lockImagePath);

    if (!groupJid.endsWith('@g.us')) {
      return conn.sendMessage(groupJid, {
        image: imagePath,
        caption: '✦ 𝑨𝑺𝑯𝑼𝑹𝑨 𝐂𝐇𝐀𝐓 ✦\n❗ هذا الأمر يعمل فقط داخل *المجموعات*\n⎯⎯⎯⎯⎯\n© 𝑨𝑺𝑯𝑼𝑹𝑨'
      }, { quoted: m });
    }

    if (!isElite(senderNumber)) {
      return conn.sendMessage(groupJid, {
        image: imagePath,
        caption: '✦ 𝑨𝑺𝑯𝑼𝑹𝑨 𝐂𝐇𝐀𝐓 ✦\n❌ ليس لديك صلاحية لاستخدام هذا الأمر\n⎯⎯⎯⎯⎯\n© 𝑨𝑺𝑯𝑼𝑹𝑨 𝑷𝑹𝑶 𝑶𝑵𝑳𝒀'
      }, { quoted: m });
    }

    let body = m.message?.extendedTextMessage?.text || m.message?.conversation || '';
    let args = body.trim().split(/\s+/).slice(1);

    if (args.length < 2) {
      return conn.sendMessage(groupJid, {
        image: imagePath,
        caption: '✦ 𝑨𝑺𝑯𝑼𝑹𝑨 𝐂𝐇𝐀𝐓 ✦\n❌ يرجى كتابة الأمر بهذا الشكل:\n`.شات قفل 2`\n`.شات فتح 3`\n⎯⎯⎯⎯⎯\n© 𝑨𝑺𝑯𝑼𝑹𝑨'
      }, { quoted: m });
    }

    const action = args[0].toLowerCase();
    const minutes = parseInt(args[1]);

    if (!['قفل', 'فتح'].includes(action) || isNaN(minutes) || minutes <= 0) {
      return conn.sendMessage(groupJid, {
        image: imagePath,
        caption: '✦ 𝑨𝑺𝑯𝑼𝑹𝑨 𝐂𝐇𝐀𝐓 ✦\n❌ صيغة غير صحيحة\nمثال: `.شات قفل 2` أو `.شات فتح 3`\n⎯⎯⎯⎯⎯\nالمدة بالدقائق ويجب أن تكون رقمًا صحيحًا\n© 𝑨𝑺𝑯𝑼𝑹𝑨'
      }, { quoted: m });
    }

    const setGroupMode = async (mode) => {
      await conn.groupSettingUpdate(groupJid, mode);
    };

    if (timers.has(groupJid)) {
      clearTimeout(timers.get(groupJid));
      timers.delete(groupJid);
    }
    if (activeTimers.has(groupJid)) {
      clearInterval(activeTimers.get(groupJid));
      activeTimers.delete(groupJid);
    }

    const endTime = Date.now() + minutes * 60 * 1000;
    const isLock = action === 'قفل';
    const mode = isLock ? 'announcement' : 'not_announcement';
    const startImage = fs.readFileSync(isLock ? lockImagePath : unlockImagePath);
    const doneText = isLock ? '✅ تم *فتح* الشات تلقائيًا' : '🔒 تم *قفل* الشات تلقائيًا';

    await setGroupMode(mode);

    let remaining = Math.ceil((endTime - Date.now()) / 1000);

    const startMsg = await conn.sendMessage(groupJid, {
      image: startImage,
      caption: `✦ 𝑨𝑺𝑯𝑼𝑹𝑨 𝐂𝐇𝐀𝐓 ✦\n${isLock ? '🔒 تم *قفل* الشات' : '✅ تم *فتح* الشات'}\n> الوقت المتبقي: ${formatTime(remaining)}\n⎯⎯⎯⎯⎯\n> يلا نسولف\n© 𝑨𝑺𝑯𝑼𝑹𝑨`,
    }, { quoted: m });

    const interval = setInterval(async () => {
      remaining = Math.ceil((endTime - Date.now()) / 1000);
      if (remaining <= 0) return;

      try {
        await conn.sendMessage(groupJid, {
          edit: startMsg.key,
          image: startImage,
          caption: `✦ 𝑨𝑺𝑯𝑼𝑹𝑨 𝐂𝐇𝐀𝐓 ✦\n${isLock ? '🔒 تم *قفل* الشات' : '✅ تم *فتح* الشات'}\n> الوقت المتبقي: ${formatTime(remaining)}\n> يلا نسولف\n⎯⎯⎯⎯⎯\n© 𝑨𝑺𝑯𝑼𝑹𝑨`,
        });
      } catch (e) {
        console.error('خطأ في تحديث العداد:', e.message);
      }
    }, 1000);

    activeTimers.set(groupJid, interval);

    const timer = setTimeout(async () => {
      const nextMode = isLock ? 'not_announcement' : 'announcement';
      await setGroupMode(nextMode);

      await conn.sendMessage(groupJid, {
        image: fs.readFileSync(isLock ? unlockImagePath : lockImagePath),
        caption: `✦ 𝑨𝑺𝑯𝑼𝑹𝑨 𝐂𝐇𝐀𝐓 ✦\n${doneText}\n⎯⎯⎯⎯⎯\n© 𝑨𝑺𝑯𝑼𝑹𝑨`,
      });

      clearInterval(interval);
      timers.delete(groupJid);
      activeTimers.delete(groupJid);
    }, minutes * 60 * 1000);

    timers.set(groupJid, timer);

  } catch (error) {
    console.error('✗ خطأ في أمر شات:', error);
    return conn.sendMessage(m.key.remoteJid, {
      image: fs.readFileSync(path.join(process.cwd(), 'image.jpeg')),
      caption: `✦ 𝑨𝑺𝑯𝑼𝑹𝑨 𝐂𝐇𝐀𝐓 ✦\n❌ حدث خطأ أثناء تنفيذ الأمر\nالخطأ: ${error.message || error.toString()}\n⎯⎯⎯⎯⎯\n© 𝑨𝑺𝑯𝑼𝑹𝑨`
    }, { quoted: m });
  }
};

handler.command = ['شات'];
handler.description = 'قفل أو فتح الشات مع عداد تنازلي بالثواني';
handler.usage = '.شات قفل 2 أو .شات فتح 3';
handler.category = 'group';

export default handler;