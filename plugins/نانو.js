import fetch from "node-fetch"

class ImgEditor {
  static base = "https://imgeditor.co/api"

  static async getUploadUrl(buffer) {
    const res = await fetch(`${this.base}/get-upload-url`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        fileName: "photo.jpg",
        contentType: "image/jpeg",
        fileSize: buffer.length
      })
    })
    return res.json()
  }

  static async upload(uploadUrl, buffer) {
    await fetch(uploadUrl, {
      method: "PUT",
      headers: { "content-type": "image/jpeg" },
      body: buffer
    })
  }

  static async generate(prompt, imageUrl) {
    const res = await fetch(`${this.base}/generate-image`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        prompt,
        styleId: "realistic",
        mode: "image",
        imageUrl,
        imageUrls: [imageUrl],
        numImages: 1,
        outputFormat: "png",
        model: "nano-banana"
      })
    })
    return res.json()
  }

  static async check(taskId) {
    while (true) {
      await new Promise(r => setTimeout(r, 2500))
      const res = await fetch(`${this.base}/generate-image/status?taskId=${taskId}`)
      const json = await res.json()
      if (json.status === "completed") return json.imageUrl
      if (json.status === "failed") throw new Error("فشلت المهمة")
    }
  }
}

let handler = async (m, { conn, text }) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ""
  
  if (!/image/.test(mime)) return m.reply("رد على صورة أو أرسل صورة مع النص .edit <الوصف>")
  if (!text) return m.reply("أين الوصف؟\nمثال: .edit حولها لأنمي")

  const prompt = text.trim()
  const wait = await conn.sendMessage(m.chat, { text: "جاري تحميل الصورة..." }, { quoted: m })

  let buffer
  try {
    buffer = await q.download()
    if (!buffer) throw ""
  } catch {
    return conn.sendMessage(m.chat, { edit: wait.key, text: "فشل تحميل الصورة!" })
  }

  await conn.sendMessage(m.chat, { edit: wait.key, text: "جاري رفع الصورة..." })

  try {
    const up = await ImgEditor.getUploadUrl(buffer)
    await ImgEditor.upload(up.uploadUrl, buffer)

    await conn.sendMessage(m.chat, { edit: wait.key, text: "جاري المعالجة بالذكاء الاصطناعي (قد يستغرق 20-50 ثانية)..." })

    const task = await ImgEditor.generate(prompt, up.publicUrl)
    const resultUrl = await ImgEditor.check(task.taskId)

    await conn.sendMessage(m.chat, {
      image: { url: resultUrl },
      caption: `تم!\nالوصف: ${prompt}`
    }, { quoted: m })

    await conn.sendMessage(m.chat, { delete: wait.key })

  } catch (e) {
    console.log(e)
    await conn.sendMessage(m.chat, { edit: wait.key, text: "فشلت معالجة الصورة. حاول مرة أخرى لاحقاً." })
  }
}

handler.help = ["edit <الوصف>"]
handler.tags = ["ai"]
handler.command = /^(edit|aiimg|نانو-برو)$/i

export default handler