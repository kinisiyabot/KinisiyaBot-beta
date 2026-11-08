import util from 'util'
import path from 'path'
let user = a => '@' + a.split('@')[0]

// متغير لتخزين آخر إجابة
let lastAnswer = null

function handler(m, { groupMetadata, command, conn, text, usedPrefix }) {
  if (!text) throw `*〄┇أدخــل الـسـؤال┇〄*`
  let ps = groupMetadata.participants.map(v => v.id)
  let a = ps.getRandom()

  let answers = [
    'احــتـمـال قـلـيـل',
    'نــعم بـالـتـأكـيد',
    'لا أعـتـقـد',
    'مــستـحـيــل',
    'جــداً أكـيــد',
    'مـــمكــن',
    'نـسـبـة ضـعـيفـة',
    'عـنـدك حــظ',
    'كـان مــمكــن',
    'خـيــالك واســع',
    'نــص نص',
    'الـفـرصـة مــوحـودة',
    'شـكـلـه صــعـب',
    'نـسـبـة ضـئـيـلة',
    'خـارج الحـسابـات',
    'تـمـامــاً لا',
    'نـعــم جــداً',
    'لا أصـلاً',
    'مــحــتـمــل',
    'عـلـى الأغـلـب',
    'خـيــرك فـي غـيــرك',
    'بـكــل أسـف لا',
    'ربـمــا قـريــبـاً',
    'الأفـضـل انـك تـسـأل غـيـري',
    'يـس بـس مش دلووقتي',
    'قــول يـارب',
    'انـسى',
    'خـلـيــها على الله',
    'عـنـديـك أمل',
    'نـظـريـة مش مـؤكــدة',
    'مــع الـوقــت'
  ]

  let x = pickRandomNoRepeat(answers)
  lastAnswer = x

  let top = `*الـسـؤال هــل : ${text}*

*الــأجــابـه : ${x}*`.trim()
  conn.sendFile(m.reply(top, null, { mentions: [a] }))
}

handler.help = handler.command = ['هل']
handler.tags = ['fun']
handler.group = true
handler.limit = 0

export default handler

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)]
}

function pickRandomNoRepeat(list) {
  let randomAnswer
  do {
    randomAnswer = pickRandom(list)
  } while (randomAnswer === lastAnswer)
  return randomAnswer
}