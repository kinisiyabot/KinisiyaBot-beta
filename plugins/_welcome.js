
import chalk from 'chalk'
let WAMessageStubType = await import('@whiskeysockets/baileys')
import { existsSync, promises as fs, readdirSync, rmSync, unlinkSync } from 'fs'
import path from 'path'

// نــصــوص الــزخــرفــة والــتــنــســيــق
let rtxWelcome = `🔞┊≡ ◡̈⃝🫦 ↜♡︎︎𝐊𝐈𝐍𝐈𝐒𝐈𝐘𝐀 𝐁𝐎𝐓ꨄ︎ఌ
╮─ׅ─๋︩︪─┈─๋︩︪─═⊐‹✨›⊏═┈─๋︩︪─
┤─ׅ─ׅ┈ ─๋︩︪──ׅ─ׅ┈ ─๋︩︪─☇
╯─ׅ─๋︩︪─┈─๋︩︪─═⊐‹♻️›⊏═┈─๋︩︪⊐`

let rtxBye = `🔞┊≡ ◡̈⃝🫦 ↜♡︎𝐊𝐈𝐍𝐈𝐒𝐈𝐘𝐀 𝐁𝐎𝐓ꨄ︎ఌ
╮─ׅ─๋︩︪─┈─๋︩︪─═⊐‹✨›⊏═┈─๋︩︪─
┤─ׅ─ׅ┈ ─๋︩︪──ׅ─ׅ┈ ─๋︩︪─☇
╯─ׅ─๋︩︪─┈─๋︩︪─═⊐‹♻️›⊏═┈─๋︩︪⊐`

// دالة للحصول على الصورة المناسبة (صورة الشخص أو صورة المجموعة)
async function getProfileImage(conn, participantId, groupId) {
try {
const userPP = await conn.profilePictureUrl(participantId, 'image')
return userPP
} catch (userError) {
try {
const groupPP = await conn.profilePictureUrl(groupId, 'image')
return groupPP
} catch (groupError) {
return 'https://i.imgur.com/6q1wQ9B.jpg'
}
}
}

let handler = (m) => m
handler.before = async function (m, {conn, participants, groupMetadata, isBotAdmin}) {
if (!m.isGroup) return

const chatId = m.chat  
const chat = global.db?.data?.chats?.[chatId] || {}  
  
if (!chat.welcome) return  
  
if (m.messageStubType === undefined) return  
  
let participantId = m.messageStubParameters?.[0] || m.sender  
let usuario = `@${participantId.split('@')[0]}`  
  
let pp = await getProfileImage(conn, participantId, m.chat)  
let img = await (await fetch(pp)).buffer()  
  
let users = participants.map((u) => conn.decodeJid(u.id))  
const groupAdmins = participants.filter((p) => p.admin)  
const listAdmin = groupAdmins.map((v, i) => `*» ${i + 1}. @${v.id.split('@')[0]}*`).join('\n')  

if (m.messageStubType == 27) {  
    let subject = groupMetadata.subject || 'المجموعة'  
    let descs = groupMetadata.desc || '🔞┊≡ ◡̈⃝🫦 ↜♡︎𝐊𝐈𝐍𝐈𝐒𝐈𝐘𝐀 𝐁𝐎𝐓ꨄ︎ఌ'  
    let userName = participantId.split('@')[0]  

    let defaultWelcome = `${rtxWelcome.trim()}\n\n`  
    defaultWelcome += `┤┌\n`
    defaultWelcome += `│┊👤 مــرحــبــًا @${userName}\n`  
    defaultWelcome += `│┊📋 أهــلاً وســهــلاً بــك فــي مــجــمــوعــة:\n`  
    defaultWelcome += `│┊📍 ${subject}\n\n`  
    defaultWelcome += `│┊📝 وصــف الــمــجــمــوعــة:\n`  
    defaultWelcome += `│┊💬 ${descs}\n`
    defaultWelcome += `┤└─ׅ─ׅ┈ ─๋︩︪──ׅ─ׅ┈ ─๋︩︪☇\n`
    defaultWelcome += `╯─ׅ─๋︩︪─┈─๋︩︪─═⊐‹♻️›⊏═┈─๋︩︪⊐`

    let textWel = chat.sWelcome  
        ? chat.sWelcome  
            .replace(/@user/g, `@${userName}`)  
            .replace(/@group/g, subject)  
            .replace(/@desc/g, descs)  
        : defaultWelcome  

    await this.sendMessage(  
        m.chat,  
        {  
            text: textWel,  
            contextInfo: {  
                forwardingScore: 9999999,  
                isForwarded: true,  
                mentionedJid: [participantId],  
                externalAdReply: {  
                    showAdAttribution: true,  
                    renderLargerThumbnail: true,  
                    thumbnailUrl: pp,  
                    title: '🔞┊≡ ◡̈⃝🫦 ↜♡︎𝐊𝐈𝐍𝐈𝐒𝐈𝐘𝐀 𝐁𝐎𝐓ꨄ︎ఌ',  
                    containsAutoReply: true,  
                    mediaType: 1,  
                    sourceUrl: 'https://whatsapp.com/channel/0029Vb80wch30LKFioKenc2V'  
                }  
            }  
        },  
        { quoted: null }  
    )  
    return  
}  

if (m.messageStubType == 28 || m.messageStubType == 32) {  
    let subject = groupMetadata.subject || 'المجموعة'  
    let userName = participantId.split('@')[0]  

    let defaultBye = `${rtxBye.trim()}\n\n`  
    defaultBye += `┤┌\n`
    defaultBye += `│┊👤 @${userName}\n`  
    defaultBye += `│┊😢 غــادر الــمــجــمــوعــة\n`  
    defaultBye += `│┊📍 ${subject}\n`
    defaultBye += `┤└─ׅ─ׅ┈ ─๋︩︪──ׅ─ׅ┈ ─๋︩︪☇\n`
    defaultBye += `╯─ׅ─๋︩︪─┈─๋︩︪─═⊐‹♻️›⊏═┈─๋︩︪⊐`

    let textBye = chat.sBye   
        ? chat.sBye  
            .replace(/@user/g, `@${userName}`)  
            .replace(/@group/g, subject)  
        : defaultBye  

    await this.sendMessage(  
        m.chat,  
        {  
            text: textBye,  
            contextInfo: {  
                forwardingScore: 9999999,  
                isForwarded: true,  
                mentionedJid: [participantId],  
                externalAdReply: {  
                    showAdAttribution: true,  
                    renderLargerThumbnail: true,  
                    thumbnailUrl: pp,  
                    title: '⛄┊≡ ◡̈⃝🧸↜♡︎✿︎𝐊𝐈𝐍𝐈𝐒𝐈𝐘𝐀 𝐁𝐎𝐓ꨄ︎ఌ',  
                    containsAutoReply: true,  
                    mediaType: 1,  
                    sourceUrl: 'https://whatsapp.com/channel/0029Vb80wch30LKFioKenc2V'  
                }  
            }  
        },  
        { quoted: null }  
    )  
    return  
}

}

export default handler