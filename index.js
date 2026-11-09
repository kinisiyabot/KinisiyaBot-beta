// KINISIYA BOT - Un bot superhéroe con un toque de Yurichi × Song
// *لا تلعب هنا عشان لا تخرب لبوت ياحبيبي*

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1';
import './config.js';
import './plugins/_allfake.js';
import cfonts from 'cfonts';
import { createRequire } from 'module';
import { fileURLToPath, pathToFileURL } from 'url';
import { platform } from 'process';
import * as ws from 'ws';
import fs, { 
    readdirSync, 
    statSync, 
    unlinkSync, 
    existsSync, 
    mkdirSync, 
    readFileSync, 
    rmSync, 
    watch 
} from 'fs';
import yargs from 'yargs';
import { spawn, execSync } from 'child_process';
import lodash from 'lodash';
import { freddyJadiBot } from './plugins/sockets-serbot.js';
import chalk from 'chalk';
import syntaxerror from 'syntax-error';
import pino from 'pino';
import Pino from 'pino';
import path, { join, dirname } from 'path';
import { Boom } from '@hapi/boom';
import { makeWASocket, protoType, serialize } from './lib/simple.js';
import './lib/config.js';
import { resolvePluginExports, unloadPlugin as unloadPluginFile } from './lib/plugin-loader.js';
import { Low, JSONFile } from 'lowdb';
import store from './lib/store.js';
const { proto } = await import('@whiskeysockets/baileys');
import pkg from 'google-libphonenumber';
const { PhoneNumberUtil } = pkg;
const phoneUtil = PhoneNumberUtil.getInstance();
const { 
    DisconnectReason, 
    useMultiFileAuthState, 
    fetchLatestBaileysVersion, 
    makeCacheableSignalKeyStore, 
    jidNormalizedUser 
} = await import('@whiskeysockets/baileys');
import readline, { createInterface } from 'readline';
import NodeCache from 'node-cache';
import QRCode from 'qrcode';
import os from 'os';
import cp from 'child_process';

const { CONNECTING } = ws;
const { chain } = lodash;
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000;

// Definicion de variables globales con valores por defecto
global.sessions = global.sessions || 'sessions';
global.jadi = global.jadi || 'jadi';
global.ch = global.ch || {};
global.nameqr = global.nameqr || 'KINISIYA-BOT';

global.format = function(err) {
    if (err instanceof Error) {
        return err.stack || err.message;
    }
    return String(err);
};

// Mostrar banner de inicio
let { say } = cfonts;
console.log(chalk.magentaBright('\nLOADING........'));
say('KINISIYA BOT', {
    font: 'simple',
    align: 'left',
    gradient: ['green', 'white']
});
say('By: yertchi', {
    font: 'console',
    align: 'center',
    colors: ['cyan', 'magenta', 'yellow']
});

protoType();
serialize();

global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
    return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString();
};
global.__dirname = function dirname(pathURL) {
    return path.dirname(global.__filename(pathURL, true));
};
global.__require = function require(dir = import.meta.url) {
    return createRequire(dir);
};
global.timestamp = { start: new Date() };
const __dirname = global.__dirname(import.meta.url);
global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse());
global.prefix = new RegExp('^[#!./-]');

