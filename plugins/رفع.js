import fetch from 'node-fetch'
import AdmZip from 'adm-zip'
import fs from 'fs'
import path from 'path'

let repoOwner = "Apex-Official"
let repoName = "apex-baileys"
let token = process.env.GITHUB_TOKEN // ❗غيّره بعد ما تعمل Regenerate للتوكن

let handler = async (m, { conn }) => {
  if (!m.quoted || !m.quoted.mimetype) {
    return m.reply("⚠️ **اعمل ريبلاي على ملف ZIP علشان أقدر أرفعه.**")
  }

  let mime = m.quoted.mimetype || ''
  if (!/zip/.test(mime)) {
    return m.reply("⚠️ الملف لازم يكون **ZIP** فقط!")
  }

  m.reply("⏳ جاري التحميل...")

  let buffer = await m.quoted.download()
  m.reply("📂 جاري فك الضغط...")

  let zip = new AdmZip(buffer)
  let extractPath = path.join(process.cwd(), 'temp_upload')
  if (!fs.existsSync(extractPath)) fs.mkdirSync(extractPath)

  zip.extractAllTo(extractPath, true)

  m.reply("🚀 جاري الرفع إلى GitHub...")

  let files = fs.readdirSync(extractPath)

  for (let file of files) {
    let filePath = path.join(extractPath, file)
    let content = fs.readFileSync(filePath, { encoding: 'base64' })

    let url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${file}`

    await fetch(url, {
      method: "PUT",
      headers: {
        "Authorization": `token ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: `Upload ${file}`,
        content: content
      })
    })
  }

  m.reply("✅ **تم الرفع بنجاح إلى GitHub!**")
}

handler.help = ["رفع"]
handler.tags = ["tools"]
handler.command = ["رفع"]

export default handler