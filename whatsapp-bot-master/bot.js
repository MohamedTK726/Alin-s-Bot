/* Copyright (C) 2020 MohamedTawfik.

Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.

Alin - Yusuf Usta
*/
const fs = require("fs")
const path = require("path")
const { handleMessages } = require("./Utilis/msg")
const chalk = require("chalk")
const { DataTypes } = require("sequelize")
const config = require("./config")
const { WAConnection, MessageType } = require("@adiwajshing/baileys")
const { StringSession } = require("./Utilis/whatsasena")
const { getJson } = require("./Utilis/download")
const { customMessageScheduler } = require("./Utilis/schedule")
const { prepareGreetingMedia } = require("./Utilis/greetings")
const { groupMuteSchuler, groupUnmuteSchuler } = require("./Utilis/groupmute")
const { PluginDB } = require("./plugins/sql/plugin")
const Jimp = require("jimp")

// Sql
const got = require("got")
const { startMessage, waWebVersion } = require("./Utilis/Misc")
const WhatsAsenaDB = config.DATABASE.define("WhatsAsena", {
  info: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
})

fs.readdirSync("./plugins/sql/").forEach((plugin) => {
  if (path.extname(plugin).toLowerCase() == ".js") {
    require("./plugins/sql/" + plugin)
  }
})

// Yalnızca bir kolaylık. https://stackoverflow.com/questions/4974238/javascript-equivalent-of-pythons-format-function //
String.prototype.format = function () {
  var i = 0,
    args = arguments
  return this.replace(/{}/g, function () {
    return typeof args[i] != "undefined" ? args[i++] : ""
  })
}

if (!Date.now) {
  Date.now = function () {
    return new Date().getTime()
  }
}

Array.prototype.remove = function () {
  var what,
    a = arguments,
    L = a.length,
    ax
  while (L && this.length) {
    what = a[--L]
    while ((ax = this.indexOf(what)) !== -1) {
      this.splice(ax, 1)
    }
  }
  return this
}

function getRawText(message) {
  const content = message && message.message
  if (!content) return ""
  return (
    content.conversation ||
    (content.extendedTextMessage && content.extendedTextMessage.text) ||
    (content.imageMessage && content.imageMessage.caption) ||
    (content.videoMessage && content.videoMessage.caption) ||
    ""
  )
}

function setRawText(message, text) {
  if (!message || !message.message) return
  if (message.message.conversation !== undefined) {
    message.message.conversation = text
  } else if (message.message.extendedTextMessage) {
    message.message.extendedTextMessage.text = text
  } else if (message.message.imageMessage) {
    message.message.imageMessage.caption = text
  } else if (message.message.videoMessage) {
    message.message.videoMessage.caption = text
  }
}

function getPrefix(text) {
  const handler = config.HANDLERS || "^[.]"
  const regexPrefix = handler.match(/^\^\[([^\]]+)\]/)
  if (regexPrefix) return regexPrefix[1][0]
  return handler[0] === "^" ? handler[1] : handler[0]
}

function levenshtein(left, right) {
  const row = Array.from({ length: right.length + 1 }, (_, i) => i)
  for (let i = 1; i <= left.length; i++) {
    let previous = row[0]
    row[0] = i
    for (let j = 1; j <= right.length; j++) {
      const current = row[j]
      row[j] =
        left[i - 1] === right[j - 1]
          ? previous
          : Math.min(previous + 1, row[j - 1] + 1, current + 1)
      previous = current
    }
  }
  return row[right.length]
}

function closestCommand(command) {
  let closest = ""
  let distance = Number.MAX_SAFE_INTEGER
  for (const candidate of config.COMMAND_NAMES) {
    const score = levenshtein(command.toLowerCase(), candidate)
    if (score < distance) {
      closest = candidate
      distance = score
    }
  }
  const threshold = Math.max(2, Math.floor(command.length / 2))
  return distance <= threshold ? closest : null
}

