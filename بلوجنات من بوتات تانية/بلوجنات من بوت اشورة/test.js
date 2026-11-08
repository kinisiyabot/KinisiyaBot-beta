import fs from "fs";
import path from "path";

const handler = async (m, { conn }) => {
    try {
        const demonicText = `> 𝑨𝑺𝑯𝑼𝑹𝑨 𝑻𝑹𝑼𝑺𝑻𝑺 𝒀𝑶𝑼 𝑨𝑺 𝑨 𝑺𝑻𝑹𝑶𝑵𝑮 𝑯𝑨𝑪𝑲𝑬𝑹🍷`;

        // مسار الصورة الافتراضية
        const defaultImagePath = path.join(new URL('.', import.meta.url).pathname, '../image.jpeg');
        const defaultImage = fs.existsSync(defaultImagePath) ? fs.readFileSync(defaultImagePath) : null;

        // محاولة جلب صورة بروفايل الشخص
        let imageBuffer;
        try {
            const ppUrl = await conn.profilePictureUrl(m.sender, 'image');
            const res = await fetch(ppUrl);
            imageBuffer = Buffer.from(await res.arrayBuffer());
        } catch {
            imageBuffer = defaultImage;
        }

        await conn.sendMessage(
            m.key.remoteJid,
            {
                text: demonicText,
                contextInfo: {
                    externalAdReply: {
                        title: "𖤐 𝑨𝑺𝑯𝑼𝑹𝑎'𝒔 BOT 𖤐",
                        body: "𝐃𝐀𝐑𝐄 𝐓𝐨 𝐄𝐍𝐓𝐄𝐑? 𝐘𝐎𝐔'𝐋𝐋 𝐁𝐔𝐑𝐍 🔥",
                        thumbnail: imageBuffer,
                        mediaType: 1,
                        sourceUrl: "https://t.me/ASHURA_Realm",
                        renderLargerThumbnail: false,
                        showAdAttribution: false
                    }
                }
            },
            { quoted: m }
        );

    } catch (err) {
        const errorDesign = `
╭─⚡| 𝑨𝑺𝑯𝑼𝑹𝑨'𝒔 𝑾𝑹𝑨𝑻𝑯 |⚡─╮
│
│ *« 𝐄𝐑𝐑𝐎𝐔𝐑 »* 
│ ${err.message || '𝐔𝐍𝐊𝐍𝐎𝐖𝐍 𝐃𝐄𝐌𝐎𝐍 𝐅𝐎𝐑𝐂𝐄'}
│
╰─────────────⚔️────────╯`;

        await conn.sendMessage(m.key.remoteJid, { text: errorDesign }, { quoted: m });
    }
};

handler.command = ['تست'];
handler.group = false; // لو عايزه يشتغل في الجروبات فقط خليها true

export default handler;