// ترجمة واجهة القائمة (عربي / إنجليزي / إسباني)
// Button presses are re-emitted as text commands, so every interactive
// option must resolve to a registered command id.

export const LANGUAGES = {
  ar: '🇲🇦 العربية',
  en: '🇬🇧 English',
  es: '🇪🇸 Español'
}

export const DEFAULT_LANG = 'ar'

// عنوان كل قسم بكل لغة
export const CATEGORIES = {
  ar: {
    ai: 'الذكاء الاصطناعي & الدردشة',
    audio_ai: 'الذكاء الاصطناعي صوتيات',
    downloader: 'البحث وتنزيل',
    images: 'تنزيل صور و خليفات',
    fun: 'ترفيه & مرح',
    game: 'ألعاب & تسلية',
    group: 'المجموعات & الإدارة',
    info: 'معلومات & مساعدة',
    edit: 'قسم تحميل الايديت',
    maker: 'صانع & تصميم',
    maker_2: 'زخارف النص',
    news: 'أخبار & معلومات',
    devs: 'ادوات_للمطورين',
    owner: 'المالك & المطور',
    quran: 'القرآن الكريم & إسلاميات',
    quotes: 'اقتباسات & تحفيز',
    search: 'بحث & معلومات',
    sticker: 'ملصقات & صانع',
    tools: 'أدوات & خدمات',
    database: 'قاعدة بيانات & تخزين',
    rules: 'القوانين',
    xp: 'المستوى & النقاط'
  },
  en: {
    ai: 'AI & Chat',
    audio_ai: 'AI Audio',
    downloader: 'Search & Download',
    images: 'Images & Wallpapers',
    fun: 'Fun & Entertainment',
    game: 'Games',
    group: 'Groups & Management',
    info: 'Info & Help',
    edit: 'Edit Downloads',
    maker: 'Maker & Design',
    maker_2: 'Text Decorations',
    news: 'News & Info',
    devs: 'Developer Tools',
    owner: 'Owner & Developer',
    quran: 'Quran & Islamic',
    quotes: 'Quotes & Motivation',
    search: 'Search & Info',
    sticker: 'Stickers & Maker',
    tools: 'Tools & Services',
    database: 'Database & Storage',
    rules: 'Rules',
    xp: 'Level & Points'
  },
  es: {
    ai: 'IA y Chat',
    audio_ai: 'IA de Audio',
    downloader: 'Buscar y Descargar',
    images: 'Imágenes y Fondos',
    fun: 'Diversión',
    game: 'Juegos',
    group: 'Grupos y Gestión',
    info: 'Info y Ayuda',
    edit: 'Descargas de Edición',
    maker: 'Creador y Diseño',
    maker_2: 'Decoraciones de Texto',
    news: 'Noticias e Info',
    devs: 'Herramientas de Desarrollador',
    owner: 'Propietario y Desarrollador',
    quran: 'Corán e Islámico',
    quotes: 'Citas y Motivación',
    search: 'Buscar e Info',
    sticker: 'Stickers y Creador',
    tools: 'Herramientas y Servicios',
    database: 'Base de Datos y Almacenamiento',
    rules: 'Reglas',
    xp: 'Nivel y Puntos'
  }
}

