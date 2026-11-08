// colors.js ملف مهم ممنوع العبة بيه

export const colors = {
  // إعادة الضبط
  reset: '\x1b[0m',
  
  // أنماط النص
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  rapidBlink: '\x1b[6m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  strikethrough: '\x1b[9m',
  
  // ألوان النص الأساسية
  fg: {
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    
    // ألوان ساطعة
    brightBlack: '\x1b[90m',
    brightRed: '\x1b[91m',
    brightGreen: '\x1b[92m',
    brightYellow: '\x1b[93m',
    brightBlue: '\x1b[94m',
    brightMagenta: '\x1b[95m',
    brightCyan: '\x1b[96m',
    brightWhite: '\x1b[97m',
    
    // أسماء مختصرة
    gray: '\x1b[90m',
    grey: '\x1b[90m',
    error: '\x1b[91m',
    success: '\x1b[92m',
    warning: '\x1b[93m',
    info: '\x1b[94m',
    debug: '\x1b[95m',
  },
  
  // ألوان الخلفية
  bg: {
    black: '\x1b[40m',
    red: '\x1b[41m',
    green: '\x1b[42m',
    yellow: '\x1b[43m',
    blue: '\x1b[44m',
    magenta: '\x1b[45m',
    cyan: '\x1b[46m',
    white: '\x1b[47m',
    
    // خلفيات ساطعة
    brightBlack: '\x1b[100m',
    brightRed: '\x1b[101m',
    brightGreen: '\x1b[102m',
    brightYellow: '\x1b[103m',
    brightBlue: '\x1b[104m',
    brightMagenta: '\x1b[105m',
    brightCyan: '\x1b[106m',
    brightWhite: '\x1b[107m',
  },
  
  // حدود وتأثيرات إضافية
  frame: {
    box: '\x1b[51m',
    encircle: '\x1b[52m',
    overline: '\x1b[53m',
  }
};

/**
 * دالات مساعدة مسبقة التجهيز للاستخدام الشائع
 */
export const logger = {
  // رسائل النظام
  info: (msg, ...args) => 
    console.log(`${colors.fg.brightCyan}ℹ️  INFO${colors.reset} ${colors.fg.cyan}${msg}${colors.reset}`, ...args),
  
  success: (msg, ...args) => 
    console.log(`${colors.fg.brightGreen}✅ SUCCESS${colors.reset} ${colors.fg.green}${msg}${colors.reset}`, ...args),
  
  warning: (msg, ...args) => 
    console.log(`${colors.fg.brightYellow}⚠️  WARNING${colors.reset} ${colors.fg.yellow}${msg}${colors.reset}`, ...args),
  
  error: (msg, ...args) => 
    console.log(`${colors.fg.brightRed}❌ ERROR${colors.reset} ${colors.fg.red}${msg}${colors.reset}`, ...args),
  
  debug: (msg, ...args) => 
    console.log(`${colors.fg.brightMagenta}🐛 DEBUG${colors.reset} ${colors.fg.magenta}${msg}${colors.reset}`, ...args),
  
  system: (msg, ...args) => 
    console.log(`${colors.fg.brightBlue}⚙️  SYSTEM${colors.reset} ${colors.fg.blue}${msg}${colors.reset}`, ...args),
  
  database: (msg, ...args) => 
    console.log(`${colors.fg.brightCyan}🗄️  DATABASE${colors.reset} ${colors.fg.cyan}${msg}${colors.reset}`, ...args),
  
  network: (msg, ...args) => 
    console.log(`${colors.fg.brightGreen}🌐 NETWORK${colors.reset} ${colors.fg.green}${msg}${colors.reset}`, ...args),
  
  // دالة لإنشاء رسائل مخصصة
  custom: (icon, label, color, msg, ...args) => 
    console.log(`${color}${icon || ''} ${label}${colors.reset} ${color}${msg}${colors.reset}`, ...args),
  
  // رسائل مسبقة التجهيز للمراحل
  startup: (msg) => 
    console.log(`${colors.fg.brightGreen}${colors.bold}🚀 ${msg}${colors.reset}`),
  
  shutdown: (msg) => 
    console.log(`${colors.fg.brightRed}${colors.bold}🛑 ${msg}${colors.reset}`),
  
  reload: (msg) => 
    console.log(`${colors.fg.brightYellow}${colors.bold}🔄 ${msg}${colors.reset}`),
};

/**
 * دوال لتنسيق النصوص
 */
export const textFormatter = {
  // إضافة لون وتنسيق للنص
  colorize: (text, color, style = '') => `${style}${color}${text}${colors.reset}`,
  
  // إنشاء عنوان
  title: (text) => 
    `${colors.bg.blue}${colors.fg.white}${colors.bold} ${text} ${colors.reset}`,
  
  // إنشاء قسم
  section: (text) => 
    `${colors.fg.brightBlue}${colors.underscore}${text}${colors.reset}`,
  
  // نص مهم
  highlight: (text) => 
    `${colors.fg.brightYellow}${colors.bold}${text}${colors.reset}`,
  
  // نص خافت للملاحظات
  subtle: (text) => 
    `${colors.fg.gray}${text}${colors.reset}`,
  
  // إنشاء خط فاصل
  divider: (length = 50, char = '─') => 
    `${colors.fg.gray}${char.repeat(length)}${colors.reset}`,
  
  // عرض قيمة بمفتاح
  keyValue: (key, value, color = colors.fg.green) => 
    `${colors.fg.cyan}${key}:${colors.reset} ${color}${value}${colors.reset}`,
};

/**
 * أمثلة متقدمة للاستخدام
 */
export const usageExamples = {
  basic: () => {
    console.log(`
${textFormatter.title('أمثلة استخدام نظام الألوان')}

${textFormatter.section('الاستخدام الأساسي:')}
${colors.fg.red}هذا نص أحمر${colors.reset}
${colors.fg.green + colors.bold}هذا نص أخضر غامق${colors.reset}

${textFormatter.section('استخدام الدوال المساعدة:')}
`);
    
    logger.info('رسالة معلومات عادية');
    logger.success('عملية ناجحة');
    logger.warning('تحذير مهم');
    logger.error('حدث خطأ في النظام');
    
    console.log(`
${textFormatter.section('تنسيق متقدم:')}
${textFormatter.keyValue('المستخدم', 'أحمد', colors.fg.brightCyan)}
${textFormatter.keyValue('الحالة', 'نشط', colors.fg.brightGreen)}
${textFormatter.divider()}
`);
  }
};

/**
 * فحص توافق النظام مع ألوان ANSI
 */
export const checkColorSupport = () => {
  console.log(`${textFormatter.title('فحص دعم الألوان')}`);
  console.log(`${colors.fg.red}🔴 أحمر ${colors.fg.green}🟢 أخضر ${colors.fg.blue}🔵 أزرق`);
  console.log(`${colors.fg.brightRed}🔴 أحمر ساطع ${colors.fg.brightGreen}🟢 أخضر ساطع`);
  console.log(`${colors.bg.red}${colors.fg.white} خلفية حمراء ${colors.reset}`);
  console.log(`${textFormatter.highlight('نص مميز')} ${textFormatter.subtle('(ملاحظة خفيفة)')}`);
  console.log(textFormatter.divider());
};

// تصدير إصدار النظام
export const COLOR_VERSION = '2.0.0';
export const ANSI_STANDARD = 'ANSI Escape Codes v3.1';

// التصدير الافتراضي
export default colors;

// مثال لكيفية الاستخدام:
// console.log(colors.fg.red + 'هذا نص باللون الأحمر' + colors.reset);
//ممكن تحسو انه ملف مو مهم بس ده هوا يلي بيقرا الاوامر متال console.log الاسم = (`مرحبا انا اسمي ${name}`) فهمتو كيف،،؟ 