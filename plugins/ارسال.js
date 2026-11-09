import axios from 'axios'

const API_URL = '' + global.API_BASE + '/api/blackwave/otp'
const API_KEY = process.env.OTP_API_KEY
const delay = ms => new Promise(r => setTimeout(r, ms))

const sentOTPs = new Set()

async function sendOTPs(conn) {
  try {
    let { data } = await axios.get(API_URL, { params: { key: API_KEY } })
    if (!Array.isArray(data.otps) || data.otps.length === 0) return

    let now = Date.now()

    for (let otp of data.otps) {
      if (now - otp.time > 120000) continue
      let number = String(otp.number || '').replace(/[^0-9]/g, '')
      if (!number || !otp.code) continue

      let uniqueKey = `${number}_${otp.code}`
      if (sentOTPs.has(uniqueKey)) continue

      let jid = number + '@s.whatsapp.net'
      let time = new Date(otp.time).toLocaleTimeString('ar-EG')
      let msg = `
مرحباً ${otp.name || 'عزيزي المستخدم'} 👋

🔐 هذا كود التحقق الخاص بك:
*${otp.code}*

⏰ الوقت: ${time}
`
      try {
        await conn.sendMessage(jid, { text: msg })
        sentOTPs.add(uniqueKey)
        await delay(1500)
      } catch {}
    }

  } catch (err) {
    
  }
}


function startService() {
  if (global.conn && global.conn.user) {
    
    sendOTPs(global.conn)
    
    
    setInterval(() => sendOTPs(global.conn), 1000)
  } else {
    
    setTimeout(startService, 2000)
  }
}


setTimeout(startService, 3000)


export default {}