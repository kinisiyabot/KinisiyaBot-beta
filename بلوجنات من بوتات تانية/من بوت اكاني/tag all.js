import moment from 'moment-timezone';
import { prepareWAMessageMedia, generateWAMessageFromContent } from "@whiskeysockets/baileys";

let usageLimits = {};

let handler = async (m, { isOwner, isAdmin, conn, text, participants, args, command }) => {
  if (!(isAdmin || isOwner)) {
    global.dfail('admin', m, conn);
    throw false;
  }

  let groupId = m.chat;
  let senderId = m.sender;
  let usageKey = `${groupId}:${command}`;

  if (command === 'تحديد_منشن') {
    if (!isOwner) {
      m.reply('❌ هذا الأمر متاح فقط للمطور.');
      return;
    }
    let limit = parseInt(args[0]);
    if (isNaN(limit) || limit <= 0) {
      m.reply('❌ الرجاء إدخال رقم صحيح كحد للاستخدام.');
      return;
    }
    usageLimits[groupId] = limit;
    m.reply(`✅ تم تعيين الحد الأقصى لاستخدام أوامر المنشن إلى ${limit} مرة.`);
    return;
  }

  if (command === 'منشن') {
    const coverImageUrl = 'https://qu.ax/nrLHp.jpg';
    const messa = await prepareWAMessageMedia(
      { image: { url: coverImageUrl } },
      { upload: conn.waUploadToServer }
    );

    const interactiveMessage = {
      body: { text: "✨ *اختر نوع المنشن الذي تريده:*" },
      footer: { text: "𝐀𝐁𝐘𝐒𝐒_𝐁𝐎𝐓" },
      header: {
        title: "╭───⟢❲ 𝐀𝐁𝐘𝐒𝐒_𝐁𝐎𝐓 ❳╰───⟢",
        hasMediaAttachment: true,
        imageMessage: messa.imageMessage,
      },
      nativeFlowMessage: {
        buttons: [
          {
            name: 'single_select',
            buttonParamsJson: JSON.stringify({
              title: "✨ اختر نوع المنشن",
              sections: [
                {
                  title: "｢🌸┊الـكـل┊🌸｣",
                  rows: [
                    {
                      header: "｢🌸┊منشن_الكل┊🌸｣",
                      title: "*⧈─╼━╾╼━┇•❄️•┇━╾─╼╾─⧈*",
                      description: "｢🍷┊𝑅𝐴𝐷𝐼𝑂 𝐷𝐸𝑀𝑂𝑁┊🍷｣",
                      id: ".منشن_الكل"
                    }
                  ]
                },
                {
                  title: "｢🌸┊اعـضـاء┊🌸｣",
                  rows: [
                    {
                      header: "｢🌸┊منشن_اعضاء┊🌸｣",
                      title: "*⧈─╼━╾╼━┇•❄️•┇━╾─╼╾─⧈*",
                      description: "｢🍷┊𝑅𝐴𝐷𝐼𝑂 𝐷𝐸𝑀𝑂𝑁┊🍷｣",
                      id: ".منشن_اعضاء"
                    }
                  ]
                },
                {
                  title: "｢🌸┊المشرفين┊🌸｣",
                  rows: [
                    {
                      header: "｢🌸┊منشن_المشرفين┊🌸｣",
                      title: "*⧈─╼━╾╼━┇•❄️•┇━╾─╼╾─⧈*",
                      description: "｢🍷┊𝑅𝐴𝐷𝐼𝑂 𝐷𝐸𝑀𝑂𝑁┊🍷｣",
                      id: ".منشن_مشرفين"
                    }
                  ]
                },
                {
                  title: "｢🌸┊مخفي┊🌸｣",
                  rows: [
                    {
                      header: "｢🌸┊منشن_مخفي┊🌸｣",
                      title: "*⧈─╼━╾╼━┇•❄️•┇━╾─╼╾─⧈*",
                      description: "｢🍷┊𝑅𝐴𝐷𝐼𝑂 𝐷𝐸𝑀𝑂𝑁┊🍷｣",
                      id: ".مخفي"
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

  if (!usageLimits[groupId]) usageLimits[groupId] = 3;
  if (usageLimits[usageKey] === undefined) usageLimits[usageKey] = usageLimits[groupId];

  if (usageLimits[usageKey] <= 0) {
    m.reply('❌ تم استنفاد الحد الأقصى لاستخدام هذا الأمر في المجموعة. الرجاء التواصل مع المطور لإعادة التعيين.');
    return;
  }

  let pesan = args.join` `;
  let time = moment.tz('Asia/Riyadh').format('hh:mm A');
  let date = moment.tz('Asia/Riyadh').format('YYYY/MM/DD');
  let groupName = m.chat;

  let filteredParticipants =
    command === 'منشن_اعضاء'
      ? participants.filter(p => !p.admin)
      : command === 'منشن_مشرفين'
      ? participants.filter(p => p.admin)
      : participants;

  let teks = `
─⟢ـ*
> ˼⚕️˹↜ ${command === 'منشن_اعضاء' ? '🌟 *قــســم الأعضاء العاديين*' : command === 'منشن_مشرفين' ? '👑 *قــســم المشرفين*' : '🌟 *قــســم جميع أعضاء المجموعة*'} ↶
╮────────────────⟢ـ

💠 *اسم المجموعة:* 『 ${groupName} 』
📩 *الرسالة:* 『 ${pesan || '❌ لا توجد رسالة محددة ❌'} 』
📅 *التاريخ:* 『 ${date} 』
🕰️ *الوقت:* 『 ${time} 』
👥 *عدد المستهدفين:* 『 ${filteredParticipants.length} 』

─⟢ـ*
> ˼⚕️˹↜ 🏷️ *قائمة الأعضاء* ↶
╮────────────────⟢ـ
${filteredParticipants.map(mem => `┊⟣｢@${mem.id.split('@')[0]}｣`).join('\n')}
╯────────────────⟢ـ

─⟢ـ*
> ˼⚕️˹↜ 👑 *مسؤول المنشن* ↶
╮────────────────⟢ـ
┊⟣｢@${m.sender.split('@')[0]}｣
╯────────────────⟢ـ

─⟢ـ*
> ˼⚕️˹↜ 🤖 *تحيات⇇𝐀𝐁𝐘𝐒𝐒_𝐁𝐎𝐓* ↶
╮────────────────⟢ـ
✨ *شكرًا لاستخدام خدماتنا! نعمل دائمًا لخدمتك.* ✨
╯────────────────⟢ـ
`;

  conn.sendMessage(m.chat, {
    text: teks,
    mentions: filteredParticipants.map(a => a.id),
    image: { url: 'https://qu.ax/nrLHp.jpg' }
  });

  usageLimits[usageKey] -= 1;
};

handler.help = ['منشن_اعضاء <message>', 'منشن_مشرفين <message>', 'منشن_الكل <message>', 'تحديد_منشن <عدد>', 'منشن'];
handler.tags = ['group'];
handler.command = /^(منشن_اعضاء|منشن_مشرفين|منشن_الكل|تحديد_منشن|منشن)$/i;
handler.admin = true;
handler.group = true;

export default handler;