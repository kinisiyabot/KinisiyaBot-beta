import { readdirSync, unlinkSync, existsSync, writeFileSync } from 'fs';
import path from 'path';
import { prepareWAMessageMedia, generateWAMessageFromContent } from '@whiskeysockets/baileys';

const handler = async (m, { conn, isOwner, text }) => {
  // السماح للمطورين فقط
  if (!isOwner) {
    return conn.sendMessage(m.chat, { text: '*❌ هذا الأمر مخصص للمطور فقط!*' }, { quoted: m });
  }

  const sessionPath = 'sessions/session-bot/';
  const databaseFile = 'datos.json';
  let filesDeleted = 0;

  // 🔹 إذا لم يُحدد خيار، إرسال زر تفاعلي
  if (!text) {
    const coverImageUrl = 'https://files.catbox.moe/7qa6p3.jpg';
    const messa = await prepareWAMessageMedia(
      { image: { url: coverImageUrl } },
      { upload: conn.waUploadToServer }
    );

    const interactiveMessage = {
      body: { text: "✨ *اختر نوع التنظيف الذي تريده:*" },
      footer: { text: "𝑾𝑨𝑯𝑴" },
      header: {
        title: "╭───⟢❲ 𝑾𝑨𝑯𝑴 ❳╰───⟢",
        hasMediaAttachment: true,
        imageMessage: messa.imageMessage,
      },
      nativeFlowMessage: {
        buttons: [
          {
            name: 'single_select',
            buttonParamsJson: JSON.stringify({
              title: "✨ اختر نوع التنظيف",
              sections: [
                {
                  title: "🗑️ تنظيف الجلسة",
                  rows: [
                    {
                      header: "🗑️ تنظيف الجلسة",
                      title: "🚀 مسح الملفات غير الضرورية",
                      description: "سيتم حذف جميع ملفات الجلسة باستثناء `creds.json`.",
                      id: ".صلح جلسة"
                    }
                  ]
                },
                {
                  title: "🗄️ تنظيف قاعدة البيانات",
                  rows: [
                    {
                      header: "🗄️ تنظيف قاعدة البيانات",
                      title: "🔄 إعادة ضبط `Database.json`",
                      description: "سيتم مسح محتوى `Database.json` دون حذفه.",
                      id: ".صلح داتا"
                    }
                  ]
                }
              ]
            })
          }
        ],
        messageParamsJson: ''
      }
    };

    let msg = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          interactiveMessage,
        },
      },
    }, { userJid: conn.user.jid, quoted: m });

    conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
    return;
  }

  try {
    if (text.toLowerCase() === 'داتا') {
      // 🔹 مسح محتوى "Database.json" دون حذفه
      if (existsSync(databaseFile)) {
        writeFileSync(databaseFile, '{}', 'utf8');
      }
      await conn.sendMessage(m.chat, { text: '*✅ تم تنظيف "Database.json" بنجاح!*' }, { quoted: m });

    } else if (text.toLowerCase() === 'جلسة') {
      // 🔹 حذف جميع الملفات داخل "BotSession" باستثناء "creds.json"
      if (existsSync(sessionPath)) {
        const files = readdirSync(sessionPath);
        for (const file of files) {
          if (!file.includes('creds.json')) {
            unlinkSync(path.join(sessionPath, file));
            filesDeleted++;
          }
        }
      }
      await conn.sendMessage(m.chat, { text: `*✅ تم حذف [ ${filesDeleted} ] ملف من الجلسة بنجاح!*` }, { quoted: m });

    } else {
      await conn.sendMessage(m.chat, { text: '*❌ خيار غير صحيح! استخدم: "صلح جلسة" أو "صلح داتا".*' }, { quoted: m });
    }
  } catch (err) {
    console.error('❗ خطأ أثناء حذف الملفات:', err);
    await conn.sendMessage(m.chat, { text: '*[❗] حدث خطأ عند تنظيف الملفات!*' }, { quoted: m });
  }
};

handler.help = ['cleanup'];
handler.tags = ['system'];
handler.command = /^(صلح|ds)$/i;

export default handler;