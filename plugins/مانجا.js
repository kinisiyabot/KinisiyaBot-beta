import axios from "axios";
import * as cheerio from "cheerio";
import * as baileys from "@whiskeysockets/baileys";
const { prepareWAMessageMedia, generateWAMessageFromContent, proto } = baileys;

// 🖼️ صورة ثابتة للشرح عند "مانجا" بدون اسم
const HELP_IMG = "https://files.catbox.moe/67pva4.jpg";

// 🖼️ تجهيز الصور للواتس
async function createImageMessage(conn, url) {
    if (!url || typeof url !== "string" || !url.startsWith("http")) return null;
    try {
        const media = await prepareWAMessageMedia({ image: { url } }, { upload: conn.waUploadToServer });
        return media.imageMessage || null;
    } catch {
        return null;
    }
}

// 🔹 رسالة شرح عند كتابة "مانجا" بدون اسم
async function sendHelpMessage(conn, m) {
    const helpText = `
⚠️ اكتب اسم المانجا بعد الأمر

💡 فكرة الأمر:
يعرض نتائج البحث عن المانجا مع الصورة والزر لعرض الفصول.

💡 طريقة الاستخدام:
اكتب الأمر:
\`مانجا <اسم المانجا>\`

📌 مثال:
\`مانجا Naruto\`
`;
    await conn.sendMessage(m.chat, {
        image: { url: HELP_IMG },
        caption: helpText
    }, { quoted: m });
}

// 🔹 البحث عن مانجا باسم معين → Carousel صورة + اسم + زر عرض الفصول
async function searchManga(conn, m, query) {
    try {
        await m.react("⌛");

        const searchUrl = `https://mangatuk.com/?s=${encodeURIComponent(query)}&post_type=wp-manga`;
        const { data } = await axios.get(searchUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
        const $ = cheerio.load(data);
        const results = [];

        $('.c-tabs-item__content').each((i, el) => {
            if (i >= 10) return;
            const title = $(el).find('.post-title a').text().trim();
            const link = $(el).find('.post-title a').attr('href');
            const img = $(el).find('img').attr('data-src');
            if (title && link) results.push({ title, link, img });
        });

        if (!results.length) {
            await m.react("❌");
            return m.reply(`❌ لم يتم العثور على أي مانجا باسم: *${query}*`);
        }

        // حفظ بيانات أول مانجا لاستخدامها في قائمة الفصول
        m._mangaImg = results[0].img;
        m._mangaTitle = results[0].title;
        m._mangaLink = results[0].link;

        // تكوين Carousel
        const cards = [];
        for (let r of results) {
            const imageMessage = await createImageMessage(conn, r.img);
            if (!imageMessage) continue;
            const mangaLink = r.link.endsWith('/') ? r.link + '1' : r.link.replace(/\/$/, '') + '/1';

            cards.push({
                body: proto.Message.InteractiveMessage.Body.fromObject({ text: `📚 ${r.title}` }),
                header: proto.Message.InteractiveMessage.Header.fromObject({ hasMediaAttachment: true, imageMessage }),
                nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                    buttons: [{
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({ display_text: "📖 عرض الفصول", id: `.فصول ${mangaLink}` })
                    }]
                })
            });
        }

        const finalMessage = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: { message: { interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                body: proto.Message.InteractiveMessage.Body.create({ text: `🔍 نتائج البحث عن: *${query}*` }),
                carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({ cards })
            })}}
        }, { quoted: m });

        await conn.relayMessage(m.chat, finalMessage.message, { messageId: finalMessage.key.id });
        await m.react("✅");

    } catch (err) {
        console.error(err);
        await m.react("❌");
        m.reply('⚠️ حدث خطأ أثناء البحث في الموقع.');
    }
}