async function handleCommandHelp(rawMessage, conn) {
  const text = getRawText(rawMessage)
  const prefix = getPrefix(text)
  if (!text || !prefix || !text.startsWith(prefix)) return false

  const body = text.slice(prefix.length).trim()
  const jid = rawMessage.key && rawMessage.key.remoteJid
  if (!jid) return false
  if (!body) {
    await conn.sendMessage(jid, config.EMPTY_COMMAND_MESSAGE, MessageType.text)
    return true
  }

  const parts = body.split(/\s+/)
  const typedCommand = parts.shift().toLowerCase()
  const arabicAlias = config.COMMAND_ALIASES[typedCommand]
  const command = arabicAlias || typedCommand
  if (arabicAlias) {
    setRawText(rawMessage, `${prefix}${command}${parts.length ? ` ${parts.join(" ")}` : ""}`)
    return false
  }

  if (config.COMMAND_NAMES.includes(command)) return false
  const suggestion = closestCommand(command)
  const response = suggestion
    ? config.UNKNOWN_COMMAND_MESSAGE.format(command, `${prefix}${suggestion}`)
    : config.NO_CLOSE_COMMAND_MESSAGE.format(command)
  await conn.sendMessage(jid, response, MessageType.text)
  return true
}

function cleanJid(jid) {
  return (jid || "").split("@")[0].split(":")[0]
}

async function makeWelcomeCard(conn, groupJid, groupName) {
  const card = await new Jimp(900, 500, 0xff171827)
  try {
    const pictureUrl = await conn.getProfilePicture(groupJid)
    if (pictureUrl) {
      const picture = await Jimp.read(await got(pictureUrl).buffer())
      picture.cover(900, 500)
      card.composite(picture, 0, 0)
    }
  } catch (error) {
    console.log("تعذر تحميل صورة الجروب، هستخدم كارت ترحيب عادي 🫠")
  }

  const shade = await new Jimp(900, 190, 0xcc10101f)
  card.composite(shade, 0, 310)
  try {
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE)
    card.print(
      font,
      30,
      330,
      {
        text: `👽 ${config.BOT_NAME} دخل ${groupName || "الجروب"} 🔥`,
        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
        alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
      },
      840,
      120
    )
  } catch (error) {
    // The caption below remains the readable source of the welcome message.
  }
  return card.getBufferAsync(Jimp.MIME_JPEG)
}

async function welcomeWhenBotJoins(update, conn) {
  if (!update || update.action !== "add" || !Array.isArray(update.participants))
    return
  const botNumber = cleanJid(conn.user && conn.user.jid)
  if (!update.participants.some((participant) => cleanJid(participant) === botNumber))
    return

  try {
    const metadata = await conn.groupMetadata(update.jid)
    const admins = (metadata.participants || []).filter(
      (participant) => participant.isAdmin || participant.isSuperAdmin
    )
    const adminJids = admins.map((participant) => participant.jid)
    const adminNames = admins.length
      ? admins.map((participant) => `@${cleanJid(participant.jid)}`).join("، ")
      : "لسه محدش ماسكها 😼"
    const caption = `╭━━━〔 ${config.BOT_NAME} 👽 〕━━━╮
┃ يا أهلًا يا أهلًا! دخلت أهو ومتقلقوش، هبقى مؤدب... غالبًا 🫠
┃
┃ 🏠 الجروب: ${metadata.subject || "من غير اسم"}
┃ 🔥 النسخة: ${config.VERSION}
┃ 🧑‍💻 المطور: ${config.OWNER_NAME}
┃ 📞 رقم المطور: +${config.OWNER_NUMBER}
┃ 👮 المشرفين: ${adminNames}
┃
┃ اكتبوا ${getPrefix(".")}help عشان تشوفوا الأوامر.
╰━━━━━━━━━━━━━━━━━━━━╯
🤍 نورتوني يا جماعة، واللي يكسر القواعد هزاره على نفسه 😾`
    const image = await makeWelcomeCard(conn, update.jid, metadata.subject)
    await conn.sendMessage(update.jid, image, MessageType.image, {
      caption,
      contextInfo: { mentionedJid: adminJids },
    })
  } catch (error) {
    console.log(`رسالة ترحيب الجروب فشلت: ${error.message}`)
  }
}

