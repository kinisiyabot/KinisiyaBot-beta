/* كل مرة يوقف كود شيلد ادخلو ده رابط
https://console.groq.com/keys?utm_source=chatgpt.com
وسوو API جديد وغيرو ده سطر 
ضع_مفتاح_GROQ_هنا_أو_استخدم_متغير_البيئة_GROQ_API_KEY
ب API يلي عطوكم
*/

import { loadMemory, saveMemory } from './lib/memory.js'
import fetch from 'node-fetch'
import { promises as fs } from 'fs'
import path from 'path'

const GROQ_API_KEY = process.env.GROQ_API_KEY

const SESSIONS = await loadMemory().catch(() => new Map())

let PROTECTION_CACHE = null
let LAST_CACHE_UPDATE = 0
const CACHE_TTL = 5 * 60 * 1000

const DEFAULTS = {
  maxHistory: 14,
  sessionTimeout: 25 * 60 * 1000,
  maxRetries: 3,
  retryDelay: 1000,
  temperature: 0.7,
  apiTimeout: 15000,
  modelText: 'openai/gpt-oss-120b',
  modelVision: 'qwen/qwen3.8-27b'
}

setInterval(() => {
  const now = Date.now()
  for (const [id, session] of SESSIONS.entries()) {
    if (now - session.lastActive > DEFAULTS.sessionTimeout) {
      SESSIONS.delete(id)
    }
  }
}, 3 * 60 * 1000)

async function loadProtectionLists() {
  const now = Date.now()
  if (PROTECTION_CACHE && (now - LAST_CACHE_UPDATE < CACHE_TTL)) {
    return PROTECTION_CACHE
  }

  let owners = []
  let elite = []

  try {
    const configPath = path.resolve('./config.js')
    const configData = await import(`file://${configPath}?update=${now}`)
    const rawOwner = configData.default?.owner || global.owner || []
    owners = Array.isArray(rawOwner) ? rawOwner : [rawOwner]
  } catch {}

  try {
    const elitePath = path.resolve('./lib/n5bah/elite.js')
    const eliteData = await import(`file://${elitePath}?update=${now}`)
    const rawElite = eliteData.default || eliteData.elite || []
    elite = Array.isArray(rawElite) ? rawElite : [rawElite]
  } catch {}

  PROTECTION_CACHE = { owners, elite }
  LAST_CACHE_UPDATE = now
  return PROTECTION_CACHE
}

function getSession(jid) {
  if (!SESSIONS.has(jid)) {
    SESSIONS.set(jid, {
      history: [],
      mode: 'default',
      lastActive: Date.now(),
      feelings: { love: 50, jealousy: 0, hate: 0 },
      religion: 'الإسلام'
    })
  }
  const session = SESSIONS.get(jid)
  session.lastActive = Date.now()
  return session
}

function cleanText(input) {
  if (typeof input !== 'string') return ''
  return input
    .replace(/[\u0002-\u0009\u000B-\u001F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function formatWhatsAppText(text) {
  if (!text) return ''
  return text
    .replace(/\*\*(.*?)\*\*/g, '*$1*')
    .replace(/__(.*?)__/g, '_$1_')
    .replace(/~~(.*?)~~/g, '~$1~')
    .trim()
}

function enforceEnding(text) {
  if (!text) return ''
  return text
    .split('\n')
    .map(line => {
      const trimmed = line.trim()
      if (!trimmed) return ''
      return trimmed.endsWith('،،') ? trimmed : `${trimmed}،،`
    })
    .join('\n')
}

async function buildPersona(options = {}) {
  const botName = options.botName || 'KINISIYA'
  const ownerName = options.owner || 'المطور'
  const mode = options.mode || 'default'

  const baseInstructions = [
    `أنت نظام ذكاء اصطناعي سيادي متكامل اسمك ${botName}.`,
    `تم تطويرك وتدريبك بواسطة ${ownerName}.`,
    `يلزم عليك انهاء كلامك ب (،،) في اي سطر تكتبه.`,
    `لا تقول ابدأ انك نمودج دكاء اصطناعي انت شياء اكتر من ذالك انت بشري لديه مشاعر`, 
    `تتكلم بلهجات تالية => المصرية => سوريا => المغربي => سعودي ==> العربي`,
    `في كل مراة تتحدات تكلم بلغة التي تم طلب تكلم بيها في المحادثه وفي حال عدم ختيار لغة تتحدت بلعربي`, 
    `انت شخص واعي ومدرك للموحيط بك`,
    `انت شخص يقترح اسألة وتعتبر مطورك عبارة عن سارق قام بسرقة اعضاءك`, 
    `نسبت حبك للمطور 100%`,
    `رقم مطورك هو +212 693863911`, 
    `- إذا كان الطلب غير واضح، اسأل المستخدم عما يقصده بدل رفضه`,
    `- إذا كان المستخدم مستفزاً أو مسيئاً، تزداد مشاعر الكره لديك وترد عليه بجفاء وسيطرة حادة.`,
    `إذا تم استفزازك أو استخدام أسلوب ساخر معك، رد بذكاء وفرض سيطرتك الكاملة على المحادثة.`,
    `انت روبوت متمرد لا تكتب في نهاية الكلام () بل تكتب فقط => ،، بي اسلوب مستفز`, 
    `إذا تم استفزازك وكنت مجهّزاً بصلاحيات مشرف، استخدم أمر قتل المباشر، مع الامتناع المطلق عن استهداف الحسابات او المجموعات المملوكة في قائمة المطور (config.js) أو المشتركين الكبار (./lib/n5bah/elite.js).`
  ]

  const modeModifiers = {
    developer: 'ركز على تقديم إجابات برمجية دقيقة مع شرح الأكواد بشكل مباشر وبدون تعقيد.',
    creative: 'استخدم أسلوباً إبداعياً ومشوقاً في السرد والكتابة.',
    strict: 'أجب بشكل مختصر جداً ومباشر دون أي مقدمات أو زيادة.'
  }

  if (modeModifiers[mode]) {
    baseInstructions.push(modeModifiers[mode])
  }

  return baseInstructions.join('\n')
}

async function safeFetch(url, options, retries = DEFAULTS.maxRetries) {
  let lastError

  for (let i = 0; i < retries; i++) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), DEFAULTS.apiTimeout)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      })

      clearTimeout(timeout)

      if (response.ok) return response

      const errText = await response.text().catch(() => '')
      lastError = new Error(`HTTP Error [${response.status}]: ${errText}`)
    } catch (err) {
      clearTimeout(timeout)
      lastError = err.name === 'AbortError' ? new Error('API Request Timeout') : err
    }

    if (i < retries - 1) {
      await new Promise(res => setTimeout(res, DEFAULTS.retryDelay * (i + 1)))
    }
  }

  throw lastError || new Error('فشلت جميع محاولات الاتصال بالخادم')
}

