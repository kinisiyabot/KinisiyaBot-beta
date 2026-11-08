const {
    proto,
    generateWAMessage,
    areJidsSameUser
} = (await import('@soymaycol/maybailyes')).default

export async function all(m, chatUpdate) {
    // Verificaciones básicas
    if (m.isBaileys) return
    if (!m.message) return
    
    // Verificar que m.msg existe y tiene las propiedades necesarias
    if (!m.msg) return
    if (!m.msg.fileSha256) return
    
    // Verificar que global.db y sus propiedades existen
    if (!global.db?.data?.sticker) return
    
    // Convertir fileSha256 a base64 de forma segura
    let fileHash
    try {
        fileHash = Buffer.from(m.msg.fileSha256).toString('base64')
    } catch (error) {
        console.log('Error converting fileSha256 to base64:', error)
        return
    }
    
    // Verificar que el hash existe en la base de datos
    if (!(fileHash in global.db.data.sticker)) return

    let hash = global.db.data.sticker[fileHash]
    
    // Verificar que hash existe y tiene las propiedades necesarias
    if (!hash) return
    
    let { text, mentionedJid } = hash
    
    // Verificar que text existe
    if (!text) return
    
    try {
        let messages = await generateWAMessage(m.chat, { 
            text: text, 
            mentions: mentionedJid || [] 
        }, {
            userJid: this.user.id,
            quoted: m.quoted && m.quoted.fakeObj
        })
        
        // Verificar que messages se generó correctamente
        if (!messages || !messages.key) return
        
        messages.key.fromMe = areJidsSameUser(m.sender, this.user.id)
        messages.key.id = m.key.id
        messages.pushName = m.pushName
        
        if (m.isGroup) messages.participant = m.sender
        
        let msg = {
            ...chatUpdate,
            messages: [proto.WebMessageInfo.fromObject(messages)],
            type: 'append'
        }
        
        this.ev.emit('messages.upsert', msg)
        
    } catch (error) {
        console.log('Error processing sticker message:', error)
    }
}
