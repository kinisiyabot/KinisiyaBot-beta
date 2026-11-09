import { existsSync } from 'fs'
import { join } from 'path'
import { prepareWAMessageMedia, generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'
import { performance } from 'perf_hooks'

const menuCategories = {
  ai: 'الذكاء الاصطناعي & الدردشة',
  audio_ai: 'الذكاء الاصطناعي صوتيات',
  downloader: 'البحث وتنزيل',
  images: 'تنزيل صور و خليفات',
  fun: 'ترفيه & مرح',
  game: 'ألعاب & تسلية',
  group: 'المجموعات & الإدارة',
  info: 'معلومات & مساعدة',
  edit: 'قسم تحميل الايديت',
  maker: 'صانع & تصميم',
  maker_2: 'زخارف النص',
  news: 'أخبار & معلومات',
  devs: 'ادوات_للمطورين',
  owner: 'المالك & المطور',
  quran: 'القرآن الكريم & إسلاميات',
  quotes: 'اقتباسات & تحفيز',
  search: 'بحث & معلومات',
  sticker: 'ملصقات & صانع',
  tools: 'أدوات & خدمات',
  database: 'قاعدة بيانات & تخزين',
  rules: 'القوانين',
  xp: 'المستوى & النقاط'
};

const rows = Object.entries(menuCategories).map(([id, title]) => ({
  title: `🗂️ ${title}`,
  description: `انقر لعرض قسم ${title}`,
  id: `.قسم_${id}`
}))

let handler = async (m, { conn, usedPrefix: _p }) => {
  try {
    // حساب البنج
    let old = performance.now()
    let neww = performance.now()
    let speed = (neww - old).toFixed(4)

    // تعريف معرف المنشن من المرسل لتجنب خطأ ReferenceError
    const mentionId = m.sender ? m.sender.split('@')[0] : ''

    // معلومات المستخدم
    const userData = global.db?.data?.users?.[m.sender] || {}
    const { level = 0, role = 'مواطن 👨🏻‍💼', exp = 0 } = userData

    const menuImageUrl = 'https://raw.githubusercontent.com/kinisiyabot/KinisiyaBot-beta/main/media/9e26328765e3798507e39ccb249213f5.jpg'
    const channel = 'https://whatsapp.com/channel/0029Vb80wch30LKFioKenc2V'
    const developerNumber = '212693863911'
    const developerContact = `https://wa.me/${developerNumber}`

    // صياغة النص
    let menuText = `*┊🌹┊⇇مـنـور يـا @${mentionId} اتـمـنـي ان انـكـ/ي تـسـمـتـ؏ـ/ـي بي وقتك يـا مـز/ه🫦*\n`
    menuText += `*⊏─๋︩︪─๋︩︪─๋︩︪─๋︩︪─═͜⊐❪🫦❫⊏═─๋︩︪─๋︩︪─๋︩︪─๋︩︪─๋︩︪─⊐*\n`
    menuText += `*↜مـعلـومـاتـك يـا مـز/ه🫦🔞↶*\n`
    menuText += `*❍━━━══━━❪🌹❫━━══━━━❍*\n`
    menuText += `*┊🫦 ⇇الـمـنـشـن↜❪@${mentionId}❫*\n`
    menuText += `*🍭┊⇇الـرتـبـه↜❪${role}❫*\n`
    menuText += `*🌸┊⇇الـمـسـتـوي↜❪${level}❫*\n`
    menuText += `*⊏─๋︩︪─๋︩︪─๋︩︪─๋︩︪─═͜⊐❪🫦❫⊏═─๋︩︪─๋︩︪─๋︩︪─๋︩︪─๋︩︪─⊐*\n`
    menuText += `*↜مـعـلـومـات مـطـوري😜🔞↶*\n`
    menuText += `*🍷┊⇇الـقـب↶*\n> *🍺༄𝐈𝐌 𝐘𝐄𝐑𝐈𝐓𝐂𝐇𝐈༆🍻*\n`
    menuText += `*╮═━━━━━━✦✿✦━━━━━━═╭*\n`
    menuText += `*┊     ｢🌹┊التـنـبـيـهـات┊🌹｣     ┊*\n`
    menuText += `*╯═━━━━━━✦✿✦━━━━━━═╰*\n`
    menuText += `*❪1❫↜ممنوع سب البوت*\n`
    menuText += `*❪2❫↜للشكوه او للاقتراح↶*\n`
    menuText += `*❪3❫↜ضغط علي الزر لي عرض الاوامر*\n`
    menuText += `*❪4❫↜لا تنسي قبل اي امر↜❪.❫*\n`
    menuText += `*❪5❫↜استخدم امر｢تسجيل/reg｣ لي تشغيل بعض الاوامر*\n`
    menuText += `*❍━━━══━━❪🫦❫━━══━━━❍*\n`
    menuText += `> 𝐊𝐈𝐍𝐈𝐒𝐈𝐘𝐀 𝐁𝐎𝐓`

    await conn.sendMessage(m.chat, { react: { text: '🩸', key: m.key } })

    // === إنشاء nativeFlowPayload ===
    const nativeFlowPayload = {
      body: { text: menuText },
      footer: { text: '' },
      nativeFlowMessage: {
        buttons: [
          {
            name: 'single_select',
            buttonParamsJson: JSON.stringify({
              title: '🗂️اقسام البوت',
              sections: [
                {
                  title: 'اختار قسم الاوامر التي تحتاج',
                  highlight_label: ' ◡̈⃝𝐊𝐈𝐍𝐈𝐒𝐈𝐘𝐀 𝐁𝐎𝐓ఌ',
                  rows
                }
              ]
            })
          },
          {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
              display_text: 'تنصيب البوت',
              id: '.تنصيب'
            })
          }, 
          {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
              display_text: 'شراء البوت',
              id: '.شرا'
            })
          }, 
          {
            name: 'cta_url',
            buttonParamsJson: JSON.stringify({
              display_text: "📢 القناة الرسمية",
              url: channel,
              merchant_url: channel
            })
          },
          {
            name: 'cta_url',
            buttonParamsJson: JSON.stringify({
              display_text: '👑 التواصل مع المطور',
              url: developerContact,
              merchant_url: developerContact
            })
          }
        ],
        messageParamsJson: JSON.stringify({
          limited_time_offer: {
            text: `⚡ ${speed}ms`,
            url: developerContact,
            copy_code: `المطور: +${developerNumber}`,
            expiration_time: Date.now() + 86400000
          },
          bottom_sheet: {
            in_thread_buttons_limit: 1,
            divider_indices: [1, 2, 3, 4, 5, 6, 7, 8, 9, 999],
            list_title: "📂 قائمة أقسام البوت",
            button_title: "『🩸┃القوائـ🗒️ـم┃🩸』"
          },
          tap_target_configuration: {
            description: "𝐊𝐈𝐍𝐈𝐒𝐈𝐘𝐀 𝐁𝐎𝐓 𝐕1",
            canonical_url: developerContact,
            domain: "https://wa.me/212693863911",
            button_index: 0
          }
        })
      }
    }

    try {
      const media = await prepareWAMessageMedia(
        { image: { url: menuImageUrl } },
        { upload: conn.waUploadToServer }
      )

      nativeFlowPayload.header = {
        hasMediaAttachment: true,
        subtitle: 'بوت متعدد الوظائف',
        imageMessage: media.imageMessage
      }
    } catch (e) {
      console.error('خطأ في تحميل صورة القائمة:', e)
      nativeFlowPayload.header = {
        hasMediaAttachment: false,
        subtitle: 'بوت متعدد الوظائف'
      }
    }

    // إرسال الرسالة التفاعلية
    const interactiveMessage = proto.Message.InteractiveMessage.fromObject(nativeFlowPayload)
    const fkontak = await makeFkontak()
    const msg = generateWAMessageFromContent(m.chat, { interactiveMessage }, { 
      userJid: conn.user.jid, 
      quoted: fkontak 
    })
    
    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })

  } catch (e) {
    console.error('خطأ:', e)
    await conn.sendMessage(m.chat, {
      text: `بوت كينيسيا\n\n• ${_p}مينيو - القائمة الرئيسية\n• ${_p}بينق - اختبار البوت\n\n⚠️ خطأ في تحميل القائمة`
    }, { quoted: m })
  }
}

