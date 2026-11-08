let handler = async (m, { conn, isPrems}) => {
    let hasil = Math.floor(Math.random() * 1000)
    let info = `*رائع، حصلت على ${hasil} XP ✨*`
    let time = global.db.data.users[m.sender].lastmiming + 600000
    if (new Date - global.db.data.users[m.sender].lastmiming < 600000) throw `*⏰ يجب أن تنتظر ${msToTime(time - new Date())} قبل أن تتمكن من التعدين مرة أخرى*`

    conn.fakeReply(m.chat, info, '0@s.whatsapp.net', '*｢🍭┊𝐀𝐁𝐘𝐒𝐒_𝐁𝐎𝐓┊🍡｣*', 'status@broadcast')
    m.react('⛏️')   
    // m.reply(`*[ 🎉 ] رائع، حصلت على ${hasil} XP*`)
    global.db.data.users[m.sender].lastmiming = new Date * 1
}
handler.help = ['minar']
handler.tags = ['rg']
handler.command = ['minar', 'miming', 'mine', 'تعدين']
handler.fail = null
handler.exp = 0
export default handler

function msToTime(duration) {
    var milliseconds = parseInt((duration % 1000) / 100),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24)

    hours = (hours < 10) ? "0" + hours : hours
    minutes = (minutes < 10) ? "0" + minutes : minutes
    seconds = (seconds < 10) ? "0" + seconds : seconds

    return minutes + " د " + seconds + " ث "
}