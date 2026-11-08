/* #===========================#
  #       𝐊𝐈𝐍𝐈𝐒𝐈𝐘𝐀 𝐁𝐎𝐓          #
 #============================# */
 
import fs, { watchFile, unwatchFile } from "fs"
import chalk from "chalk"
import { fileURLToPath } from "url"

// Configuración de propietarios y permisos
global.owner = [
  ["212693863911", "🩸OWNER 🩸", true],
  ["172048387182781", "🩸OWNER 🩸", true],
  ["212693863911"],
  ["212675036009"]
]
global.suittag = [] 
global.prems = []

// Configuración de sesión y conexión
global.sessions = 'session'
global.nameqr = 'kinisiya-MD'
global.jadi = 'session'
global.freddyJadibts = true
global.yukiJadibts = true

// Datos principales del bot
global.botname = '🩸𝐊𝐈𝐍𝐈𝐒𝐈𝐘𝐀-𝐌𝐃🌑'
global.namebot = 'kinisiya-MD'
global.namebotttt = 'kinisiya-MD'
global.textbot = '𝐊𝐈𝐍𝐈𝐒𝐈𝐘𝐀-𝐌𝐃🩸'
global.dev = '🍺༄𝐈𝐌 𝐘𝐄𝐑𝐈𝐓𝐂𝐇𝐈༆🍻'
global.author = '🍺༄𝐈𝐌 𝐘𝐄𝐑𝐈𝐓𝐂𝐇𝐈༆🍻'
global.personaje = '🍺༄𝐈𝐌 𝐘𝐄𝐑𝐈𝐓𝐂𝐇𝐈༆🍻'
global.etiqueta = '𝐊𝐈𝐍𝐈𝐒𝐈𝐘𝐀'
global.apodo = '𝐊𝐈𝐍𝐈𝐒𝐈𝐘𝐀'
global.currency = "𝐊𝐈𝐍𝐈𝐒𝐈𝐘𝐀 𝐁𝐎𝐓"
global.packname = '🌑𝐊𝐈𝐍𝐈𝐒𝐈𝐘𝐀-𝕄𝔻🩸'
global.wm = '𝐊𝐈𝐍𝐈𝐒𝐈𝐘𝐀-𝙼𝙳 🌑'

// Archivos multimedia del bot
global.banner = fs.readFileSync('./lib/icon.jpg')
global.icono = fs.readFileSync('./lib/icon.jpg')
global.catalogo = fs.readFileSync('./lib/icon.jpg')

// Nombres de canales y grupos
global.namechannel = '𝐊𝐈𝐍𝐈𝐒𝐈𝐘𝐀 • تحديثات'
global.namechannel2 = '𝐊𝐈𝐍𝐈𝐒𝐈𝐘𝐀 • تحديثات'
global.namegrupo = '𝐊𝐈𝐍𝐈𝐒𝐈𝐘𝐀 • تحديثات'
global.namecomu = '𝐊𝐈𝐍𝐈𝐒𝐈𝐘𝐀 • تحديثات'

// Enlaces de contacto y redes sociales
global.group = "https://chat.whatsapp.com/EZWYkFDi5mO19xTQxPglVT?s=cl&p=a&ilr=1"
global.community = "https://chat.whatsapp.com/EZWYkFDi5mO19xTQxPglVT?s=cl&p=a&ilr=1"
global.channel = "https://whatsapp.com/channel/0029Vb80wch30LKFioKenc2V"
global.gmail = "fahd.mohmd.1333.9@gmail.com"
global.repo = 'yertchi/kinisiya-MD'
global.github = 'kinisiya-MD'
global.pais = '⊹˚• المغرب •˚⊹'

// Información de la librería y versión
global.libreria = 'MayBailyes'
global.baileys = 'V 6.7.16'
global.vs = '2.2.0'

// Canales de difusión
global.ch = {
  ch1: '120363406309079902@newsletter',
  ch2: '120363406309079902@newsletter',
  ch3: '120363406309079902@newsletter',
  ch4: '120363406309079902@newsletter',
  ch5: '120363406309079902@newsletter',
  ch6: '120363406309079902@newsletter',
  ch7: '120363406309079902@newsletter',
  ch8: '120363406309079902@newsletter',
  ch9: '120363406309079902@newsletter',
  ch10: '120363406309079902@newsletter',
  ch11: '120363406309079902@newsletter',
  ch12: '120363406309079902@newsletter',
  ch13: '120363406309079902@newsletter',
  ch14: '120363406309079902@newsletter',
  ch15: '120363406309079902@newsletter',
  ch16: '120363406309079902@newsletter',
  ch17: '120363406309079902@newsletter',
  ch18: '120363406309079902@newsletter',
  ch19: '120363406309079902@newsletter',
  ch20: '120363406309079902@newsletter',
  ch21: '120363406309079902@newsletter',
  ch22: '120363406309079902@newsletter'
}

// Mensajes y emojis predefinidos
global.listo = 'خد يعم ولا تزعل (°>♥️) '
global.rwait = '🕒'
global.done = '🇯🇵'
global.error = '🈲'
global.msm = '⚠︎'
global.emoji = '🇯🇵'
global.emoji2 = '💕'
global.emoji3 = '😍'
global.emoji4 = '🥴'
global.emoji5 = '👻'
global.wait = '⏳ تسنا شوي 🐦...'
global.waitt = '⏳ تسنا شويا 🐦...'
global.waittt = '⏳ تسنا شوي 🐦...'
global.waitttt = '⏳ تسنا شوي 🐦...'
global.yahecho = 'تم تنفيذ مند قرن (•~°)'

// Sistema de recarga automática
let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("Update 'system'"))
  import(`${file}?update=${Date.now()}`)
})
