let handler = async (m, { conn }) => {
    const start = new Date().getTime();
    const { key } = await conn.sendMessage(m.chat, {text: `🔄 جاري فحص الحالة ...`}, {quoted: m});
    const end = new Date().getTime();

    const latency = end - start;
    const seconds = (latency / 1000).toFixed(1);

    const uptime = process.uptime(); // بالثواني
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const secondsUp = Math.floor(uptime % 60);
    const uptimeFormatted = `${hours} سـ ${minutes} د ${secondsUp} ث`;

    const usedRAM = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2); // بالميجا بايت

    setTimeout(async () => {
        let response = 
`✦︵‿︵‿︵‿︵‿︵‿︵‿︵✦
👋 مرحباً، @${m.sender.split('@')[0]}

📡 *حالة البوت* ⌗

⚡ السرعة: ${latency} ms
⏳ وقت التشغيل: ${uptimeFormatted}
💾 الذاكرة المستخدمة: ${usedRAM} MB
✦︵‿︵‿︵‿︵‿︵‿︵‿︵✦`;

        await conn.sendMessage(m.chat, { text: response, edit: key, mentions: [m.sender] }, { quoted: m });
    }, latency);
};

handler.help = ['بنج', 'سرعة'];
handler.tags = ['معلومات'];
handler.command = ['بنج', 'سرعة'];

export default handler;