import axios from 'axios'
import FormData from 'form-data'
import cheerio from 'cheerio'
import { exec } from 'child_process'
import fs from 'fs'
import util from 'util'
import path from 'path'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `*╻❗╹↜ ٭ \`يـجـب يـجـب كـتـابـة اسـم لـوضـعـه\` ٭ ↯*\n\n*❐↞┇مـثـال📌↞ .${usedPrefix + command} Sakura   ┇*`

  m.reply("˼⏱️˹ `جـاري صـنـاعـة الـوجـو....`")
  let model
  if (/نص_مشوه/.test(command)) model = 'https://en.ephoto360.com/create-digital-glitch-text-effects-online-767.html'
  if (/نص_على_زجاج/.test(command)) model = 'https://en.ephoto360.com/write-text-on-wet-glass-online-589.html'
  if (/توهج_متقدم/.test(command)) model = 'https://en.ephoto360.com/advanced-glow-effects-74.html'
  if (/نص_طباعي/.test(command)) model = 'https://en.ephoto360.com/create-typography-text-effect-on-pavement-online-774.html'
  if (/تكسير_بكسل/.test(command)) model = 'https://en.ephoto360.com/create-pixel-glitch-text-effect-online-769.html'
  if (/توهج_نيون/.test(command)) model = 'https://en.ephoto360.com/create-impressive-neon-glitch-text-effects-online-768.html'
  if (/علم_نيجيريا/.test(command)) model = 'https://en.ephoto360.com/nigeria-3d-flag-text-effect-online-free-753.html'
  if (/علم_أمريكا/.test(command)) model = 'https://en.ephoto360.com/free-online-american-flag-3d-text-effect-generator-725.html'
  if (/نص_ممحو/.test(command)) model = 'https://en.ephoto360.com/create-eraser-deleting-text-effect-online-717.html'
  if (/بلاك_بنك/.test(command)) model = 'https://en.ephoto360.com/online-blackpink-style-logo-maker-effect-711.html'
  if (/نص_متوهج/.test(command)) model = 'https://en.ephoto360.com/create-glowing-text-effects-online-706.html'
  if (/نص_تحت_الماء/.test(command)) model = 'https://en.ephoto360.com/3d-underwater-text-effect-online-682.html'
  if (/صانع_شعار/.test(command)) model = 'https://en.ephoto360.com/free-bear-logo-maker-online-673.html'
  if (/رسوم_كرتونية/.test(command)) model = 'https://en.ephoto360.com/create-a-cartoon-style-graffiti-text-effect-online-668.html'
  if (/ورق_مقطع/.test(command)) model = 'https://en.ephoto360.com/multicolor-3d-paper-cut-style-text-effect-658.html'
  if (/ألوان_مائية/.test(command)) model = 'https://en.ephoto360.com/create-a-watercolor-text-effect-online-655.html'
  if (/سحب/.test(command)) model = 'https://en.ephoto360.com/write-text-effect-clouds-in-the-sky-online-619.html'
  if (/شعار_بلاك_بنك/.test(command)) model = 'https://en.ephoto360.com/create-blackpink-logo-online-free-607.html'
  if (/تدرج_لوني/.test(command)) model = 'https://en.ephoto360.com/create-3d-gradient-text-effect-online-600.html'
  if (/شاطئ/.test(command)) model = 'https://en.ephoto360.com/write-in-sand-summer-beach-online-free-595.html'
  if (/ذهب/.test(command)) model = 'https://en.ephoto360.com/create-a-luxury-gold-text-effect-online-594.html'
  if (/نيون_ملون/.test(command)) model = 'https://en.ephoto360.com/create-multicolored-neon-light-signatures-591.html'
  if (/رمل/.test(command)) model = 'https://en.ephoto360.com/write-in-sand-summer-beach-online-576.html'
  if (/مجرة/.test(command)) model = 'https://en.ephoto360.com/create-galaxy-wallpaper-mobile-online-528.html'
  if (/نمط_1917/.test(command)) model = 'https://en.ephoto360.com/1917-style-text-effect-523.html'
  if (/نيون_مجرة/.test(command)) model = 'https://en.ephoto360.com/making-neon-light-text-effect-with-galaxy-style-521.html'
  if (/ملكي/.test(command)) model = 'https://en.ephoto360.com/royal-text-effect-online-free-471.html'
  if (/هولوغرام/.test(command)) model = 'https://en.ephoto360.com/free-create-a-3d-hologram-text-effect-441.html'
  if (/مجرة_شعار/.test(command)) model = 'https://en.ephoto360.com/create-galaxy-style-free-name-logo-438.html'
  if (/أمونج_أس/.test(command)) model = 'https://en.ephoto360.com/create-a-cover-image-for-the-game-among-us-online-762.html'
  if (/مطر/.test(command)) model = 'https://en.ephoto360.com/foggy-rainy-text-effect-75.html'
  if (/غرافيتي/.test(command)) model = 'https://en.ephoto360.com/graffiti-color-199.html'
  if (/ألوان_زاهية/.test(command)) model = 'https://en.ephoto360.com/create-colorful-neon-light-text-effects-online-797.html#google_vignette'
  if (/ميزان_موسيقي/.test(command)) model = 'https://en.ephoto360.com/music-equalizer-text-effect-259.html'
  if (/ناروتو/.test(command)) model = 'https://en.ephoto360.com/naruto-shippuden-logo-style-text-effect-online-808.html'
  if (/أجنحة/.test(command)) model = 'https://en.ephoto360.com/angel-wing-effect-329.html'
  if (/نجوم/.test(command)) model = 'https://en.ephoto360.com/stars-night-online-1-85.html'

  let data = await ephoto(model, text)
  await conn.sendMessage(m.chat, { image: { url: data } }, { quoted: m })
}

