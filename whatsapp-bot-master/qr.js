/* Copyright (C) 2020 MohamedTawfik.

Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.

Alin - MohamedTawfik
*/

const chalk = require('chalk');
const {WAConnection} = require('@adiwajshing/baileys');
const {StringSession} = require('./whatsasena/');
const Config = require('./config');
const fs = require('fs');

async function whatsAsena () {
    const conn = new WAConnection();
    conn.version = [2,2119,6]
    const Session = new StringSession();  
    conn.logger.level = 'warn';
    conn.regenerateQRIntervalMs = 30000;
    
    conn.on('connecting', async () => {
        console.log(`${chalk.green.bold(Config.BOT_NAME)}
${chalk.white.italic('مولّد جلسة Alin')}

${chalk.blue.italic('ℹ️  Alin بيتصل بواتساب... استنى يا نجم.')}`);
    });
    

    conn.on('open', () => {
        var st = Session.createStringSession(conn.base64EncodedAuthInfo());
        console.log(
            chalk.green.bold('كود جلسة Alin: '), Session.createStringSession(conn.base64EncodedAuthInfo())
        );
        
        if (!fs.existsSync('config.env')) {
            fs.writeFileSync('config.env', `ASENA_SESSION="${st}"`);
        }

        console.log(
            chalk.blue.bold('حط الجلسة في الإعدادات وشغّل البوت بـ node bot.js.')
        );
        process.exit(0);
    });

    await conn.connect();
}

whatsAsena()