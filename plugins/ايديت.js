import * as pkg from '@whiskeysockets/baileys';
const { proto, generateWAMessageFromContent, generateWAMessageContent } = pkg;

const handler = async (m, { conn, args, usedPrefix, command }) => {
    try {
        if (!args[0]) {
            return conn.reply(
                m.chat,
                `[❗️] استخدم الأمر هكذا:\n${usedPrefix}${command} <اسم الشخصية>\nمثال: ${usedPrefix}${command} eminem`,
                m
            );
        }

        const characterName = args.join(' ');
        const searchText = `Best Edit for ${characterName} 4K`;

        await conn.reply(m.chat, `🔎 البحث الجاهز:\n${searchText}`, m);
        await conn.reply(m.chat, '⏳ جاري البحث في تيك توك ...', m);

        const query = encodeURIComponent(searchText);
        
        // استخدام محركات بحث تيك توك مع رأس الطلب (Headers) لتجنب حظر الاتصال (fetch failed)
        const fetchOptions = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        };

        let videos = [];
        
        // المحاولة من المصدر الأول
        try {
            const res1 = await fetch(`https://deliriussapi.vercel.app/search/tiktok?q=${query}`, fetchOptions);
            if (res1.ok) {
                const data1 = await res1.json();
                videos = data1.data || data1.results || data1 || [];
            }
        } catch (e) {
            console.error('المصدر الأول فشل، جاري تجربة المصدر الثاني...');
        }

        // إذا فشل المصدر الأول يتم الانتقال للمصدر الاحتياطي تلقائياً
        if (!Array.isArray(videos) || videos.length === 0) {
            try {
                const res2 = await fetch(`https://api.tiklydown.eu.org/api/search?q=${query}`, fetchOptions);
                if (res2.ok) {
                    const data2 = await res2.json();
                    videos = data2.data || data2.result || data2.videos || [];
                }
            } catch (e) {
                console.error('المصدر الثاني فشل أيضاً.');
            }
        }

        if (!Array.isArray(videos) || videos.length === 0) {
            return conn.reply(
                m.chat,
                `❌ لم يتم العثور على نتائج لـ "${searchText}"، حاول مرة أخرى.`,
                m
            );
        }

        const cards = await Promise.all(
            videos.slice(0, 3).map(async (video) => {
                const videoUrl = video.nowm || video.play || video.video || video.noWatermark || video.url;
                const videoTitle = video.title || video.description || 'بدون عنوان';

                const videoMsg = await generateVideoMessage(conn, videoUrl);

                return {
                    body: proto.Message.InteractiveMessage.Body.fromObject({
                        text: ''
                    }),
                    footer: proto.Message.InteractiveMessage.Footer.fromObject({
                        text: '📹 تيك توك فيديو'
                    }),
                    header: proto.Message.InteractiveMessage.Header.fromObject({
                        title: videoTitle,
                        hasMediaAttachment: true,
                        videoMessage: videoMsg
                    }),
                    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                        buttons: []
                    })
                };
            })
        );

        const msg = generateWAMessageFromContent(
            m.chat,
            {
                viewOnceMessage: {
                    message: {
                        messageContextInfo: {
                            deviceListMetadata: {},
                            deviceListMetadataVersion: 2
                        },
                        interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                            body: proto.Message.InteractiveMessage.Body.create({
                                text: `🎬 *نتائج البحث عن:* ${searchText}`
                            }),
                            footer: proto.Message.InteractiveMessage.Footer.create({
                                text: '🔎 بواسطة: KINISIYA BOT'
                            }),
                            header: proto.Message.InteractiveMessage.Header.create({
                                hasMediaAttachment: false
                            }),
                            carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
                                cards
                            })
                        })
                    }
                }
            },
            { quoted: m }
        );

        await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

    } catch (err) {
        console.error(err);
        conn.reply(
            m.chat,
            `❌ حصل خطأ أثناء البحث!\n\n${err.message || err}`,
            m
        );
    }
};

async function generateVideoMessage(conn, videoUrl) {
    const { videoMessage } = await generateWAMessageContent(
        { video: { url: videoUrl } },
        { upload: conn.waUploadToServer }
    );
    return videoMessage;
}

handler.help = ['ايديت <اسم الشخصية>'];
handler.tags = ['search'];
handler.command = /^ايديت$/i;

export default handler;
