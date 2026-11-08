import { isElite } from '../lib/elite.js'
import { jidDecode } from '@soymaycol/maybailyes'
import chalk from 'chalk'
import { spawn } from 'child_process'

const decode = jid => (jidDecode(jid)?.user || jid.split('@')[0]) + '@s.whatsapp.net'

const handler = async (m, { conn }) => {
  try {
    const chatId = m.key.remoteJid
    const sender = decode(m.key.participant || m.participant || chatId)
    const senderLid = sender.split('@')[0]

    // تحقق من النخبة
    if (!(await isElite(senderLid))) {
      return await conn.sendMessage(chatId, { text: '🚫 هذا الأمر للنخبة فقط.' }, { quoted: m })
    }

    await conn.sendMessage(chatId, { text: '🔄 جاري إعادة تشغيل البوت...' }, { quoted: m })

    console.log(chalk.yellow.bold('[ System ]'), '🔄 Restart initiated')

    // إعادة التشغيل بنفس الملف الأساسي
    const child = spawn('node', ['index.js'], {
      cwd: process.cwd(),
      stdio: 'inherit'
    })

    child.on('spawn', () => {
      console.log(chalk.green.bold('[ System ]'), `🚀 Restarted with PID: ${child.pid}`)
      process.exit(0)
    })

  } catch (e) {
    console.error('❌ خطأ:', e)
    await conn.sendMessage(m.key.remoteJid, { text: '❌ حدث خطأ أثناء تنفيذ الأمر.' }, { quoted: m })
  }
}

handler.command = ['ريستارت', 'restart']
export default handler