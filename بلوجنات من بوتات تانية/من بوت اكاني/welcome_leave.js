export async function participantsUpdate({ id, participants, action }) {
    try {
        let conn = global.conn; // الاتصال الرئيسي بالبوت
        for (let user of participants) {
            let metadata = await conn.groupMetadata(id).catch(() => ({}));
            let groupName = metadata.subject || "المجموعة";
            let userTag = `@${user.split("@")[0]}`;

            if (action === "remove") { // عند المغادرة
                let profilePicUrl;
                try {
                    profilePicUrl = await conn.profilePictureUrl(user, 'image'); // جلب صورة البروفايل
                } catch {
                    profilePicUrl = 'https://telegra.ph/file/1c36b4b2f7e4a91915b18.jpg'; // صورة افتراضية في حال لم تكن هناك صورة
                }

                let byeMessage = `*┏━━⊱❰ 🌸 وداعاً 🌸 ❱⊰━━┓*\n` +
                                 `*┃* 𓆩👋𓆪 أوه لا! ${userTag} غادر مجموعة *${groupName}* 😢💔\n` +
                                 `*┃* 🕊️ نتمنى لك حظاً سعيداً في رحلتك القادمة! 🚀✨\n` +
                                 `*┃* 🍃 لا تنسَ أن تبتسم، فالحياة تستمر! 😊💕\n` +
                                 `*┗━━━━━━━━━━━━━━━━━┛*`;

                await conn.sendMessage(id, { image: { url: profilePicUrl }, caption: byeMessage, mentions: [user] });
            }
        }
    } catch (err) {
        console.error("❌ خطأ في نظام المغادرة:", err);
    }
}