// Configuracion de base de datos LowDB
global.db = new Low(/https?:\/\//.test(global.opts['db'] || '') ? new cloudDBAdapter(global.opts['db']) : new JSONFile('database.json'));
global.DATABASE = global.db;

global.loadDatabase = async function loadDatabase() {
    if (global.db.READ) {
        return new Promise((resolve) => setInterval(async function() {
            if (!global.db.READ) {
                clearInterval(this);
                resolve(global.db.data == null ? global.loadDatabase() : global.db.data);
            }
        }, 1 * 1000));
    }
    if (global.db.data !== null) return;
    global.db.READ = true;
    await global.db.read().catch(console.error);
    global.db.READ = null;
    global.db.data = {
        users: {},
        chats: {},
        settings: {},
        ...(global.db.data || {}),
    };
    global.db.chain = chain(global.db.data);
};
await global.loadDatabase();

// Sistema de autenticacion
const { state, saveState, saveCreds } = await useMultiFileAuthState(global.sessions);
const msgRetryCounterMap = new Map();
const msgRetryCounterCache = new NodeCache({ stdTTL: 0, checkperiod: 0 });
const userDevicesCache = new NodeCache({ stdTTL: 0, checkperiod: 0 });
const { version } = await fetchLatestBaileysVersion();

let phoneNumber = global.botNumber;
const methodCodeQR = process.argv.includes("qr");
const methodCode = !!phoneNumber || process.argv.includes("code");
const MethodMobile = process.argv.includes("mobile");
const colors = chalk.bold.white;
const qrOption = chalk.blueBright;
const textOption = chalk.cyan;
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (texto) => new Promise((resolver) => rl.question(texto, resolver));

let opcion;
if (methodCodeQR) {
    opcion = '1';
}
if (!methodCodeQR && !methodCode && !fs.existsSync(`./${global.sessions}/creds.json`)) {
    do {
        opcion = await question(colors("Choose an option:\n") +
            qrOption("1. Using QR Code\n") +
            textOption("2. Using 8-digit text code\n--> "));
        
        if (!/^[1-2]$/.test(opcion)) {
            console.log(chalk.bold.redBright(`Only numbers 1 or 2 are allowed. Letters or special characters are not valid.`));
        }
    } while (opcion !== '1' && opcion !== '2' || fs.existsSync(`./${global.sessions}/creds.json`));
}

console.info = () => {};

// Opciones de conexion para Baileys
const connectionOptions = {
    logger: pino({ level: 'silent' }),
    mobile: MethodMobile,
    browser: opcion == '1' ? [`${global.nameqr}`, 'Edge', '20.0.04'] : methodCodeQR ? [`${global.nameqr}`, 'Edge', '20.0.04'] : ['Ubuntu', 'Edge', '110.0.1587.56'],
    auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, Pino({ level: "fatal" }).child({ level: "fatal" })),
    },
    markOnlineOnConnect: true,
    generateHighQualityLinkPreview: true,
    getMessage: async (clave) => {
        let jid = jidNormalizedUser(clave.remoteJid);
        let msg = await store.loadMessage(jid, clave.id);
        return msg?.message || "";
    },
    msgRetryCounterCache,
    msgRetryCounterMap,
    defaultQueryTimeoutMs: undefined,
    version,
};

global.conn = makeWASocket(connectionOptions);
// سجّل مستمع اتصال مباشرةً بعد إنشاء الجلسة، لأن حدث QR/الاتصال يصل
// بسرعة (أقل من ثانية) بينما تحميل البلوجنات يستغرق وقتاً طويلاً.
conn.connectionUpdate = connectionUpdate;
conn.ev.on('connection.update', conn.connectionUpdate);
conn.ev.on("creds.update", saveCreds);

// Manejador del codigo de emparejamiento (pairing code)
if (!fs.existsSync(`./${global.sessions}/creds.json`)) {
    if (opcion === '2' || methodCode) {
        opcion = '2';
        if (!conn.authState.creds.registered) {
            let addNumber;
            if (!!phoneNumber) {
                addNumber = phoneNumber.replace(/[^0-9]/g, '');
            } else {
                do {
                    phoneNumber = await question(chalk.bgBlack(chalk.bold.greenBright(`Please enter the WhatsApp number.\n${chalk.bold.magentaBright('---> ')}`)));
                    phoneNumber = phoneNumber.replace(/\D/g, '');
                    if (!phoneNumber.startsWith('+')) {
                        phoneNumber = `+${phoneNumber}`;
                    }
                } while (!await isValidPhoneNumber(phoneNumber));
                rl.close();
                addNumber = phoneNumber.replace(/\D/g, '');
                setTimeout(async () => {
                    let codeBot = await conn.requestPairingCode(addNumber);
                    codeBot = codeBot.match(/.{1,4}/g)?.join("-") || codeBot;
                    console.log(chalk.bold.white(chalk.bgMagenta(`CODE:`)), chalk.bold.white(chalk.white(codeBot)));
                }, 3000);
            }
        }
    }
}

conn.isInit = false;
conn.well = false;
conn.logger.info(`DONE ✅\n`);

if (!opts['test']) {
    if (global.db) setInterval(async () => {
        if (global.db.data) await global.db.write();
        if (opts['autocleartmp'] && (global.support || {}).find) {
            const tmp = [os.tmpdir(), 'tmp', `${global.jadi}`];
            tmp.forEach((filename) => cp.spawn('find', [filename, '-amin', '3', '-type', 'f', '-delete']));
        }
    }, 30 * 1000);
}

