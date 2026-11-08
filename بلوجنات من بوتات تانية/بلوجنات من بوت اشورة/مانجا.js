// Update By Xnuvers007

import fetch from 'node-fetch'

var handler = async (m, { conn, text }) => {
if (!text) throw `*أدخل عنوان المانغا الذي تريد البحث عنه/المانهوا!*`
conn.reply(m.chat, 'جارِ البحث عن المانغا/المانهوا... يرجى الانتظار', m)
let res = await fetch('https://api.jikan.moe/v4/manga?q=' + text)
if (!res.ok) throw 'لم يتم العثور على مانغا/المانهوا'
let json = await res.json()
let { chapters, url, type, score, scored, scored_by, rank, popularity, members, background, status, volumes, synopsis, favorites } = json.data[0]
// let author = json.data[0].authors[0].name
// let authormynimelist = json.data[0].authors[0].url
let judul = json.data[0].titles.map(jud => `${jud.title} [${jud.type}]`).join('\n');
let xnuvers007 = json.data[0].authors.map(Xnuvers007 => `${Xnuvers007.name} (${Xnuvers007.url})`).join('\n');
let genrenya = json.data[0].genres.map(xnvrs007 => `${xnvrs007.name}`).join('\n');

let animeingfo = `📚 *العنوان:* ${judul}
📑 *الفصول:* ${chapters}
✉️ *نوع النقل:* ${type}
🗂 *الحالة:* ${status}
😎 *النوع:* ${genrenya}
🗃 *المجلدات:* ${volumes}
🌟 *المفضلة:* ${favorites}
🧮 *التقييم:* ${score}
🧮 *التقييم الكلي:* ${scored}
🧮 *تقييمه من قبل:* ${scored_by}
🌟 *التصنيف:* ${rank}
🤩 *شعبية:* ${popularity}
👥 *الأعضاء:* ${members}
⛓️ *الرابط:* ${url}
👨‍🔬 *المؤلفون:* ${xnuvers007}
📝 *الخلفية:* ${background}
💬 *الملخص:* ${synopsis}
`
conn.sendFile(m.chat, json.data[0].images.jpg.image_url, 'manga.jpg', `*معلومات المانغا/المانهوا*\n` + animeingfo, m)
    conn.reply(m.chat, 'اتمنى لكم الاستمتاع', m)
}
handler.help = ['mangainfo <manga>', 'manga <namaManga>', 'infomanga <NamaManga/Anime>']
handler.tags = ['مانجا']
handler.command = /^(manga|مانغا|مانجا|مانهوا|مانها)$/i

export default handler;