export async function before(m, { conn, isAdmin, isBotAdmin }) {
    if (!m.isGroup) return;
    let chat = global.db.data.chats[m.chat]
    let delet = m.key.participant
    let bang = m.key.id
    let bot = global.db.data.settings[this.user.jid] || {}
    if (m.fromMe) return true;

    if (m.id.startsWith('3EB0') && m.id.length === 22) {
        let chat = global.db.data.chats[m.chat];

        if (chat.antiBot) {
         //   await conn.reply(m.chat, "     ͞ ͟͞ ͟s᪶۫۫a᪶۫۫s᪶۫۫u᪶۫۫k᪶۫i᪶۫ b᪶۫o᪶۫t۫۫͟ ͟͞ ͞   \n╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝\n\n*[ 🫠 ] هلا انا _ساسكي-بوت_*\*في دي المجموعة ما نحتاج بوت ثاني*, *لان بوت ساسكي افضل بوت تقدر تشوفه[ 🫠 ]*", null, rcanal);

            if (isBotAdmin) {
await conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: delet }})
await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
            }
        }
    }
}