// معالج الأزرار التفاعلية
handler.before = async (m, { conn }) => {
  if (m.type === 'interactive_response') {
    const response = JSON.parse(m.response)
    const buttonId = response.id || response.buttonId
    
    const sections = {
      ai: 'الذكاء الاصطناعي & الدردشة',
      audio_ai: 'الذكاء الاصطناعي صوتيات',
      downloader: 'البحث وتنزيل',
      images: 'تنزيل صور و خليفات',
      fun: 'ترفيه & مرح',
      game: 'ألعاب & تسلية',
      group: 'المجموعات & الإدارة',
      info: 'معلومات & مساعدة',
      edit: 'قسم تحميل الايديت',
      maker: 'صانع & تصميم',
      maker_2: 'زخارف النص',
      news: 'أخبار & معلومات',
      devs: 'ادوات_للمطورين',
      owner: 'المالك & المطور',
      quran: 'القرآن الكريم & إسلاميات',
      quotes: 'اقتباسات & تحفيز',
      search: 'بحث & معلومات',
      sticker: 'ملصقات & صانع',
      tools: 'أدوات & خدمات',
      database: 'قاعدة بيانات & تخزين',
      rules: 'القوانين',
      xp: 'المستوى & النقاط'
    }
    
    if (sections[buttonId]) {
      await conn.sendMessage(m.chat, {
        text: `╔══════════════════╗\n║  ${sections[buttonId]}  ║\n╚══════════════════╝`
      }, { quoted: m })
      return true
    }
  }
  return false
}

// دالة للاقتباس الخاص
async function makeFkontak() {
  try {
    const res = await fetch('https://raw.githubusercontent.com/fazbear-Official/uploads/main/uploads/upload-1773410525010.jpg')
    const thumb2 = Buffer.from(await res.arrayBuffer())
    return {
      key: { participants: '0@s.whatsapp.net', remoteJid: 'status@broadcast', fromMe: false, id: 'Halo' },
      message: { locationMessage: { name: 'بوت ابيس', jpegThumbnail: thumb2 } },
      participant: '0@s.whatsapp.net'
    }
  } catch {
    return undefined
  }
}

handler.help = ['menu', 'مينيو', 'القائمة']
handler.tags = ['main']
handler.command = ['menu', 'اوامر', 'القائمة', 'مهام']

export default handler