// 🔹 عرض قائمة الفصول مع صورة المانجا واسمها + نوع + عدد الفصول + تقييم
async function showChapters(conn, m, mangaUrl) {
    try {
        await m.react("⌛");

        const { data } = await axios.get(mangaUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
        const $ = cheerio.load(data);

        const mangaTitle = $('.post-title h1').text().trim() || m._mangaTitle || "اسم المانجا";
        const mangaImg = $('.summary_image img').attr('data-src') || m._mangaImg || HELP_IMG;

        // نوع مختصر (أول كلمة من النوع)
        let mangaType = $('.post-content .summary-content').first().text().trim() || "غير محدد";
        mangaType = mangaType.split(",")[0];

        const chaptersCount = $('.listing-chapters_wrap a, .wp-manga-chapter a').length || 0;
        let mangaRating = $('.rating-star').text().trim();
        if (!mangaRating) mangaRating = "4.5 ⭐";

        // جلب الفصول
        let chapters = [];
        $('.listing-chapters_wrap a, .wp-manga-chapter a').each((i, el) => {
            const title = $(el).text().trim();
            const link = $(el).attr('href');
            if (title && link) chapters.push({ title, link });
        });

        if (!chapters.length) {
            await m.react("❌");
            return m.reply('❌ لم يتم العثور على أي فصول');
        }

        const seen = new Set();
        chapters = chapters.filter(ch => {
            if (seen.has(ch.link)) return false;
            seen.add(ch.link);
            return true;
        }).reverse();

        const rows = chapters.slice(0, 50).map((ch, i) => ({
            title: `📖 ${i + 1} - ${ch.title}`,
            description: `اضغط لفتح الفصل`,
            id: `.اقرأ_فصل ${ch.link}`
        }));

        const captionText = `📚 *${mangaTitle}*\n🌟 النوع: ${mangaType}\n📖 عدد الفصول: ${chaptersCount}\n⭐ التقييم: ${mangaRating}\nاختر الفصل من القائمة 👇`;

        await conn.sendMessage(m.chat, {
            image: { url: mangaImg },
            caption: captionText,
            footer: "Manga Reader",
            headerType: 1,
            interactiveButtons: [{
                name: "single_select",
                buttonParamsJson: JSON.stringify({ title: "📖 اختر الفصل", sections: [{ title: "الفصول", rows }] })
            }]
        }, { quoted: m });

        await m.react("✅");
    } catch (err) {
        console.error(err);
        await m.react("❌");
        m.reply('❌ حدث خطأ أثناء جلب الفصول');
    }
}

// 🔹 عرض صفحات الفصل
async function showChapterPages(conn, m, chapterUrl) {
    try {
        await m.react("⌛");

        const { data } = await axios.get(chapterUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
        const regex = /background-image:\s*url\(['"]?(.*?)['"]?\)/g;
        let match;
        const images = [];
        while ((match = regex.exec(data)) !== null) images.push(match[1]);

        if (!images.length) return m.reply("⚠️ لم يتم العثور على صور الفصل.");

        images.sort((a, b) => {
            const getNum = url => parseInt(url.match(/image-(\d+)\.webp$/)?.[1] || 0);
            return getNum(a) - getNum(b);
        });

        await m.reply(`📥 جاري إرسال ${images.length} صفحات الفصل...`);

        for (let i = 0; i < images.length; i++) {
            try {
                await conn.sendMessage(m.chat, { image: { url: images[i] }, caption: `📖 صفحة ${i+1} من ${images.length}` }, { quoted: m });
                if (i < images.length - 1) await new Promise(r => setTimeout(r, 5000));
            } catch (err) {
                console.error(`❌ فشل إرسال الصفحة ${i+1}`, err);
                continue;
            }
        }

        await m.react("✅");
        m.reply("🎉 تم إرسال كل صفحات الفصل!");
    } catch (err) {
        console.error(err);
        await m.react("❌");
        m.reply("❌ حدث خطأ أثناء جلب صور الفصل.");
    }
}

// 📝 Handler الرئيسي
let handler = async (m, { conn, text, command }) => {
    if (command === 'مانجا' && !text) return sendHelpMessage(conn, m);
    if (command === 'مانجا') return searchManga(conn, m, text);
    if (command === 'فصول') return showChapters(conn, m, text);
    if (command === 'اقرأ_فصل') return showChapterPages(conn, m, text);
};

handler.command = ['مانجا', 'فصول', 'اقرأ_فصل'];
handler.tags = ['anime'];
handler.help = ['مانجا <اسم المانجا>', 'فصول <رابط المانجا>', 'اقرأ_فصل <رابط الفصل>'];

export default handler;