const STRINGS = {
  ar: {
    chooseLang: '🌍 اختر لغة القائمة\n\nChoose the menu language\nElige el idioma del menú',
    langTitle: '🌍 اللغة / Language / Idioma',
    welcome: name => `*┊🌹┊⇇مـنـور يـا @${name} اتـمـنـي ان انـكـ/ي تـسـمـتـ؏ـ/ـي بي وقتك يـا مـز/ه🫦*`,
    yourInfo: '*↜مـعلـومـاتـك يـا مـز/ه🫦🔞↶*',
    mention: v => `*┊🫦 ⇇الـمـنـشـن↜❪@${v}❫*`,
    rank: v => `*🍭┊⇇الـرتـبـه↜❪${v}❫*`,
    level: v => `*🌸┊⇇الـمـسـتـوي↜❪${v}❫*`,
    devInfo: '*↜مـعـلـومـات مـطـوري😜🔞↶*',
    devNick: '*🍷┊⇇الـقـب↶*\n> *🍺༄𝐈𝐌 𝐘𝐄𝐑𝐈𝐓𝐂𝐇𝐈༆🍻*',
    notes: '*┊     ｢🌹┊التـنـبـيـهـات┊🌹｣     ┊*',
    note1: '*❪1❫↜ممنوع سب البوت*',
    note2: '*❪2❫↜للشكوه او للاقتراح↶*',
    note3: '*❪3❫↜ضغط علي الزر لي عرض الاوامر*',
    note4: '*❪4❫↜لا تنسي قبل اي امر↜❪.❫*',
    note5: '*❪5❫↜استخدم امر｢تسجيل/reg｣ لي تشغيل بعض الاوامر*',
    sections: '🗂️اقسام البوت',
    sectionsHint: 'اختار قسم الاوامر التي تحتاج',
    install: 'تنصيب البوت',
    buy: 'شراء البوت',
    channel: '📢 القناة الرسمية',
    contact: '👑 التواصل مع المطور',
    listTitle: '📂 قائمة أقسام البوت',
    buttonTitle: '『🩸┃القوائـ🗒️ـم┃🩸』',
    subtitle: 'بوت متعدد الوظائف',
    changed: '✅ تم تغيير لغة القائمة',
    errMenu: '⚠️ خطأ في تحميل القائمة'
  },
  en: {
    chooseLang: '🌍 Choose the menu language\n\nاختر لغة القائمة\nElige el idioma del menú',
    langTitle: '🌍 Language / Idioma / اللغة',
    welcome: name => `*┊🌹┊Welcome @${name}, enjoy your stay 💫*`,
    yourInfo: '*↜Your information ↶*',
    mention: v => `*┊🫦 ⇇Mention↜❪@${v}❫*`,
    rank: v => `*🍭┊⇇Rank↜❪${v}❫*`,
    level: v => `*🌸┊⇇Level↜❪${v}❫*`,
    devInfo: '*↜Developer information ↶*',
    devNick: '*🍷┊⇇Nickname↶*\n> *🍺༄𝐈𝐌 𝐘𝐄𝐑𝐈𝐓𝐂𝐇𝐈༆🍻*',
    notes: '*┊     ｢🌹┊Notes┊🌹｣     ┊*',
    note1: '*❪1❫↜Insulting the bot is forbidden*',
    note2: '*❪2❫↜For complaints or suggestions↶*',
    note3: '*❪3❫↜Tap the button to view commands*',
    note4: '*❪4❫↜Do not forget the prefix ↜❪.❫ before any command*',
    note5: '*❪5❫↜Use ｢تسجيل/reg｣ to unlock some commands*',
    sections: '🗂️Bot sections',
    sectionsHint: 'Choose the section you need',
    install: 'Install the bot',
    buy: 'Buy the bot',
    channel: '📢 Official channel',
    contact: '👑 Contact the developer',
    listTitle: '📂 Bot sections list',
    buttonTitle: '『🩸┃Sections┃🩸』',
    subtitle: 'Multi-purpose bot',
    changed: '✅ Menu language changed',
    errMenu: '⚠️ Failed to load the menu'
  },
  es: {
    chooseLang: '🌍 Elige el idioma del menú\n\nاختر لغة القائمة\nChoose the menu language',
    langTitle: '🌍 Idioma / Language / اللغة',
    welcome: name => `*┊🌹┊Bienvenido @${name}, disfruta tu estancia 💫*`,
    yourInfo: '*↜Tu información ↶*',
    mention: v => `*┊🫦 ⇇Mención↜❪@${v}❫*`,
    rank: v => `*🍭┊⇇Rango↜❪${v}❫*`,
    level: v => `*🌸┊⇇Nivel↜❪${v}❫*`,
    devInfo: '*↜Información del desarrollador ↶*',
    devNick: '*🍷┊⇇Apodo↶*\n> *🍺༄𝐈𝐌 𝐘𝐄𝐑𝐈𝐓𝐂𝐇𝐈༆🍻*',
    notes: '*┊     ｢🌹┊Avisos┊🌹｣     ┊*',
    note1: '*❪1❫↜Está prohibido insultar al bot*',
    note2: '*❪2❫↜Para quejas o sugerencias↶*',
    note3: '*❪3❫↜Toca el botón para ver los comandos*',
    note4: '*❪4❫↜No olvides el prefijo ↜❪.❫ antes de cada comando*',
    note5: '*❪5❫↜Usa ｢تسجيل/reg｣ para desbloquear algunos comandos*',
    sections: '🗂️Secciones del bot',
    sectionsHint: 'Elige la sección que necesitas',
    install: 'Instalar el bot',
    buy: 'Comprar el bot',
    channel: '📢 Canal oficial',
    contact: '👑 Contactar al desarrollador',
    listTitle: '📂 Lista de secciones',
    buttonTitle: '『🩸┃Secciones┃🩸』',
    subtitle: 'Bot multipropósito',
    changed: '✅ Idioma del menú cambiado',
    errMenu: '⚠️ Error al cargar el menú'
  }
}

export function normalizeLang(value) {
  const lang = String(value || '').trim().toLowerCase()
  if (lang.startsWith('ar') || lang === 'عربي' || lang === 'العربية') return 'ar'
  if (lang.startsWith('en') || lang === 'english') return 'en'
  if (lang.startsWith('es') || lang === 'español' || lang === 'espanol') return 'es'
  return null
}

// t('en', 'level', 3) -> localized string (functions are called with args)
export function t(lang, key, ...args) {
  const table = STRINGS[lang] || STRINGS[DEFAULT_LANG]
  const value = table[key] ?? STRINGS[DEFAULT_LANG][key]
  return typeof value === 'function' ? value(...args) : (value ?? key)
}

export function categoryTitle(lang, id) {
  const table = CATEGORIES[lang] || CATEGORIES[DEFAULT_LANG]
  return table[id] || CATEGORIES[DEFAULT_LANG][id] || id
}

export function categoryIds() {
  return Object.keys(CATEGORIES[DEFAULT_LANG])
}
