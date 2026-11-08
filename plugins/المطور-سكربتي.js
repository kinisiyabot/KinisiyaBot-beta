import fsp from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')
const TEMP = path.join(ROOT, 'temp')

const ALWAYS_EXCLUDE = new Set(['node_modules', '.git', '.vscode', 'temp', '.npm'])
const EXCLUDE_FILES = new Set(['database.json', 'package-lock.json'])
const SESSION_DIRS = new Set(['sessions', 'sessions-qr', 'botSession'])

function stamp() {
  const d = new Date()
  const p = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`
}

async function copyTree(src, dst, includeSessions) {
  await fsp.mkdir(dst, { recursive: true })
  const entries = await fsp.readdir(src, { withFileTypes: true })
  for (const e of entries) {
    const name = e.name
    if (ALWAYS_EXCLUDE.has(name)) continue
    if (!includeSessions && SESSION_DIRS.has(name)) continue
    const sp = path.join(src, name)
    const dp = path.join(dst, name)
    if (e.isDirectory()) {
      await copyTree(sp, dp, includeSessions)
    } else if (e.isFile()) {
      if (EXCLUDE_FILES.has(name)) continue
      await fsp.mkdir(path.dirname(dp), { recursive: true })
      try { await fsp.copyFile(sp, dp) } catch {}
    }
  }
}

async function zipFolderWin(sourceDir, zipPath) {
  const destPS = zipPath.replace(/'/g, "''")
  const script = `$ErrorActionPreference='Stop'; $dest='${destPS}'; if (Test-Path -LiteralPath $dest) { Remove-Item -LiteralPath $dest -Force }; $items = Get-ChildItem -Force | Select-Object -ExpandProperty FullName; Compress-Archive -Path $items -DestinationPath $dest -Force`
  const cmd = `powershell -NoProfile -Command "${script.replace(/"/g, '`"')}"`
  execSync(cmd, { cwd: sourceDir, stdio: 'inherit' })
}

async function zipFolderUnix(sourceDir, zipPath) {
  try {
    execSync('zip -v', { stdio: 'ignore' })
    execSync(`zip -r "${zipPath}" .`, { cwd: sourceDir, stdio: 'inherit' })
    return zipPath
  } catch {
    const gzPath = zipPath.replace(/\.zip$/i, '.tar.gz')
    execSync(`tar -czf "${gzPath}" .`, { cwd: sourceDir, stdio: 'inherit' })
    return gzPath
  }
}

function parseArgs(args) {
  const opts = { includeSessions: false, name: '' }
  for (const a of args || []) {
    const s = String(a)
    if (/^--with-?sessions$/i.test(s)) opts.includeSessions = true
    const m = s.match(/^--name=(.+)$/i)
    if (m) opts.name = m[1]
  }
  return opts
}

