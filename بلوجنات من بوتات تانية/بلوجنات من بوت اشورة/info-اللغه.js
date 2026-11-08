/*************************************************/
/*
/* حقوق التأليف والنشر لمبدع هذا الوحدة.
/* جيفرسون: https://github.com/jeffersonalionco
/* 
/*************************************************/
const handler = async (m, { args, usedPrefix, command, isAdmin }) => {
    try {
        const data = global
        const idioma = data.db.data.users[m.sender].language
        const _translate = JSON.parse(fs.readFileSync(`./language/${idioma}.json`))
        const tradutor = _translate.plugins._language

        data.db.data.users[m.sender].language
        let sigla // Args user

        //---- تحويل "السلسلة" إلى أحرف صغيرة
        if (args[0] != undefined) {
            sigla = args[0].toLowerCase()
        }

        if (command === 'اللغة') {
            // ----- خيارات اللغة
            if (sigla === 'pt-br' || sigla === 'pt' || sigla === 'br') {
                global.db.data.users[m.sender].language = 'pt-br'
                m.reply(`*[ ✅ ] ذا ميستيك - بوت*\n\n*—◉* *_اللغة مضبوطة على البرتغالية 🇧🇷_*`)

            } else if (sigla === 'es') {
                global.db.data.users[m.sender].language = 'es'
                m.reply(`*[ ✅ ] ذا ميستيك - بوت*\n\n*—◉* *_اللغة مضبوطة على الإسبانية 🇪🇸_*`)

            } else if (sigla === 'en') {
                global.db.data.users[m.sender].language = 'en'
                m.reply(`*[ ✅ ] ذا ميستيك - بوت*\n\n*—◉* *_اللغة مضبوطة على الإنجليزية 🇬🇧_*`)

            } else if (sigla === 'ru') {
                global.db.data.users[m.sender].language = 'ru'
                m.reply(`*[ ✅ ] ذا ميستيك - بوت*\n\n*—◉* *_اللغة مضبوطة على الروسية 🇷🇺_*`)

            }else if (sigla === 'fr') {
                global.db.data.users[m.sender].language = 'fr'
                m.reply(`*[ ✅ ] ذا ميستيك - بوت*\n\n*—◉* *_اللغة مضبوطة على الفرنسية 🇫🇷_*`)

            }else if (sigla === 'ar') {
                global.db.data.users[m.sender].language = 'ar'
                m.reply("[ ✅ ] ذا ميستيك - بوت\n\n*—◉* اللغة مضبوطة على العربية 🇸🇦")

            }else {

                m.reply(`
${tradutor.texto1[2]}
${tradutor.texto1[3]} *( ${data.db.data.users[m.sender].language} )*
${tradutor.texto1[0]}
*${usedPrefix}اللغة* es

${tradutor.texto1[1]}

`)
            }

        }

        // - تحديد الترجمات للمجموعات في بوت ذا ميستيك 

        if (command === 'لغةالجروب') {

            // ----- الشروط للمجموعات
            if (m.isGroup === false) {
                return m.reply(tradutor.texto3)
            }
            if (m.isGroup === true && isAdmin === false) {
                return m.reply(tradutor.texto4)
            }

            // ----- خيارات اللغة
            if (sigla === 'pt-br' || sigla === 'pt' || sigla === 'br') {
                global.db.data.chats[m.chat].language = 'pt-br';

                m.reply(`*[ ✅ ] إعدادات المجموعة*\n\n*—◉* *_اللغة مضبوطة على البرتغالية 🇧🇷_*`)
            } else if (sigla === 'es') {
                global.db.data.chats[m.chat].language = 'es';

                m.reply(`*[ ✅ ] إعدادات المجموعة*\n\n*—◉* *_اللغة مضبوطة على الإسبانية 🇪🇸_*`)
            } else if (sigla === 'en') {
                global.db.data.chats[m.chat].language = 'en';

                m.reply(`*[ ✅ ] إعدادات المجموعة*\n\n*—◉* *_اللغة مضبوطة على الإنجليزية 🇬🇧_*`)
            } else if (sigla === 'ru') {
                global.db.data.chats[m.chat].language = 'ru';

                m.reply(`*[ ✅ ] ذا ميستيك - بوت*\n\n*—◉* *_اللغة مضبوطة على الروسية 🇷🇺_*`)
            }else if (sigla === 'fr') {
                global.db.data.chats[m.chat].language = 'fr';

                m.reply(`*[ ✅ ] إعدادات المجموعة*\n\n*—◉* *_اللغة مضبوطة على الفرنسية 🇫🇷_*`)
            } else if (sigla === 'ar') {
                global.db.data.chats[m.chat].language = 'ar';

                m.reply("[ ✅ ] إعدادات المجموعة\n\n*—◉* اللغة مضبوطة على العربية 🇸🇦")
            } else  {
                m.reply(`
${tradutor.texto2[0]}
*${usedPrefix}لغةالجروب* es

${tradutor.texto2[1]}

`)
            }

        }
        // النهاية 
    } catch (error) {
        global.db.data.users[m.sender].language = 'ar'
        global.db.data.chats[m.chat].language = 'ar'
        m.reply(`*[ERROR]* -  _تم ضبط اللغة بشكل افتراضي على العربية._
                \`\`\`تواصل مع مطوري البوت\`\`\` `)
    }
}

handler.command = /^(اللغة|لغةالجروب)$/i;

export default handler