import fs from 'fs'
import path from 'path'
import axios from 'axios'

const TOKEN = process.env.GITHUB_TOKEN
const GITHUB_USERNAME = 'fazbear-Official'
const REPO_NAME = 'uploads'

const uploadToGitHub = async (buffer, fileName) => {
  const base64Content = Buffer.from(buffer).toString('base64')
  const uploadPath = `uploads/${fileName}`

  const url = `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${uploadPath}`

  const res = await axios.put(
    url,
    {
      message: `Upload ${fileName}`,
      content: base64Content,
      branch: 'main',
    },
    {
      headers: {
        Authorization: `token ${TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }
  )

  if (res.status === 201 || res.status === 200) {
    return `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${REPO_NAME}/main/${uploadPath}`
  } else {
    throw new Error('فشل رفع الملف')
  }
}

let handler = async (m) => {
  const mediaFolder = path.join('./media')
  const files = fs.readdirSync(mediaFolder).filter(file =>
    /\.(jpg|jpeg|png|webp)$/i.test(file)
  )

  if (!files.length) return m.reply('⚠️ لا توجد صور في مجلد media.')

  let uploadedLinks = []

  await m.reply(`🔄 جاري رفع ${files.length} صورة إلى GitHub... انتظر`)

  for (let file of files) {
    try {
      const filePath = path.join(mediaFolder, file)
      const buffer = fs.readFileSync(filePath)

      const url = await uploadToGitHub(buffer, file)

      uploadedLinks.push(url)
    } catch (e) {
      console.error(`❌ خطأ أثناء رفع الصورة: ${file}`, e)
    }
  }

  if (!uploadedLinks.length) return m.reply('❌ فشل رفع جميع الصور.')

  fs.writeFileSync('./media-links.txt', uploadedLinks.join('\n'))

  await m.reply(
    `✅ تم رفع ${uploadedLinks.length} صورة بنجاح.\n📄 تم حفظ الروابط في: media-links.txt`
  )
}

handler.command = /^(رفع-الصور)$/i
handler.owner = true

export default handler