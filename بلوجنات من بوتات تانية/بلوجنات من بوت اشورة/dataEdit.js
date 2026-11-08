import fs, { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { isElite } from '../lib/elite.js';
import { downloadMediaMessage } from '@soymaycol/maybailyes';

const zarfPath = join(process.cwd(), 'zarf.json');
const imagePath = join(process.cwd(), 'image.jpeg');
const audioPath = join(process.cwd(), 'sounds', 'AUDIO.mp3');

const handler = async (m, { conn }) => {
  const sender = m.key.participant || m.key.remoteJid;
  const senderNum = sender.split('@')[0];

  if (!isElite(senderNum)) {
    return m.reply('❌ هذا الأمر مخصص للنخبة فقط.');
  }

  const zarfData = existsSync(zarfPath)
    ? JSON.parse(readFileSync(zarfPath))
    : {};

  const text = m.message?.conversation || m.message?.extendedTextMessage?.text || '';
  const args = text.trim().split(/\s+/);

  const type = args[1]?.toLowerCase();
  const toggle = args[2]?.toLowerCase();

  const reply = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;

  const sendHelp = () => m.reply(
`شرح الاستخدام:
.edit اسم ← لتعديل الاسم الجديد
.edit وصف ← لتعديل الوصف
.edit رسالة ← لتعديل الرسالة النهائية
.edit منشن ← لتعديل رسالة المنشن
.edit رياكت ← لتعديل التفاعل
.edit صورة ← لتحديث صورة الزرف (رد على صورة)
.edit صوت ← لتحديث ملف الصوت (رد على رسالة صوتية أو ملف صوتي)
.edit [نوع] شغل/طفي ← لتشغيل أو تعطيل نوع معين

يجب استخدام الأمر بالرد على الرسالة المناسبة.`
  );

  const setStatus = (section, value) => {
    if (['شغل', 'طفي'].includes(value)) {
      const status = value === 'شغل' ? 'on' : 'off';
      zarfData[section] = zarfData[section] || {};
      zarfData[section].status = status;
      writeFileSync(zarfPath, JSON.stringify(zarfData, null, 2));
      return m.reply(`✅ تم ${status === 'on' ? 'تشغيل' : 'إيقاف'} قسم ${type}.`);
    }
    return false;
  };

  if (!type) return sendHelp();

  try {
    switch (type) {
      case 'اسم':
        if (setStatus('group', toggle)) return;
        if (reply?.conversation) {
          zarfData.group = zarfData.group || {};
          zarfData.group.newSubject = reply.conversation;
          writeFileSync(zarfPath, JSON.stringify(zarfData, null, 2));
          return m.reply('✅ تم تعديل الاسم.');
        }
        break;

      case 'وصف':
        if (setStatus('group', toggle)) return;
        if (reply?.conversation) {
          zarfData.group = zarfData.group || {};
          zarfData.group.newDescription = reply.conversation;
          writeFileSync(zarfPath, JSON.stringify(zarfData, null, 2));
          return m.reply('✅ تم تعديل الوصف.');
        }
        break;

      case 'منشن':
        if (setStatus('messages', toggle)) return;
        if (reply?.conversation) {
          zarfData.messages = zarfData.messages || {};
          zarfData.messages.mention = reply.conversation;
          writeFileSync(zarfPath, JSON.stringify(zarfData, null, 2));
          return m.reply('✅ تم تعديل رسالة المنشن.');
        }
        break;

      case 'رسالة':
        if (setStatus('messages', toggle)) return;
        if (reply?.conversation) {
          zarfData.messages = zarfData.messages || {};
          zarfData.messages.final = reply.conversation;
          writeFileSync(zarfPath, JSON.stringify(zarfData, null, 2));
          return m.reply('✅ تم تعديل الرسالة النهائية.');
        }
        break;

      case 'رياكت':
        if (setStatus('reaction', toggle)) return;
        if (reply?.conversation) {
          zarfData.reaction = reply.conversation;
          writeFileSync(zarfPath, JSON.stringify(zarfData, null, 2));
          return m.reply('✅ تم تعديل التفاعل.');
        }
        break;

      case 'صورة':
        if (setStatus('media', toggle)) return;
        const imageMessage = reply?.imageMessage;
        if (imageMessage) {
          const buffer = await downloadMediaMessage(
            { message: { imageMessage } },
            'buffer',
            {},
            { reuploadRequest: conn.updateMediaMessage }
          );
          writeFileSync(imagePath, buffer);
          zarfData.media = zarfData.media || {};
          zarfData.media.image = 'image.jpeg';
          writeFileSync(zarfPath, JSON.stringify(zarfData, null, 2));
          return m.reply('✅ تم تحديث صورة الزرف.');
        }
        break;

      case 'صوت':
        if (setStatus('audio', toggle)) return;

        if (!reply) {
          return m.reply('❌ يرجى الرد على رسالة صوتية أو ملف صوتي لتحديث الصوت.');
        }

        const audioMsg = reply.audioMessage || reply.documentMessage;
        if (!audioMsg) {
          return m.reply('❌ يرجى الرد على رسالة صوتية أو ملف صوتي لتحديث الصوت.');
        }

        const buffer = await downloadMediaMessage(
          { message: reply },
          'buffer',
          {},
          { reuploadRequest: conn.updateMediaMessage }
        );

        mkdirSync(join(process.cwd(), 'sounds'), { recursive: true });
        writeFileSync(audioPath, buffer);

        zarfData.audio = zarfData.audio || {};
        zarfData.audio.file = 'sounds/AUDIO.mp3';
        if (!zarfData.audio.status) zarfData.audio.status = 'on';

        writeFileSync(zarfPath, JSON.stringify(zarfData, null, 2));
        return m.reply('✅ تم تحديث ملف الصوت.');

      default:
        return sendHelp();
    }

    return sendHelp();
  } catch (err) {
    console.error('✗ خطأ في أمر edit:', err);
    return m.reply(`❌ حدث خطأ:\n\n${err.message || err.toString()}`);
  }
};

handler.help = ['edit [اسم|وصف|منشن|رسالة|رياكت|صورة|صوت] [شغل|طفي]'];
handler.tags = ['tools'];
handler.command = /^edit$/i;

export default handler;