import fs from "fs";

const handler = async (m, { conn, isOwner, command, text, quoted }) => {
    // السماح للمطورين فقط
    if (!isOwner) {
        return m.reply("❌ هذا الأمر للمطور فقط.");
    }

    // لو الأمر يخص النصوص (اسم، وصف، منشن، رسالة)
    if (/^تعديل_(اسم|وصف|منشن|رساله)$/.test(command)) {
        let zarfData = JSON.parse(fs.readFileSync("./zarf.json"));

        // القيمة الجديدة: نص مكتوب أو رد على رسالة
        let newValue = text || (quoted?.text ? quoted.text : null);
        if (!newValue) {
            return m.reply("⚠️ اكتب القيمة الجديدة أو رد على رسالة.");
        }

        switch (command) {
            case "تعديل_اسم":
                zarfData.groupName = newValue;
                break;
            case "تعديل_وصف":
                zarfData.groupDescription = newValue;
                break;
            case "تعديل_منشن":
                zarfData.hiddenMention = newValue;
                break;
            case "تعديل_رساله":
                zarfData.normalMessage = newValue;
                break;
        }

        fs.writeFileSync("./zarf.json", JSON.stringify(zarfData, null, 2));
        return m.reply(`✅ تم تعديل ${command.replace("تعديل_", "")} إلى:\n${newValue}`);
    }

    // لو الأمر يخص الصورة
    if (command === "تعديل_صوره") {
        if (!m.quoted || !/image/.test(m.quoted.mimetype || "")) {
            return m.reply("⚠️ رد على صورة عشان أعدلها.");
        }
        let buffer = await m.quoted.download();
        fs.writeFileSync("./media/zarf.jpg", buffer);
        return m.reply("✅ تم تعديل الصورة (zarf.jpg) بنجاح.");
    }

    // لو الأمر يخص الصوت
    if (command === "تعديل_صوت") {
        if (!m.quoted || !/audio/.test(m.quoted.mimetype || "")) {
            return m.reply("⚠️ رد على مقطع صوتي عشان أعدله.");
        }
        let buffer = await m.quoted.download();
        fs.writeFileSync("./media/zarf.mp3", buffer);
        return m.reply("✅ تم تعديل الصوت (zarf.mp3) بنجاح.");
    }
};

handler.command = /^(تعديل_اسم|تعديل_وصف|تعديل_منشن|تعديل_رساله|تعديل_صوره|تعديل_صوت)$/i;

export default handler;