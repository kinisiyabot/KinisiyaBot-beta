import fetch from 'node-fetch';

let handler = async (m, { conn, args, usedPrefix, command }) => {

    let appName = args.join(' ').trim();

    if (!appName) return m.reply(`*🤔 ماذا تريد تحميله؟ 🤔*\n*أدخل اسم التطبيق*\n\n*مثال:*\n${usedPrefix}${command} Free Fire`);

    const apiUrl = `https://api-streamline.vercel.app/dlapk?search=${encodeURIComponent(appName)}`;

    try {

        const response = await fetch(apiUrl);

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();

        if (!data || !data.id) return m.reply('❌ لم يتم العثور على التطبيق.');

        let { name, file, icon } = data;

        await conn.sendMessage(m.chat, {
            image: { url: icon },
            caption: `📦 *جارٍ تحميل التطبيق "${name}"...*`,
        }, { quoted: m });

        await conn.sendFile(
            m.chat,
            file.path,
            `${name}.apk`,
            `✅ *تم التحميل بنجاح: ${name}*\n🔗 *المصدر: Uptdown*`,
            m,
            false,
            { mimetype: 'application/vnd.android.package-archive' }
        );

    } catch (error) {
        console.error('Error fetching APK:', error)
        m.reply('❌ حدث خطأ أثناء محاولة تحميل التطبيق. حاول مرة أخرى لاحقًا.');
    }

};

handler.command = ['تطبيق3', 'apk3'];

export default handler;