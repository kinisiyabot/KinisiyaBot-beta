import axios from "axios";

let handler = async (m, { conn, text }) => {
    if (!text) return m.reply("⚠️ اكتب رابط الفصل مثال:\n\n*.عرض_الفصول https://mangatuk.com/manga/solo-leveling/*");

    try {
        const { data } = await axios.get(text, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            }
        });

        // استخراج كل روابط الصور من CSS
        const regex = /background-image:\s*url\(['"]?(.*?)['"]?\)/g;
        let match;
        const images = [];
        while ((match = regex.exec(data)) !== null) {
            images.push(match[1]);
        }

        if (images.length === 0) return m.reply("⚠️ لم يتم العثور على صور الفصل.");

        // ترتيب الصور حسب الرقم
        images.sort((a, b) => {
            const getNum = url => parseInt(url.match(/image-(\d+)\.webp$/)?.[1] || 0);
            return getNum(a) - getNum(b);
        });

        // إرسال الصور واحدة واحدة في الواتس
        for (let i = 0; i < images.length; i++) {
            await conn.sendMessage(m.chat, { image: { url: images[i] }, caption: `صفحة ${i + 1}` }, { quoted: m });
        }

    } catch (err) {
        console.error(err);
        m.reply("❌ حدث خطأ أثناء جلب صور الفصل.");
    }
};

handler.command = ['عرض_الفصول'];
export default handler;