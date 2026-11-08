import { existsSync, promises as fs, readdirSync, rmSync, unlinkSync } from 'fs'
import path from 'path'

const handler = async (m, { conn, usedPrefix }) => {
  const chatId = m.isGroup ? m.chat : m.sender
  const uniqid = chatId.split('@')[0]
  const sessionPath = './KinisiyaBot-MD/'

  try {
    const files = await fs.readdir(sessionPath)
    let filesDeleted = 0

    for (const file of files) {
      if (file.includes(uniqid)) {
        await fs.unlink(path.join(sessionPath, file))
        filesDeleted++
      }
    }

    if (filesDeleted === 0) {
      await conn.sendMessage(
        m.chat,
        {
          text: `*╮──────────────────⟢ـ*
*⧉┆⚠️ لـم يـتـم الـعـثـور عـلـى أي مـلـف جـلـسـة*
*⧉┆↜ يـحـتـوي عـلـى مـعـرّف الـدردشـة*
*╯──────────────────⟢ـ*`
        },
        { quoted: m }
      )
    } else {
      await conn.sendMessage(
        m.chat,
        {
          text: `*╮──────────────────⟢ـ*
*⧉┆✅ تـم حـذف ${filesDeleted} مـن مـلـفـات الـجـلـسـة*
*╯──────────────────⟢ـ*`
        },
        { quoted: m }
      )
    }

  } catch (err) {
    console.error(err)
    await conn.sendMessage(
      m.chat,
      {
        text: `*╮──────────────────⟢ـ*
*⧉┆❌ فـشـل الـوصـول إلـى مـلـفـات الـجـلـسـة*
*⧉┆↜ الـمـجـلـد غـيـر مـوجـود أو تـالـف*
*╯──────────────────⟢ـ*`
      },
      { quoted: m }
    )
  }

  await conn.sendMessage(
    m.chat,
    {
      text: `*╮──────────────────⟢ـ*
*⧉┆💠 الـبـوت يـعـمـل الآن بـنـجـاح*
*⧉┆↜ إذا لـم يـسـتـجـب لـلأوامـر*
*⧉┆↜ قـم بـإرسـال سـبـام بـسـيـط*
*╯──────────────────⟢ـ*

*╮──────────────────⟢ـ*
*⧉┆📌 مـثـال:*
*⧉┆↜ ${usedPrefix}s*
*⧉┆↜ ${usedPrefix}s*
*⧉┆↜ ${usedPrefix}s*
*╯──────────────────⟢ـ*`
    },
    { quoted: m }
  )
}

handler.help = ['deletebot']
handler.tags = ['jadibot']
handler.command = /^(حذف_الجلسه|ds)$/i

export default handler