let handler = async (m, { conn, args }) => {
  const opts = parseArgs(args)
  const includeSessions = !!opts.includeSessions
  const sanitize = (s = '') => String(s).replace(/\s+/g, '-').replace(/[^a-z0-9._-]/ig, '')
  const baseName = opts.name ? sanitize(opts.name) : sanitize(global.namebot || '𝐊𝐈𝐍𝐈𝐒𝐈𝐘𝐀 𝐁𝐎𝐓 Beta V1')
  const base = opts.name ? baseName : `${baseName}-${stamp()}`
  const exportDir = path.join(TEMP, base)
  const zipPath = path.join(TEMP, `${base}.zip`)
  
  // تحديث الرسالة بدلاً من إرسال رسائل جديدة
  let statusMessage = null
  
  // وظيفة لتحديث الرسالة الحالية أو إرسال جديدة
  const updateStatus = async (text) => {
    try {
      if (!statusMessage) {
        statusMessage = await conn.reply(m.chat, text, m)
      } else {
        await conn.sendMessage(m.chat, {
          text: text,
          edit: statusMessage.key
        })
      }
    } catch (e) {
      console.error('خطأ في تحديث الرسالة:', e)
    }
  }

  await conn.sendMessage(m.chat, { react: { text: '📦', key: m.key } })
  await fsp.mkdir(TEMP, { recursive: true }).catch(() => {})

  try {
    await updateStatus(`*📊 إنشاء نسخة احتياطية*\n\n📁 جاري نسخ الملفات...\n\n┏━━━━━━━━━━━━━━━━\n┃ ✅ جاري النسخ\n┗━━━━━━━━━━━━━━━━`)

    await copyTree(ROOT, exportDir, includeSessions)
    
    await updateStatus(`*📊 إنشاء نسخة احتياطية*\n\n📁 تم نسخ الملفات بنجاح\n🗜️ جاري ضغط الملفات...\n\n┏━━━━━━━━━━━━━━━━\n┃ ✅ تم النسخ\n┃ ✅ جاري الضغط\n┗━━━━━━━━━━━━━━━━`)

    let artifact = zipPath
    if (process.platform === 'win32') {
      await zipFolderWin(exportDir, zipPath)
    } else {
      artifact = await zipFolderUnix(exportDir, zipPath)
    }

    const stat = await fsp.stat(artifact)
    const maxSend = 95 * 1024 * 1024
    
    await updateStatus(`*📊 إنشاء نسخة احتياطية*\n\n📁 تم نسخ الملفات بنجاح\n🗜️ تم ضغط الملفات بنجاح\n📤 جاري الإرسال...\n\n┏━━━━━━━━━━━━━━━━\n┃ ✅ تم النسخ\n┃ ✅ تم الضغط\n┃ ✅ جاري الإرسال\n┗━━━━━━━━━━━━━━━━\n\n📦 الحجم: ${(stat.size / 1024 / 1024).toFixed(1)} ميغابايت`)

    if (stat.size > maxSend) {
      await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } })
      await updateStatus(`*❌ خطأ في النسخة الاحتياطية*\n\n📦 الحجم كبير جداً: ${(stat.size / 1024 / 1024).toFixed(1)} ميغابايت\n\n*الحد الأقصى:* 95 ميغابايت\n\n💡 الرجاء رفع الملف يدوياً:\n\`${artifact}\``)
      return
    }

    const buffer = await fsp.readFile(artifact)
    const fileName = path.basename(artifact)
    const mt = artifact.endsWith('.zip')
      ? 'application/zip'
      : (artifact.endsWith('.tar.gz') ? 'application/gzip' : 'application/octet-stream')
    
    await conn.sendMessage(
      m.chat,
      { document: buffer, mimetype: mt, fileName },
      { quoted: m }
    )

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    
    await updateStatus(`*✅ تم إنشاء النسخة الاحتياطية بنجاح*\n\n📦 اسم الملف: ${fileName}\n📊 الحجم: ${(stat.size / 1024 / 1024).toFixed(1)} ميغابايت\n\n┏━━━━━━━━━━━━━━━━\n┃ ✅ تم النسخ\n┃ ✅ تم الضغط\n┃ ✅ تم الإرسال\n┗━━━━━━━━━━━━━━━━\n\n*تم إرسال الملف في الرسالة السابقة*`)

  } catch (e) {
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    await updateStatus(`*❌ فشل إنشاء النسخة الاحتياطية*\n\nخطأ: ${e.message || 'خطأ غير معروف'}\n\n┏━━━━━━━━━━━━━━━━\n┃ ❌ فشل العملية\n┗━━━━━━━━━━━━━━━━`)
  } finally {
    try { await fsp.rm(exportDir, { recursive: true, force: true }) } catch {}
    try { await fsp.rm(artifact, { force: true }) } catch {}
  }
}

handler.help = ['backupbot']
handler.tags = ['owner']
handler.command = ['backup', 'backupbot', 'export', 'respaldo', 'سيك', 'احتياطي', 'اسكربتي', 'سكربتي']
handler.rowner = true

export default handler