import { smsg } from "./lib/simple.js"
import { matchesAny, learnIdentity, sameIdentity } from "./lib/identity.js"
import { format } from "util"
import { fileURLToPath } from "url"
import path, { join } from "path"
import fs, { unwatchFile, watchFile } from "fs"
import chalk from "chalk"
import fetch from "node-fetch"
import ws from "ws"

const isNumber = x => typeof x === "number" && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(function () {
  clearTimeout(this)
  resolve()
}, ms))

const pickRandom = list => list[Math.floor(Math.random() * list.length)]

export async function handler(chatUpdate) {
  this.msgqueque = this.msgqueque || []
  this.uptime = this.uptime || Date.now()
  if (!chatUpdate) return
  
  this.pushMessage?.(chatUpdate.messages).catch(console.error)
  let m = chatUpdate.messages[chatUpdate.messages.length - 1]
  if (!m) return
  
  if (global.db.data == null) await global.loadDatabase()

  try {
    m = smsg(this, m) || m
    if (!m) return
    m.exp = 0

    // تعلّم مرادفات الهوية (رقم الهاتف <-> الـ LID) من مفتاح الرسالة، حتى
    // تنجح مقارنات المطور/النخبة حتى لو أرسل المرسل بمعرّف واحد فقط.
    learnIdentity(
      m.sender,
      m.key?.participant,
      m.key?.participantPn,
      m.key?.participantLid,
      m.key?.senderPn,
      m.key?.senderLid
    )

    try {
      // User Database Initialization
      let user = global.db.data.users[m.sender]
      if (typeof user !== "object") global.db.data.users[m.sender] = {}
      if (user) {
        if (!("name" in user)) user.name = m.name || ""
        if (!("exp" in user) || !isNumber(user.exp)) user.exp = 0
        if (!("coin" in user) || !isNumber(user.coin)) user.coin = 0
        if (!("bank" in user) || !isNumber(user.bank)) user.bank = 0
        if (!("level" in user) || !isNumber(user.level)) user.level = 0
        if (!("health" in user) || !isNumber(user.health)) user.health = 100
        if (!("genre" in user)) user.genre = ""
        if (!("birth" in user)) user.birth = ""
        if (!("marry" in user)) user.marry = ""
        if (!("description" in user)) user.description = ""
        if (!("packstickers" in user)) user.packstickers = null
        if (!("premium" in user)) user.premium = false
        if (!("premiumTime" in user)) user.premiumTime = 0
        if (!("banned" in user)) user.banned = false
        if (!("bannedReason" in user)) user.bannedReason = ""
        if (!("commands" in user) || !isNumber(user.commands)) user.commands = 0
        if (!("afk" in user) || !isNumber(user.afk)) user.afk = -1
        if (!("afkReason" in user)) user.afkReason = ""
        if (!("warn" in user) || !isNumber(user.warn)) user.warn = 0
        if (!("lang" in user)) user.lang = ""
      } else {
        global.db.data.users[m.sender] = {
          name: m.name || "",
          exp: 0,
          coin: 0,
          bank: 0,
          level: 0,
          health: 100,
          genre: "",
          birth: "",
          marry: "",
          description: "",
          packstickers: null,
          premium: false,
          premiumTime: 0,
          banned: false,
          bannedReason: "",
          commands: 0,
          afk: -1,
          afkReason: "",
          warn: 0,
          lang: ""
        }
      }

      // Chat Database Initialization
      let chat = global.db.data.chats[m.chat]
      if (typeof chat !== "object") global.db.data.chats[m.chat] = {}
      if (chat) {
        if (!("isBanned" in chat)) chat.isBanned = false
        if (!("isMute" in chat)) chat.isMute = false
        if (!("welcome" in chat)) chat.welcome = false
        if (!("sWelcome" in chat)) chat.sWelcome = ""
        if (!("sBye" in chat)) chat.sBye = ""
        if (!("detect" in chat)) chat.detect = true
        if (!("primaryBot" in chat)) chat.primaryBot = null
        if (!("modoadmin" in chat)) chat.modoadmin = false
        if (!("antiLink" in chat)) chat.antiLink = true
        if (!("nsfw" in chat)) chat.nsfw = false
        if (!("economy" in chat)) chat.economy = true
        if (!("gacha" in chat)) chat.gacha = true
        if (!("reaction" in chat)) chat.reaction = true
      } else {
        global.db.data.chats[m.chat] = {
          isBanned: false,
          isMute: false,
          welcome: false,
          sWelcome: "",
          sBye: "",
          detect: true,
          primaryBot: null,
          modoadmin: false,
          antiLink: true,
          nsfw: false,
          economy: true,
          gacha: true,
          reaction: true
        }
      }

      // Settings Database Initialization
      let settings = global.db.data.settings[this.user.jid]
      if (typeof settings !== "object") global.db.data.settings[this.user.jid] = {}
      if (settings) {
        if (!("self" in settings)) settings.self = false
        if (!("jadibotmd" in settings)) settings.jadibotmd = true
      } else {
        global.db.data.settings[this.user.jid] = {
          self: false,
          jadibotmd: true
        }
      }
    } catch (e) {
      console.error(e)
    }

    if (typeof m.text !== "string") m.text = ""
    const user = global.db.data.users[m.sender]
    
    try {
      const actual = user.name || ""
      const nuevo = m.pushName || await this.getName(m.sender)
      if (typeof nuevo === "string" && nuevo.trim() && nuevo !== actual) {
        user.name = nuevo
      }
    } catch {}

    const chat = global.db.data.chats[m.chat]
    const settings = global.db.data.settings[this.user.jid]  
    
    // تحويل العناصر إلى نصوص بشكل آمن
    // نطابق عبر aliases (رقم الهاتف <-> الـ LID) حتى لا يفشل التعرف على
    // المطور عندما لا يظهر إلا الـ LID، ويفشل بأمان إذا لم يُحل المعرّف.
    const isROwner = matchesAny(m.sender, global.owner || [])

    const isOwner = isROwner

    const isPrems = isROwner || matchesAny(m.sender, global.prems || []) || user.premium

    const opts = global.opts || {}
    if (opts["queque"] && m.text && !isPrems) {
      const queque = this.msgqueque, time = 1000 * 5
      const previousID = queque[queque.length - 1]
      queque.push(m.id || m.key.id)
      setInterval(async function () {
        if (queque.indexOf(previousID) === -1) clearInterval(this)
        await delay(time)
      }, time)
    }

    if (m.isBaileys) return
    m.exp += Math.ceil(Math.random() * 10)

    // ⭐⭐⭐⭐⭐ Auto Reaction Feature on Bot Mention ⭐⭐⭐⭐⭐
    if (typeof m.text === 'string' && m.text && !m.fromMe) {
        if (chat?.reaction !== false && 
            m.text.match(/(بوت|يوريتشي|كينيسيا|سونغ|ساسكي|هلا|bot|كيفك|البوت|احا|كيفك|اهلا|خرا|تست|عمي|موجود|شغال|هنا|gay|ملون|جي)/gi)) {
            
            let emot = pickRandom([
                "🍟", "😃", "😄", "😁", "😆", "🍓", "😅", "😂", "🤣", "🥲", "☺️", "😊", "😇", "🙂", "🙃", "😉", 
                "😌", "😍", "🥰", "😘", "😗", "😙", "🌺", "🌸", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🌟", 
                "🤓", "😎", "🥸", "🤩", "🥳", "😏", "💫", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", 
                "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😶‍🌫️", "😱", "😨", "😰", 
                "😥", "😓", "🤗", "🤔", "🫣", "🤭", "🤖", "🍭", "🤫", "🫠", "🤥", "😶", "📇", "😐", "💧", "😑", 
                "🫨", "😬", "🙄", "😯", "😦", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😮‍💨", "😵", "😵‍💫", "🤐", 
                "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕", "🤑", "🤠", "😈", "👿", "👺", "🧿", "🌩", "👻", "😺", 
                "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾", "🫶", "👍", "✌️", "🙏", "🫵", "🤏", "🤌", "☝️", 
                "🖕", "🫂", "🐱", "🤹‍♀️", "🤹‍♂️", "🗿", "✨", "⚡", "🔥", "🌈", "🩷", "❤️", "🧡", "💛", "💚", "🩵", 
                "💙", "💜", "🖤", "🩶", "🤍", "🤎", "💔", "❤️‍🔥", "❤️‍🩹", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", 
                "💝", "🚩", "👊", "⚡️", "💋", "🫰", "💅", "👑", "🐣", "🐤", "🐈"
            ])
            await m.react(emot)
        }
    }

    let usedPrefix
    const groupMetadata = m.isGroup ? { ...(this.chats?.[m.chat]?.metadata || await this.groupMetadata(m.chat).catch(_ => null) || {}) } : {}
    const participants = (m.isGroup ? groupMetadata.participants : []) || []
    // سجّل مرادفات هوية كل عضو (id/jid/lid) لتفادي فشل المطابقة بسبب LID.
    for (const p of participants) learnIdentity(p, p?.id, p?.jid, p?.lid)
    const userGroup = (m.isGroup ? participants.find((u) => sameIdentity(this.decodeJid(u.id || u.jid || u.lid), m.sender)) : {}) || {}
    const botGroup = (m.isGroup ? participants.find((u) => sameIdentity(this.decodeJid(u.id || u.jid || u.lid), this.user.jid)) : {}) || {}
    
    const isRAdmin = userGroup?.admin === "superadmin"
    const isAdmin = isRAdmin || userGroup?.admin === "admin"
    const isBotAdmin = !!botGroup?.admin

    const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), "./plugins")
    
    for (const name in global.plugins) {
      const plugin = global.plugins[name]
      if (!plugin || plugin.disabled) continue
      
      const __filename = join(___dirname, name)
      if (typeof plugin.all === "function") {
        try {
          await plugin.all.call(this, m, {
            chatUpdate,
            __dirname: ___dirname,
            __filename,
            user,
            chat,
            settings
          })
        } catch (err) {
          console.error(err)
        }
      }

      if (!opts["restrict"] && plugin.tags && plugin.tags.includes("admin")) {
        continue
      }

      // Safe Regex Prefix Matching
      const strRegex = (str) => str.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&")
      const pluginPrefix = plugin.customPrefix || this.prefix || global.prefix
      
      let match = null;
      if (pluginPrefix instanceof RegExp) {
        match = [[pluginPrefix.exec(m.text), pluginPrefix]]
      } else if (Array.isArray(pluginPrefix)) {
        match = pluginPrefix.map(p => {
          const re = p instanceof RegExp ? p : new RegExp(strRegex(p))
          return [re.exec(m.text), re]
        })
      } else if (typeof pluginPrefix === "string") {
        const re = new RegExp(strRegex(pluginPrefix))
        match = [[re.exec(m.text), re]]
      } else {
        // 🔥 التعديل المهم هنا: البادئات الافتراضية المسموح بها فقط
        const defaultPrefix = /^[\/#!.]/
        match = [[defaultPrefix.exec(m.text), defaultPrefix]]
      }

      const foundMatch = match.find(p => p && p[0])

      if (typeof plugin.before === "function") {
        if (await plugin.before.call(this, m, {
          match: foundMatch,
          conn: this,
          participants,
          groupMetadata,
          userGroup,
          botGroup,
          isROwner,
          isOwner,
          isRAdmin,
          isAdmin,
          isBotAdmin,
          isPrems,
          chatUpdate,
          __dirname: ___dirname,
          __filename,
          user,
          chat,
          settings
        })) {
          continue
        }
      }

      if (typeof plugin !== "function" && typeof plugin.run !== "function") {
        continue
      }

      // 🔥 التأكد من وجود بادئة صحيحة قبل تنفيذه كأمر
      if (!foundMatch || !foundMatch[0]) {
        continue
      }

      usedPrefix = (foundMatch?.[0] || "")[0] || ""
      const noPrefix = m.text.replace(usedPrefix, "")
      let [command, ...args] = noPrefix.trim().split(" ").filter(v => v)
      args = args || []
      let _args = noPrefix.trim().split(" ").slice(1)
      let text = _args.join(" ")
      command = (command || "").toLowerCase()
      
      const fail = plugin.fail || global.dfail
      const isAccept = plugin.command instanceof RegExp ?
        plugin.command.test(command) :
        Array.isArray(plugin.command) ?
          plugin.command.some(cmd => cmd instanceof RegExp ? cmd.test(command) : cmd === command) :
          typeof plugin.command === "string" ?
            plugin.command === command : false

      global.comando = command

      if (settings?.self && !isROwner) return
      if ((m.id?.startsWith("NJX-") || (m.id?.startsWith("BAE5") && m.id?.length === 16) || (m.id?.startsWith("B24E") && m.id?.length === 20))) return

      // Primary Bot Handling
      if (chat?.primaryBot && chat.primaryBot !== this.user.jid) {
        const primaryBotConn = global.conns?.find(conn => conn.user?.jid === chat.primaryBot && conn.ws?.socket && conn.ws.socket.readyState !== ws.CLOSED)
        const primaryBotInGroup = participants.some(p => (p.id || p.jid) === chat.primaryBot)
        if (primaryBotConn && primaryBotInGroup) {
          return
        } else {
          chat.primaryBot = null
        }
      }

      if (!isAccept) continue
      m.plugin = name
      user.commands = (user.commands || 0) + 1

      // Group Banned & User Banned Checking
      if (chat) {
        const botId = this.user.jid
        const primaryBotId = chat.primaryBot
        
        if (name !== "group-banchat.js" && chat?.isBanned && !isROwner) {
          if (!primaryBotId || primaryBotId === botId) {
            fail("chatBanned", m, this)
            return
          }
        }
        if (m.text && user.banned && !isROwner) {
          if (!primaryBotId || primaryBotId === botId) {
            fail("banned", m, this, user.bannedReason)
            return
          }
        }
      }

      const adminMode = chat?.modoadmin || false
      if (adminMode && !isOwner && m.isGroup && !isAdmin) {
        fail("adminMode", m, this)
        return
      }

      if (plugin.rowner && plugin.owner && !(isROwner || isOwner)) {
        fail("owner", m, this)
        continue
      }
      if (plugin.rowner && !isROwner) {
        fail("rowner", m, this)
        continue
      }
      if (plugin.owner && !isOwner) {
        fail("owner", m, this)
        continue
      }
      if (plugin.premium && !isPrems) {
        fail("premium", m, this)
        continue
      }
      if (plugin.group && !m.isGroup) {
        fail("group", m, this)
        continue
      } else if (plugin.botAdmin && !isBotAdmin) {
        fail("botAdmin", m, this)
        continue
      } else if (plugin.admin && !isAdmin) {
        fail("admin", m, this)
        continue
      }
      if (plugin.private && m.isGroup) {
        fail("private", m, this)
        continue
      }

      m.isCommand = true
      m.exp += plugin.exp ? parseInt(plugin.exp) : 10
      
      let extra = {
        match: foundMatch,
        usedPrefix,
        noPrefix,
        _args,
        args,
        command,
        text,
        conn: this,
        participants,
        groupMetadata,
        userGroup,
        botGroup,
        isROwner,
        isOwner,
        isRAdmin,
        isAdmin,
        isBotAdmin,
        isPrems,
        chatUpdate,
        __dirname: ___dirname,
        __filename,
        user,
        chat,
        settings
      }

      try {
        const runFn = typeof plugin === "function" ? plugin : plugin.run
        await runFn.call(this, m, extra)
      } catch (err) {
        m.error = err
        console.error(err)
        fail("error", m, this, err?.message || err)
      } finally {
        if (typeof plugin.after === "function") {
          try {
            await plugin.after.call(this, m, extra)
          } catch (err) {
            console.error(err)
          }
        }
      }
    }
  } catch (err) {
    console.error(err)
  } finally {
    if (opts["queque"] && m?.text) {
      const quequeIndex = this.msgqueque.indexOf(m.id || m.key?.id)
      if (quequeIndex !== -1) this.msgqueque.splice(quequeIndex, 1)
    }
    
    if (m && m.sender && global.db?.data?.users?.[m.sender]) {
      global.db.data.users[m.sender].exp = (global.db.data.users[m.sender].exp || 0) + (m.exp || 0)
    }

    try {
      if (!opts["noprint"]) await (await import("./lib/print.js")).default(m, this)
    } catch (err) {
      console.warn(err)
    }
  }
}

