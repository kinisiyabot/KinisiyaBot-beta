import mongoose from "mongoose";

const uri = "mongodb+srv://itachi3mk:mypassis1199@cluster0.zzyxjo3.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("✅ تم الاتصال بـ MongoDB بنجاح"))
  .catch(error => console.error("❌ خطأ في الاتصال بـ MongoDB:", error));

const bk9Schema = new mongoose.Schema({
  groupId: String,
  userId: String,
  bk9: String
});

const BK9 = mongoose.model("BK9", bk9Schema);

const handler = async (message, { conn, text, command, isAdmin }) => {
  try {
    const chatId = message.chat;
    const senderId = message.sender.split("@")[0];

    if (command === "الالقاب") {
      if (!message.isGroup) return message.reply("*〔يعمل هذا الأمر فقط في المجموعات⌫〕*");
      if (!isAdmin) return message.reply("*〔هذا الأمر مخصص للمشرفين فقط⌫〕*");

      const nicknames = await BK9.find({ groupId: chatId });
      if (nicknames.length === 0) {
        return message.reply("*〔لا يوجد ألقاب مسجلة حاليًا⌫〕*");
      }

      let response = `📌 *عدد الألقاب المسجلة:* ${nicknames.length}\n\n`;
      nicknames.forEach((entry, index) => {
        response += `${index + 1} - ${entry.bk9}\n`;
      });

      return message.reply(response);
    }

    if (command === "تسجيل") {
      if (!message.isGroup) return message.reply("*〔يعمل هذا الأمر فقط في المجموعات⌫〕*");
      if (!isAdmin) return message.reply("*〔هذا الأمر مخصص للمشرفين فقط⌫〕*");
      if (!message.mentionedJid || !text || text.trim() === "") {
        return message.reply("*📌 مثال:*\n`.تسجيل @العضو لقب`");
      }

      const mentionedUser = message.mentionedJid[0].replace("@s.whatsapp.net", "");
      const nickname = text.trim().split(" ").slice(1).join(" ");

      if (!nickname) return message.reply("*📌 مثال:*\n`.تسجيل @العضو لقب`");

      const existingNickname = await BK9.findOne({ bk9: nickname, groupId: chatId });

      if (existingNickname) {
        const ownerName = await conn.getName(existingNickname.userId + "@s.whatsapp.net");
        return message.reply(`*📌 اللقب "${nickname}" مأخوذ من طرف* @${ownerName}`);
      }

      await BK9.findOneAndUpdate(
        { userId: mentionedUser, groupId: chatId },
        { bk9: nickname },
        { upsert: true }
      );

      return message.reply(`✅ *تم تسجيل ${nickname} بنجاح!*`);
    }

    if (command === "حذف_لقب") {
      if (!message.isGroup) return message.reply("*〔يعمل هذا الأمر فقط في المجموعات⌫〕*");
      if (!isAdmin) return message.reply("*〔هذا الأمر مخصص للمشرفين فقط⌫〕*");
      if (!text || text.trim() === "") return message.reply("*📌 اكتب اللقب الذي تريد حذفه.*");

      const nicknameToDelete = text.trim();
      const deletion = await BK9.deleteOne({ bk9: nicknameToDelete, groupId: chatId });

      if (deletion.deletedCount > 0) {
        return message.reply(`✅ *تم حذف اللقب "${nicknameToDelete}" بنجاح!*`);
      } else {
        return message.reply(`⚠️ *اللـقب "${nicknameToDelete}" غير مسجل.*`);
      }
    }

    if (command === "لقبي") {
      const userNickname = await BK9.findOne({ userId: senderId, groupId: chatId });

      if (userNickname && userNickname.bk9) {
        return message.reply(`📌 *لقبك هو:* ${userNickname.bk9}`);
      } else {
        return message.reply("⚠️ *لم يتم تسجيلك بأي لقب بعد.*");
      }
    }

    if (command === "لقبه") {
      if (!message.mentionedJid || message.mentionedJid.length === 0) {
        return message.reply("*📌 منشن أحد لمعرفة لقبه.*");
      }

      const targetUser = message.mentionedJid[0].replace("@s.whatsapp.net", "");
      const targetNickname = await BK9.findOne({ userId: targetUser, groupId: chatId });

      if (targetNickname) {
        const targetName = await conn.getName(targetUser + "@s.whatsapp.net");
        return message.reply(`📌 *لقب ${targetName} هو:* ${targetNickname.bk9}`);
      } else {
        return message.reply("⚠️ *لم يتم تسجيل هذا المستخدم بأي لقب بعد.*");
      }
    }

    if (command === "لقب") {
      if (!text || text.trim() === "") return message.reply("*📌 اكتب اللقب للتحقق إذا كان مأخوذًا أم لا.*");

      const nicknameToCheck = text.trim();
      const nicknameExists = await BK9.findOne({ bk9: nicknameToCheck, groupId: chatId });

      if (nicknameExists) {
        const ownerName = await conn.getName(nicknameExists.userId + "@s.whatsapp.net");
        return message.reply(`⚠️ *اللـقب "${nicknameToCheck}" مأخوذ من طرف* @${ownerName}`);
      } else {
        return message.reply(`✅ *اللـقب "${nicknameToCheck}" متاح!*`);
      }
    }

  } catch (error) {
    console.error("❌ خطأ في تنفيذ الأمر:", error);
    message.reply("⚠️ *حدث خطأ، يرجى المحاولة لاحقًا.*");
  }
};

// 🛠️ تحديد الأوامر التي يمكن استخدامها
handler.command = ["الالقاب", "تسجيل", "لقبي", "لقبه", "حذف_لقب", "لقب"];
handler.tags = ["BK9"];

export default handler;