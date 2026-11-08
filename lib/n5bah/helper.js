// معرفات جاهزة
export const FromID = {
  status: 'status@broadcast',
  s: '@s.whatsapp.net',
  g: '@g.us',
  lid: '@lid'
};

// أدوات تحليل الرسائل
export const MessageUtils = {
  getQuotedMessage: (m) =>
    m.message?.extendedTextMessage?.contextInfo?.quotedMessage || null,

  getMessageType: (message) =>
    Object.keys(message)[0],

  getMessageContent: (message, type) =>
    message[type]
};

// أدوات عامة
export const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const formatTime = (ms) => {
  let s = Math.floor(ms / 1000),
      m = Math.floor(s / 60),
      h = Math.floor(m / 60),
      d = Math.floor(h / 24);
  s %= 60;
  m %= 60;
  h %= 24;
  return [d, h, m, s].map(v => v.toString().padStart(2, 0)).join(':');
};

// تنسيقات نصوص
export const bold = (str) => `*${str}*`;
export const italic = (str) => `_${str}_`;
export const strikethrough = (str) => `~${str}~`;
export const quote = (str) => `> ${str}`;
export const monospace = (str) => '```' + str + '```';
export const inlineCode = (str) => '`' + str + '`';
