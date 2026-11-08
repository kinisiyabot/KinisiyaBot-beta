import db from '../lib/database.js'
let handler = m => m
handler.before = async function (m, {conn, isAdmin, isBotAdmin} ) {
if (!m.isGroup) return !1
let chat = global.db.data.chats[m.chat]
if (isBotAdmin && chat.antifake) {
if (m.sender.startsWith('91' || '91')) {
global.db.data.users[m.sender].block = true
 
await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')}
if (m.sender.startsWith('91' || '91')) {
global.db.data.users[m.sender].block = true
 
await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')}
if (m.sender.startsWith('91' || '91')) {
global.db.data.users[m.sender].block = true
  
await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')}
if (m.sender.startsWith('91' || '91')) {
global.db.data.users[m.sender].block = true
 
await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')}
if (m.sender.startsWith('91' || '91')) {
global.db.data.users[m.sender].block = true
 
await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')}
if (m.sender.startsWith('91' || '91')) {
global.db.data.users[m.sender].block = true

await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')}
if (m.sender.startsWith('91' || '91')) {
global.db.data.users[m.sender].block = true

await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')}
if (m.sender.startsWith('91' || '91')) {
global.db.data.users[m.sender].block = true

await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')}
if (m.sender.startsWith('91' || '91')) {
global.db.data.users[m.sender].block = true

await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')}
if (m.sender.startsWith('91' || '91')) {
global.db.data.users[m.sender].block = true

await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')}
if (m.sender.startsWith('91' || '91')) {
global.db.data.users[m.sender].block = true

await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')} 
}}
export default handler