// Manejador de actualizaciones de conexion
async function connectionUpdate(update) {
    const { connection, lastDisconnect, isNewLogin } = update;
    global.stopped = connection;
    if (isNewLogin) conn.isInit = true;
    const code = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
    if (code && code !== DisconnectReason.loggedOut && conn?.ws.socket == null) {
        await global.reloadHandler(true).catch(console.error);
        global.timestamp.connect = new Date();
    }
    if (global.db.data == null) loadDatabase();
    if (update.qr && (opcion === '1' || methodCodeQR)) {
        console.log(chalk.green.bold(`[ 🌊 ]  Please scan this QR code`));
        try {
            console.log(await QRCode.toString(update.qr, { type: 'terminal', small: true }));
        } catch (e) {
            console.error('QR render error:', e.message);
        }
    }
    if (connection === "open") {
        const userJid = jidNormalizedUser(conn.user.id);
        const userName = conn.user.name || conn.user.verifiedName || "UNKNOWN";
        await joinChannels(conn);
        console.log(chalk.green.bold(`[ 🐍 ]: ${userName} is Connected`));
    }
    let reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
    if (connection === "close") {
        if ([401, 440, 428, 405].includes(reason)) {
            console.log(chalk.red(`→ (${code}) › Close the Main Session`));
        }
        console.log(chalk.yellow("→ Reconnecting the Main Bot"));
        await global.reloadHandler(true).catch(console.error);
    }
}

process.on('uncaughtException', console.error);

// Sistema de recarga del manejador
let isInit = true;
let handler = await import('./handler.js');

global.reloadHandler = async function(restatConn) {
    try {
        const Handler = await import(`./handler.js?update=${Date.now()}`).catch(console.error);
        if (Object.keys(Handler || {}).length) handler = Handler;
    } catch (e) {
        console.error(e);
    }
    if (restatConn) {
        const oldChats = global.conn.chats;
        try {
            global.conn.ws.close();
        } catch {}
        conn.ev.removeAllListeners();
        global.conn = makeWASocket(connectionOptions, { chats: oldChats });
        isInit = true;
    }
    if (!isInit) {
        conn.ev.off('messages.upsert', conn.handler);
        conn.ev.off('connection.update', conn.connectionUpdate);
        conn.ev.off('connection.update', connectionUpdate);
        conn.ev.off('creds.update', conn.credsUpdate);
    }
    conn.handler = handler.handler.bind(global.conn);
    conn.connectionUpdate = connectionUpdate.bind(global.conn);
    conn.credsUpdate = saveCreds.bind(global.conn, true);
    
    const currentDateTime = new Date();
    const messageDateTime = new Date(conn.ev);
    if (currentDateTime >= messageDateTime) {
        const chats = Object.entries(conn.chats).filter(([jid, chat]) => !jid.endsWith('@g.us') && chat.isChats).map((v) => v[0]);
    } else {
        const chats = Object.entries(conn.chats).filter(([jid, chat]) => !jid.endsWith('@g.us') && chat.isChats).map((v) => v[0]);
    }
    
    // ¿Por qué por el amor de Dios ningún desarrollador pensó en esto que hice?
    conn.ev.on('messages.upsert', conn.handler);
    conn.ev.on('connection.update', conn.connectionUpdate);
    conn.ev.on('creds.update', conn.credsUpdate);
    isInit = false;
    return true;
};

process.on('unhandledRejection', (reason, promise) => {
    console.error("⚠️ Unhandled rejection detected • Fazbear Alert 🍷", reason);
});

// Sistema de sub-bots (JadiBot)
global.rutaJadiBot = join(__dirname, `./${global.jadi}`);
if (global.freddyJadibts) {
    if (!existsSync(global.rutaJadiBot)) {
        mkdirSync(global.rutaJadiBot, { recursive: true });
        console.log(chalk.bold.cyan(`🌊┊The folder: ${global.jadi} was created successfully 🍷`));
    } else {
        console.log(chalk.bold.cyan(`🌊┊The folder: ${global.jadi} is already created 🍷`));
    }
    const readRutaJadiBot = readdirSync(global.rutaJadiBot);
    if (readRutaJadiBot.length > 0) {
        const creds = 'creds.json';
        for (const gjbts of readRutaJadiBot) {
            const botPath = join(global.rutaJadiBot, gjbts);
            if (existsSync(botPath) && statSync(botPath).isDirectory()) {
                const readBotPath = readdirSync(botPath);
                if (readBotPath.includes(creds)) {
                    freddyJadiBot({ pathfreddyJadiBot: botPath, m: null, conn, args: '', usedPrefix: '/', command: 'serbot' });
                }
            }
        }
    }
}

// Sistema de plugins con recarga en caliente
const pluginFolder = global.__dirname(join(__dirname, './plugins'));
const pluginFilter = (filename) => /\.js$/.test(filename);
global.plugins = {};

