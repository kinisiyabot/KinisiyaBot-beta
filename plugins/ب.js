import * as pkg from "@whiskeysockets/baileys";
import fs from "fs";
import { promisify } from "util";
import cp from "child_process";
const { generateWAMessageFromContent, prepareWAMessageMedia } = pkg;
const exec = promisify(cp.exec);

const handler = async (m, { conn, text, command }) => {
  try {
    const files = fs.readdirSync("./plugins").filter((f) => f.endsWith(".js"));
    const names = files.map((v) => v.replace(".js", ""));

    // 🌟 لو المستخدم كتب .ب بدون اسم → قائمة تفاعلية
    if (!text) {
      const radio = "https://raw.githubusercontent.com/fazbear-Official/uploads/main/uploads/a1a6fff7242dc17877210c3974019c0f.jpg";
      const media = await prepareWAMessageMedia({ image: { url: radio } }, { upload: conn.waUploadToServer });

      const sections = [
        {
          title: "📚 قائمة البلوجنز المتاحة",
          highlight_label: "RUBY PLUGINS",
          rows: names.map((v) => ({
            header: "📄 ملف بلوجن",
            title: `⚙️ ${v}.js`,
            id: `.ب ${v}`,
          })),
        },
      ];

      const msgContent = {
        viewOnceMessage: {
          message: {
            interactiveMessage: {
              header: { title: "📜 الملفات النشطة في النظام", hasMediaAttachment: true, ...media },
              body: {
                text: `❀⃘⃛͜𓉘᳟ี 𓉝᳟ี ⚙️ قائمة ملفات البلوجنز ⚙️\n━━━━━━━━━━━━━━━\n📦 *عدد الملفات:* ${names.length}\nاختر أي ملف لعرض الكود وتحميله 👇`,
              },
              nativeFlowMessage: {
                buttons: [
                  {
                    name: "single_select",
                    buttonParamsJson: JSON.stringify({
                      title: "📂 الملفات المتاحة",
                      sections,
                    }),
                  },
                ],
              },
            },
          },
        },
      };

      const msg = generateWAMessageFromContent(m.chat, msgContent, { userJid: m.sender });
      await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
      return;
    }

    // ⚙️ تحقق من صحة الاسم
    const pluginName = text.trim();
    if (!names.includes(pluginName)) {
      return conn.sendMessage(m.chat, { text: `❌ لا يوجد ملف بهذا الاسم.\n📦 *عدد الملفات:* ${names.length}` });
    }

    // 🧾 قراءة الكود
    let result;
    try {
      result = await exec(`cat plugins/${pluginName}.js`);
    } catch (e) {
      result = e;
    }

    const { stdout, stderr } = result;
    const content = stdout.trim() || stderr.trim() || "⚠️ الملف فارغ.";

    // ✨ إرسال الكود أولاً
    const msg = await conn.sendMessage(
      m.chat,
      {
        text: `${content.substring(0, 10000)}`,
      },
      { quoted: m }
    );

    // 📎 بعدين إرسال الملف نفسه
    await conn.sendMessage(
      m.chat,
      {
        document: fs.readFileSync(`./plugins/${pluginName}.js`),
        mimetype: "application/javascript",
        fileName: `${pluginName}.js`,
        caption: "📦 تم إرسال الملف بنجاح",
      },
      { quoted: msg }
    );
  } catch (err) {
    console.error(err);
    await conn.sendMessage(m.chat, { text: `⚠️ خطأ: ${err.message}` });
  }
};

handler.help = ["ب <اسم الملف>"];
handler.tags = ["owner"];
handler.command = /^(ب|g|باتش)$/i;
handler.owner = true;

export default handler;