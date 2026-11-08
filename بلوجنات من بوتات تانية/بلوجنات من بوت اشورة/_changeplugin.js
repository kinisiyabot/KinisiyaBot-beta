import fs from "fs";
import path from "path";
import { isElite, extractPureNumber } from '../lib/elite.js';

const handler = async (m, { conn, text }) => {
    const sender = extractPureNumber(m.sender); // تحويل JID إلى رقم صافي

    // التحقق إذا الرقم من النخبة
    if (!isElite(sender)) {
        return m.reply('🚫 هذا الأمر مخصص فقط لأعضاء النخبة.');
    }

  let converted = text;

  // require → import (يدعم { } )
  converted = converted.replace(
    /const\s+{([^}]+)}\s*=\s*require\(['"](.+)['"]\);?/g,
    "import { $1 } from \"$2\";"
  );

  converted = converted.replace(
    /const\s+(\w+)\s*=\s*require\(['"](.+)['"]\);?/g,
    "import $1 from \"$2\";"
  );

  // module.exports → export default
  converted = converted.replace(
    /module\.exports\s*=\s*({[\s\S]*?});?/g,
    "export default $1;"
  );

  await m.reply("✅ الكود بعد التحويل:\n\n```js\n" + converted + "\n```");
};

handler.command = /^حول$/i;
handler.owner = false;

export default handler;