async function whatsAsena(version) {
  await config.DATABASE.sync()
  let StrSes_Db = await WhatsAsenaDB.findAll({
    where: {
      info: "StringSession",
    },
  })
  const conn = new WAConnection()
  conn.version = version
  const Session = new StringSession()
  conn.logger.level = config.DEBUG ? "debug" : "warn"
  var nodb

  if (StrSes_Db.length < 1 || config.CLR_SESSION) {
    nodb = true
    conn.loadAuthInfo(Session.deCrypt(config.SESSION))
  } else {
    conn.loadAuthInfo(Session.deCrypt(StrSes_Db[0].dataValues.value))
  }

  conn.on("connecting", () => {
    console.log(`${chalk.red.bgBlack("A")}${chalk.green.bgBlack(
      "o"
    )}${chalk.blue.bgBlack("t")}${chalk.yellow.bgBlack(
      "t"
    )}${chalk.white.bgBlack("u")}${chalk.magenta.bgBlack("s")}
${chalk.white.bold.bgBlack("الإصدار:")} ${chalk.red.bold.bgBlack(
      config.VERSION
    )}
${chalk.blue.italic.bgBlack("ℹ️ Alin بيتصل بواتساب... استنى يا نجم.")}`)
  })
  conn.on("open", async () => {
    console.log(chalk.green.bold("✅ تسجيل الدخول تم!"))
    console.log(chalk.blueBright.italic("⬇️ بثبت الإضافات الخارجية..."))
    console.log(chalk.blueBright.italic("✅ بيانات الدخول اتحدثت!"))

    const authInfo = conn.base64EncodedAuthInfo()
    if (StrSes_Db.length < 1) {
      await WhatsAsenaDB.create({
        info: "StringSession",
        value: Session.createStringSession(authInfo),
      })
    } else {
      await StrSes_Db[0].update({
        value: Session.createStringSession(authInfo),
      })
    }

    let plugins = await PluginDB.findAll()
    plugins.map(async (plugin) => {
      try {
        if (!fs.existsSync("./plugins/" + plugin.dataValues.name + ".js")) {
          console.log(plugin.dataValues.name)
          let response = await got(plugin.dataValues.url)
          if (response.statusCode == 200) {
            fs.writeFileSync(
              "./plugins/" + plugin.dataValues.name + ".js",
              response.body
            )
            require("./plugins/" + plugin.dataValues.name + ".js")
          }
        }
      } catch (error) {
        console.log(
          `failed to load external plugin : ${plugin.dataValues.name}`
        )
      }
    })
    console.log(chalk.blueBright.italic("⬇️  بثبت الإضافات..."))

    fs.readdirSync("./plugins").forEach((plugin) => {
      if (path.extname(plugin).toLowerCase() == ".js") {
        require("./plugins/" + plugin)
      }
    })

    console.log(chalk.green.bold("✅ الإضافات اتثبتت!"))
    await conn.sendMessage(
      conn.user.jid,
      await startMessage(),
      MessageType.text,
      { detectLinks: false }
    )
  })
  conn.on("close", (e) => console.log(e.reason))
  conn.on("group-participants-update", (update) =>
    welcomeWhenBotJoins(update, conn)
  )

  await groupMuteSchuler(conn)
  await groupUnmuteSchuler(conn)
  await customMessageScheduler(conn)

  conn.on("chat-update", (m) => {
    if (!m.hasNewMessage) return
    if (!m.messages && !m.count) return
    const { messages } = m
    const all = messages.all()
    const rawMessage = all[0]
    handleCommandHelp(rawMessage, conn).then((handled) => {
      if (!handled) handleMessages(rawMessage, conn)
    })
  })

  try {
    await conn.connect()
  } catch (e) {
    if (!nodb) {
      console.log(chalk.red.bold("جلسة واتساب قديمة، بجددها..."))
      conn.loadAuthInfo(Session.deCrypt(config.SESSION))
      try {
        await conn.connect()
      } catch (e) {
        return
      }
    } else console.log(`${e.message}`)
  }
}

;(async () => {
  await prepareGreetingMedia()
  whatsAsena(await waWebVersion())
})()