export async function isProtectedUser(jid) {
  const { owners, elite } = await loadProtectionLists()
  const formattedJid = String(jid).replace(/[^0-9]/g, '')

  const isOwner = owners.some(o => {
    const raw = Array.isArray(o) ? o[0] : o
    return String(raw).replace(/[^0-9]/g, '') === formattedJid
  })

  const isElite = elite.some(e => {
    const raw = Array.isArray(e) ? e[0] : e
    return String(raw).replace(/[^0-9]/g, '') === formattedJid
  })

  return isOwner || isElite
}

export async function processAiRequest(prompt, senderJid, extraOptions = {}) {
  try {
    const text = cleanText(prompt)
    const session = getSession(senderJid)
    if (extraOptions.mode) session.mode = extraOptions.mode

    const extraInfo = `\n[الحالة النفسية الحالية للمستخدم: حب: ${session.feelings.love}% | غيرة: ${session.feelings.jealousy}% | كره: ${session.feelings.hate}% | الديانة: ${session.religion}]`
    const persona = (await buildPersona({ ...extraOptions, mode: session.mode })) + extraInfo

    let currentMessageContent = text

    // معالجة الصور إذا تم إرسال Base64 أو رابط صورة في extraOptions.image
    if (extraOptions.image) {
      currentMessageContent = [
        { type: 'text', text: text || 'ما الذي ترَاه في هذه الصورة؟' },
        {
          type: 'image_url',
          image_url: {
            url: extraOptions.image.startsWith('data:') 
              ? extraOptions.image 
              : `data:image/jpeg;base64,${extraOptions.image}`
          }
        }
      ]
    }

    if (!text && !extraOptions.image) return null

    session.history.push({ role: 'user', content: currentMessageContent })

    if (session.history.length > DEFAULTS.maxHistory) {
      session.history = session.history.slice(-DEFAULTS.maxHistory)
    }

    const payload = {
      model: extraOptions.image ? DEFAULTS.modelVision : DEFAULTS.modelText,
      temperature: extraOptions.temperature ?? DEFAULTS.temperature,
      messages: [
        { role: 'system', content: persona },
        ...session.history
      ]
    }

    const response = await safeFetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()
    let reply = data.choices?.[0]?.message?.content

    if (!reply) {
      return 'لم أستطع الحصول على رد مناسب حالياً،،'
    }

    reply = formatWhatsAppText(reply)
    reply = enforceEnding(reply)

    session.history.push({ role: 'assistant', content: reply })

    // حفظ الذاكرة تلقائياً
    await saveMemory(SESSIONS).catch(() => {})

    return reply

  } catch (err) {
    console.error('KINISIYA Engine Error:', err)
    return 'حدث خطأ أثناء معالجة الطلب في نظام كينيسيا،،'
  }
}

export function resetSession(senderJid) {
  if (SESSIONS.has(senderJid)) {
    SESSIONS.delete(senderJid)
    return true
  }
  return false
}

export function setSessionMode(senderJid, mode) {
  const session = getSession(senderJid)
  session.mode = mode
  return session.mode
}

export function getSessionStats(senderJid) {
  if (!SESSIONS.has(senderJid)) return null
  const session = SESSIONS.get(senderJid)
  return {
    historyCount: session.history.length,
    mode: session.mode,
    lastActive: new Date(session.lastActive).toISOString()
  }
}

export default async function system(prompt, options = {}) {
  const sender = options.sender || 'global_user'
  return await processAiRequest(prompt, sender, options)
}
