import { promises as fs } from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execPromise = promisify(exec)

let handler = async (m, { conn, usedPrefix, command }) => {
    // 1. Identify quoted message or media attachment
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || q.mediaType || ''

    if (!mime) {
        return m.reply(`⚠️ *Please reply to a blurred image or video!*\n\n*Example:* Reply to the media and type:\n\`${usedPrefix + command}\``)
    }

    const isImage = /image\/(jpe?g|png)/.test(mime)
    const isVideo = /video\/(mp4|mkv|avi|mov)/.test(mime)

    if (!isImage && !isVideo) {
        return m.reply('❌ *Invalid media type! Please reply to an image or video only.*')
    }

    await m.react('⏳')

    // Temp directory setup
    const tmpDir = path.join(process.cwd(), 'tmp')
    await fs.mkdir(tmpDir, { recursive: true })

    const ext = isImage ? 'jpg' : 'mp4'
    const inputPath = path.join(tmpDir, `input_${Date.now()}.${ext}`)
    const outputPath = path.join(tmpDir, `output_${Date.now()}.${ext}`)

    try {
        // 2. Download the media file
        let media = await q.download()
        await fs.writeFile(inputPath, media)

        // 3. FFmpeg video/image processing filter
        // Enhances sharpness, contrast, and brightness to uncover blurred content
        let vfFilter = "unsharp=5:5:1.5:5:5:0.0,eq=contrast=1.4:brightness=0.05:saturation=1.3"

        if (isImage) {
            let cmd = `ffmpeg -y -i "${inputPath}" -vf "${vfFilter}" "${outputPath}"`
            await execPromise(cmd)

            let resultBuffer = await fs.readFile(outputPath)
            await conn.sendMessage(m.chat, {
                image: resultBuffer,
                caption: '👁️ *Media processed and unblurred (Developer Mode)*'
            }, { quoted: m })

        } else if (isVideo) {
            let cmd = `ffmpeg -y -i "${inputPath}" -vf "${vfFilter}" -c:a copy "${outputPath}"`
            await execPromise(cmd)

            let resultBuffer = await fs.readFile(outputPath)
            await conn.sendMessage(m.chat, {
                video: resultBuffer,
                caption: '👁️ *Video processed and unblurred (Developer Mode)*'
            }, { quoted: m })
        }

        await m.react('✅')

    } catch (e) {
        console.error(e)
        await m.react('❌')
        m.reply('❌ *An error occurred while processing the file with FFmpeg!*')
    } finally {
        // Clean up temp files
        await fs.unlink(inputPath).catch(() => {})
        await fs.unlink(outputPath).catch(() => {})
    }
}

// 👑 Restrict command to bot developers
handler.help = ['unblur']
handler.tags = ['owner']
handler.command = ['unblur', 'clear', 'reveal']
handler.rowner = true // Exclusive for the real owner/developer

export default handler
