import fetch from 'node-fetch'

let sentNumbers = new Set() // تخزين الأرقام التي تم إرسال الكود لها مسبقًا

// دالة لتصحيح JID قبل الإرسال
function formatJID(number) {
    let cleanNumber = number.replace(/\D/g, "") // إزالة أي رموز أو مسافات
    if (cleanNumber.startsWith("0")) cleanNumber = "20" + cleanNumber.slice(1) // مصر كمثال
    return cleanNumber + "@s.whatsapp.net"
}

let handler = async (m, { conn }) => {
    try {
        await global.loading(m, conn) // تشغيل Loading

        const API_URL = 'https://apex-api-five.vercel.app/api/blackwave/otp'
        const API_KEY = process.env.OTP_API_KEY

        // تشغيل المستشعر لتشغيل GET كل فترة
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`${API_URL}?key=${API_KEY}`)
                if (!res.ok) {
                    console.log(`❌ API Error: HTTP ${res.status}`)
                    return
                }

                const data = await res.json()
                if (!data.otps || !Array.isArray(data.otps)) return

                for (let otp of data.otps) {
                    const number = otp.number
                    const code = otp.code
                    const name = otp.name

                    // إذا الرقم جديد ولم يُرسل له الكود مسبقًا
                    if (!sentNumbers.has(number)) {
                        sentNumbers.add(number) // علامة أنه تم الإرسال

                        try {
                            await conn.sendMessage(formatJID(number), {
                                text: `📌 مرحباً ${name}\n✅ كود OTP الخاص بك هو: *${code}*`
                            })
                            console.log(`✅ OTP sent to ${number}: ${code}`)
                        } catch (err) {
                            console.log(`❌ Failed to send OTP to ${number}: ${err.message}`)
                            sentNumbers.delete(number) // السماح بإعادة الإرسال لاحقًا
                        }
                    }
                }
            } catch (err) {
                console.log('❌ Fetch failed:', err.message)
            }
        }, 5000) // كل 5 ثواني

        // إيقاف المستشعر بعد 10 دقائق (اختياري)
        setTimeout(() => clearInterval(interval), 10 * 60 * 1000)

    } catch (e) {
        m.reply(`❌ حدث خطأ: ${e.message}`)
    } finally {
        await global.loading(m, conn, true)
    }
}

handler.help = ['otp-sensor']
handler.tags = ['owner']
handler.command = /^(otp-sensor)$/i
handler.owner = true

export default handler