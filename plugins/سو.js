import axios from 'axios';

// ================== Axios Instance (قوي) ==================
const api = axios.create({
    timeout: 30_000,
    headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
            '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://soundcloud.com/',
        'Origin': 'https://soundcloud.com',
        'Connection': 'keep-alive'
    }
});

// Retry بسيط
async function safeRequest(fn, retries = 2) {
    try {
        return await fn();
    } catch (e) {
        if (retries <= 0) throw e;
        await new Promise(r => setTimeout(r, 1500));
        return safeRequest(fn, retries - 1);
    }
}

// ================== Handler ==================
let handler = async (m, { conn, text }) => {
    if (!text)
        return m.reply('⚠️ استخدم الأمر هكذا:\n.سو <رابط ساوند كلاود>');

    let wait;
    try {
        // ⏳ خطوة 1
        wait = await conn.sendMessage(
            m.chat,
            { text: '⏳ جاري تحليل رابط SoundCloud...' },
            { quoted: m }
        );

        // 1️⃣ جلب بيانات التراك
        const scRes = await safeRequest(() =>
            api.post('https://sc.snapfirecdn.com/soundcloud', {
                target: text,
                gsc: 'x'
            })
        );

        const data = scRes?.data;
        const progressive = data?.sound?.progressive_url;
        if (!progressive) throw new Error('NO_PROGRESSIVE_URL');

        // ⏳ خطوة 2
        await conn.sendMessage(
            m.chat,
            { text: '⏳ استخراج رابط التحميل النهائي...' },
            { quoted: wait }
        );

        // 2️⃣ GET الرابط النهائي
        const dlRes = await safeRequest(() =>
            api.get(
                'https://sc.snapfirecdn.com/soundcloud-get-dl',
                { params: { target: progressive } }
            )
        );

        const finalUrl = dlRes?.data?.url;
        if (!finalUrl) throw new Error('NO_FINAL_URL');

        const title = data.sound?.title || 'SoundCloud';
        const artist = data.metadata?.username || 'SoundCloud Artist';
        const artwork = data.metadata?.artwork_url;

        // 🧹 حذف رسالة الانتظار
        if (wait?.key)
            await conn.sendMessage(m.chat, { delete: wait.key });

        // 🎧 إرسال الصوت
        await conn.sendMessage(
            m.chat,
            {
                audio: { url: finalUrl },
                mimetype: 'audio/mpeg',
                fileName: `${title}.mp3`,
                contextInfo: {
                    externalAdReply: {
                        mediaUrl: text,
                        mediaType: 2,
                        title: title,
                        body: artist,
                        thumbnail: artwork
                            ? await (
                                  await api.get(artwork, {
                                      responseType: 'arraybuffer'
                                  })
                              ).data
                            : null
                    }
                }
            },
            { quoted: m }
        );

    } catch (err) {
        console.error('[SC ERROR]', err?.message || err);
        if (wait?.key)
            await conn.sendMessage(m.chat, { delete: wait.key });

        m.reply('❌ فشل تحميل الصوت حالياً، جرّب لاحقاً.');
    }
};

handler.command = /^سو$/i;
export default handler;