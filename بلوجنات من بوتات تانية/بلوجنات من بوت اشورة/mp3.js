import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { downloadMediaMessage } from '@soymaycol/maybailyes';

const handler = async (m, { conn, text }) => {
    try {
        // لازم يكون رد على فيديو
        if (!m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage) {
            return m.reply('❗ من فضلك، رد على فيديو لاستخدام هذا الأمر.');
        }

        // جلب الفيديو المردود عليه
        const quoted = m.message.extendedTextMessage.contextInfo;
        const videoMessage = quoted.quotedMessage.videoMessage;

        // تحميل الفيديو كـ buffer
        const stream = await downloadMediaMessage(
            { message: { videoMessage } },
            'buffer',
            {},
            { logger: console }
        );

        // مسارات الملفات المؤقتة
        const videoPath = path.join(process.cwd(), 'temp_video.mp4');
        const audioPath = path.join(process.cwd(), 'temp_audio.mp3');
        fs.writeFileSync(videoPath, stream);

        // تحويل الفيديو إلى mp3 باستخدام ffmpeg
        exec(
            `ffmpeg -i "${videoPath}" -vn -ar 44100 -ac 2 -b:a 192k "${audioPath}"`,
            async (err) => {
                if (err) {
                    console.error('ffmpeg error:', err);
                    return m.reply('❌ خطأ أثناء تحويل الفيديو.');
                }

                // إرسال الملف mp3
                const audioBuffer = fs.readFileSync(audioPath);
                await conn.sendMessage(
                    m.chat,
                    {
                        audio: audioBuffer,
                        mimetype: 'audio/mpeg',
                        fileName: 'converted.mp3',
                        ptt: false // false = ملف صوت، true = مذكره صوتية
                    },
                    { quoted: m }
                );

                // حذف الملفات المؤقتة
                fs.unlinkSync(videoPath);
                fs.unlinkSync(audioPath);
            }
        );
    } catch (e) {
        console.error('❌ خطأ في أمر تحويل:', e);
        m.reply(`⚠ حدث خطأ أثناء التنفيذ:\n\n${e.message || e.toString()}`);
    }
};

handler.command = ['تحويل'];
handler.help = ['تحويل (بالرد على فيديو)'];
handler.tags = ['tools'];

export default handler;