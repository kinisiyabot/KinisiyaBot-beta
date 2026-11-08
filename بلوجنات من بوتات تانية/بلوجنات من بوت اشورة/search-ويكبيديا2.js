import axios from "axios"
import fetch from "node-fetch"
import cheerio from "cheerio"

async function wikipedia(الاستعلام) {
    try {
        const الرابط = await axios.get(`https://ar.wikipedia.org/wiki/${الاستعلام}`)
        const $ = cheerio.load(الرابط.data)
        let العنوان = $('#firstHeading').text().trim()
        let الصورة = $('#mw-content-text').find('div.mw-parser-output > div:nth-child(1) > table > tbody > tr:nth-child(2) > td > a > img').attr('src') || `//i.ibb.co/nzqPBpC/http-error-404-not-found.png`
        let المحتوى = []
        $('#mw-content-text > div.mw-parser-output').each(function (rayy, Ra) {
            let الشرح = $(Ra).find('p').text().trim()
            المحتوى.push(الشرح)
        })
        for (let i of المحتوى) {
            const البيانات = {
                الحالة: الرابط.status,
                النتيجة: {
                    العنوان: العنوان,
                    الصورة: 'https:' + الصورة,
                    المحتوى: i
                }
            }
            return البيانات
        }
    } catch (الخطأ) {
        var غيرموجود = {
            الحالة: الرابط.status,
            رسالة: الخطأ
        }
        return غيرموجود
    }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `*[❗️𝐈𝐍𝐅𝐎❗️] أنه استخدام الأمر بشكل خاطئ!!*\n*الاستخدام صحيح:*\n*${usedPrefix + command} ابحث الكلمة الرئيسية*\n\n*مثال:*\n*${usedPrefix + command} النجوم*`
    wikipedia(`${text}`).then(res => {
        m.reply(`*𝙰𝚀𝚄𝙸 𝚃𝙸𝙴𝙽𝙴𝚂 𝙻𝙰 𝙸𝙽𝙵𝙾𝚁𝙼𝙰𝙲𝙸𝙾𝙽 𝙴𝙽𝙲𝙾𝙽𝚃𝚁𝙰𝙳𝙰:*\n\n` + res.النتيجة.المحتوى)
    }).catch(() => {
        m.reply('*[❗️𝐈𝐍𝐅𝐎❗️] 𝙽𝙾 𝚂𝙴 𝙴𝙽𝙲𝙾𝙽𝚃𝚁𝙾 𝙽𝙸𝙽𝙶𝚄𝙽𝙰 𝙸𝙽𝙵𝙾𝚁𝙼𝙰𝙲𝙸𝙾𝙽, 𝙿𝚁𝚄𝙴𝙱𝙰 𝚀𝚄𝙴 𝙷𝙰𝚈𝙰𝚂 𝙴𝚂𝙲𝚁𝙸𝚃𝙾 𝚄𝙽𝙰 𝚂𝙾𝙻𝙰 𝙿𝙰𝙻𝙰𝙱𝚁𝙰 𝚈 𝙻𝙾 𝙷𝙰𝚈𝙰𝚂 𝙴𝚂𝙲𝚁𝙸𝚃𝙾 𝙲𝙾𝚁𝚁𝙴𝙲𝚃𝙰𝙼𝙴𝙽𝚃𝙴*')
    })
}

handler.help = ['ويكيبيديا'].map(v => v + ' <الاستعلام>')
handler.tags = ['انترنت']
handler.command = /^(wiki1|ويكبيديا|wikipedia1)$/i

export default handler