// Global Fail Handler with beautiful Arabic design
global.dfail = (type, m, conn, reason = "") => {
  const rcanal = global.rcanal || {}

  const styles = {
    rowner: `*~⌝˼‏※⪤˹͟͞≽━⌯⧽°⸂◞✘◜⸃°⧼⌯━≼˹͟͞⪤※˹⌞~*\n> *「⸂♤┊⪼•◈˼‏هذا الأمر خاص بالمطور فقط◈」*\n*~⌝˼‏※⪤˹͟͞≽━⌯⧽°⸂◞✘◜⸃°⧼⌯━≼˹͟͞⪤※˹⌞~*`,
    owner: `*~⌝˼‏※⪤˹͟͞≽━⌯⧽°⸂◞✘◜⸃°⧼⌯━≼˹͟͞⪤※˹⌞~*\n> *「⸂♤┊⪼•◈˼‏هذا الأمر خاص بالمطور فقط◈」*\n*~⌝˼‏※⪤˹͟͞≽━⌯⧽°⸂◞✘◜⸃°⧼⌯━≼˹͟͞⪤※˹⌞~*`,
    mods: `\n◉━━━━━━✦━━━━━━◉\n┃ ☁️ الأمر *${comando}* يمكن استخدامه من قِبل المشرفين فقط.\n◉━━━━━━✦━━━━━━◉`,
    premium: `\n◉━━━━━━✦━━━━━━◉\n┃ 💎 هذا الأمر مخصص فقط لمستخدمي النسخة المميزة\n◉━━━━━━✦━━━━━━◉`,
    group: `\n◉━━━━━━✦━━━━━━◉\n┃ 🏮 الأمر *${comando}* يعمل فقط داخل المجموعات\n◉━━━━━━✦━━━━━━◉`,
    private: `\n◉━━━━━━✦━━━━━━◉\n┃ 📜 الأمر *${comando}* متاح فقط في الخاص.\n◉━━━━━━✦━━━━━━◉`,
    admin: `*~⌝˼‏※⪤˹͟͞≽━⌯⧽°⸂◞⚔️◜⸃°⧼⌯━≼˹͟͞⪤※˹⌞~*\n> *「⸂♤┊⪼• ◈˼‏هذا الأمر خاص بمشرفي المجموعة◈」*\n*~⌝˼‏※⪤˹͟͞≽━⌯⧽°⸂◞⚔️◜⸃°⧼⌯━≼˹͟͞⪤※˹⌞~*`,
    botAdmin: `\n◉━━━━━━✦━━━━━━◉\n┃ 😠 يجب أن أكون مشرفاً لتنفيذ الأمر *${comando}*!\n◉━━━━━━✦━━━━━━◉`,
    unreg: `⎔⋅• ━ ╼╃ ⌬〔🍁〕⌬ ╄╾ ━ •⋅⎔\n║ (｡•́︿•̀｡) يجب تسجيل حسابك أولاً\n║ استخدم: #تسجيل الاسم.العمر\n⎔⋅• ━ ╼╃ ⌬〔🇲‏🇦〕⌬ ╄╾ ━ •⋅⎔`,
    channel: `⎔⋅• ━ ╼╃ ⌬〔🍁〕⌬ ╄╾ ━ •⋅⎔\n║ 🍷 هذا الأمر متاح فقط في القنوات.\n⎔⋅• ━ ╼╃ ⌬〔🚫〕⌬ ╄╾ ━ •⋅⎔`,
    restrict: `\n◉━━━━━━✦━━━━━━◉\n┃ 🚫 هذا الأمر معطل من قبل المطور.\n◉━━━━━━✦━━━━━━◉`
  }

  const msg = styles[type] || styles.error
  const reasonText = reason ? `\n\n*السبب:* ${reason}` : ""

  if (m && m.chat) {
    conn.reply(m.chat, msg + reasonText, m, rcanal).then(_ => m.react?.("✖️")).catch(() => {
      conn.sendMessage(m.chat, { text: msg + reasonText }, { quoted: m })
    })
  }
}

let file = global.__filename ? global.__filename(import.meta.url, true) : fileURLToPath(import.meta.url)
watchFile(file, async () => {
  unwatchFile(file)
  console.log(chalk.magenta("Updated 'handler.js'"))
  if (global.reloadHandler) console.log(await global.reloadHandler())
})
