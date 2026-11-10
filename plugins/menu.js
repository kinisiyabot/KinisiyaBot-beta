import { prepareWAMessageMedia, generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'
import { performance } from 'perf_hooks'
import { DEFAULT_LANG, LANGUAGES, categoryTitle, categoryIds, normalizeLang, t } from '../lib/i18n.js'

const MENU_COMMANDS = ['menu', 'مينيو', 'القائمة', 'مهام', 'اوامر']
// الأمر المطابق لكل لغة (زر اللغة يعيد الإرسال كأمر نصي)
const LANG_COMMANDS = { ar: 'menu_ar', en: 'menu_en', es: 'menu_es' }

function resolveLang(m, user, command) {
  const byCommand = Object.entries(LANG_COMMANDS).find(([, cmd]) => cmd === command)
  if (byCommand) return byCommand[0]
  return normalizeLang(user?.lang) || null
}

// الأقسام التي يملك كل منها بلوجن مستقل للأمر `.قسم_<id>`؛ تُبنى ديناميكياً
// حتى لا تظهر في القائمة أقسام بلا أوامر.
export function availableCategories() {
  const commands = new Set()
  for (const plugin of Object.values(global.plugins || {})) {
    const cmd = plugin?.command
    if (!cmd) continue
    if (cmd instanceof RegExp) {
      const m = cmd.source.match(/قسم_([a-zA-Z0-9_]+)/)
      if (m) commands.add(m[1])
    } else if (Array.isArray(cmd)) {
      for (const c of cmd) {
        if (typeof c !== 'string') continue
        if (c.startsWith('قسم_')) commands.add(c.slice(4))
        else { const m = c.match(/قسم_([a-zA-Z0-9_]+)/); if (m) commands.add(m[1]) }
      }
    } else if (typeof cmd === 'string') {
      if (cmd.startsWith('قسم_')) commands.add(cmd.slice(4))
      else { const m = cmd.match(/قسم_([a-zA-Z0-9_]+)/); if (m) commands.add(m[1]) }
    }
  }
  const known = categoryIds().filter(id => commands.has(id))
  return known.length ? known : categoryIds()
}

function buildMenuText(lang, { mentionId, role, level }) {
  const sep = '*⊏─๋︩︪─๋︩︪─๋︩︪─๋︩︪─═͜⊐❪🫦❫⊏═─๋︩︪─๋︩︪─๋︩︪─๋︩︪─⊐*'
  const line = '*❍━━━══━━❪🫦❫━━══━━━❍*'
  const bar = '*╮═━━━━━━✦✿✦━━━━━━═╭*'
  const barEnd = '*╯═━━━━━━✦✿✦━━━━━━═╰*'

  let text = t(lang, 'welcome', mentionId) + '\n'
  text += sep + '\n'
  text += t(lang, 'yourInfo') + '\n'
  text += line + '\n'
  text += t(lang, 'mention', mentionId) + '\n'
  text += t(lang, 'rank', role) + '\n'
  text += t(lang, 'level', level) + '\n'
  text += sep + '\n'
  text += t(lang, 'devInfo') + '\n'
  text += t(lang, 'devNick') + '\n'
  text += bar + '\n'
  text += t(lang, 'notes') + '\n'
  text += barEnd + '\n'
  text += t(lang, 'note1') + '\n'
  text += t(lang, 'note2') + '\n'
  text += t(lang, 'note3') + '\n'
  text += t(lang, 'note4') + '\n'
  text += t(lang, 'note5') + '\n'
  text += line + '\n'
  text += '> 𝐊𝐈𝐍𝐈𝐒𝐈𝐘𝐀 𝐁𝐎𝐓'
  return text
}

async function sendInteractive(conn, m, chat, payload) {
  const interactiveMessage = proto.Message.InteractiveMessage.fromObject(payload)
  const fkontak = await makeFkontak()
  const msg = generateWAMessageFromContent(chat, { interactiveMessage }, {
    userJid: conn.user.jid,
    quoted: fkontak || m
  })
  await conn.relayMessage(chat, msg.message, { messageId: msg.key.id })
}

// شاشة اختيار اللغة (تظهر عند أول طلب للقائمة بدون لغة محفوظة)
async function sendLanguageChooser(conn, m, chat) {
  const buttons = ['ar', 'en', 'es'].map(code => ({
    name: 'quick_reply',
    buttonParamsJson: JSON.stringify({
      display_text: LANGUAGES[code],
      id: `.${LANG_COMMANDS[code]}`
    })
  }))

  await sendInteractive(conn, m, chat, {
    body: { text: t(DEFAULT_LANG, 'chooseLang') },
    footer: { text: '' },
    nativeFlowMessage: {
      buttons,
      messageParamsJson: JSON.stringify({
        bottom_sheet: {
          in_thread_buttons_limit: 3,
          list_title: t(DEFAULT_LANG, 'langTitle'),
          button_title: t(DEFAULT_LANG, 'langTitle')
        }
      })
    }
  })
}

let handler = async (m, { conn, usedPrefix: _p, command }) => {
  try {
    const user = global.db?.data?.users?.[m.sender] || {}
    const lang = resolveLang(m, user, command)

    await conn.sendMessage(m.chat, { react: { text: '🩸', key: m.key } })

    // لا لغة محددة بعد -> اسأل المستخدم
    if (!lang) {
      await sendLanguageChooser(conn, m, m.chat)
      return
    }

    // خزّن اللغة المختارة
    if (global.db?.data?.users?.[m.sender]) global.db.data.users[m.sender].lang = lang

    const speed = performance.now().toFixed(4)
    const mentionId = m.sender ? m.sender.split('@')[0] : ''
    const { level = 0, role = 'مواطن 👨🏻‍💼' } = user

    const menuImageUrl = 'https://raw.githubusercontent.com/kinisiyabot/KinisiyaBot-beta/main/media/9e26328765e3798507e39ccb249213f5.jpg'
    const channel = 'https://whatsapp.com/channel/0029Vb80wch30LKFioKenc2V'
    const developerNumber = '212693863911'
    const developerContact = `https://wa.me/${developerNumber}`

    const rows = availableCategories().map(id => ({
      title: `🗂️ ${categoryTitle(lang, id)}`,
      description: `${t(lang, 'sectionsHint')} - ${categoryTitle(lang, id)}`,
      id: `.قسم_${id}`
    }))

    const nativeFlowPayload = {
      body: { text: buildMenuText(lang, { mentionId, role, level }) },
      footer: { text: '' },
      nativeFlowMessage: {
        buttons: [
          {
            name: 'single_select',
            buttonParamsJson: JSON.stringify({
              title: t(lang, 'sections'),
              sections: [
                {
                  title: t(lang, 'sectionsHint'),
                  highlight_label: ' ◡̈⃝𝐊𝐈𝐍𝐈𝐒𝐈𝐘𝐀 𝐁𝐎𝐓ఌ',
                  rows
                }
              ]
            })
          },
          {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({ display_text: t(lang, 'install'), id: '.تنصيب' })
          },
          {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({ display_text: t(lang, 'buy'), id: '.شرا' })
          },
          {
            name: 'cta_url',
            buttonParamsJson: JSON.stringify({ display_text: t(lang, 'channel'), url: channel, merchant_url: channel })
          },
          {
            name: 'cta_url',
            buttonParamsJson: JSON.stringify({ display_text: t(lang, 'contact'), url: developerContact, merchant_url: developerContact })
          },
          {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({ display_text: LANGUAGES[lang], id: `.${LANG_COMMANDS[lang]}` })
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
            list_title: t(lang, 'listTitle'),
            button_title: t(lang, 'buttonTitle')
          },
          tap_target_configuration: {
            description: '𝐊𝐈𝐍𝐈𝐒𝐈𝐘𝐀 𝐁𝐎𝐓 𝐕1',
            canonical_url: developerContact,
            domain: `https://wa.me/${developerNumber}`,
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
        subtitle: t(lang, 'subtitle'),
        imageMessage: media.imageMessage
      }
    } catch (e) {
      console.error('menu image error:', e)
      nativeFlowPayload.header = { hasMediaAttachment: false, subtitle: t(lang, 'subtitle') }
    }

    await sendInteractive(conn, m, m.chat, nativeFlowPayload)
  } catch (e) {
    console.error('menu error:', e)
    await conn.sendMessage(m.chat, {
      text: `Kinisiya Bot\n\n• ${_p}menu - ${t(DEFAULT_LANG, 'errMenu')}`
    }, { quoted: m })
  }
}

// التعامل مع أزرار الأقسام يتم عبر بلوجنات `.قسم_*` المستقلة بعد أن يعيد
// `_templateResponse` إرسال ضغطة الزر كأمر نصي، فلا حاجة لمعالجة مكرّرة هنا.

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
handler.command = [...MENU_COMMANDS, ...Object.values(LANG_COMMANDS)]

export default handler
