import translate from '@vitalets/google-translate-api'
const defaultLang = 'ar'
const tld = 'cn'

let handler = async (m, { args, usedPrefix, command }) => {
    let err = `
╮ ── ⋆⋆ ── ⋆⋆ ── ⋆⋆ ── ⋆⋆ ── ⋆⋆ ── ⋆⋆ ╭ـ
˼🤖˹┆ الـاسـم┆⌟𝐋𝐀𝐂𝐊⌜
˼🤖˹┆ مثال┆⌟ .ترجم hello pro⌜
╯ ── ⋆⋆ ── ⋆⋆ ── ⋆⋆ ── ⋆⋆ ── ⋆⋆ ── ⋆⋆ ╰ـ
> ˼👻˹ مــلـاحـــظـــة ⇅ ↶
╮ ── ⋆⋆ ── ⋆⋆ ── ⋆⋆ ── ⋆⋆ ── ⋆⋆ ── ⋆⋆ ╭ـ
> تابع قناة البوت يا برو 👽👇🏻
https://whatsapp.com/channel/0029VaoUBmSKmCPIIiEatx1H
╯ ── ⋆⋆ ── ⋆⋆ ── ⋆⋆ ── ⋆⋆ ── ⋆⋆ ── ⋆⋆ ╰ـ
> 𝐋𝐀𝐂𝐊﹝⚡﹞𝐁𝐎𝐓 © 𝐁𝐘 ILOMY`.trim()

    let lang = args[0]
    let text = args.slice(1).join(' ')
    if ((args[0] || '').length !== 2) {
        lang = defaultLang
        text = args.join(' ')
    }
    if (!text && m.quoted && m.quoted.text) text = m.quoted.text

    try {
       let result = await translate(text, { to: lang, autoCorrect: true }).catch(_ => null) 
       m.reply(result.text)
    } catch (e) {
        throw err
    } 

}
handler.help = ['trad <leng> <text>']
handler.tags = ['tools']
handler.command = ['tl', 'ترجم']

export default handler
