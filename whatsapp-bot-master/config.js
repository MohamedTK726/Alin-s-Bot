/* Copyright (C) 2020 Yusuf Usta.

Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.

WhatsAsena - Yusuf Usta
*/

const { Sequelize } = require("sequelize")
const fs = require("fs")
if (fs.existsSync("config.env"))
  require("dotenv").config({ path: "./config.env" })

// Özel Fonksiyonlarımız
function convertToBool(text, fault = "true") {
  return text === fault ? true : false
}

DATABASE_URL =
  process.env.DATABASE_URL === undefined
    ? "./whatsasena.db"
    : process.env.DATABASE_URL
DEBUG =
  process.env.DEBUG === undefined ? false : convertToBool(process.env.DEBUG)

module.exports = {
  BOT_NAME: process.env.BOT_NAME === undefined ? "Alin" : process.env.BOT_NAME,
  OWNER_NAME:
    process.env.OWNER_NAME === undefined ? "محمد توفيق" : process.env.OWNER_NAME,
  OWNER_NUMBER:
    process.env.OWNER_NUMBER === undefined
      ? "201005560325"
      : process.env.OWNER_NUMBER.replace(/[^\d]/g, ""),
  VERSION: "v1.2.8",
  SESSION:
    process.env.ASENA_SESSION === undefined ? "" : process.env.ASENA_SESSION,
  EXT: process.env.EXT === undefined ? undefined : process.env.EXT,
  LANG:
    process.env.LANGUAGE === undefined
      ? "EN"
      : process.env.LANGUAGE.toUpperCase(),
  HANDLERS: process.env.HANDLERS === undefined ? "^[.]" : process.env.HANDLERS,
  SEND_READ:
    process.env.SEND_READ === undefined
      ? false
      : convertToBool(process.env.SEND_READ),
  BRANCH: "master",
  HEROKU: {
    HEROKU:
      process.env.HEROKU === undefined
        ? false
        : convertToBool(process.env.HEROKU),
    API_KEY:
      process.env.HEROKU_API_KEY === undefined
        ? ""
        : process.env.HEROKU_API_KEY,
    APP_NAME:
      process.env.HEROKU_APP_NAME === undefined
        ? ""
        : process.env.HEROKU_APP_NAME,
  },
  DATABASE_URL: DATABASE_URL,
  DATABASE:
    DATABASE_URL === "./whatsasena.db"
      ? new Sequelize({
          dialect: "sqlite",
          storage: DATABASE_URL,
          logging: DEBUG,
        })
      : new Sequelize(DATABASE_URL, {
          host: "xxxxxx.eu-west-1.compute.amazonaws.com",
          dialect: "postgres",
          ssl: true,
          protocol: "postgres",
          logging: DEBUG,
          dialectOptions: {
            native: true,
            ssl: { require: true, rejectUnauthorized: false },
          },
        }),
  NO_ONLINE:
    process.env.NO_ONLINE === undefined
      ? true
      : convertToBool(process.env.NO_ONLINE),
  CLR_SESSION:
    process.env.CLR_SESSION === undefined
      ? false
      : convertToBool(process.env.CLR_SESSION),
  SUDO:
    process.env.SUDO === undefined
      ? "201005560325"
      : process.env.SUDO.replace(/[^\d,]/g, ""),
  EMPTY_COMMAND_MESSAGE:
    "يا معلم اكتب الأمر بعد البادئة، متخلّينيش أخمّن 🫠\nمثال: .help أو .مساعدة",
  UNKNOWN_COMMAND_MESSAGE:
    "الأمر «{}» مش موجود عندي 😾\nهل تقصد «{}»؟ جرّبه كده يا بطل 🔥",
  NO_CLOSE_COMMAND_MESSAGE:
    "مش لاقي أمر قريب من «{}» يا نجم 🤡\nاكتب .help عشان تشوف اللي أقدر أعمله.",
  COMMAND_ALIASES: {
    مساعدة: "help",
    اوامر: "list",
    قائمة: "list",
    بنج: "ping",
    رمز: "qr",
    جدولة: "schedule",
    طرد: "kick",
    اضافة: "add",
    إضافة: "add",
    ترقية: "promote",
    خفض: "demote",
    كتم: "mute",
    فك_الكتم: "unmute",
    دعوة: "invite",
    مشترك: "common",
    مختلف: "diff",
    انضمام: "join",
    الغاء_الرابط: "revoke",
    مغادرة: "left",
    منشن: "mention",
    نوم: "afk",
    ترحيب: "welcome",
    وداع: "goodbye",
    بانباي: "banbye",
    ضد_الروابط: "antilink",
    ضد_التزييف: "antifake",
    ضد_الشتائم: "antibad",
    تلقائي: "automute",
    تلقائي_فتح: "autoumute",
    اعادة_تشغيل: "restart",
    إيقاف: "shutdown",
    حالة: "alive",
    احصائيات: "sysd",
    تحذير: "warn",
    تاج: "tag",
    رسائل: "msgs",
    تصويت: "vote",
    تيك_توك: "tiktok",
    فيلم: "movie",
    تويتر: "twitter",
    بنترست: "pinterest",
    ميديافاير: "mediafire",
    انستجرام: "insta",
    قصة: "story",
    فيسبوك: "fb",
    ملصق: "sticker",
    فيديو: "video",
    صوت: "song",
    بحث: "yts",
    ويكيبيديا: "wiki",
    صورة: "img",
    طقس: "weather",
    يوتيوب: "ytv",
    صوت_يوتيوب: "yta",
    جوجل: "google",
    رفع: "upload",
    لقطة: "ss",
    ايموجي: "emoji",
    تحويل: "trt",
    نص_لصوت: "tts",
    خلفية: "wallpaper",
    رابط: "url",
    ميم: "meme",
    نص: "txt",
    خلفية_شفافة: "removebg",
    صورة_شخصية: "pp",
    رقم: "jid",
    معلومات: "whois",
    ضغط: "compress",
    عكس: "reverse",
    قص: "cut",
    قص_فيديو: "trim",
    بيانو: "low",
    نغمة: "pitch",
    اضافة_صفحة: "page",
    تحويل_بي_دي_اف: "pdf",
    اضافة_فلتر: "filter",
    حذف_فلتر: "stop",
    تحديث: "update",
    ليديا: "lydia",
    إضافة_إضافة: "plugin",
    حذف_إضافة: "remove",
    إظهار_المشترك: "common",
    إظهار_المختلف: "diff",
    إلغاء: "revoke",
    طردني: "pdm",
    بي_دي_اف: "topdf",
    ضايع: "wasted",
    مهمة: "mission",
    سجن: "jail",
    متأثر: "trigged",
    اقرأ_المزيد: "readmore",
    بث: "broadcast",
    تطبيق: "apk",
    ستايل: "fancy",
    جمجمة: "skull",
    اسكتش: "sketch",
    قلم: "pencil",
    ألوان: "color",
    بوسة: "kiss",
    بوكيه: "bokeh",
    مطلوب: "wanted",
    دراما: "look",
    جوكر: "dark",
    مكياج: "makeup",
    كرتون: "cartoon",
    محرر: "editor",
    تدوير: "rotate",
    ام_بي_ثري: "mp3",
    صورة_ملصق: "photo",
    صفحة: "page",
    دمج: "merge",
    باس: "bass",
    تريبل: "treble",
    هيستوجرام: "histo",
    فيكتور: "vector",
    اقتصاص: "crop",
    ايه_في: "avec",
    فلاتر: "filter",
    نيكو: "neko",
    ستوري: "story",
    معرفات: "getjids",
    حظر: "block",
    فك_حظر: "unblock",
    الحالة: "setstatus",
    نبذة: "setabout",
    أخبار: "news",
    بحث_جوجل: "google",
    نقاط: "score",
    خلفية_متحركة: "attp",
    صوت_ساوندكلاود: "scl",
    تعرف_الأغنية: "find",
    إعادة_توجيه: "forward",
    رسالة_مباشرة: "url",
    معلومات_الجروب: "whois",
    غير_النشطين: "inactive",
    رسائل_الجروب: "msgs",
    متغيرات: "allvar",
    إعادة_فحص: "update",
  },
  COMMAND_NAMES: [
    "list", "help", "lydia", "plugin", "remove", "kick", "add", "promote",
    "demote", "mute", "unmute", "invite", "common", "diff", "join", "revoke",
    "pdm", "afk", "topdf", "wasted", "mission", "jail", "trigged", "readmore",
    "broadcast", "apk", "strs", "tictactoe", "fancy", "skull", "sketch",
    "pencil", "color", "kiss", "bokeh", "wanted", "look", "gandm", "dark",
    "makeup", "cartoon", "editor", "filter", "stop", "welcome", "goodbye",
    "banbye", "antilink", "antifake", "antibad", "mention", "automute",
    "autoumute", "restart", "shutdown", "dyno", "setvar", "delvar", "getvar",
    "allvar", "insta", "story", "fb", "rotate", "mp3", "photo", "reverse",
    "cut", "trim", "page", "pdf", "merge", "compress", "bass", "treble",
    "histo", "vector", "crop", "low", "pitch", "avec", "avm", "black", "meme",
    "neko", "txt", "left", "getjids", "pp", "block", "unblock", "jid",
    "setstatus", "setabout", "removebg", "trt", "tts", "song", "video", "yts",
    "wiki", "img", "news", "sticker", "mp4", "take", "alive", "sysd", "warn",
    "tag", "msgs", "inactive", "vote", "tiktok", "movie", "forward", "wallpaper",
    "url", "twitter", "pinterest", "mediafire", "whois", "upload", "scl", "emoji",
    "ss", "find", "attp", "weather", "ytv", "yta", "google", "score", "ping",
    "qr", "schedule",
  ],
  DEBUG: DEBUG,
  REMOVEBG:
    process.env.REMOVEBG_KEY === undefined ? "false" : process.env.REMOVEBG_KEY,
  WARN_COUNT: process.env.WARN_COUNT === undefined ? 3 : process.env.WARN_COUNT,
  WARN_MSG:
    process.env.WARN_MSG === undefined ? "Ok bie" : process.env.WARN_MSG,
  ANTIJID: process.env.ANTIJID === undefined ? "" : process.env.ANTIJID,
  STICKER_PACKNAME:
    process.env.STICKER_PACKNAME === undefined
      ? "🥰,lyfe00011"
      : process.env.STICKER_PACKNAME,
  BRAINSHOP:
    process.env.BRAINSHOP === undefined
      ? "159501,6pq8dPiYt7PdqHz3"
      : process.env.BRAINSHOP,
  DIS_BOT:
    process.env.DISABLE_BOT === undefined ? "null" : process.env.DISABLE_BOT,
  FIND_API_KEY:
    process.env.FIND_API_KEY === undefined
      ? "null"
      : process.env.FIND_API_KEY,
}
