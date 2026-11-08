import axios from "axios"
import fs from "fs"
import path from "path"

let handler = async (m, { conn, text }) => {
  if (!text) {
    return m.reply("❌ اكتب اسم المكتبة\nمثال:\nمكتبه @rexxhayanasi/elaina-baileys")
  }

  try {
    await m.reply("⏳ جاري جلب المكتبة من npm...")

    // 1️⃣ جلب بيانات المكتبة
    const info = await axios.get(`https://registry.npmjs.org/${text}`)
    const latest = info.data["dist-tags"].latest
    const tarball = info.data.versions[latest].dist.tarball

    // 2️⃣ تحميل الملف
    const fileName = `${text.replace(/[\/@]/g, "_")}-${latest}.zip`
    const filePath = path.join("./tmp", fileName)

    const res = await axios.get(tarball, { responseType: "stream" })
    const stream = fs.createWriteStream(filePath)

    res.data.pipe(stream)

    await new Promise((resolve, reject) => {
      stream.on("finish", resolve)
      stream.on("error", reject)
    })

    // 3️⃣ إرسال الملف في واتساب
    await conn.sendMessage(
      m.chat,
      {
        document: fs.readFileSync(filePath),
        fileName: fileName,
        mimetype: "application/zip"
      },
      { quoted: m }
    )

    // 4️⃣ تنظيف
    fs.unlinkSync(filePath)

  } catch (err) {
    console.error(err)
    m.reply("❌ حصل خطأ، تأكد إن اسم المكتبة صحيح")
  }
}

handler.help = ["مكتبه <npm-package>"]
handler.tags = ["tools"]
handler.command = ["مكتبه"]

export default handler