// ✧･ﾟ: *✧･ﾟ:* Comando Exclusivo SubBots Hanako-Kun Mejorado *:･ﾟ✧*:･ﾟ✧
// Codigo hecho por SoyMaycol del Bot MaycolAIUltraMD ♣
// GitHub: SoySapo6 - NO EDITAR ESTE FRAGMENTO NO QUITAR CREDITOS

import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, args, command, usedPrefix, text }) => {

  if (global.conn.user.jid == conn.user.jid) {
    await conn.reply(m.chat, `╭─❍「 ✦ ${global.apodo} ✦ 」\n│\n├─ الامر *.${command}* هو فقط\n├─ متاح لـ Sub-Bots...\n│\n├─ تحقق من الاوامر المتاحة مع:\n│   ⇝ *.اوامر*\n╰─✦`, m)
    return
  }

  const numero = conn.user.jid.split('@')[0]
  const rutaDir = `./MayBots/${numero}`
  const rutaConfig = path.join(rutaDir, 'settings.js')
  const plantilla = './settings.js' // Archivo base que copias al crear uno nuevo

  if (!fs.existsSync(rutaDir)) fs.mkdirSync(rutaDir, { recursive: true })
  if (!fs.existsSync(rutaConfig)) fs.copyFileSync(plantilla, rutaConfig)

  // Función para editar el settings específico del Sub-Bot
  function editarSettings(buscar, reemplazar) {
    let contenido = fs.readFileSync(rutaConfig, 'utf8')
    contenido = contenido.replace(buscar, reemplazar)
    fs.writeFileSync(rutaConfig, contenido)
  }

  // Comandos mágicos:
  switch (command) {

    case 'بوت_اسم': {
      if (!text) return conn.reply(m.chat, `🌙 يجب عليك أن تقول الاسم الجديد\nمثال: *${usedPrefix + command} 𝑪𝑹𝑶𝑪𝑶*`, m)

      editarSettings(/global\.namebotttt\s*=\s*['"].*?['"]/, `global.namebotttt = '${text}'`)
      editarSettings(/global\.namebot\s*=\s*['"].*?['"]/, `global.namebot = '${text}'`)
      editarSettings(/global\.packname\s*=\s*['"].*?['"]/, `global.packname = '${text}'`)
      editarSettings(/global\.botname\s*=\s*['"].*?['"]/, `global.botname = '${text}'`)
      editarSettings(/global\.wm\s*=\s*['"].*?['"]/, `global.wm = '${text}'`)
      editarSettings(/global\.etiqueta\s*=\s*['"].*?['"]/, `global.etiqueta = '${text}'`)

      global.namebotttt = text
      global.namebot = text
      global.packname = text
      global.botname = text
      global.wm = text
      global.etiqueta = text

      conn.reply(m.chat, `✨ لقد تم تغيير الاسم السحري إلى: *${text}*\n¡يؤثر فقط على Sub-Bot!`, m)
    }
      break

    case 'سبانر': {
      if (!args[0] || !args[1] || !args[2]) {
        return conn.reply(m.chat, `🖼️ يجب عليك إرسال الروابط الثلاثة:\n*${usedPrefix + command} [بانر] [بانر2] [افاتار]*`, m)
      }

      editarSettings(/global\.banner\s*=\s*['"].*?['"]/, `global.banner = '${args[0]}'`)
      editarSettings(/global\.banner2\s*=\s*['"].*?['"]/, `global.banner2 = '${args[1]}'`)
      editarSettings(/global\.avatar\s*=\s*['"].*?['"]/, `global.avatar = '${args[2]}'`)

      global.banner = args[0]
      global.banner2 = args[1]
      global.avatar = args[2]

      conn.reply(m.chat, `🖼️ تم تحديث اللافتات والصورة الرمزية لهذا الروبوت الفرعي.`, m)
    }
      break

    case 'مجموعه_فيديو': {
      if (!text) return conn.reply(m.chat, `📹 يجب عليك تمرير رابط الفيديو\nمثال: *${usedPrefix + command} https://files.catbox.moe/xxxxx.mp4*`, m)

      editarSettings(/global\.video\s*=\s*['"].*?['"]/, `global.video = '${text}'`)
      editarSettings(/global\.video2\s*=\s*.*?/s, `global.video2 = ['${text}']`)

      global.video = text
      global.video2 = [text]

      conn.reply(m.chat, `🎬 تم إعداد الفيديو لهذا Sub-Bot.`, m)
    }
      break
  }
}

handler.tags = ['serbot']
handler.command = ['بوت_اسم', 'سبانر', 'مجموعه_فيديو']
handler.help = ['بوت_اسم <nombre>', 'سبانر <بانر> <بانر2> <افاتار>', 'مجموعه_فيديو <url>']
handler.mantenimiento = true

export default handler
