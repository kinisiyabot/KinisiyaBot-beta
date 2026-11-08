import fs from "fs";
import path from "path";

const settingsPath = path.join(process.cwd(), "settings.js");

// ─────────── دوال مساعدة ───────────
function getOwners() {
  if (!fs.existsSync(settingsPath)) return [];
  let settingsData = fs.readFileSync(settingsPath, "utf-8");
  let ownerMatch = settingsData.match(/global\.owner\s*=\s*(\[[^\]]*\])/);
  if (!ownerMatch) return [];
  return eval(ownerMatch[1]);
}

function saveOwners(owners) {
  let settingsData = fs.readFileSync(settingsPath, "utf-8");
  let newSettings = settingsData.replace(
    /global\.owner\s*=\s*\[[^\]]*\]/,
    `global.owner = ${JSON.stringify(owners, null, 2)}`
  );
  fs.writeFileSync(settingsPath, newSettings, "utf-8");
}

// ─────────── الأمر الرئيسي ───────────
let handler = async (m, { conn, text, isOwner }) => {
  if (!isOwner) return m.reply("❌ هذا الأمر للمطور فقط.");

  if (!fs.existsSync(settingsPath)) return m.reply("❌ ملف settings.js غير موجود.");

  let owners = getOwners();

  let args = text.trim().split(/\s+/);
  let action = args[0]?.toLowerCase(); // اضف / حذف / عرض
  let number =
    args[1]?.replace(/\D/g, "") ||
    (m.quoted?.sender ? m.quoted.sender.split("@")[0] : null) ||
    (m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0].split("@")[0] : null);

  if (action === "اضف") {
    if (!number) return m.reply("⚠️ اكتب رقم أو اعمل منشن أو ريپلاي.");
    if (owners.includes(number)) return m.reply("⚠️ الرقم موجود بالفعل.");

    owners.push(number);
    saveOwners(owners);
    return m.reply(`✅ تم إضافة الرقم *${number}* إلى المطورين.`);
  }

  if (action === "حذف") {
    if (!number) return m.reply("⚠️ اكتب رقم أو اعمل منشن أو ريپلاي.");
    if (!owners.includes(number)) return m.reply("❌ الرقم غير موجود.");

    owners = owners.filter((n) => n !== number);
    saveOwners(owners);
    return m.reply(`🗑️ تم حذف الرقم *${number}* من المطورين.`);
  }

  if (action === "عرض") {
    if (owners.length === 0) return m.reply("⚠️ لا يوجد مطورين حالياً.");
    let list = owners.map((n, i) => `${i + 1}. ${n}`).join("\n");
    return m.reply(`📋 قائمة المطورين:\n\n${list}`);
  }

  return m.reply("⚠️ الاستخدام: \n- مطور اضف [رقم/منشن/ريپلاي]\n- مطور حذف [رقم/منشن/ريپلاي]\n- مطور عرض");
};

handler.command = ["مطور"];
handler.help = ["مطور اضف/حذف/عرض"];
handler.tags = ["owner"];

export default handler;