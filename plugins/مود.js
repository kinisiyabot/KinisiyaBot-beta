import fetch from 'node-fetch'

let handler = async (m, { conn, args }) => {
  if (!args.length) {
    return conn.reply(
      m.chat,
      '❌ اكتب اسم المود بعد الأمر\n\nمثال:\n.مود pubg',
      m
    )
  }

  let query = args.join(' ')
  let api = `https://apex-api-five.vercel.app/api/v1/search/mod?q=${encodeURIComponent(query)}`

  try {
    let res = await fetch(api)
    let json = await res.json()

    if (!json.status || !json.results || json.results.length === 0) {
      return conn.reply(m.chat, '⚠️ لا توجد نتائج لهذا البحث', m)
    }

    let teks = `╭─〔 🔎 نتائج البحث 〕─╮
│ 🔍 الكلمة: ${json.query}
│ 📊 عدد النتائج: ${json.count}
╰───────────────╯\n\n`

    json.results.forEach((v, i) => {
      teks += `╭─❖〔 ${i + 1} 〕❖─╮
│ 🧩 الاسم: ${v.title || 'غير متوفر'}
│ 🔗 الرابط:
│ ${v.url || 'غير متوفر'}
╰───────────────╯\n\n`
    })

    conn.reply(m.chat, teks.trim(), m)

  } catch (e) {
    console.log(e)
    conn.reply(m.chat, '❌ حصل خطأ أثناء البحث', m)
  }
}

handler.command = /^مود$/i
export default handler