handler.help = [
  'نص_مشوه', 'نص_على_زجاج', 'توهج_متقدم', 'نص_طباعي', 'تكسير_بكسل', 
  'توهج_نيون', 'علم_نيجيريا', 'علم_أمريكا', 'نص_ممحو', 'بلاك_بنك', 
  'نص_متوهج', 'نص_تحت_الماء', 'صانع_شعار', 'رسوم_كرتونية', 'ورق_مقطع', 
  'ألوان_مائية', 'سحب', 'شعار_بلاك_بنك', 'تدرج_لوني', 'شاطئ', 
  'ذهب', 'نيون_ملون', 'رمل', 'مجرة', 'نمط_1917', 
  'نيون_مجرة', 'ملكي', 'هولوغرام', 'مجرة_شعار', 'أمونج_أس', 'مطر', 'غرافيتي', 'ألوان_زاهية', 'ميزان_موسيقي', 'أجنحة', 'نجوم'
].map(a => a + " ˼الـاسـم")

handler.tags = ["لـوجـو"]
handler.command = handler.help.map(h => h.split(' ')[0])

export default handler

export async function ephoto(url, textInput) {
  let formData = new FormData()

  let initialResponse = await axios.get(url, {
    headers: {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0 Win64 x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36'
    }
  })

  let $ = cheerio.load(initialResponse.data)
  let token = $('input[name=token]').val()
  let buildServer = $('input[name=build_server]').val()
  let buildServerId = $('input[name=build_server_id]').val()
  formData.append('text[]', textInput)
  formData.append('token', token)
  formData.append('build_server', buildServer)
  formData.append('build_server_id', buildServerId)

  let postResponse = await axios({
    url,
    method: 'POST',
    data: formData,
    headers: {
      'Accept': '*/*',
      'Accept-Language': 'en-US,enq=0.9',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0 Win64 x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
      'cookie': initialResponse.headers['set-cookie']?.join(' '),
      ...formData.getHeaders()
    }
  })

  let $$ = cheerio.load(postResponse.data)
  let formValueInput = JSON.parse($$('input[name=form_value_input]').val())
  formValueInput['text[]'] = formValueInput.text
  delete formValueInput.text

  let { data: finalResponseData } = await axios.post('https://en.ephoto360.com/effect/create-image', new URLSearchParams(formValueInput), {
    headers: {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0 Win64 x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36',
      'cookie': initialResponse.headers['set-cookie'].join(' ')
    }
  })

  return buildServer + finalResponseData.image
}