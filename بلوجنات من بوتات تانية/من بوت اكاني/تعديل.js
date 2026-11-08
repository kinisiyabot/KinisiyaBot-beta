import FormData from "form-data";
import Jimp from "jimp";

let handler = async (m, { conn, usedPrefix, command, args }) => {
    if (command === "تعديل") {
        // عرض القائمة الفرعية للأوامر
        const subcommands = ["إزالة_الضباب", "إعادة_تلوين", "تحسين", "تمويه", "توضيح"];
        const subcommandList = subcommands.map((cmd, index) => `${index + 1}. ${cmd}`).join('\n');
        const promptMessage = `اختر عملية من القائمة التالية:\n${subcommandList}\n\nاستخدم الأمر بالشكل التالي:\n${usedPrefix}تعديل <رقم_العملية>`;
        if (!args[0]) {
            return m.reply(promptMessage);
        }
        
        const selectedIndex = parseInt(args[0]) - 1;
        if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= subcommands.length) {
            return m.reply(`اختيار غير صالح. ${promptMessage}`);
        }
        
        const selectedCommand = subcommands[selectedIndex];
        return await handler(m, { conn, usedPrefix, command: selectedCommand, args: args.slice(1) });
    } else {
        // تنفيذ الأوامر الفرعية
        await processImage(m, conn, command, "*｢⚕️┊𝐀𝐁𝐘𝐒𝐒_𝐁𝐎𝐓┊⚕️｣*");
    }
};

handler.help = ["اديت"];
handler.tags = ["أدوات"];
handler.command = ["تعديل", "إزالة_الضباب", "إعادة_تلوين", "تحسين", "تمويه", "توضيح"];
export default handler;

async function processImage(m, conn, method, caption) {
    conn[method] = conn[method] ? conn[method] : {};
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || q.mediaType || "";
    if (!mime)
        throw `أين هي الصورة؟`;
    if (!/image\/(jpe?g|png)/.test(mime))
        throw `النوع ${mime} غير مدعوم`;
    else conn[method][m.sender] = true;
    m.reply(wait);
    let img = await q.download?.();
    let error;
    try {
        const This = await processing(img, method);
        conn.sendFile(m.chat, This, "", caption, m);
    } catch (er) {
        error = true;
    } finally {
        if (error) {
            m.reply("عملية فشلت :(");
        }
        delete conn[method][m.sender];
    }
}

async function processing(urlPath, method) {
    return new Promise(async (resolve, reject) => {
        let Methods = ["enhance", "recolor", "dehaze", "blur", "sharpen"];
        Methods.includes(method) ? (method = method) : (method = Methods[0]);
        let buffer,
            Form = new FormData(),
            scheme = "https" + "://" + "inferenceengine" + ".vyro" + ".ai/" + method;
        Form.append("model_version", 1, {
            "Content-Transfer-Encoding": "binary",
            contentType: "multipart/form-data; charset=uttf-8",
        });
        Form.append("image", Buffer.from(urlPath), {
            filename: "enhance_image_body.jpg",
            contentType: "image/jpeg",
        });
        Form.submit(
            {
                url: scheme,
                host: "inferenceengine" + ".vyro" + ".ai",
                path: "/" + method,
                protocol: "https:",
                headers: {
                    "User-Agent": "okhttp/4.9.3",
                    Connection: "Keep-Alive",
                    "Accept-Encoding": "gzip",
                },
            },
            function (err, res) {
                if (err) reject();
                let data = [];
                res
                    .on("data", function (chunk, resp) {
                        data.push(chunk);
                    })
                    .on("end", () => {
                        resolve(Buffer.concat(data));
                    });
                res.on("error", (e) => {
                    reject();
                });
            }
        );
    });
}