import db from '../lib/database.js'
let handler = m => m
handler.before = async function (m, {conn, isAdmin, isBotAdmin} ) {
if (!m.isGroup) return !1
let chat = global.db.data.chats[m.chat]
if (isBotAdmin && chat.autoRechazar) {
if (m.sender.startsWith('91')) {
await conn.groupRequestParticipantsUpdate(m.chat, [m.sender], 'reject')}

if (m.sender.startsWith('91')) {
await conn.groupRequestParticipantsUpdate(m.chat, [m.sender], 'reject')}

if (m.sender.startsWith('91')) {
await conn.groupRequestParticipantsUpdate(m.chat, [m.sender], 'reject')}

if (m.sender.startsWith('91')) {
await conn.groupRequestParticipantsUpdate(m.chat, [m.sender], 'reject')}

if (m.sender.startsWith('91')) {
await conn.groupRequestParticipantsUpdate(m.chat, [m.sender], 'reject')}

if (m.sender.startsWith('91')) {
await conn.groupRequestParticipantsUpdate(m.chat, [m.sender], 'reject')}

if (m.sender.startsWith('91')) {
await conn.groupRequestParticipantsUpdate(m.chat, [m.sender], 'reject')}

if (m.sender.startsWith('91')) {
await conn.groupRequestParticipantsUpdate(m.chat, [m.sender], 'reject')}

if (m.sender.startsWith('91')) {
await conn.groupRequestParticipantsUpdate(m.chat, [m.sender], 'reject')}

if (m.sender.startsWith('91')) {
await conn.groupRequestParticipantsUpdate(m.chat, [m.sender], 'reject')}

if (m.sender.startsWith('91')) {
await conn.groupRequestParticipantsUpdate(m.chat, [m.sender], 'reject')}

if (m.sender.startsWith('91')) {
await conn.groupRequestParticipantsUpdate(m.chat, [m.sender], 'reject')}

if (m.sender.startsWith('91')) {
await conn.groupRequestParticipantsUpdate(m.chat, [m.sender], 'reject')}

if (m.sender.startsWith('91')) {
await conn.groupRequestParticipantsUpdate(m.chat, [m.sender], 'reject')}

if (m.sender.startsWith('91')) {
await conn.groupRequestParticipantsUpdate(m.chat, [m.sender], 'reject')} 
}}
export default handler