// بلوجن واحد قد يُصدِّر أكثر من handler (مصفوفة)، أو يصدّر `handler` بالاسم
// بدل التصدير الافتراضي. نوحّد كل الأشكال هنا حتى لا تُهمَل أي أوامر.
function unloadPlugin(filename) {
    return unloadPluginFile(global.plugins, filename);
}

async function filesInit() {
    const files = readdirSync(pluginFolder).filter(pluginFilter);
    // حمّل البلوجنات بالتوازي (دفعات) لتسريع الإقلاع بدل التحميل التسلسلي.
    const BATCH = 16;
    for (let i = 0; i < files.length; i += BATCH) {
        const batch = files.slice(i, i + BATCH);
        await Promise.all(batch.map(async (filename) => {
            try {
                const file = global.__filename(join(pluginFolder, filename));
                const module = await import(file);
                Object.assign(global.plugins, resolvePluginExports(module, filename));
            } catch (e) {
                conn.logger.error(e);
                unloadPlugin(filename);
            }
        }));
    }
}

await filesInit().then((_) => Object.keys(global.plugins)).catch(console.error);

global.reload = async (_ev, filename) => {
    if (pluginFilter(filename)) {
        const dir = global.__filename(join(pluginFolder, filename), true);
        if (filename in global.plugins || Object.keys(global.plugins).some(k => k.startsWith(`${filename}#`))) {
            if (existsSync(dir)) conn.logger.info(` updated plugin - '${filename}'`);
            else {
                conn.logger.warn(`deleted plugin - '${filename}'`);
                return unloadPlugin(filename);
            }
        } else conn.logger.info(`new plugin - '${filename}'`);
        const err = syntaxerror(readFileSync(dir), filename, {
            sourceType: 'module',
            allowAwaitOutsideFunction: true,
        });
        if (err) conn.logger.error(`syntax error while loading '${filename}'\n${global.format(err)}`);
        else {
            try {
                const module = (await import(`${global.__filename(dir)}?update=${Date.now()}`));
                unloadPlugin(filename);
                Object.assign(global.plugins, resolvePluginExports(module, filename));
            } catch (e) {
                conn.logger.error(`error in this plugin '${filename}\n${global.format(e)}'`);
            } finally {
                global.plugins = Object.fromEntries(Object.entries(global.plugins).sort(([a], [b]) => a.localeCompare(b)));
            }
        }
    }
};

Object.freeze(global.reload);
watch(pluginFolder, global.reload);
await global.reloadHandler();

// Verificacion de dependencias (ffmpeg, imagemagick, etc)
async function _quickTest() {
    const test = await Promise.all([
        spawn('ffmpeg'),
        spawn('ffprobe'),
        spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-filter_complex', 'color', '-frames:v', '1', '-f', 'webp', '-']),
        spawn('convert'),
        spawn('magick'),
        spawn('gm'),
        spawn('find', ['--version']),
    ].map((p) => {
        return Promise.race([
            new Promise((resolve) => {
                p.on('close', (code) => {
                    resolve(code !== 127);
                });
            }),
            new Promise((resolve) => {
                p.on('error', (_) => resolve(false));
            })
        ]);
    }));
    const [ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find] = test;
    const s = global.support = { ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find };
    Object.freeze(global.support);
}

// Limpieza periodica de la carpeta tmp
setInterval(async () => {
    const tmpDir = join(__dirname, 'tmp');
    try {
        const filenames = readdirSync(tmpDir);
        filenames.forEach(file => {
            const filePath = join(tmpDir, file);
            unlinkSync(filePath);
        });
        console.log(chalk.gray(`→ TMP folder files deleted 🍷`));
    } catch {
        console.log(chalk.gray(`→ The files in the TMP folder could not be deleted 🍷`));
    }
}, 30 * 1000);

_quickTest().catch(console.error);

// Validacion de numeros de telefono
async function isValidPhoneNumber(number) {
    try {
        number = number.replace(/\s+/g, '');
        if (number.startsWith('+521')) {
            number = number.replace('+521', '+52');
        } else if (number.startsWith('+52') && number[4] === '1') {
            number = number.replace('+52 1', '+52');
        }
        const parsedNumber = phoneUtil.parseAndKeepRawInput(number);
        return phoneUtil.isValidNumber(parsedNumber);
    } catch (error) {
        return false;
    }
}

// Union automatica a canales y newsletters
async function joinChannels(sock) {
    for (const value of Object.values(global.ch)) {
        if (typeof value === 'string' && value.endsWith('@newsletter')) {
            await sock.newsletterFollow(value).catch(() => {});
        }
    }
}

export default conn;